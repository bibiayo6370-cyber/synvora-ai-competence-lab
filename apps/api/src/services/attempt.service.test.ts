import { randomUUID } from "node:crypto";
import { describe, it, expect, beforeEach } from "vitest";
import type { AttemptRecord, AttemptRepository, AttemptUnit } from "../repositories/attempt.repository.js";
import { AttemptService } from "./attempt.service.js";
import { RetentionService } from "./retention.service.js";
import type { EvidenceType, ValidationResult } from "@synvora/shared";

// Test-only transactional repository. Production always uses PostgreSQL.
class TestRepository implements AttemptRepository {
  records = new Map<string, AttemptRecord>();
  now = "2026-10-10T12:00:00.000Z";
  async create(id: string, secretDigest: string) {
    const record: AttemptRecord = { id, secretDigest, challengeId: "001", challengeVersion: "0.1", stage: "predict",
      createdAt: this.now, updatedAt: this.now, expiresAt: new Date(Date.parse(this.now) + 168 * 3600000).toISOString(),
      completedAt: null, prediction: null, predictionAt: null, revealedAt: null, validationCount: 0, evidence: [], validations: [] };
    this.records.set(id, structuredClone(record)); return record;
  }
  async withAttempt<T>(id: string, operation: (unit: AttemptUnit) => Promise<T>) {
    const saved = this.records.get(id); if (!saved) return undefined;
    const record = structuredClone(saved);
    const result = await operation({ record, now: this.now,
      evidence: async (type: EvidenceType, content: string) => {
        const old = record.evidence.find(item => item.type === type);
        if (old) { old.content = content; old.updatedAt = this.now; }
        else record.evidence.push({ type, content, createdAt: this.now, updatedAt: this.now });
      },
      validation: async (expression: string, result: ValidationResult) => {
        record.validations.unshift({ id: randomUUID(), expression, result, sequence: ++record.validationCount, createdAt: this.now });
        record.validations = record.validations.slice(0, 100);
      }
    });
    this.records.set(id, record); return result;
  }
  async deleteExpired() {
    let count = 0;
    for (const [id, record] of this.records) if (Date.parse(record.expiresAt) <= Date.parse(this.now)) { this.records.delete(id); count++; }
    return count;
  }
}

