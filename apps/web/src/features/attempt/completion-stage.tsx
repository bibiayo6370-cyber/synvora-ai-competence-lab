import type { AttemptSnapshot } from "@synvora/shared";
const labels = { investigation: "Investigation", modification_draft: "Submitted expression", reflection: "Reflection", ai_use_declaration: "AI-use declaration" };
export function CompletionStage({ snapshot }: { snapshot: AttemptSnapshot }) {
  return <div className="stack"><h2>Evidence recorded</h2><p>Your challenge evidence was submitted. Competence report forthcoming in Assignment 002C.</p>
    <p>Completed: {snapshot.completedAt ? new Date(snapshot.completedAt).toLocaleString() : "Not recorded"}.</p>
    <p>Recorded prediction: <span className="evidence-text">{snapshot.prediction?.text}</span>.</p>
    {snapshot.evidence.map(item => <section key={item.type}><h3>{labels[item.type]}</h3><p className="evidence-text">{item.content}</p></section>)}
    {!snapshot.evidence.some(item => item.type === "ai_use_declaration") && <p>No AI-use declaration was supplied.</p>}
    <p>{snapshot.validationCount} validation runs recorded; {snapshot.validations.length} retained. Investigation and reflection remain unassessed.</p>
  </div>;
}
