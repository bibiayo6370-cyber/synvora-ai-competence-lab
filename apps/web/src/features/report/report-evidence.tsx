import type { CompetenceReport, ReportEvidenceReference } from "@synvora/shared";

export const evidenceLabels = { investigation: "Investigation", modification_draft: "Submitted expression", reflection: "Reflection", ai_use_declaration: "AI-use declaration" };
export function evidenceAnchor(ref: ReportEvidenceReference): string {
  return ref.kind === "validation" ? `report-validation-${ref.id}` : ref.kind === "evidence" ? `report-evidence-${ref.type}` : `report-${ref.kind}`;
}
export function EvidenceLinks({ refs }: { refs: ReportEvidenceReference[] }) {
  return <span className="evidence-links">{refs.map((ref, index) => <a key={`${evidenceAnchor(ref)}-${index}`} href={`#${evidenceAnchor(ref)}`}
    onClick={() => document.getElementById(evidenceAnchor(ref))?.focus()}>
    {ref.kind === "validation" ? "Validation evidence" : ref.kind === "evidence" ? evidenceLabels[ref.type] : ref.kind === "attempt" ? "Attempt evidence" : ref.kind === "prediction" ? "Prediction" : "Reference result"}
  </a>)}</span>;
}
export function ReportEvidence({ snapshot }: { snapshot: CompetenceReport["learningJourney"] }) {
  return <div className="stack">
    <div id="report-attempt" tabIndex={-1} className="evidence-target"><dl className="report-meta">
      <div><dt>Challenge</dt><dd>{snapshot.challengeId} · version {snapshot.challengeVersion}</dd></div>
      <div><dt>Completed</dt><dd><time dateTime={snapshot.completedAt ?? undefined}>{snapshot.completedAt ? new Date(snapshot.completedAt).toLocaleString() : "Unavailable"}</time></dd></div>
      <div><dt>Access expires</dt><dd><time dateTime={snapshot.expiresAt}>{new Date(snapshot.expiresAt).toLocaleString()}</time></dd></div>
    </dl><p className="help">Server timestamps describe recorded events, not active learning duration.</p></div>
    {snapshot.prediction && <div id="report-prediction" tabIndex={-1} className="evidence-target"><h4>Recorded prediction</h4><p className="evidence-text">{snapshot.prediction.text}</p></div>}
    {snapshot.reference && <div id="report-reference" tabIndex={-1} className="evidence-target"><h4>Revealed reference result</h4><p className="evidence-text">{snapshot.reference.output}</p><p>{snapshot.reference.predictionMatches ? "Prediction matched" : "Prediction differed"} under the server's trimmed exact-text comparison.</p></div>}
    {snapshot.evidence.map(item => <div key={item.type} id={`report-evidence-${item.type}`} tabIndex={-1} className="evidence-target">
      <h4>{evidenceLabels[item.type]}</h4><p className={`evidence-text ${item.type === "modification_draft" ? "expression" : ""}`}>{item.content}</p>
      <p className="help">Saved <time dateTime={item.updatedAt}>{new Date(item.updatedAt).toLocaleString()}</time>.</p>
    </div>)}
    <div><h4>Retained validation history</h4><p>{snapshot.validationCount} recorded executions; {snapshot.validations.length} retained. Executions do not establish distinct learner intentions.</p>
      {!snapshot.validations.length && <p>No validation evidence is available.</p>}
      <ol className="validation-history">{snapshot.validations.map(run => <li key={run.id} id={`report-validation-${run.id}`} tabIndex={-1} className="evidence-target">
        <strong>Execution {run.sequence}</strong> · <time dateTime={run.createdAt}>{new Date(run.createdAt).toLocaleString()}</time>
        <p className="evidence-text expression">{run.expression || "(empty expression)"}</p>
        <p>{run.result.status === "evaluated" ? `${run.result.passed} of ${run.result.total} defined checks passed` : `Rejected: ${run.result.message}`}</p>
      </li>)}</ol></div>
  </div>;
}
