import type { ValidationResult } from "@synvora/shared";
import { fixtures } from "../challenges/challenge-001.fixtures.js";
import { parseExpression, ExpressionError } from "../expressions/parser.js";
import { interpret } from "../expressions/interpreter.js";
export const TOLERANCE = 1e-8;
export function validateExpression(expression: string): ValidationResult {
  try {
    const ast = parseExpression(expression);
    const outcomes = fixtures.map(fixture => {
      const actual = interpret(ast, { total: fixture.price * fixture.quantity, discount: fixture.discount });
      return { actual, passed: Math.abs(actual - fixture.expected) <= TOLERANCE };
    });
    const passed = outcomes.filter(outcome => outcome.passed).length;
    return { status: "evaluated", passed, total: 5, allPassed: passed === 5,
      example: { ...outcomes[0], expected: 4050 } };
  } catch (error) {
    if (!(error instanceof ExpressionError)) throw error;
    return { status: "rejected", code: error.code, message: error.message };
  }
}
