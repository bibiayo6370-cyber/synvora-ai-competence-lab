export function SessionNotice({ expiresAt }: { expiresAt?: string }) {
  return <aside className="notice" aria-label="Anonymous session notice">
    <strong>Anonymous demo session.</strong> Your attempt expires seven days after creation{expiresAt ? ` (${new Date(expiresAt).toLocaleString()})` : ""}.
    <p>Seven-day server retention does not guarantee seven-day browser access. Closing this tab or browser may lose access. Without its secret, an attempt cannot be recovered.</p>
    <p>Only submitted evidence is saved on the server. Refreshing can discard unsubmitted changes; keep this page open while editing.</p>
  </aside>;
}