describe("attempt lifecycle and retention", () => {
  let repository: TestRepository, service: AttemptService;
  beforeEach(() => { repository = new TestRepository(); service = new AttemptService(repository); });
  async function validating() {
    const { attempt, accessSecret } = await service.create();
    await service.prediction(attempt.id, accessSecret, " 4500 ");
    await service.reveal(attempt.id, accessSecret);
    await service.investigation(attempt.id, accessSecret, "The parameters are multiplied.");
    await service.modification(attempt.id, accessSecret, "total");
    return { id: attempt.id, secret: accessSecret };
  }
  it.each(["", " \t\n "])("does not advance for blank drafts or validation %#", async expression => {
    const { attempt, accessSecret: secret } = await service.create();
    await service.prediction(attempt.id, secret, "1");
    await service.reveal(attempt.id, secret);
    await service.investigation(attempt.id, secret, "Reasoning");
    await expect(service.modification(attempt.id, secret, expression)).rejects.toThrow();
    const unchanged = await service.get(attempt.id, secret);
    expect(unchanged.stage).toBe("modify");
    expect(unchanged.evidence.some(item => item.type === "modification_draft")).toBe(false);
    await service.modification(attempt.id, secret, "total");
    const rejected = await service.validation(attempt.id, secret, expression);
    expect(rejected.validation.status).toBe("rejected");
    expect(rejected.attempt.stage).toBe("validate");
  });
  it("blocks completion after rejection until the current draft is safely revalidated", async () => {
    const { id, secret } = await validating();
    expect((await service.validation(id, secret, "total")).attempt.stage).toBe("reflect");
    const rejected = await service.validation(id, secret, "total/0");
    expect(rejected.validation).toMatchObject({ status: "rejected", code: "DIVISION_BY_ZERO" });
    expect(rejected.attempt.stage).toBe("reflect");
    await expect(service.reflection(id, secret, "Done")).rejects.toMatchObject({ status: 409, code: "REVALIDATION_REQUIRED" });
    await service.modification(id, secret, "total");
    await expect(service.reflection(id, secret, "Done")).rejects.toMatchObject({ code: "REVALIDATION_REQUIRED" });
    const recovered = await service.validation(id, secret, "total");
    expect(recovered.validation).toMatchObject({ status: "evaluated", allPassed: false });
    expect((await service.reflection(id, secret, "The tests show a gap.")).stage).toBe("completed");
  });
  it("locks prediction, gates reveal, and leaves reasoning unassessed", async () => {
    const { attempt, accessSecret: secret } = await service.create();
    expect(attempt.reference).toBeNull();
    await expect(service.reveal(attempt.id, secret)).rejects.toMatchObject({ status: 409 });
    const predicted = await service.prediction(attempt.id, secret, " 4500 ");
    expect(predicted.reference).toBeNull();
    await expect(service.prediction(attempt.id, secret, "other")).rejects.toMatchObject({ status: 409 });
    const revealed = await service.reveal(attempt.id, secret);
    expect(revealed.reference?.predictionMatches).toBe(true);
    await expect(service.reveal(attempt.id, secret)).rejects.toMatchObject({ status: 409 });
    expect((await service.get(attempt.id, secret)).prediction?.text).toBe(" 4500 ");
  });
  it("does not reveal anything for another attempt's secret", async () => {
    const first = await service.create(), second = await service.create();
    await expect(service.get(first.attempt.id, second.accessSecret)).rejects.toMatchObject({ status: 404 });
    await expect(service.get(randomUUID(), first.accessSecret)).rejects.toMatchObject({ status: 404 });
    expect(Object.hasOwn(first.attempt, "secretDigest")).toBe(false);
  });
  it("permits rejection retries and finite-but-failing progression", async () => {
    const { id, secret } = await validating();
    const rejected = await service.validation(id, secret, "total()");
    expect(rejected.attempt.stage).toBe("validate");
    expect(rejected.validation.status).toBe("rejected");
    expect(rejected.attempt.evidence.find(item => item.type === "modification_draft")?.content).toBe("total()");
    const evaluated = await service.validation(id, secret, "total");
    expect(evaluated.attempt.stage).toBe("reflect");
    expect(evaluated.validation).toMatchObject({ status: "evaluated", allPassed: false });
    const complete = await service.reflection(id, secret, "My expression ignored the discount.");
    expect(complete.stage).toBe("completed");
    expect(complete.evidence.some(item => item.type === "ai_use_declaration")).toBe(false);
    await expect(service.modification(id, secret, "1")).rejects.toMatchObject({ status: 409 });
    await expect(service.validation(id, secret, "total")).rejects.toMatchObject({ status: 409 });
    await expect(service.reflection(id, secret, "Again")).rejects.toMatchObject({ status: 409 });
  });
  it("requires evaluation of the current draft before completing", async () => {
    const { id, secret } = await validating();
    await service.validation(id, secret, "total*(1-discount/100)");
    await service.modification(id, secret, "total+1");
    await expect(service.reflection(id, secret, "Done")).rejects.toMatchObject({ status: 409 });
    await service.validation(id, secret, "total+1");
    await service.validation(id, secret, "total/0");
    await expect(service.reflection(id, secret, "Done")).rejects.toMatchObject({ status: 409 });
    await service.validation(id, secret, "total*(1-discount/100)");
    const result = await service.reflection(id, secret, "I checked the results.", "I used assistance and checked it.");
    expect(result.evidence.find(item => item.type === "ai_use_declaration")).toBeDefined();
  });
  it("preserves bounded draft on oversized input and caps retained history", async () => {
    const { id, secret } = await validating();
    const oversized = await service.validation(id, secret, "1".repeat(201));
    expect(oversized.validation).toMatchObject({ code: "TOO_LONG" });
    expect(oversized.attempt.evidence.find(item => item.type === "modification_draft")?.content).toBe("total");
    for (let i = 0; i < 101; i++) await service.validation(id, secret, "total");
    const result = await service.get(id, secret);
    expect(result.validations.length).toBe(100);
    expect(result.validationCount).toBe(101);
  });
  it("expires exactly seven days from creation regardless of activity", async () => {
    const { attempt, accessSecret: secret } = await service.create();
    repository.now = new Date(Date.parse(attempt.expiresAt) - 1).toISOString();
    const updated = await service.prediction(attempt.id, secret, "1");
    expect(updated.expiresAt).toBe(attempt.expiresAt);
    repository.now = attempt.expiresAt;
    await expect(service.get(attempt.id, secret)).rejects.toMatchObject({ status: 404 });
    await expect(service.reveal(attempt.id, secret)).rejects.toMatchObject({ status: 404 });
    expect(repository.records.has(attempt.id)).toBe(true);
    expect(await new RetentionService(repository).cleanup()).toBe(1);
    expect(repository.records.has(attempt.id)).toBe(false);
  });
});
