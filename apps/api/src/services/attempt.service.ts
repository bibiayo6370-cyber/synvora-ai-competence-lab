import { randomUUID } from "node:crypto";
import { attemptSnapshotSchema, modificationSchema, type AttemptSnapshot, type Stage } from "@synvora/shared";
import type { AttemptRepository, AttemptRecord, AttemptUnit } from "../repositories/attempt.repository.js";
import { generateSecret, digestSecret, verifySecret } from "../security/attempt-secret.js";
import { ApplicationError, conflict, notFound } from "../http/errors.js";
import { referenceOutput } from "../challenges/challenge-001.js";
import { validateExpression } from "./validation.service.js";

function snapshot(record: AttemptRecord): AttemptSnapshot {
  return attemptSnapshotSchema.parse({ id: record.id, challengeId: record.challengeId, challengeVersion: record.challengeVersion,
    stage: record.stage, createdAt: record.createdAt, updatedAt: record.updatedAt, expiresAt: record.expiresAt,
    completedAt: record.completedAt, validationCount: record.validationCount,
    prediction: record.prediction === null ? null : { text: record.prediction, submittedAt: record.predictionAt },
    reference: record.revealedAt === null ? null : { label: "reference result", output: referenceOutput,
      predictionMatches: record.prediction?.trim() === referenceOutput, revealedAt: record.revealedAt },
    evidence: record.evidence, validations: record.validations });
}
export class AttemptService {
  constructor(private readonly repository: AttemptRepository) {}
  async create() {
    const accessSecret = generateSecret();
    const record = await this.repository.create(randomUUID(), digestSecret(accessSecret));
    return { attempt: snapshot(record), accessSecret };
  }
  private async authorized<T>(id: string, secret: string, action: (unit: AttemptUnit) => Promise<T>): Promise<T> {
    const result = await this.repository.withAttempt<T>(id, async unit => {
      if (!verifySecret(secret, unit.record.secretDigest) || Date.parse(unit.now) >= Date.parse(unit.record.expiresAt)) throw notFound();
      return action(unit);
    });
    if (result === undefined) throw notFound();
    return result;
  }
  private stage(unit: AttemptUnit, allowed: Stage[]) {
    if (!allowed.includes(unit.record.stage)) throw conflict();
  }
  private updated(unit: AttemptUnit) { unit.record.updatedAt = unit.now; return snapshot(unit.record); }
  get(id: string, secret: string) { return this.authorized(id, secret, async unit => snapshot(unit.record)); }
  prediction(id: string, secret: string, text: string) {
    return this.authorized(id, secret, async unit => {
      this.stage(unit, ["predict"]);
      unit.record.prediction = text; unit.record.predictionAt = unit.now; unit.record.stage = "run";
      return this.updated(unit);
    });
  }
  reveal(id: string, secret: string) {
    return this.authorized(id, secret, async unit => {
      this.stage(unit, ["run"]);
      unit.record.revealedAt = unit.now; unit.record.stage = "investigate";
      return this.updated(unit);
    });
  }
  investigation(id: string, secret: string, explanation: string) {
    return this.authorized(id, secret, async unit => {
      this.stage(unit, ["investigate"]); await unit.evidence("investigation", explanation);
      unit.record.stage = "modify"; return this.updated(unit);
    });
  }
  modification(id: string, secret: string, expression: string) {
    return this.authorized(id, secret, async unit => {
      this.stage(unit, ["modify", "validate", "reflect"]);
      modificationSchema.parse({ expression });
      await unit.evidence("modification_draft", expression);
      if (unit.record.stage === "modify") unit.record.stage = "validate";
      return this.updated(unit);
    });
  }
  validation(id: string, secret: string, expression: string) {
    return this.authorized(id, secret, async unit => {
      this.stage(unit, ["validate", "reflect"]);
      const validation = validateExpression(expression);
      // Oversized input cannot be persisted; keep the previous bounded draft intact.
      if (expression.length <= 200) {
        if (expression.length > 0) await unit.evidence("modification_draft", expression);
        await unit.validation(expression, validation);
      }
      if (validation.status === "evaluated") unit.record.stage = "reflect";
      return { attempt: this.updated(unit), validation };
    });
  }
  reflection(id: string, secret: string, reflection: string, aiUseDeclaration?: string) {
    return this.authorized(id, secret, async unit => {
      this.stage(unit, ["reflect"]);
      const latest = unit.record.validations[0];
      const draft = unit.record.evidence.find(item => item.type === "modification_draft");
      if (!latest || latest.result.status !== "evaluated" || latest.expression !== draft?.content) {
        throw new ApplicationError(409, "REVALIDATION_REQUIRED",
          "Validate the current draft again before submitting reflection. It must evaluate safely; technical tests may still fail.");
      }
      await unit.evidence("reflection", reflection);
      if (aiUseDeclaration !== undefined) await unit.evidence("ai_use_declaration", aiUseDeclaration);
      unit.record.stage = "completed"; unit.record.completedAt = unit.now;
      return this.updated(unit);
    });
  }
}
