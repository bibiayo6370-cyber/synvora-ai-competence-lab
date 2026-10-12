import { challengeSchema, attemptSnapshotSchema, type AttemptSnapshot } from "@synvora/shared";
export const attemptId = "00000000-0000-4000-8000-000000000001";
// Synthetic test credentials, never an actual attempt secret.
export const session = { attemptId, secret: "a".repeat(43) };
export const challenge = challengeSchema.parse({ id: "001", version: "0.1", title: "Understand and extend calculateTotal",
  objective: "Trace function parameters and arithmetic.", starterCode: "function calculateTotal(price, quantity) { return price * quantity; }\nconsole.log(calculateTotal(1500, 3));",
  modificationTemplate: "function calculateTotal(price, quantity, discount) {\n const total = price * quantity;\n return /* learner expression */;\n}",
  resource: { title: "Functions and parameters", author: "SYNVORA", content: "Parameters receive arguments. Return sends a value to the caller." },
  example: { price: 1500, quantity: 3, discount: 10, expected: 4050 }, permittedSyntax: "Use total, discount, decimal numbers, parentheses, and + - * /.",
  limits: { length: 200, nodes: 50, depth: 12 } });
export function snapshot(overrides: Partial<AttemptSnapshot> = {}): AttemptSnapshot {
  return attemptSnapshotSchema.parse({ id: attemptId, challengeId: "001", challengeVersion: "0.1", stage: "predict",
    createdAt: "2026-10-11T08:00:00.000Z", updatedAt: "2026-10-11T08:00:00.000Z", expiresAt: "2026-10-18T08:00:00.000Z", completedAt: null,
    validationCount: 0, prediction: null, reference: null, evidence: [], validations: [], ...overrides });
}
export function json(value: unknown, status = 200) { return new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } }); }
