import { useEffect, useRef } from "react";
import type { AttemptCoordinator } from "./use-attempt.js";
import { PredictStage } from "./predict-stage.js";
import { RunStage } from "./run-stage.js";
import { InvestigateStage } from "./investigate-stage.js";
import { ModifyStage } from "./modify-stage.js";
import { ValidateStage } from "./validate-stage.js";
import { ReflectStage } from "./reflect-stage.js";
import { CompletionStage } from "./completion-stage.js";
import { ReferenceResult } from "./reference-result.js";
import { Card } from "../../components/ui/card.js";
import { Button } from "../../components/ui/button.js";
export function AttemptJourney({ journey: j }: { journey: AttemptCoordinator }) {
  const target = useRef<HTMLDivElement>(null);
  const stage = j.snapshot?.stage;
  useEffect(() => { target.current?.focus(); }, [stage, j.panel]);
  if (!j.snapshot || !j.challenge) return null;
  let content;
  if (stage === "completed") return <Card><div ref={target} tabIndex={-1} aria-label="Current learner stage" className="stack"><CompletionStage journey={j} /></div></Card>;
  else if (j.panel === "reference" && stage === "investigate") content = <><h2>Observe the reference result</h2><ReferenceResult snapshot={j.snapshot} /><Button onClick={() => j.showPanel("stage")}>Continue to investigation</Button></>;
  else if (stage === "validate" || (stage === "reflect" && j.panel === "validation")) content = <ValidateStage journey={j} />;
  else if (stage === "predict") content = <PredictStage journey={j} />;
  else if (stage === "run") content = <RunStage journey={j} />;
  else if (stage === "investigate") content = <InvestigateStage journey={j} />;
  else if (stage === "modify") content = <ModifyStage journey={j} />;
  else content = <ReflectStage journey={j} />;
  return <div className="journey-grid"><Card><div ref={target} tabIndex={-1} aria-label="Current learner stage" className="stack">{content}</div></Card>
    <Card className="stack"><h2>Challenge context</h2><p>{j.challenge.objective}</p><pre><code>{j.challenge.starterCode}</code></pre>
      {j.panel !== "reference" && <ReferenceResult snapshot={j.snapshot} />}
      <details><summary>{j.challenge.resource.title}</summary><p>{j.challenge.resource.content}</p></details>
    </Card></div>;
}
