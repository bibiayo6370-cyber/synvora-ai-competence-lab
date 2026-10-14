import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { competenceReportSchema, createAttemptResponseSchema } from "@synvora/shared";
import { createApp } from "./app.js";
import { databaseUrl } from "./config/env.js";
import { migrate } from "./db/migrations.js";
import { PostgresAttemptRepository } from "./repositories/postgres-attempt.repository.js";
import { AttemptService } from "./services/attempt.service.js";
import { isolatedDatabase } from "./test-support/database.js";

let db: Awaited<ReturnType<typeof isolatedDatabase>>;
let app: ReturnType<typeof createApp>;
let dev: Pool, beforeDevelopment: unknown;
const ids: string[] = [];
const counts = async (pool: Pool) => (await pool.query(`SELECT
  (SELECT count(*) FROM challenge_attempts) AS attempts,
  (SELECT count(*) FROM attempt_evidence) AS evidence,
  (SELECT count(*) FROM validation_runs) AS validations`)).rows;
beforeAll(async () => {
  dev = new Pool({ connectionString: databaseUrl(process.env.DATABASE_URL, "synvora_dev"), max: 1, connectionTimeoutMillis: 5000 });
  beforeDevelopment = await counts(dev);
  db = await isolatedDatabase(); await migrate(db.pool);
  app = createApp(new AttemptService(new PostgresAttemptRepository(db.pool)));
});
afterAll(async () => {
  try {
    if (dev) {
      expect(await counts(dev)).toEqual(beforeDevelopment);
      expect((await dev.query("SELECT id FROM challenge_attempts WHERE id=ANY($1::uuid[])", [ids])).rowCount).toBe(0);
    }
  } finally { if (db) await db.close(); if (dev) await dev.end(); }
});
async function start() {
  const response = await request(app).post("/api/attempts").send({ challengeId: "001", challengeVersion: "0.1" }).expect(201);
  const value = createAttemptResponseSchema.parse(response.body); ids.push(value.attempt.id);
  return { id: value.attempt.id, secret: value.accessSecret, path: `/api/attempts/${value.attempt.id}`, auth: `Bearer ${value.accessSecret}` };
}
async function complete(expression = "total * (1 - discount / 100)", recovery = false) {
  const value = await start();
  await request(app).post(`${value.path}/prediction`).set("Authorization", value.auth).send({ prediction: "4500" }).expect(200);
  await request(app).post(`${value.path}/reveal`).set("Authorization", value.auth).send({}).expect(200);
  await request(app).post(`${value.path}/investigation`).set("Authorization", value.auth).send({ explanation: "Parameters receive ordered arguments and return their product." }).expect(200);
  await request(app).put(`${value.path}/modification`).set("Authorization", value.auth).send({ expression }).expect(200);
  if (recovery) await request(app).post(`${value.path}/validation`).set("Authorization", value.auth).send({ expression: "total/0" }).expect(422);
  await request(app).post(`${value.path}/validation`).set("Authorization", value.auth).send({ expression }).expect(200);
  await request(app).post(`${value.path}/reflection`).set("Authorization", value.auth).send({ reflection: "The saved checks have limits.", aiUseDeclaration: "I checked assistance myself; this is a declaration." }).expect(200);
  return value;
}
async function report(value: Awaited<ReturnType<typeof start>>) {
  const response = await request(app).get(`${value.path}/report`).set("Authorization", value.auth).expect(200).expect("Cache-Control", "no-store");
  return competenceReportSchema.parse(response.body);
}
function noPrivateFields(value: unknown) {
  expect(JSON.stringify(value)).not.toMatch(/secretDigest|secret_digest|accessSecret|privateFixtures|DATABASE_URL|"stack"/);
}

