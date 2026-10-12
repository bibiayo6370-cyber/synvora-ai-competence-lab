import { Button } from "../../components/ui/button.js";
import type { AttemptCoordinator } from "./use-attempt.js";
export function RunStage({ journey: j }: { journey: AttemptCoordinator }) {
  return <><h2>Run: reveal the reference</h2><p>Your recorded prediction is locked: <strong className="evidence-text">{j.snapshot?.prediction?.text}</strong></p>
    <p>This action reveals a precomputed reference result. Learner-submitted code is not executed.</p>
    <Button disabled={j.busy || j.needsReconcile || !j.hasSession} onClick={() => void j.submit("reveal")}>Reveal reference result</Button></>;
}
