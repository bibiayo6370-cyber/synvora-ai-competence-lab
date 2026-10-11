import { it, expect } from "vitest";
import { databaseUrl } from "./env.js";
it("restricts operations to dedicated local databases", () => {
  expect(databaseUrl("postgresql://localhost/synvora_dev", "synvora_dev")).toBeTruthy();
  expect(() => databaseUrl("postgresql://localhost/synvora_dev", "synvora_test")).toThrow();
  expect(() => databaseUrl("postgresql://remote/synvora_test", "synvora_test")).toThrow();
  expect(() => databaseUrl("postgresql://localhost/unrelated", "synvora_dev")).toThrow();
  expect(() => databaseUrl(undefined, "synvora_dev")).toThrow();
});
