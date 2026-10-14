import type { AttemptCoordinator } from "./use-attempt.js";
import { CompetenceReportView } from "../report/competence-report.js";
import { Button } from "../../components/ui/button.js";
import { Alert } from "../../components/ui/alert.js";
const labels = { investigation: "Investigation", modification_draft: "Submitted expression", reflection: "Reflection", ai_use_declaration: "AI-use declaration" };
export function CompletionStage({ journey }: { journey: AttemptCoordinator }) {
  const { snapshot, report, reportBusy, reportError, retryReport, hasSession } = journey;
  if (!snapshot) return null;
  return <div className="stack"><h2>Evidence recorded</h2><p>Your challenge evidence was submitted. This completed attempt is read-only.</p>
    <p aria-live="polite">{reportBusy ? "Loading your evidence-based report…" : report ? "Your evidence-based report is ready." : ""}</p>
    {reportError && <div className="stack"><Alert>{reportError}</Alert><Button disabled={reportBusy || !hasSession} onClick={retryReport}>Retry report</Button></div>}
    {report ? <CompetenceReportView report={report} /> : <section aria-label="Saved completion evidence">
    <p>Completed: {snapshot.completedAt ? new Date(snapshot.completedAt).toLocaleString() : "Not recorded"}.</p>
    <p>Recorded prediction: <span className="evidence-text">{snapshot.prediction?.text}</span>.</p>
    {snapshot.evidence.map(item => <section key={item.type}><h3>{labels[item.type]}</h3><p className="evidence-text">{item.content}</p></section>)}
    {!snapshot.evidence.some(item => item.type === "ai_use_declaration") && <p>No AI-use declaration was supplied.</p>}
    <p>{snapshot.validationCount} validation runs recorded; {snapshot.validations.length} retained. Investigation and reflection remain unassessed.</p>
    </section>}
  </div>;
}
