import { attemptSnapshotSchema, type AttemptSnapshot } from "@synvora/shared";

/** Synthetic public evidence for report tests; no bearer credentials/private cases. */
export function completedEvidence(overrides: Partial<AttemptSnapshot> = {}): AttemptSnapshot {
  const time = "2026-10-12T08:00:00.000Z";
  const expression = "total * (1 - discount / 100)";
  return attemptSnapshotSchema.parse({ id: "00000000-0000-4000-8000-000000000001", challengeId: "001", challengeVersion: "0.1",
    stage: "completed", createdAt: time, updatedAt: time, completedAt: time, expiresAt: "2026-10-19T08:00:00.000Z", validationCount: 1,
    prediction: { text: "4500", submittedAt: time }, reference: { label: "reference result", output: "4500", predictionMatches: true, revealedAt: time },
    evidence: [
      { type: "investigation", content: "Arguments fill parameters; return sends their product to the caller.", createdAt: time, updatedAt: time },
      { type: "modification_draft", content: expression, createdAt: time, updatedAt: time },
      { type: "reflection", content: "The defined checks passed; more inputs need consideration.", createdAt: time, updatedAt: time }
    ], validations: [{ id: "00000000-0000-4000-8000-000000000002", sequence: 1, createdAt: time, expression,
      result: { status: "evaluated", passed: 5, total: 5, allPassed: true, example: { passed: true, actual: 4050, expected: 4050 } } }], ...overrides });
}
