import { attemptSnapshotSchema, validationResponseSchema, type AttemptSnapshot, type ValidationResult } from "@synvora/shared";
import { challenge, json, session, snapshot } from "./contract-fixtures.js";
const stamp = "2026-10-11T08:00:00.000Z";
export function mockApi(initial: AttemptSnapshot = snapshot()) {
  let current = structuredClone(initial);
  const calls: { method: string; path: string }[] = [];
  let conflictOnce = false;
  const error = (status: number, code: string, message: string) => json({ error: { code, message } }, status);
  function evidence(type: AttemptSnapshot["evidence"][number]["type"], content: string) {
    current.evidence = [...current.evidence.filter(item => item.type !== type), { type, content, createdAt: stamp, updatedAt: stamp }];
  }
  const fetcher: typeof fetch = async (input, options) => {
    const path = String(input), method = options?.method ?? "GET"; calls.push({ method, path });
    if (path === "/api/challenges/001") return json(challenge);
    if (path === "/api/attempts" && method === "POST") { current = snapshot(); return json({ attempt: current, accessSecret: session.secret }, 201); }
    if (path === `/api/attempts/${session.attemptId}`) return json(attemptSnapshotSchema.parse(current));
    const body = JSON.parse(options?.body as string ?? "{}");
    const operation = path.split("/").at(-1);
    if (operation === "prediction") {
      current.prediction = { text: body.prediction, submittedAt: stamp }; current.stage = "run";
    } else if (operation === "reveal") {
      current.reference = { label: "reference result", output: "4500", predictionMatches: current.prediction?.text.trim() === "4500", revealedAt: stamp };
      current.stage = "investigate";
    } else if (operation === "investigation") { evidence("investigation", body.explanation); current.stage = "modify"; }
    else if (operation === "modification") { evidence("modification_draft", body.expression); if (current.stage === "modify") current.stage = "validate"; }
    else if (operation === "validation") {
      const expression: string = body.expression;
      const result: ValidationResult = expression === "total" ? { status: "evaluated", passed: 1, total: 5, allPassed: false, example: { passed: false, actual: 4500, expected: 4050 } } :
        { status: "rejected", code: expression === "total/0" ? "DIVISION_BY_ZERO" : "SYNTAX", message: "Revise the denominator or enter a complete expression." };
      if (expression.length) evidence("modification_draft", expression);
      current.validationCount++;
      current.validations.unshift({ id: `00000000-0000-4000-8000-${String(current.validationCount).padStart(12, "0")}`, expression, sequence: current.validationCount, createdAt: stamp, result });
      if (result.status === "evaluated") current.stage = "reflect";
      return json(validationResponseSchema.parse({ attempt: current, validation: result }), result.status === "rejected" ? 422 : 200);
    } else if (operation === "reflection") {
      const latest = current.validations[0];
      if (conflictOnce || !latest || latest.result.status !== "evaluated" || latest.expression !== current.evidence.find(item => item.type === "modification_draft")?.content) {
        conflictOnce = false; return error(409, "REVALIDATION_REQUIRED", "Validate the current draft again before submitting reflection. It must evaluate safely; technical tests may still fail.");
      }
      evidence("reflection", body.reflection); if (body.aiUseDeclaration) evidence("ai_use_declaration", body.aiUseDeclaration);
      current.stage = "completed"; current.completedAt = stamp;
    } else return error(404, "NOT_FOUND", "Resource not found.");
    return json(attemptSnapshotSchema.parse(current));
  };
  return { fetcher, calls, current: () => structuredClone(current), revalidationConflict: () => { conflictOnce = true; } };
}
export function atValidate(): AttemptSnapshot {
  return snapshot({ stage: "validate", prediction: { text: "123", submittedAt: stamp },
    reference: { label: "reference result", output: "4500", predictionMatches: false, revealedAt: stamp },
    evidence: [{ type: "investigation", content: "Arguments explain the result.", createdAt: stamp, updatedAt: stamp },
      { type: "modification_draft", content: "total", createdAt: stamp, updatedAt: stamp }] });
}
