import { describe, it, expect } from "vitest";
import { createAttemptSchema, predictionSchema, investigationSchema, modificationSchema, reflectionSchema, validationRequestSchema } from "./attempt.schema.js";
import { validationResultSchema } from "./validation.schema.js";
import { errorResponseSchema } from "./error.schema.js";

describe("shared trust-boundary contracts", () => {
  it("accepts only approved challenge and explicit fields", () => {
    expect(createAttemptSchema.safeParse({ challengeId: "001", challengeVersion: "0.1" }).success).toBe(true);
    expect(createAttemptSchema.safeParse({ challengeId: "002", challengeVersion: "0.1" }).success).toBe(false);
    expect(predictionSchema.safeParse({ prediction: "a", stage: "completed" }).success).toBe(false);
  });
  it.each([
    [predictionSchema, "prediction", 200], [investigationSchema, "explanation", 4000],
    [modificationSchema, "expression", 200], [reflectionSchema, "reflection", 4000]
  ] as const)("validates text bounds %#", (schema, key, max) => {
    expect(schema.safeParse({ [key]: "a".repeat(max) }).success).toBe(true);
    expect(schema.safeParse({ [key]: "a".repeat(max + 1) }).success).toBe(false);
    expect(schema.safeParse({ [key]: "  " }).success).toBe(false);
  });
  it.each(["", " \t\n "])("rejects blank modification drafts and leaves blank validation to the parser %#", expression => {
    expect(modificationSchema.safeParse({ expression }).success).toBe(false);
    expect(validationRequestSchema.safeParse({ expression }).success).toBe(true);
  });
  it("leaves expression rejection to authoritative parser", () => {
    expect(validationRequestSchema.safeParse({ expression: "x".repeat(201) }).success).toBe(true);
    expect(validationRequestSchema.safeParse({ expression: 1 }).success).toBe(false);
  });
  it("enforces validation result discrimination and counts", () => {
    expect(validationResultSchema.safeParse({ status: "rejected", code: "SYNTAX", message: "Revise input" }).success).toBe(true);
    expect(validationResultSchema.safeParse({ status: "evaluated", passed: 2, total: 5, allPassed: true,
      example: { passed: false, actual: 1, expected: 4050 } }).success).toBe(false);
    expect(validationResultSchema.safeParse({ status: "rejected", code: "SYNTAX", message: "Revise", stack: "internal" }).success).toBe(false);
  });
  it("permits actionable safe errors", () => {
    expect(errorResponseSchema.safeParse({ error: { code: "INPUT", message: "Revise", issues: [{ path: "prediction", message: "Enter text" }] } }).success).toBe(true);
    expect(errorResponseSchema.safeParse({ error: { code: "INPUT", message: "Revise", stack: "internal" } }).success).toBe(false);
  });
});
