import { describe, it, expect, vi } from "vitest";
import { ApiClient } from "./api-client.js";
import { ApiError, TransportError } from "./api-errors.js";
import { challenge, json, session, snapshot } from "../test/contract-fixtures.js";
const evaluated = { status: "evaluated", passed: 0, total: 5, allPassed: false, example: { passed: false, actual: 0, expected: 4050 } };
describe("API trust boundary", () => {
  it.each([
    ["get", "GET", "", undefined], ["prediction", "POST", "/prediction", { prediction: "1" }],
    ["reveal", "POST", "/reveal", {}], ["investigation", "POST", "/investigation", { explanation: "Reason" }],
    ["modification", "PUT", "/modification", { expression: "total" }], ["validation", "POST", "/validation", { expression: "total" }],
    ["reflection", "POST", "/reflection", { reflection: "Reason" }]
  ] as const)("authenticates %s with the actual route and body", async (method, verb, suffix, body) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(json(method === "validation" ? { attempt: snapshot(), validation: evaluated } : snapshot()));
    const api = new ApiClient(fetcher);
    if (method === "get") await api.get(session);
    else if (method === "reveal") await api.reveal(session);
    else if (method === "reflection") await api.reflection(session, { reflection: "Reason" });
    else await api[method](session, method === "prediction" ? "1" : method === "investigation" ? "Reason" : "total");
    const [url, options] = fetcher.mock.calls[0];
    expect(url).toBe(`/api/attempts/${session.attemptId}${suffix}`); expect(String(url).includes(session.secret)).toBe(false);
    expect(options?.method).toBe(verb); expect(Boolean((options?.headers as Record<string, string>).Authorization?.startsWith("Bearer "))).toBe(true);
    expect(options?.cache).toBe("no-store"); expect(options?.credentials).toBe("omit");
    expect(options?.body ? JSON.parse(options.body as string) : undefined).toEqual(body);
  });
  it("keeps public challenge and creation unauthenticated", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(json(challenge)).mockResolvedValueOnce(json({ attempt: snapshot(), accessSecret: session.secret }, 201));
    const api = new ApiClient(fetcher); await api.challenge(); await api.create();
    expect(fetcher.mock.calls.every(([, options]) => !("Authorization" in (options?.headers ?? {})))).toBe(true);
  });
  it("parses 422 as a validation outcome with a snapshot", async () => {
    const api = new ApiClient(vi.fn<typeof fetch>().mockResolvedValue(json({ attempt: snapshot({ stage: "validate" }), validation: { status: "rejected", code: "SYNTAX", message: "Close the parenthesis." } }, 422)));
    expect((await api.validation(session, "(")).validation.status).toBe("rejected");
  });
  it.each([400, 401, 404, 409, 413, 415, 500])( "maps structured HTTP failure %i", async status => {
    const api = new ApiClient(vi.fn<typeof fetch>().mockResolvedValue(json({ error: { code: "SAFE_ERROR", message: "Revise or retry." } }, status)));
    await expect(api.get(session)).rejects.toMatchObject({ status, code: "SAFE_ERROR" });
  });
  it.each([{}, { ...snapshot(), privateField: "hidden" }])("fails closed on invalid response %#", async body => {
    const api = new ApiClient(vi.fn<typeof fetch>().mockResolvedValue(json(body)));
    await expect(api.get(session)).rejects.toBeInstanceOf(TransportError);
  });
  it("rejects inconsistent validation HTTP status", async () => {
    const api = new ApiClient(vi.fn<typeof fetch>().mockResolvedValue(json({ attempt: snapshot(), validation: evaluated }, 422)));
    await expect(api.validation(session, "total")).rejects.toMatchObject({ kind: "protocol" });
  });
  it("suppresses raw network diagnostics", async () => {
    const marker = "private-test-marker";
    const api = new ApiClient(vi.fn<typeof fetch>().mockRejectedValue(new Error(marker)));
    let failure: unknown; try { await api.get(session); } catch (error) { failure = error; }
    expect(failure instanceof ApiError).toBe(false); expect((failure as Error).message.includes(marker)).toBe(false);
  });
  it("bounds requests with a safe timeout", async () => {
    const fetcher: typeof fetch = (_url, options) => new Promise((_resolve, reject) => { options?.signal?.addEventListener("abort", () => reject(new Error("private timeout"))); });
    await expect(new ApiClient(fetcher, 5).get(session)).rejects.toMatchObject({ kind: "timeout" });
  });
  it("suppresses malformed JSON bodies", async () => {
    await expect(new ApiClient(vi.fn<typeof fetch>().mockResolvedValue(new Response("private malformed body"))).get(session)).rejects.toMatchObject({ kind: "protocol" });
  });
});
