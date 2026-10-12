import { describe, it, expect } from "vitest";
import { checkStorage, clearSession, readSession, SESSION_KEY, writeSession } from "./attempt-session.js";
import { session } from "../test/contract-fixtures.js";
describe("credentials-only session", () => {
  it("stores only the attempt ID and secret and round-trips", () => {
    writeSession(sessionStorage, session);
    expect(Object.keys(JSON.parse(sessionStorage.getItem(SESSION_KEY)!)).sort()).toEqual(["attemptId", "secret"]);
    expect(readSession(sessionStorage)?.attemptId).toBe(session.attemptId);
  });
  it.each(["{", "{}", JSON.stringify({ ...session, evidence: [] }), JSON.stringify({ attemptId: "bad", secret: "bad" })])("clears malformed scoped data %#", value => {
    sessionStorage.setItem(SESSION_KEY, value); sessionStorage.setItem("unrelated", "keep");
    expect(readSession(sessionStorage)).toBeNull(); expect(sessionStorage.getItem("unrelated")).toBe("keep");
  });
  it("preserves existing session during probe and clears only its key", () => {
    writeSession(sessionStorage, session); checkStorage(sessionStorage);
    expect(readSession(sessionStorage)?.attemptId).toBe(session.attemptId);
    sessionStorage.setItem("unrelated", "keep"); clearSession(sessionStorage);
    expect(sessionStorage.getItem("unrelated")).toBe("keep");
  });
  it("propagates storage failure so the UI can prevent creation", () => {
    const blocked = { getItem: () => { throw new Error("denied"); } } as unknown as Storage;
    expect(() => checkStorage(blocked)).toThrow("denied");
  });
});
