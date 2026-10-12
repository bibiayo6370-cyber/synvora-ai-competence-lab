import type { Stage } from "@synvora/shared";
const steps = ["Challenge", "Predict", "Run", "Investigate", "Modify", "Validate", "Reflect", "Completion"];
const stageIndex: Record<Stage, number> = { predict: 1, run: 2, investigate: 3, modify: 4, validate: 5, reflect: 6, completed: 7 };
export function JourneyStepper({ stage }: { stage?: Stage }) {
  const current = stage ? stageIndex[stage] : 0;
  return <nav aria-label="Learner journey"><ol className="stepper">{steps.map((step, index) =>
    <li key={step} aria-current={index === current ? "step" : undefined}>{index + 1}. {step}{index < current ? " ✓" : ""}</li>)}</ol></nav>;
}
