import { Alert } from "./ui/alert.js";
import { Button } from "./ui/button.js";
export function RecoveryPanel({ error, notice, warning, busy, retry, showRetry }: {
  error: string; notice: string; warning: string; busy: boolean; retry: () => void; showRetry: boolean;
}) {
  return <div className="stack">
    {warning && <Alert>{warning}</Alert>}
    {error && <Alert>{error}</Alert>}
    <div role="status" aria-live="polite">{busy ? "Working… Your current text is kept." : notice}</div>
    {showRetry && <Button variant="outline" disabled={busy} onClick={retry}>Check saved progress / Retry connection</Button>}
  </div>;
}
