import { EXPRESSION_LIMITS } from "@synvora/shared";
import { ExpressionError, type Ast } from "./parser.js";

export function interpret(ast: Ast, values: { total: number; discount: number }): number {
  let count = 0;
  function visit(node: Ast, depth: number): number {
    if (++count > EXPRESSION_LIMITS.nodes) throw new ExpressionError("NODE_LIMIT", "Simplify the expression.");
    if (depth > EXPRESSION_LIMITS.depth) throw new ExpressionError("DEPTH_LIMIT", "Reduce expression nesting.");
    let result: number;
    switch (node.kind) {
      case "number": result = node.value; break;
      case "identifier":
        if (node.name !== "total" && node.name !== "discount") throw new ExpressionError("UNSUPPORTED", "Unsupported name.");
        result = values[node.name]; break;
      case "group": result = visit(node.child, depth + 1); break;
      case "unary": {
        const child = visit(node.child, depth + 1);
        if (node.operator !== "+" && node.operator !== "-") throw new ExpressionError("UNSUPPORTED", "Unsupported operator.");
        result = node.operator === "+" ? child : -child; break;
      }
      case "binary": {
        const left = visit(node.left, depth + 1), right = visit(node.right, depth + 1);
        switch (node.operator) {
          case "+": result = left + right; break;
          case "-": result = left - right; break;
          case "*": result = left * right; break;
          case "/":
            if (right === 0) throw new ExpressionError("DIVISION_BY_ZERO", "The expression divides by zero for a test input. Revise the denominator.");
            result = left / right; break;
          default: throw new ExpressionError("UNSUPPORTED", "Unsupported operator.");
        }
        break;
      }
      default: throw new ExpressionError("UNSUPPORTED", "Unsupported expression node.");
    }
    if (!Number.isFinite(result)) throw new ExpressionError("NON_FINITE", "The expression produces a non-finite value. Reduce the arithmetic magnitude.");
    return result;
  }
  if (!Number.isFinite(values.total) || !Number.isFinite(values.discount)) throw new ExpressionError("NON_FINITE", "Operands must be finite.");
  return visit(ast, 1);
}
