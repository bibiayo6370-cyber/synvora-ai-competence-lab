export function FieldFeedback({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} role="alert" className="field-error">{message}</p> : null;
}
