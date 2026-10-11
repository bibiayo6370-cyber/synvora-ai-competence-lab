import { z } from "zod";
import { CHALLENGE_ID, CHALLENGE_VERSION, stages, evidenceTypes } from "../constants/challenge.constants.js";
import { validationResultSchema, validationRunSchema } from "./validation.schema.js";

const text = (max: number) => z.string().min(1).max(max).refine(value => value.trim().length > 0, "Enter some text");
export const attemptIdSchema = z.uuid();
export const createAttemptSchema = z.strictObject({ challengeId: z.literal(CHALLENGE_ID), challengeVersion: z.literal(CHALLENGE_VERSION) });
export const predictionSchema = z.strictObject({ prediction: text(200) });
export const investigationSchema = z.strictObject({ explanation: text(4000) });
export const modificationSchema = z.strictObject({ expression: text(200) });
// Length is checked by the expression validator so oversized expressions receive HTTP 422.
export const validationRequestSchema = z.strictObject({ expression: z.string() });
export const reflectionSchema = z.strictObject({ reflection: text(4000), aiUseDeclaration: text(2000).optional() });
export const emptyRequestSchema = z.strictObject({});
export const evidenceSchema = z.strictObject({ type: z.enum(evidenceTypes), content: z.string().min(1).max(4000),
  createdAt: z.iso.datetime(), updatedAt: z.iso.datetime() });
export const attemptSnapshotSchema = z.strictObject({
  id: z.uuid(), challengeId: z.literal(CHALLENGE_ID), challengeVersion: z.literal(CHALLENGE_VERSION), stage: z.enum(stages),
  createdAt: z.iso.datetime(), updatedAt: z.iso.datetime(), expiresAt: z.iso.datetime(), completedAt: z.iso.datetime().nullable(),
  prediction: z.strictObject({ text: z.string().max(200), submittedAt: z.iso.datetime() }).nullable(),
  reference: z.strictObject({ label: z.literal("reference result"), output: z.string(), predictionMatches: z.boolean(), revealedAt: z.iso.datetime() }).nullable(),
  evidence: z.array(evidenceSchema).max(4), validations: z.array(validationRunSchema).max(100),
  validationCount: z.number().int().nonnegative()
});
export const createAttemptResponseSchema = z.strictObject({ attempt: attemptSnapshotSchema, accessSecret: z.string().regex(/^[A-Za-z0-9_-]{43}$/) });
export const validationResponseSchema = z.strictObject({ attempt: attemptSnapshotSchema, validation: validationResultSchema });
export type AttemptSnapshot = z.infer<typeof attemptSnapshotSchema>;
export type Stage = AttemptSnapshot["stage"];
export type Evidence = z.infer<typeof evidenceSchema>;
export type EvidenceType = Evidence["type"];
