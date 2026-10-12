import { modificationSchema, validationRequestSchema } from "@synvora/shared";
import { TextEvidenceForm } from "../../components/text-evidence-form.js";
import type { AttemptCoordinator } from "./use-attempt.js";
export function ExpressionEditor({ journey: j, validate = false }: { journey: AttemptCoordinator; validate?: boolean }) {
  if (!j.challenge) return null;
  return <><p>Complete only the return expression. The function template stays fixed.</p><pre><code>{j.challenge.modificationTemplate}</code></pre>
    <p>Published example: price {j.challenge.example.price}, quantity {j.challenge.example.quantity}, discount {j.challenge.example.discount}% → {j.challenge.example.expected}.</p>
    <TextEvidenceForm name="expression" label="Return expression" help={`${j.challenge.permittedSyntax} Use ASCII operators and whitespace. Decimals need digits on both sides of the dot. Server limits: ${j.challenge.limits.nodes} nodes, depth ${j.challenge.limits.depth}.`}
      value={j.drafts.expression.value} dirty={j.drafts.expression.dirty} schema={validate ? validationRequestSchema : modificationSchema} max={j.challenge.limits.length} expression
      action={validate ? "Validate expression" : "Save expression and continue"} disabled={j.busy || j.needsReconcile || !j.hasSession}
      onEdit={value => j.edit("expression", value)} onSubmit={value => j.submit(validate ? "validation" : "modification", value)} /></>;
}
