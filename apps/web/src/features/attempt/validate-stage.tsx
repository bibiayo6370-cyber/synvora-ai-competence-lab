import { useEffect } from "react";
import type { AttemptCoordinator } from "./use-attempt.js";
import { ExpressionEditor } from "./expression-editor.js";
import { ValidationFeedback } from "./validation-feedback.js";
import { Button } from "../../components/ui/button.js";
export function ValidateStage({ journey: j }: { journey: AttemptCoordinator }) {
  const latest = j.snapshot?.validations[0];
  const canReflect = j.snapshot?.stage === "reflect" && latest?.result.status === "evaluated" && latest.expression === j.drafts.expression.value;
  useEffect(() => {
    if (j.validation?.status === "rejected") document.getElementById("expression")?.focus();
  }, [j.validation]);
  return <div className="stack"><h2>Validate your expression</h2><ValidationFeedback result={j.validation} />
    {j.drafts.expression.dirty && j.validation && <p className="help">The result above is from submitted evidence, not your newer unsaved edit.</p>}
    <ExpressionEditor journey={j} validate />
    {canReflect && <Button variant="outline" disabled={j.busy || j.needsReconcile || !j.hasSession} onClick={() => j.showPanel("stage")}>Continue to reflection</Button>}
  </div>;
}
