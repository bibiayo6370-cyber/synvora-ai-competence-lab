import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "./ui/button.js";
import { Input } from "./ui/input.js";
import { Textarea } from "./ui/textarea.js";
import { Label } from "./ui/label.js";
import { FieldFeedback } from "./field-feedback.js";
export function TextEvidenceForm({ name, label, help, value, dirty, schema, max, action, disabled, onEdit, onSubmit, expression = false, singleLine = false }: {
  name: string; label: string; help: string; value: string; dirty: boolean; schema: z.ZodType<Record<string, string>, Record<string, string>>;
  max: number; action: string; disabled: boolean; onEdit: (value: string) => void; onSubmit: (value: string) => Promise<void>; expression?: boolean; singleLine?: boolean;
}) {
  const { register, setValue, handleSubmit, formState: { errors } } = useForm<Record<string, string>>({ resolver: zodResolver(schema), defaultValues: { [name]: value } });
  useEffect(() => { setValue(name, value); }, [name, value, setValue]);
  const field = register(name);
  const Comp = singleLine ? Input : Textarea;
  return <form onSubmit={handleSubmit(body => onSubmit(body[name]))} noValidate className="stack">
    <div><Label htmlFor={name}>{label}</Label>
      <Comp {...field} id={name} maxLength={max} className={expression ? "expression" : ""} spellCheck={!expression}
        autoCapitalize={expression ? "off" : undefined} autoCorrect={expression ? "off" : undefined}
        aria-invalid={Boolean(errors[name])} aria-describedby={`${name}-help ${name}-saved${errors[name] ? ` ${name}-error` : ""}`}
        onChange={event => { void field.onChange(event); onEdit(event.target.value); }} />
      <p id={`${name}-help`} className="help">{help} {value.length}/{max} characters.</p>
      <p id={`${name}-saved`} className="help">{dirty ? "Unsaved changes — refresh can discard this text." : value ? "Matches saved evidence." : "Not submitted yet."}</p>
      <FieldFeedback id={`${name}-error`} message={errors[name]?.message as string | undefined} />
    </div><Button type="submit" disabled={disabled}>{action}</Button>
  </form>;
}
