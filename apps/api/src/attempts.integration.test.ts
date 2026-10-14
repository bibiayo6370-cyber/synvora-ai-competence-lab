import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { databaseUrl } from "./config/env.js";
import { createApp } from "./app.js";
import { isolatedDatabase } from "./test-support/database.js";
import { migrate } from "./db/migrations.js";
import { PostgresAttemptRepository } from "./repositories/postgres-attempt.repository.js";
import { AttemptService } from "./services/attempt.service.js";
import { RetentionService } from "./services/retention.service.js";
import { attemptSnapshotSchema, validationResponseSchema, errorResponseSchema, challengeSchema } from "@synvora/shared";

let db: Awaited<ReturnType<typeof isolatedDatabase>>;
let app: ReturnType<typeof createApp>;
let repository: PostgresAttemptRepository;
let dev: Pool;
let developmentCounts: string;
const createdIds: string[] = [];
async function counts(pool: Pool) {
  const result = await pool.query(`SELECT
    (SELECT count(*) FROM challenge_attempts) AS attempts,
    (SELECT count(*) FROM attempt_evidence) AS evidence,
    (SELECT count(*) FROM validation_runs) AS validations`);
  return JSON.stringify(result.rows[0]);
}
beforeAll(async () => {
  dev = new Pool({ connectionString: databaseUrl(process.env.DATABASE_URL, "synvora_dev"), max: 1 });
  developmentCounts = await counts(dev);
  db = await isolatedDatabase(); await migrate(db.pool);
  repository = new PostgresAttemptRepository(db.pool); app = createApp(new AttemptService(repository));
});
afterAll(async () => {
  try {
    if (dev) {
      expect((await counts(dev)) === developmentCounts).toBe(true);
      const unexpected = await dev.query("SELECT id FROM challenge_attempts WHERE id=ANY($1::uuid[])", [createdIds]);
      expect(unexpected.rowCount).toBe(0);
    }
  } finally { if (db) await db.close(); if (dev) await dev.end(); }
});
async function start() {
  const response = await request(app).post("/api/attempts").send({ challengeId: "001", challengeVersion: "0.1" }).expect(201).expect("Cache-Control", "no-store");
  createdIds.push(response.body.attempt.id);
  return { id: response.body.attempt.id as string, secret: response.body.accessSecret as string };
}
async function ready() {
  const value = await start(); const path = `/api/attempts/${value.id}`;
  const auth = `Bearer ${value.secret}`;
  await request(app).post(`${path}/prediction`).set("Authorization", auth).send({ prediction: "4500" }).expect(200);
  await request(app).post(`${path}/reveal`).set("Authorization", auth).send({}).expect(200);
  await request(app).post(`${path}/investigation`).set("Authorization", auth).send({ explanation: "I traced the parameter values." }).expect(200);
  await request(app).put(`${path}/modification`).set("Authorization", auth).send({ expression: "total" }).expect(200);
  return { ...value, path, auth };
}
function noInternalData(body: unknown) {
  const text = JSON.stringify(body);
  for (const field of ["secretDigest", "secret_digest", "accessSecret", "fixtures", "stack", "DATABASE_URL"]) {
    expect(text.includes(field)).toBe(false);
  }
}

