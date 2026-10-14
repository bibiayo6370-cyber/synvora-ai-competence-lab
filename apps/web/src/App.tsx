import { ApiClient } from "./lib/api-client.js";
import { useAttempt } from "./features/attempt/use-attempt.js";
import { ChallengeOverview } from "./features/challenge/challenge-overview.js";
import { AttemptJourney } from "./features/attempt/attempt-journey.js";
import { JourneyStepper } from "./components/journey-stepper.js";
import { SessionNotice } from "./components/session-notice.js";
import { RecoveryPanel } from "./components/recovery-panel.js";
const client = new ApiClient();
export function App({ api = client }: { api?: ApiClient }) {
  const j = useAttempt(api);
  return <><a href="#main" className="skip-link">Skip to learner journey</a><div className="shell stack">
    <header className="topbar"><span className="brand">SYNVORA</span><span className="help">AI Engineering Competence Lab</span></header>
    <SessionNotice expiresAt={j.snapshot?.expiresAt} />
    <JourneyStepper stage={j.snapshot?.stage} />
    <RecoveryPanel error={j.error} notice={j.notice} warning={j.storageWarning} busy={j.busy} retry={() => void j.retry()}
      showRetry={j.needsReconcile || Boolean(j.error) || !j.storageReady} />
    {Object.values(j.drafts).some(draft => draft.dirty) && <details className="notice">
      <summary>Unsaved work kept in this page</summary>
      <p>This text is not saved evidence. Copy it before refreshing or starting again. Newer edits are kept even after a stage changes.</p>
      {Object.entries(j.drafts).filter(([, draft]) => draft.dirty).map(([name, draft]) =>
        <section key={name}><h3>Unsaved {name}</h3><p className="evidence-text">{draft.value || "(intentionally cleared)"}</p></section>)}
    </details>}
    <main id="main" className="stack" aria-busy={j.busy}>
      {j.challenge && !j.hasSession && <ChallengeOverview challenge={j.challenge} start={() => void j.create()}
        disabled={j.busy || !j.storageReady} restarting={Boolean(j.error || j.snapshot)} />}
      {j.snapshot && <AttemptJourney journey={j} />}
    </main><footer className="help">Reports describe recorded technical evidence. Qualitative reasoning and SOLO understanding remain unassessed.</footer>
  </div></>;
}
