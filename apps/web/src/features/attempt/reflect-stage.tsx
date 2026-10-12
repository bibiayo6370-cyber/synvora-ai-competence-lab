import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { reflectionSchema } from "@synvora/shared";
import type { AttemptCoordinator } from "./use-attempt.js";
import { Label } from "../../components/ui/label.js";
import { Textarea } from "../../components/ui/textarea.js";
import { Button } from "../../components/ui/button.js";
import { FieldFeedback } from "../../components/field-feedback.js";
import { ValidationFeedback } from "./validation-feedback.js";
const formSchema = reflectionSchema.extend({ aiUseDeclaration: z.union([z.literal(""), reflectionSchema.shape.aiUseDeclaration]) });
export function ReflectStage({ journey: j }: { journey: AttemptCoordinator }) {
  const { register, setValue, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema),
    defaultValues: { reflection: j.drafts.reflection.value, aiUseDeclaration: j.drafts.aiUseDeclaration.value } });
  useEffect(() => {
    setValue("reflection", j.drafts.reflection.value); setValue("aiUseDeclaration", j.drafts.aiUseDeclaration.value);
  }, [j.drafts.reflection.value, j.drafts.aiUseDeclaration.value, setValue]);
  return <div className="stack"><h2>Reflect on the evidence</h2><ValidationFeedback result={j.validation} />
    <p>Explain what changed, why, what the checks showed, and what is still uncertain. Reflection and AI-use notes are recorded without automatic grading.</p>
    <form noValidate className="stack" onSubmit={handleSubmit(body => j.submit("reflection", "", { reflection: body.reflection,
      ...(body.aiUseDeclaration ? { aiUseDeclaration: body.aiUseDeclaration } : {}) }))}>
      {([ ["reflection", "Reflection", 4000], ["aiUseDeclaration", "AI-use declaration (optional)", 2000] ] as const).map(([name, label, max]) => {
        const field = register(name);
        return <div key={name}><Label htmlFor={name}>{label}</Label><Textarea {...field} id={name} maxLength={max}
          aria-invalid={Boolean(errors[name])} aria-describedby={`${name}-help${errors[name] ? ` ${name}-error` : ""}`}
          onChange={event => { void field.onChange(event); j.edit(name, event.target.value); }} />
          <p id={`${name}-help`} className="help">{j.drafts[name].value.length}/{max} characters. {j.drafts[name].dirty ? "Unsaved — refresh can discard this text." : "Not submitted yet."}</p>
          <FieldFeedback id={`${name}-error`} message={errors[name]?.message} /></div>;
      })}
      <div className="actions"><Button type="submit" disabled={j.busy || j.needsReconcile || !j.hasSession}>Record reflection and complete</Button>
        <Button variant="outline" disabled={j.busy} onClick={() => j.showPanel("validation")}>Edit / revalidate expression</Button></div>
    </form></div>;
}
