import type { CompetenceReport } from "@synvora/shared";
import { Card } from "../../components/ui/card.js";
import { EvidenceLinks, ReportEvidence } from "./report-evidence.js";

const labels = { code_comprehension: "Code comprehension", predictive_reasoning: "Predictive reasoning", investigation: "Investigation",
  debugging: "Debugging", modification: "Modification", validation: "Validation", explanation_reflection: "Explanation and reflection", ai_collaboration: "AI collaboration" };
export function CompetenceReportView({ report }: { report: CompetenceReport }) {
  const technical = report.technicalPerformance;
  const finalRun = technical.final.finalValidationId ? report.learningJourney.validations.find(run => run.id === technical.final.finalValidationId) : null;
  const evaluated = finalRun?.result.status === "evaluated" ? finalRun.result : null;
  return <article className="report stack" aria-label="Evidence-based competence report">
    <header className="report-header"><p className="eyebrow">Challenge {report.learningJourney.challengeId} · recorded evidence</p><h2>Competence report</h2>
      <p>Technical observations and submitted reasoning, with assessment limits made explicit.</p>
      <span className="report-badge">{technical.final.status === "checks_met" ? "Defined checks passed" : technical.final.status === "checks_not_met" ? "Technical gaps recorded" : "Technical evidence inconclusive"}</span>
    </header>
    <nav aria-label="Report sections" className="report-nav">{["Overall Competence Profile", "Competency Breakdown", "SOLO Understanding Profile", "Technical Performance", "Learning Journey Evidence", "AI Collaboration Summary", "Strengths & Growth Areas"].map((label, index) =>
      <a key={label} href={`#report-section-${index + 1}`}>{index + 1}. {label}</a>)}</nav>
    <Card id="report-section-1" aria-labelledby="report-overall"><h3 id="report-overall">Overall Competence Profile</h3><p>{report.overall.summary}</p><p className="help">Scope: one challenge's recorded evidence. No independently verified competence rating.</p></Card>
    <Card id="report-section-2" aria-labelledby="report-competencies"><h3 id="report-competencies">Competency Breakdown</h3><div className="competency-grid">{report.competencies.map(item =>
      <section key={item.id} className="competency-item"><h4>{labels[item.id]}</h4><p className="report-badge">{item.qualitativeAssessment === "not_assessed" ? "Qualitative assessment: not assessed" : "Qualitative evidence unavailable"}</p>
        {item.observations.length ? <ul>{item.observations.map((observation, index) => <li key={index}><p>{observation.summary}</p><EvidenceLinks refs={observation.evidenceRefs} /></li>)}</ul> : <p className="help">No additional observation recorded for this criterion.</p>}
        <ul className="help">{item.limitations.map(limit => <li key={limit}>{limit}</li>)}</ul>
      </section>)}</div></Card>
    <Card id="report-section-3" aria-labelledby="report-solo"><h3 id="report-solo">SOLO Understanding Profile</h3><p className="report-badge">Not assessed — no SOLO level assigned</p><p>{report.solo.reason}</p></Card>
    <Card id="report-section-4" aria-labelledby="report-technical"><h3 id="report-technical">Technical Performance</h3>
      {evaluated ? <><p className="technical-count"><strong>{evaluated.passed} of {evaluated.total}</strong> defined checks passed</p>
        <p>{technical.final.status === "checks_met" ? "The final saved expression met the defined checks." : "The final saved expression evaluated safely; some defined checks failed."}</p>
        <p>Published example: {evaluated.example.passed ? "passed" : "failed"}. Recorded result {evaluated.example.actual}; expected {evaluated.example.expected}.</p>
        <EvidenceLinks refs={[{ kind: "validation", id: finalRun!.id }]} /></> : <p>Inconclusive: final expression and validation evidence do not support a conclusive technical result. No earlier result is substituted.</p>}
      <p>{technical.recordedExecutions} recorded executions · {technical.retainedExecutions} retained.</p>
      {technical.historyTruncated && <p>Some execution history is not retained.</p>}
      <ul className="help">{technical.limitations.map(limit => <li key={limit}>{limit}</li>)}</ul>
    </Card>
    <Card id="report-section-5" aria-labelledby="report-journey"><h3 id="report-journey">Learning Journey Evidence</h3><ReportEvidence snapshot={report.learningJourney} /></Card>
    <Card id="report-section-6" aria-labelledby="report-ai"><h3 id="report-ai">AI Collaboration Summary</h3><p className="report-badge">Learner declaration · not independently verified</p>
      {report.aiCollaboration.status === "declared" ? <><p className="evidence-text">{report.aiCollaboration.declaration}</p><EvidenceLinks refs={report.aiCollaboration.evidenceRefs} /></> : <p>No AI-use declaration was supplied. This establishes neither AI use nor non-use.</p>}
      <p className="help">No observed interactions or AI contribution metrics were collected.</p>
    </Card>
    <Card id="report-section-7" aria-labelledby="report-findings"><h3 id="report-findings">Strengths &amp; Growth Areas</h3><div className="findings-grid">
      <section><h4>Evidence-supported strengths</h4>{report.strengths.length ? <ul>{report.strengths.map((item, index) => <li key={index}><p>{item.summary}</p><EvidenceLinks refs={item.evidenceRefs} /></li>)}</ul> : <p>No supported strength finding is available from this evidence.</p>}</section>
      <section><h4>Growth and review needs</h4><ul>{report.growthAreas.map((item, index) => <li key={index}><p>{item.summary}</p><EvidenceLinks refs={item.evidenceRefs} /></li>)}</ul></section>
    </div></Card>
    <Card className="next-step" aria-labelledby="report-next"><p className="eyebrow">Continue learning</p><h3 id="report-next">Your next learning step</h3><p>{report.nextStep.summary}</p><EvidenceLinks refs={report.nextStep.evidenceRefs} /><p className="help">This completed attempt is read-only.</p></Card>
    <footer><h3>Assessment limitations</h3><ul>{report.limitations.map(limit => <li key={limit}>{limit}</li>)}</ul>
      <p className="help">Report schema {report.schemaVersion} · assessment {report.assessmentVersion} · rubric {report.rubricVersion}</p>
    </footer>
  </article>;
}
