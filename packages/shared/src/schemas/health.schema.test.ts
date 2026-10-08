import { describe, expect, it } from "vitest";
import { healthResponseSchema } from "./health.schema.js";

describe("healthResponseSchema", () => {
  const validResponse = {
    status: "ok",
    service: "synvora-api",
    timestamp: "2026-10-08T12:00:00.000Z",
  };

  it("accepts a valid health response", () => {
    const result = healthResponseSchema.safeParse(validResponse);

    expect(result.success).toBe(true);
  });

  it("rejects an invalid status", () => {
    const result = healthResponseSchema.safeParse({
      ...validResponse,
      status: "failed",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty service name", () => {
    const result = healthResponseSchema.safeParse({
      ...validResponse,
      service: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid timestamp", () => {
    const result = healthResponseSchema.safeParse({
      ...validResponse,
      timestamp: "not-a-date",
    });

    expect(result.success).toBe(false);
  });
});
