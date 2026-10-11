import { it, expect } from "vitest";
import { generateSecret, digestSecret, verifySecret } from "./attempt-secret.js";
it("creates distinct unguessable secrets and verifies only their digests", () => {
  const secret = generateSecret(), other = generateSecret();
  expect(secret).toMatch(/^[A-Za-z0-9_-]{43}$/);
  expect(secret === other).toBe(false);
  const digest = digestSecret(secret);
  expect(digest === secret).toBe(false);
  expect(verifySecret(secret, digest)).toBe(true);
  expect(verifySecret(other, digest)).toBe(false);
  expect(verifySecret("invalid", digest)).toBe(false);
  expect(verifySecret(secret, "invalid")).toBe(false);
});
