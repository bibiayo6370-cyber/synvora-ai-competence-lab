import type { AttemptSnapshot } from "@synvora/shared";
export function ReferenceResult({ snapshot }: { snapshot: AttemptSnapshot }) {
  if (!snapshot.reference) return null;
  return <section aria-label="Reference result"><h3>Precomputed reference result</h3><pre><code>{snapshot.reference.output}</code></pre>
    <p>Recorded prediction: <span className="evidence-text">{snapshot.prediction?.text}</span> (locked).</p>
    <p>{snapshot.reference.predictionMatches ? "Your prediction matches the reference text." : "Your prediction differs from the reference text."}</p>
  </section>;
}
