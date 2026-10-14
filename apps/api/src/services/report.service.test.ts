import { describe, expect, it, vi } from "vitest";
import { attemptSnapshotSchema, type Stage } from "@synvora/shared";
import { completedEvidence } from "../test-support/report-fixture.js";
import { ApplicationError, notFound } from "../http/errors.js";
import { ReportService } from "./report.service.js";

describe("protected report service", () => {
  it("delegates access to the existing attempt service and does not mutate its result", async () => {
    const snapshot = completedEvidence(), before = structuredClone(snapshot);
    const get = vi.fn().mockResolvedValue(snapshot);
    const report = await new ReportService({ get }).get(snapshot.id, "synthetic test input");
    expect(get).toHaveBeenCalledExactlyOnceWith(snapshot.id, "synthetic test input");
    expect(report.learningJourney).toEqual(snapshot); expect(snapshot).toEqual(before);
  });
  it("preserves inaccessible/expired 404 before revealing report readiness", async () => {
    const get = vi.fn().mockRejectedValue(notFound());
    await expect(new ReportService({ get }).get(completedEvidence().id, "synthetic test input")).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });
  });
  it.each(["predict", "run", "investigate", "modify", "validate", "reflect"] satisfies Stage[])("returns REPORT_NOT_READY for %s", async stage => {
    const get = vi.fn().mockResolvedValue(completedEvidence({ stage, completedAt: null }));
    await expect(new ReportService({ get }).get(completedEvidence().id, "synthetic test input")).rejects.toMatchObject({ status: 409, code: "REPORT_NOT_READY" });
  });
  it("sanitizes repository and internal evidence validation failures", async () => {
    const invalid = attemptSnapshotSchema.safeParse({});
    if (invalid.success) throw new Error("Expected invalid synthetic snapshot");
    for (const error of [new Error("SYNTHETIC_PRIVATE_MARKER"), invalid.error]) {
      const service = new ReportService({ get: vi.fn().mockRejectedValue(error) });
      await expect(service.get(completedEvidence().id, "synthetic test input")).rejects.toMatchObject({ status: 500, code: "INTERNAL_ERROR" });
      try { await service.get(completedEvidence().id, "synthetic test input"); }
      catch (failure) { expect((failure as Error).message).not.toContain("SYNTHETIC_PRIVATE_MARKER"); }
    }
  });
  it("sanitizes report DTO inconsistency as an internal error", async () => {
    const snapshot = completedEvidence(); snapshot.validations[0].sequence = 2;
    const service = new ReportService({ get: vi.fn().mockResolvedValue(snapshot) });
    await expect(service.get(snapshot.id, "synthetic test input")).rejects.toBeInstanceOf(ApplicationError);
    await expect(service.get(snapshot.id, "synthetic test input")).rejects.toMatchObject({ status: 500, code: "INTERNAL_ERROR" });
  });
});
