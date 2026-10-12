import type { AttemptSnapshot, ValidationResult } from "@synvora/shared";
export type DraftKey = "prediction" | "investigation" | "expression" | "reflection" | "aiUseDeclaration";
export type Draft = { value: string; dirty: boolean };
export type Drafts = Record<DraftKey, Draft>;
export const emptyDrafts = (): Drafts => ({ prediction: { value: "", dirty: false }, investigation: { value: "", dirty: false },
  expression: { value: "", dirty: false }, reflection: { value: "", dirty: false }, aiUseDeclaration: { value: "", dirty: false } });
export function savedValue(snapshot: AttemptSnapshot | null, key: DraftKey): string {
  if (key === "prediction") return snapshot?.prediction?.text ?? "";
  const type = key === "expression" ? "modification_draft" : key === "aiUseDeclaration" ? "ai_use_declaration" : key;
  return snapshot?.evidence.find(item => item.type === type)?.content ?? "";
}
export function mergeDrafts(drafts: Drafts, snapshot: AttemptSnapshot): Drafts {
  const next = { ...drafts };
  for (const key of Object.keys(next) as DraftKey[]) {
    const saved = savedValue(snapshot, key);
    next[key] = drafts[key].dirty ? { value: drafts[key].value, dirty: drafts[key].value !== saved } : { value: saved, dirty: false };
  }
  return next;
}
export type Panel = "stage" | "reference" | "validation";
export type JourneyState = { snapshot: AttemptSnapshot | null; drafts: Drafts; panel: Panel; validation: ValidationResult | null };
export const initialJourney = (): JourneyState => ({ snapshot: null, drafts: emptyDrafts(), panel: "stage", validation: null });
export type JourneyAction = { type: "reset" } | { type: "edit"; key: DraftKey; value: string } |
  { type: "snapshot"; snapshot: AttemptSnapshot; panel?: Panel; validation?: ValidationResult } | { type: "panel"; panel: Panel };
export function journeyReducer(state: JourneyState, action: JourneyAction): JourneyState {
  if (action.type === "reset") return initialJourney();
  if (action.type === "panel") return { ...state, panel: action.panel };
  if (action.type === "edit") return { ...state, drafts: { ...state.drafts, [action.key]: {
    value: action.value, dirty: action.value !== savedValue(state.snapshot, action.key) } } };
  return { ...state, snapshot: action.snapshot, drafts: mergeDrafts(state.drafts, action.snapshot), panel: action.panel ?? state.panel,
    validation: action.validation ?? action.snapshot.validations[0]?.result ?? null };
}
