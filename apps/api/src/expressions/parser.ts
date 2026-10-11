import { EXPRESSION_LIMITS, type RejectionCode } from "@synvora/shared";

export class ExpressionError extends Error {
  constructor(public readonly code: RejectionCode, message: string) { super(message); }
}
export type Ast =
  | { kind: "number"; value: number }
  | { kind: "identifier"; name: "total" | "discount" }
  | { kind: "group"; child: Ast }
  | { kind: "unary"; operator: "+" | "-"; child: Ast }
  | { kind: "binary"; operator: "+" | "-" | "*" | "/"; left: Ast; right: Ast };
type Token = { kind: "number" | "identifier" | "symbol" | "end"; text: string };

export function parseExpression(source: string): Ast {
  if (source.length > EXPRESSION_LIMITS.length) throw new ExpressionError("TOO_LONG", "Use at most 200 characters.");
  let position = 0;
  let count = 0;
  function next(): Token {
    while (/[ \t\r\n\f\v]/.test(source[position] ?? "") && position < source.length) position++;
    if (position === source.length) return { kind: "end", text: "" };
    const rest = source.slice(position);
    const number = /^\d+(?:\.\d+)?/.exec(rest);
    if (number) { position += number[0].length; return { kind: "number", text: number[0] }; }
    const identifier = /^[A-Za-z_][A-Za-z_0-9]*/.exec(rest);
    if (identifier) { position += identifier[0].length; return { kind: "identifier", text: identifier[0] }; }
    const char = source[position++];
    if ("()+-*/".includes(char)) return { kind: "symbol", text: char };
    throw new ExpressionError("UNSUPPORTED", "Only total, discount, decimal numbers, parentheses, and + - * / are allowed.");
  }
  let token = next();
  const advance = () => { token = next(); };
  function node<T extends Ast>(value: T): T {
    if (++count > EXPRESSION_LIMITS.nodes) throw new ExpressionError("NODE_LIMIT", "Simplify the expression to at most 50 syntax nodes.");
    return value;
  }
  function unary(depth: number): Ast {
    if (depth > EXPRESSION_LIMITS.depth) throw new ExpressionError("DEPTH_LIMIT", "Use at most 12 levels of nesting.");
    if (token.text === "+" || token.text === "-") {
      const operator = token.text; advance();
      return node({ kind: "unary", operator, child: unary(depth + 1) });
    }
    if (token.text === "(") {
      advance(); const child = expression(depth + 1);
      if ((token as Token).text !== ")") throw new ExpressionError("SYNTAX", "Close every opening parenthesis.");
      advance(); return node({ kind: "group", child });
    }
    if (token.kind === "number") {
      const value = Number(token.text); advance();
      if (!Number.isFinite(value)) throw new ExpressionError("NON_FINITE", "Use finite decimal numbers.");
      return node({ kind: "number", value });
    }
    if (token.kind === "identifier") {
      if (token.text !== "total" && token.text !== "discount") throw new ExpressionError("UNSUPPORTED", "Only the names total and discount are allowed.");
      const name = token.text; advance(); return node({ kind: "identifier", name });
    }
    throw new ExpressionError("SYNTAX", "Enter a number, total, discount, or a parenthesized expression.");
  }
  function term(depth: number): Ast {
    let left = unary(depth);
    while (token.text === "*" || token.text === "/") {
      const operator = token.text; advance(); left = node({ kind: "binary", operator, left, right: unary(depth) });
    }
    return left;
  }
  function expression(depth: number): Ast {
    let left = term(depth);
    while (token.text === "+" || token.text === "-") {
      const operator = token.text; advance(); left = node({ kind: "binary", operator, left, right: term(depth) });
    }
    return left;
  }
  const ast = expression(1);
  if (token.kind !== "end") throw new ExpressionError("SYNTAX", "Submit one complete expression with no trailing input.");
  // Check actual tree depth too: long left-associative operator chains form deep ASTs.
  function check(value: Ast, depth: number): void {
    if (depth > EXPRESSION_LIMITS.depth) throw new ExpressionError("DEPTH_LIMIT", "Simplify the expression to at most 12 syntax levels.");
    if (value.kind === "binary") { check(value.left, depth + 1); check(value.right, depth + 1); }
    if (value.kind === "group" || value.kind === "unary") check(value.child, depth + 1);
  }
  check(ast, 1);
  return ast;
}
