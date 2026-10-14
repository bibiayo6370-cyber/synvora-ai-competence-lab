import { z } from "zod";
import { attemptIdSchema, attemptSnapshotSchema, challengeSchema, createAttemptSchema, createAttemptResponseSchema,
  predictionSchema, investigationSchema, modificationSchema, emptyRequestSchema, validationRequestSchema,
  validationResponseSchema, reflectionSchema, errorResponseSchema, competenceReportSchema } from "@synvora/shared";
import type { AttemptSession } from "./attempt-session.js";
import { ApiError, TransportError } from "./api-errors.js";
export type Challenge = z.infer<typeof challengeSchema>;
export type ReflectionRequest = z.infer<typeof reflectionSchema>;
export class ApiClient {
  constructor(private readonly fetcher: typeof fetch = (...args) => fetch(...args), private readonly timeoutMs = 30000) {}
  private async request<T>(path: string, method: string, responseSchema: z.ZodType<T>, body?: unknown,
    session?: AttemptSession, signal?: AbortSignal, accepted = [200]): Promise<T> {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) controller.abort();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, this.timeoutMs);
    try {
      const response = await this.fetcher(path, { method, cache: "no-store", credentials: "omit", signal: controller.signal,
        headers: { ...(body === undefined ? {} : { "Content-Type": "application/json" }),
          ...(session ? { Authorization: `Bearer ${session.secret}` } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      let value: unknown;
      try { value = await response.json(); } catch { throw new TransportError("protocol"); }
      if (accepted.includes(response.status)) {
        const parsed = responseSchema.safeParse(value);
        if (!parsed.success) throw new TransportError("protocol");
        // A 422 must carry rejected validation, never an evaluated result.
        if (accepted.includes(422)) {
          const validation = validationResponseSchema.parse(value).validation;
          if ((response.status === 422) !== (validation.status === "rejected")) throw new TransportError("protocol");
        }
        return parsed.data;
      }
      const error = errorResponseSchema.safeParse(value);
      if (!error.success) throw new TransportError("protocol");
      throw new ApiError(response.status, error.data.error.code, error.data.error.message);
    } catch (error) {
      if (error instanceof ApiError || error instanceof TransportError) throw error;
      throw new TransportError(timedOut ? "timeout" : "network");
    } finally { clearTimeout(timer); signal?.removeEventListener("abort", abort); }
  }
  private path(session: AttemptSession, suffix = "") { return `/api/attempts/${attemptIdSchema.parse(session.attemptId)}${suffix}`; }
  challenge(signal?: AbortSignal) { return this.request("/api/challenges/001", "GET", challengeSchema, undefined, undefined, signal); }
  create() { return this.request("/api/attempts", "POST", createAttemptResponseSchema,
    createAttemptSchema.parse({ challengeId: "001", challengeVersion: "0.1" }), undefined, undefined, [201]); }
  get(session: AttemptSession, signal?: AbortSignal) { return this.request(this.path(session), "GET", attemptSnapshotSchema, undefined, session, signal); }
  async report(session: AttemptSession, signal?: AbortSignal) {
    const report = await this.request(this.path(session, "/report"), "GET", competenceReportSchema, undefined, session, signal);
    if (report.learningJourney.id !== session.attemptId) throw new TransportError("protocol");
    return report;
  }
  prediction(session: AttemptSession, prediction: string) { return this.request(this.path(session, "/prediction"), "POST", attemptSnapshotSchema, predictionSchema.parse({ prediction }), session); }
  reveal(session: AttemptSession) { return this.request(this.path(session, "/reveal"), "POST", attemptSnapshotSchema, emptyRequestSchema.parse({}), session); }
  investigation(session: AttemptSession, explanation: string) { return this.request(this.path(session, "/investigation"), "POST", attemptSnapshotSchema, investigationSchema.parse({ explanation }), session); }
  modification(session: AttemptSession, expression: string) { return this.request(this.path(session, "/modification"), "PUT", attemptSnapshotSchema, modificationSchema.parse({ expression }), session); }
  validation(session: AttemptSession, expression: string) { return this.request(this.path(session, "/validation"), "POST", validationResponseSchema, validationRequestSchema.parse({ expression }), session, undefined, [200, 422]); }
  reflection(session: AttemptSession, body: ReflectionRequest) { return this.request(this.path(session, "/reflection"), "POST", attemptSnapshotSchema, reflectionSchema.parse(body), session); }
}
