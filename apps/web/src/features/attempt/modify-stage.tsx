import type { AttemptCoordinator } from "./use-attempt.js";
import { ExpressionEditor } from "./expression-editor.js";
export function ModifyStage({ journey }: { journey: AttemptCoordinator }) { return <><h2>Modify the return expression</h2><ExpressionEditor journey={journey} /></>; }
