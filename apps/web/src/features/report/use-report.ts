import { useEffect, useRef, useState } from "react";
import type { CompetenceReport } from "@synvora/shared";
import type { ApiClient } from "../../lib/api-client.js";
import { ApiError, TransportError } from "../../lib/api-errors.js";
import type { AttemptSession } from "../../lib/attempt-session.js";

type State = { owner: AttemptSession | null; report: CompetenceReport | null; busy: boolean; error: string };
const matches = (a: AttemptSession | null, b: AttemptSession | null) => a?.attemptId === b?.attemptId && a?.secret === b?.secret;
const initialVersion = () => 0;

/** Read-only, memory-only report state. Credentials never leave the coordinator. */
export function useReport(api: ApiClient, owner: AttemptSession | null, enabled: boolean, onUnavailable: () => void, sessionVersion = initialVersion) {
  const [state, setState] = useState<State>({ owner: null, report: null, busy: false, error: "" });
  const [retry, setRetry] = useState(0);
  const context = useRef({ owner, enabled }); context.current = { owner, enabled };
  const generation = useRef(0);
  useEffect(() => {
    const controller = new AbortController(), token = ++generation.current;
    const version = sessionVersion();
    if (!enabled || !owner) {
      setState({ owner: null, report: null, busy: false, error: "" });
      return () => controller.abort();
    }
    const active = () => !controller.signal.aborted && token === generation.current &&
      context.current.enabled && matches(context.current.owner, owner) && version === sessionVersion();
    setState({ owner, report: null, busy: true, error: "" });
    void api.report(owner, controller.signal).then(report => {
      if (active()) setState({ owner, report, busy: false, error: "" });
    }).catch((failure: unknown) => {
      if (!active()) return;
      if (failure instanceof ApiError && [401, 404].includes(failure.status)) {
        setState({ owner: null, report: null, busy: false, error: "" }); onUnavailable(); return;
      }
      const message = failure instanceof ApiError ? failure.message : failure instanceof TransportError && failure.kind === "protocol" ?
        "The report response could not be verified. Your saved completion evidence is still shown below." :
        "The report could not be loaded. Check your connection and retry. Your saved completion evidence is still shown below.";
      setState({ owner, report: null, busy: false, error: message });
    });
    return () => controller.abort();
  }, [api, owner?.attemptId, owner?.secret, enabled, retry, onUnavailable, sessionVersion]);
  const current = enabled && matches(state.owner, owner);
  return { report: current ? state.report : null, reportBusy: enabled && (!current || state.busy), reportError: current ? state.error : "",
    retryReport: () => { if (enabled && !state.busy) setRetry(value => value + 1); } };
}