describe("PostgreSQL-backed HTTP lifecycle", () => {
  it("serves public metadata without unrevealed output, answers, or private fixture values", async () => {
    const response = await request(app).get("/api/challenges/001").expect(200);
    expect(challengeSchema.safeParse(response.body).success).toBe(true);
    expect(JSON.stringify(response.body).includes("4500")).toBe(false);
    noInternalData(response.body);
    await request(app).get("/api/challenges/002").expect(404);
  });
  it("requires attempt bearer authorization on every read and write", async () => {
    const first = await start(), second = await start();
    for (const [method, suffix, body] of [
      ["get", "", {}], ["post", "/prediction", { prediction: "1" }], ["post", "/reveal", {}],
      ["post", "/investigation", { explanation: "Reason" }], ["put", "/modification", { expression: "total" }],
      ["post", "/validation", { expression: "total" }], ["post", "/reflection", { reflection: "Reflect" }]
    ] as const) {
      const path = `/api/attempts/${first.id}${suffix}`;
      for (const authorization of [undefined, "Bearer malformed", `Bearer ${second.secret}`]) {
        const call = method === "get" ? request(app).get(path) : method === "put" ? request(app).put(path) : request(app).post(path);
        if (authorization) call.set("Authorization", authorization);
        const response = await call.send(body).expect(authorization === `Bearer ${second.secret}` ? 404 : 401);
        expect(errorResponseSchema.safeParse(response.body).success).toBe(true);
        noInternalData(response.body);
      }
    }
    const unknown = await request(app).get(`/api/attempts/${randomUUID()}`).set("Authorization", `Bearer ${first.secret}`).expect(404);
    noInternalData(unknown.body);
  });
  it("enforces stage order and immutable prediction under concurrent requests", async () => {
    const value = await start(); const path = `/api/attempts/${value.id}`, auth = `Bearer ${value.secret}`;
    await request(app).post(`${path}/reveal`).set("Authorization", auth).send({}).expect(409);
    const responses = await Promise.all(["4500", "123"].map(prediction => request(app).post(`${path}/prediction`).set("Authorization", auth).send({ prediction })));
    expect(responses.map(response => response.status).sort()).toEqual([200, 409]);
    const accepted = responses.find(response => response.status === 200)!;
    expect(accepted.body.reference).toBeNull();
    const before = await request(app).get(path).set("Authorization", auth).expect(200);
    expect(before.body.reference).toBeNull();
    await request(app).post(`${path}/investigation`).set("Authorization", auth).send({ explanation: "Early" }).expect(409);
    const reveal = await request(app).post(`${path}/reveal`).set("Authorization", auth).send({}).expect(200);
    expect(reveal.body.reference.label).toBe("reference result");
    expect(reveal.body.prediction.text).toBe(accepted.body.prediction.text);
    noInternalData(reveal.body);
  });
  it("rejects expressions with 422, preserves retries, and persists across new pool/app instances", async () => {
    const { path, auth, id, secret } = await ready();
    for (const expression of ["process.exit()", "total/0", "total**2", "1".repeat(201)]) {
      const response = await request(app).post(`${path}/validation`).set("Authorization", auth).send({ expression }).expect(422);
      expect(validationResponseSchema.safeParse(response.body).success).toBe(true);
      expect(response.body.attempt.stage).toBe("validate");
      expect(response.body.validation.message.length > 0).toBe(true);
      noInternalData(response.body);
    }
    const success = await request(app).post(`${path}/validation`).set("Authorization", auth).send({ expression: "total*(1-discount/100)" }).expect(200);
    expect(success.body.validation).toMatchObject({ allPassed: true, passed: 5 });
    const renewed = new Pool({ connectionString: db.connectionString, options: `-c search_path=${db.schema}` });
    try {
      const resumed = createApp(new AttemptService(new PostgresAttemptRepository(renewed)));
      const response = await request(resumed).get(path).set("Authorization", auth).expect(200);
      expect(attemptSnapshotSchema.safeParse(response.body).success).toBe(true);
      expect(response.body.stage).toBe("reflect");
      const stored = await renewed.query("SELECT secret_digest FROM challenge_attempts WHERE id=$1", [id]);
      expect(stored.rows[0].secret_digest === secret).toBe(false);
      noInternalData(response.body);
    } finally { await renewed.end(); }
    const completed = await request(app).post(`${path}/reflection`).set("Authorization", auth).send({ reflection: "I checked the arithmetic." }).expect(200);
    expect(completed.body.stage).toBe("completed");
    await request(app).post(`${path}/validation`).set("Authorization", auth).send({ expression: "total" }).expect(409);
    await request(app).get(`${path}/report`).set("Authorization", auth).expect(200).expect("Cache-Control", "no-store");
  });
  it("allows finite-but-failing reflection, bounds history, and preserves verbatim SQL-like text", async () => {
    const { path, auth, id } = await ready();
    for (let i = 0; i < 101; i++) await request(app).post(`${path}/validation`).set("Authorization", auth).send({ expression: "total" }).expect(200);
    const count = await db.pool.query("SELECT count(*)::int AS count FROM validation_runs WHERE attempt_id=$1", [id]);
    expect(count.rows[0].count).toBe(100);
    const text = "  learner's explanation; DROP TABLE challenge_attempts;  ";
    const result = await request(app).post(`${path}/reflection`).set("Authorization", auth).send({ reflection: text, aiUseDeclaration: "I reviewed assistance." }).expect(200);
    expect(result.body.evidence.find((item: {type: string}) => item.type === "reflection").content).toBe(text);
    expect(result.body.validationCount).toBe(101);
    expect(result.body.validations[0].result.allPassed).toBe(false);
    const report = await request(app).get(`${path}/report`).set("Authorization", auth).expect(200);
    expect(report.body.technicalPerformance).toMatchObject({ recordedExecutions: 101, retainedExecutions: 100, historyTruncated: true });
  });
  it.each(["", " \t\n "])("keeps blank draft and validation submissions from advancing %#", async expression => {
    const value = await start(); const path = `/api/attempts/${value.id}`, auth = `Bearer ${value.secret}`;
    await request(app).post(`${path}/prediction`).set("Authorization", auth).send({ prediction: "1" }).expect(200);
    await request(app).post(`${path}/reveal`).set("Authorization", auth).send({}).expect(200);
    await request(app).post(`${path}/investigation`).set("Authorization", auth).send({ explanation: "Reasoning" }).expect(200);
    await request(app).put(`${path}/modification`).set("Authorization", auth).send({ expression }).expect(400);
    const unchanged = await request(app).get(path).set("Authorization", auth).expect(200);
    expect(unchanged.body.stage).toBe("modify");
    expect(unchanged.body.evidence.some((item: {type: string}) => item.type === "modification_draft")).toBe(false);
    await request(app).put(`${path}/modification`).set("Authorization", auth).send({ expression: "total" }).expect(200);
    const rejected = await request(app).post(`${path}/validation`).set("Authorization", auth).send({ expression }).expect(422);
    expect(rejected.body.validation.status).toBe("rejected");
    expect(rejected.body.attempt.stage).toBe("validate");
    await request(app).post(`${path}/reflection`).set("Authorization", auth).send({ reflection: "Early" }).expect(409);
  });
  it("recovers from rejected input at reflect only after safely revalidating the current draft", async () => {
    const { path, auth } = await ready();
    const evaluated = await request(app).post(`${path}/validation`).set("Authorization", auth).send({ expression: "total" }).expect(200);
    expect(evaluated.body.attempt.stage).toBe("reflect");
    const rejected = await request(app).post(`${path}/validation`).set("Authorization", auth).send({ expression: "total/0" }).expect(422);
    expect(rejected.body.attempt.stage).toBe("reflect");
    expect(rejected.body.validation.message).toContain("Revise the denominator");
    const blocked = await request(app).post(`${path}/reflection`).set("Authorization", auth).send({ reflection: "Done" }).expect(409);
    expect(blocked.body.error.code).toBe("REVALIDATION_REQUIRED");
    expect(blocked.body.error.message).toContain("Validate the current draft again");
    expect(errorResponseSchema.safeParse(blocked.body).success).toBe(true);
    const unfinished = await request(app).get(path).set("Authorization", auth).expect(200);
    expect(unfinished.body.completedAt).toBeNull();
    expect(unfinished.body.evidence.some((item: {type: string}) => item.type === "reflection")).toBe(false);
    await request(app).put(`${path}/modification`).set("Authorization", auth).send({ expression: "total" }).expect(200);
    await request(app).post(`${path}/reflection`).set("Authorization", auth).send({ reflection: "Still early" }).expect(409);
    const recovered = await request(app).post(`${path}/validation`).set("Authorization", auth).send({ expression: "total" }).expect(200);
    expect(recovered.body.validation).toMatchObject({ status: "evaluated", allPassed: false });
    await request(app).post(`${path}/reflection`).set("Authorization", auth).send({ reflection: "The tests show a gap." }).expect(200);
  });
  it("rejects a changed or rejected latest draft before reflection", async () => {
    const { path, auth } = await ready();
    await request(app).post(`${path}/validation`).set("Authorization", auth).send({ expression: "total" }).expect(200);
    await request(app).put(`${path}/modification`).set("Authorization", auth).send({ expression: "total+1" }).expect(200);
    await request(app).post(`${path}/reflection`).set("Authorization", auth).send({ reflection: "Done" }).expect(409);
    await request(app).post(`${path}/validation`).set("Authorization", auth).send({ expression: "total/0" }).expect(422);
    await request(app).post(`${path}/reflection`).set("Authorization", auth).send({ reflection: "Done" }).expect(409);
  });
  it("expires before cleanup and physically cascades only within the isolated test schema", async () => {
    const expired = await ready(), active = await start();
    await request(app).post(`${expired.path}/validation`).set("Authorization", expired.auth).send({ expression: "total" }).expect(200);
    await db.pool.query(`WITH stamp AS (SELECT date_trunc('milliseconds',clock_timestamp()) AS now)
      UPDATE challenge_attempts SET created_at=stamp.now-interval '169 hours',
      expires_at=stamp.now-interval '1 hour' FROM stamp WHERE id=$1`, [expired.id]);
    await request(app).get(expired.path).set("Authorization", expired.auth).expect(404);
    await request(app).post(`${expired.path}/validation`).set("Authorization", expired.auth).send({ expression: "total" }).expect(404);
    expect((await db.pool.query("SELECT id FROM challenge_attempts WHERE id=$1", [expired.id])).rowCount).toBe(1);
    expect(await new RetentionService(repository).cleanup()).toBe(1);
    expect((await db.pool.query("SELECT id FROM attempt_evidence WHERE attempt_id=$1", [expired.id])).rowCount).toBe(0);
    expect((await db.pool.query("SELECT id FROM validation_runs WHERE attempt_id=$1", [expired.id])).rowCount).toBe(0);
    await request(app).get(`/api/attempts/${active.id}`).set("Authorization", `Bearer ${active.secret}`).expect(200);
  });
  it("rolls back evidence and stage writes together on repository failure", async () => {
    const value = await start();
    await expect(repository.withAttempt(value.id, async unit => {
      await unit.evidence("investigation", "Must roll back"); unit.record.stage = "completed"; throw new Error("Injected failure");
    })).rejects.toThrow("Injected failure");
    const resumed = await new AttemptService(repository).get(value.id, value.secret);
    expect(resumed.stage).toBe("predict"); expect(resumed.evidence).toEqual([]);
  });
  it("returns safe structured errors for malformed input and bounds body size", async () => {
    const value = await start(), path = `/api/attempts/${value.id}`, auth = `Bearer ${value.secret}`;
    await request(app).post(`${path}/prediction`).set("Authorization", auth).send({ prediction: 1 }).expect(400);
    await request(app).post(`${path}/prediction`).set("Authorization", auth).set("Content-Type", "application/json").send('{').expect(400);
    await request(app).post(`${path}/prediction`).set("Authorization", auth).send({ prediction: "a".repeat(40000) }).expect(413);
    const result = await request(app).post(`${path}/prediction`).set("Authorization", auth).send({ prediction: "1", extra: "private" }).expect(400);
    expect(errorResponseSchema.safeParse(result.body).success).toBe(true);
    expect(JSON.stringify(result.body).includes("private")).toBe(false);
  });
});