describe("PostgreSQL evidence reports", () => {
  it("authorizes report access before exposing readiness and does not reveal reference early", async () => {
    const first = await start(), other = await start();
    await request(app).get(`${first.path}/report`).expect(401).expect("Cache-Control", "no-store");
    await request(app).get(`${first.path}/report`).set("Authorization", "Bearer malformed").expect(401);
    await request(app).get(`${first.path}/report`).set("Authorization", other.auth).expect(404);
    await request(app).get(`/api/attempts/${randomUUID()}/report`).set("Authorization", first.auth).expect(404);
    await request(app).get("/api/attempts/invalid/report").set("Authorization", first.auth).expect(400);
    const unavailable = await request(app).get(`${first.path}/report`).set("Authorization", first.auth).expect(409).expect("Cache-Control", "no-store");
    expect(unavailable.body.error.code).toBe("REPORT_NOT_READY");
    expect(JSON.stringify(unavailable.body)).not.toContain("4500"); noPrivateFields(unavailable.body);
  });
  it("reports recovered persisted evidence reproducibly without mutating completed data", async () => {
    const value = await complete(undefined, true);
    const before = (await request(app).get(value.path).set("Authorization", value.auth).expect(200)).body;
    const databaseBefore = await db.pool.query("SELECT stage,created_at,updated_at,expires_at,completed_at,validation_count FROM challenge_attempts WHERE id=$1", [value.id]);
    const childCounts = await counts(db.pool);
    const first = await report(value), second = await report(value);
    expect(second).toEqual(first);
    expect(first.learningJourney).toEqual(before);
    expect(first.technicalPerformance).toMatchObject({ recordedExecutions: 2, retainedExecutions: 2, final: { status: "checks_met" } });
    expect(first.solo.level).toBeNull(); expect(first.aiCollaboration.verification).toBe("not_verified");
    noPrivateFields(first); expect(JSON.stringify(first).includes(value.secret)).toBe(false);
    const after = (await request(app).get(value.path).set("Authorization", value.auth).expect(200)).body;
    expect(after).toEqual(before); expect(await counts(db.pool)).toEqual(childCounts);
    const databaseAfter = await db.pool.query("SELECT stage,created_at,updated_at,expires_at,completed_at,validation_count FROM challenge_attempts WHERE id=$1", [value.id]);
    expect(databaseAfter.rows).toEqual(databaseBefore.rows);
    await request(app).post(`${value.path}/validation`).set("Authorization", value.auth).send({ expression: "total" }).expect(409);
  });
  it("returns an honest report for safe-but-failing completion", async () => {
    const value = await complete("total"); const result = await report(value);
    expect(result.technicalPerformance.final.status).toBe("checks_not_met");
    expect(result.nextStep.code).toBe("review_arithmetic_new_attempt");
    expect(result.nextStep.completedAttemptEditable).toBe(false);
    expect(result.growthAreas.some(item => item.code === "checks_not_met")).toBe(true);
  });
  it("restores the same report through a new pool and app instance", async () => {
    const value = await complete(); const original = await report(value);
    const renewed = new Pool({ connectionString: db.connectionString, options: `-c search_path=${db.schema}`, connectionTimeoutMillis: 5000 });
    try {
      const resumed = createApp(new AttemptService(new PostgresAttemptRepository(renewed)));
      const response = await request(resumed).get(`${value.path}/report`).set("Authorization", value.auth).expect(200);
      expect(competenceReportSchema.parse(response.body)).toEqual(original);
    } finally { await renewed.end(); }
  });
  it("denies expired report access immediately without physical deletion", async () => {
    const value = await complete();
    await db.pool.query(`WITH stamp AS (SELECT date_trunc('milliseconds',clock_timestamp()) AS now)
      UPDATE challenge_attempts SET created_at=stamp.now-interval '169 hours',expires_at=stamp.now-interval '1 hour' FROM stamp WHERE id=$1`, [value.id]);
    const expired = await request(app).get(`${value.path}/report`).set("Authorization", value.auth).expect(404).expect("Cache-Control", "no-store");
    const wrong = await request(app).get(`${value.path}/report`).set("Authorization", (await start()).auth).expect(404);
    expect(expired.body).toEqual(wrong.body);
    expect((await db.pool.query("SELECT id FROM challenge_attempts WHERE id=$1", [value.id])).rowCount).toBe(1);
  });
  it("does not conclude technical success from inconsistent final-expression evidence", async () => {
    const value = await complete();
    // Deliberately inconsistent new test fixture only, within this isolated schema.
    await db.pool.query("UPDATE attempt_evidence SET content=$2 WHERE attempt_id=$1 AND type='modification_draft'", [value.id, "total"]);
    const result = await report(value);
    expect(result.technicalPerformance.final).toEqual({ status: "inconclusive", finalValidationId: null, reason: "expression_mismatch" });
    expect(result.nextStep.code).toBe("request_evidence_review");
    expect(result.strengths.some(item => item.code === "checks_met")).toBe(false);
  });
  it("sanitizes contradictory aggregate data as 500 rather than an input error", async () => {
    const value = await complete();
    await db.pool.query("UPDATE validation_runs SET result=$2::jsonb WHERE attempt_id=$1", [value.id,
      JSON.stringify({ status: "evaluated", passed: 5, total: 5, allPassed: true, example: { passed: false, actual: 4500, expected: 4050 } })]);
    const response = await request(app).get(`${value.path}/report`).set("Authorization", value.auth).expect(500).expect("Cache-Control", "no-store");
    expect(response.body.error.code).toBe("INTERNAL_ERROR"); noPrivateFields(response.body);
    expect(response.body.error.issues).toBeUndefined();
  });
});
