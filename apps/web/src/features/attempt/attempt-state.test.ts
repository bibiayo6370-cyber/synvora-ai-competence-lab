import { describe, it, expect } from "vitest";
import { initialJourney, journeyReducer } from "./attempt-state.js";
import { snapshot } from "../../test/contract-fixtures.js";
describe("saved evidence and dirty drafts", () => {
  it("hydrates clean drafts from persisted evidence", () => {
    const value = journeyReducer(initialJourney(), { type: "snapshot", snapshot: snapshot({ prediction: { text: "123", submittedAt: "2026-10-11T08:00:00.000Z" } }) });
    expect(value.drafts.prediction).toEqual({ value: "123", dirty: false });
  });
  it("never overwrites newer unsaved work during reconciliation or panel changes", () => {
    let state = journeyReducer(initialJourney(), { type: "edit", key: "reflection", value: "Newer work" });
    state = journeyReducer(state, { type: "snapshot", snapshot: snapshot({ evidence: [{ type: "reflection", content: "Older evidence", createdAt: "2026-10-11T08:00:00.000Z", updatedAt: "2026-10-11T08:00:00.000Z" }] }) });
    state = journeyReducer(state, { type: "panel", panel: "validation" });
    expect(state.drafts.reflection).toEqual({ value: "Newer work", dirty: true });
  });
  it("cleans only drafts matching accepted evidence", () => {
    let state = journeyReducer(initialJourney(), { type: "edit", key: "prediction", value: "123" });
    state = journeyReducer(state, { type: "snapshot", snapshot: snapshot({ stage: "run", prediction: { text: "123", submittedAt: "2026-10-11T08:00:00.000Z" } }) });
    expect(state.drafts.prediction.dirty).toBe(false);
  });
  it("preserves intentional clearing of previously saved text", () => {
    let state = journeyReducer(initialJourney(), { type: "snapshot", snapshot: snapshot({ prediction: { text: "123", submittedAt: "2026-10-11T08:00:00.000Z" } }) });
    state = journeyReducer(state, { type: "edit", key: "prediction", value: "" });
    state = journeyReducer(state, { type: "snapshot", snapshot: state.snapshot! });
    expect(state.drafts.prediction).toEqual({ value: "", dirty: true });
  });
});
