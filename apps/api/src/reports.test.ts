import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { competenceReportSchema, errorResponseSchema, attemptSnapshotSchema } from "@synvora/shared";
import { createApp } from "./app.js";
import { AttemptService } from "./services/attempt.service.js";
import { notFound } from "./http/errors.js";
import { completedEvidence } from "./test-support/report-fixture.js";

// Synthetic credential only. Real authorization is also exercised against PostgreSQL.
const auth = `Bearer ${"a".repeat(43)}`;
function setup() {
  const attempts = new AttemptService({ create: async () => { throw new Error("Unused test operation"); },
    withAttempt: async () => undefined, deleteExpired: async () => 0 });
  const get = vi.spyOn(attempts, "get").mockResolvedValue(completedEvidence());
  return { app: createApp(attempts), get, path: `/api/attempts/${completedEvidence().id}/report` };
}
describe("report HTTP boundary", () => {
  it("returns a schema-valid report with no-store", async () => {
    const { app, get, path } = setup();
    const response = await request(app).get(path).set("Authorization", auth).expect(200).expect("Cache-Control", "no-store");
    expect(competenceReportSchema.safeParse(response.body).success).toBe(true);
    expect(get).toHaveBeenCalledExactlyOnceWith(completedEvidence().id, "a".repeat(43));
  });
  it.each([undefined, "Bearer malformed"])("requires valid bearer syntax before accessing evidence %#", async authorization => {
    const { app, get, path } = setup(); const call = request(app).get(path);
    if (authorization) call.set("Authorization", authorization);
    await call.expect(401).expect("Cache-Control", "no-store");
    expect(get).not.toHaveBeenCalled();
  });
  it("rejects a malformed UUID as 400", async () => {
    const { app, get } = setup();
    await request(app).get("/api/attempts/not-a-uuid/report").set("Authorization", auth).expect(400).expect("Cache-Control", "no-store");
    expect(get).not.toHaveBeenCalled();
  });
  it("keeps inaccessible attempts indistinguishable from unknown attempts", async () => {
    const { app, get, path } = setup(); get.mockRejectedValue(notFound());
    const response = await request(app).get(path).set("Authorization", auth).expect(404).expect("Cache-Control", "no-store");
    expect(response.body.error.code).toBe("NOT_FOUND");
  });
  it("returns 409 without a report for an authorized unfinished attempt", async () => {
    const { app, get, path } = setup(); get.mockResolvedValue(completedEvidence({ stage: "predict", completedAt: null, reference: null }));
    const response = await request(app).get(path).set("Authorization", auth).expect(409).expect("Cache-Control", "no-store");
    expect(response.body.error.code).toBe("REPORT_NOT_READY"); expect(response.body.learningJourney).toBeUndefined();
  });
  it("sanitizes infrastructure and internal Zod failures as 500 rather than input errors", async () => {
    const { app, get, path } = setup(); const parsed = attemptSnapshotSchema.safeParse({});
    if (parsed.success) throw new Error("Expected invalid test data");
    for (const failure of [new Error("SYNTHETIC_PRIVATE_MARKER"), parsed.error]) {
      get.mockRejectedValue(failure);
      const response = await request(app).get(path).set("Authorization", auth).expect(500).expect("Cache-Control", "no-store");
      expect(errorResponseSchema.safeParse(response.body).success).toBe(true);
      expect(response.body.error.code).toBe("INTERNAL_ERROR");
      expect(JSON.stringify(response.body)).not.toMatch(/SYNTHETIC_PRIVATE_MARKER|stack|secret|issues/);
    }
  });
  it("maps output inconsistency to sanitized 500", async () => {
    const { app, get, path } = setup(); const snapshot = completedEvidence(); snapshot.validationCount = 0;
    get.mockResolvedValue(snapshot);
    const response = await request(app).get(path).set("Authorization", auth).expect(500).expect("Cache-Control", "no-store");
    expect(response.body.error.code).toBe("INTERNAL_ERROR");
  });
});
