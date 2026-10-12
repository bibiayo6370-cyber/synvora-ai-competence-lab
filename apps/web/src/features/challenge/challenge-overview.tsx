import type { Challenge } from "../../lib/api-client.js";
import { Card } from "../../components/ui/card.js";
import { Button } from "../../components/ui/button.js";
export function ChallengeOverview({ challenge, start, disabled, restarting }: { challenge: Challenge; start: () => void; disabled: boolean; restarting: boolean }) {
  return <div className="journey-grid"><Card className="stack">
    <p className="eyebrow">Challenge {challenge.id} · Function comprehension</p>
    <h1>{challenge.title}</h1><p>{challenge.objective}</p><pre><code>{challenge.starterCode}</code></pre>
    <p>First predict the console output. Then reveal a precomputed reference result, explain the behavior, and try a percentage discount.</p>
    {restarting && <p>Starting again replaces your browser session. Copy any unsaved text you need before starting.</p>}
    <Button disabled={disabled} onClick={start}>{restarting ? "Start again" : "Start challenge"}</Button>
  </Card><Card><h2>{challenge.resource.title}</h2><p className="help">Project-authored by {challenge.resource.author}</p><p>{challenge.resource.content}</p></Card></div>;
}
