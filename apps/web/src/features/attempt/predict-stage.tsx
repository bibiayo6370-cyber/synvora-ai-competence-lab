import { predictionSchema } from "@synvora/shared";
import type { AttemptCoordinator } from "./use-attempt.js";
import { TextEvidenceForm } from "../../components/text-evidence-form.js";
export function PredictStage({ journey: j }: { journey: AttemptCoordinator }) {
  return <><h2>Predict the output</h2><p>Trace the arguments through the function. What text would appear in the console? Your prediction is recorded once and cannot be edited afterward.</p>
    <TextEvidenceForm name="prediction" label="Predicted console output" help="Submit your prediction before seeing the reference result." value={j.drafts.prediction.value} dirty={j.drafts.prediction.dirty}
      schema={predictionSchema} max={200} action="Submit prediction" disabled={j.busy || j.needsReconcile || !j.hasSession} singleLine
      onEdit={value => j.edit("prediction", value)} onSubmit={value => j.submit("prediction", value)} /></>;
}
