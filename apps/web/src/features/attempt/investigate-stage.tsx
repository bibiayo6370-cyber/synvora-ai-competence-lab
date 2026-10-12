import { investigationSchema } from "@synvora/shared";
import { TextEvidenceForm } from "../../components/text-evidence-form.js";
import type { AttemptCoordinator } from "./use-attempt.js";
export function InvestigateStage({ journey: j }: { journey: AttemptCoordinator }) {
  return <><h2>Investigate the behavior</h2><p>Explain which arguments fill each parameter, how multiplication determines the return value, and any difference from your prediction. Your reasoning is stored, not automatically graded.</p>
    <TextEvidenceForm name="explanation" label="Investigation explanation" help="Describe your reasoning in your own words." value={j.drafts.investigation.value} dirty={j.drafts.investigation.dirty}
      schema={investigationSchema} max={4000} action="Save investigation" disabled={j.busy || j.needsReconcile || !j.hasSession}
      onEdit={value => j.edit("investigation", value)} onSubmit={value => j.submit("investigation", value)} /></>;
}
