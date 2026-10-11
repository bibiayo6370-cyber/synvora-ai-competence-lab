import { describe, it, expect } from "vitest";
import { parseExpression, ExpressionError } from "./parser.js";
import { interpret } from "./interpreter.js";
import { validateExpression } from "../services/validation.service.js";

describe("bounded expression interpretation", () => {
  it.each(["process.exit()", "globalThis", "constructor", "total; 1", "total = 1", "Math.random()",
    "total ** 2", "total[0]", "total.discount", "'total'", '"total"', "(total", "total)", "", "1 2",
    "/*comment*/total", "total//2", "1e2", "0x10", ".5", "1.", "1_000", "`total`", "tоtal", "total\u00a0+1"])("rejects unsupported input %#", source => {
    expect(() => parseExpression(source)).toThrow(ExpressionError);
  });
  it("enforces length before parsing", () => {
    expect(() => parseExpression("1".padEnd(200))).not.toThrow();
    expect(validateExpression("1".padEnd(201))).toMatchObject({ status: "rejected", code: "TOO_LONG" });
  });
  it("counts grouping and unary depth", () => {
    expect(() => parseExpression("(".repeat(11) + "1" + ")".repeat(11))).not.toThrow();
    expect(validateExpression("(".repeat(12) + "1" + ")".repeat(12))).toMatchObject({ code: "DEPTH_LIMIT" });
    expect(() => parseExpression("-".repeat(11) + "1")).not.toThrow();
    expect(validateExpression("-".repeat(12) + "1")).toMatchObject({ code: "DEPTH_LIMIT" });
    expect(validateExpression(Array(14).fill("1").join("+"))).toMatchObject({ code: "DEPTH_LIMIT" });
  });
  it("enforces node count independently of depth", () => {
    const tree = (n: number): string => n === 1 ? "1" : `(${tree(Math.floor(n / 2))}+${tree(Math.ceil(n / 2))})`;
    expect(() => parseExpression(tree(17))).not.toThrow(); // 49 nodes
    expect(validateExpression(`+${tree(17)}`)).toMatchObject({ status: "evaluated" }); // 50 nodes
    expect(validateExpression(`++${tree(17)}`)).toMatchObject({ code: "NODE_LIMIT" });
  });
  it("respects precedence, associativity, unary signs, decimal literals", () => {
    const value = (source: string) => interpret(parseExpression(source), { total: 10, discount: 2 });
    expect(value("2+3*4")).toBe(14);
    expect(value("8/2/2")).toBe(2);
    expect(value("8-2-1")).toBe(5);
    expect(value("-(+total)+12.5")).toBe(2.5);
  });
  it.each(["total * (1 - discount / 100)", "(100-discount)*total/100"])("accepts equivalent arithmetic %#", source => {
    expect(validateExpression(source)).toMatchObject({ status: "evaluated", passed: 5, allPassed: true });
  });
  it("distinguishes failed checks from rejected arithmetic", () => {
    expect(validateExpression("total")).toMatchObject({ status: "evaluated", passed: 1, allPassed: false });
    expect(validateExpression("total / discount")).toMatchObject({ status: "rejected", code: "DIVISION_BY_ZERO" });
    expect(validateExpression("1/-0")).toMatchObject({ code: "DIVISION_BY_ZERO" });
    expect(() => interpret({ kind: "binary", operator: "*", left: { kind: "number", value: 1e200 }, right: { kind: "number", value: 1e200 } }, { total: 1, discount: 1 })).toThrow(ExpressionError);
    const large = "9".repeat(100);
    expect(validateExpression(`${large}*${large.slice(0, 90)}`)).toMatchObject({ status: "evaluated" });
    expect(() => interpret({ kind: "number", value: Infinity }, { total: 1, discount: 1 })).toThrow(ExpressionError);
    expect(() => interpret(parseExpression("total"), { total: NaN, discount: 1 })).toThrow(ExpressionError);
  });
  it("applies documented numerical tolerance", () => {
    expect(validateExpression("total*(1-discount/100)+0.000000001")).toMatchObject({ allPassed: true });
    expect(validateExpression("total*(1-discount/100)+0.0000001")).toMatchObject({ allPassed: false });
  });
});
