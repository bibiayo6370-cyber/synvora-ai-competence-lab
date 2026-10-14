import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { AttemptSnapshot } from "@synvora/shared";
import { ApiClient, type Challenge, type ReflectionRequest } from "../../lib/api-client.js";
import { ApiError } from "../../lib/api-errors.js";
import { checkStorage, clearSession, readSession, writeSession, type AttemptSession } from "../../lib/attempt-session.js";
import { initialJourney, journeyReducer, mergeDrafts, savedValue, type DraftKey, type Panel } from "./attempt-state.js";
import { useReport } from "../report/use-report.js";
export type Operation = "prediction" | "reveal" | "investigation" | "modification" | "validation" | "reflection";
type Pending = { operation: Operation; text: string; reflection?: ReflectionRequest; before: AttemptSnapshot };
function accepted(snapshot: AttemptSnapshot, pending: Pending): boolean {
  const { operation, text } = pending;
  if (operation === "prediction") return snapshot.prediction?.text === text;
  if (operation === "reveal") return snapshot.reference !== null;
  if (operation === "validation") return snapshot.validations.some(run => run.sequence > pending.before.validationCount && run.expression === text);
  if (operation === "reflection") return snapshot.stage === "completed" && savedValue(snapshot, "reflection") === pending.reflection?.reflection &&
    savedValue(snapshot, "aiUseDeclaration") === (pending.reflection?.aiUseDeclaration ?? "");
  return savedValue(snapshot, operation === "modification" ? "expression" : "investigation") === text;
}
export function useAttempt(api: ApiClient) {
  const [state, dispatch] = useReducer(journeyReducer, undefined, initialJourney);
  const stateRef = useRef(state); stateRef.current = state;
  const session = useRef<AttemptSession | null>(null);
  const generation = useRef(0);
  const locked = useRef(false);
  const uncertain = useRef<Pending | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [storageWarning, setStorageWarning] = useState("");
  const [storageReady, setStorageReady] = useState(false);
  const [needsReconcile, setNeedsReconcile] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const loseSession = useCallback(() => {
    session.current = null; generation.current++; uncertain.current = null;
    try { clearSession(window.sessionStorage); } catch { /* Storage may be unavailable. */ }
    setHasSession(false); setNeedsReconcile(false);
    setError("This attempt is unavailable. Access may have expired or its secret may no longer be valid. There is no recovery without the secret. You can start again; any text still on screen can be copied first.");
  }, []);
  const reconcile = useCallback(async (signal?: AbortSignal) => {
    const value = session.current;
    if (!value) return;
    const token = generation.current;
    const restoring = stateRef.current.snapshot === null;
    const snapshot = await api.get(value, signal);
    if (signal?.aborted || token !== generation.current) return;
    const pending = uncertain.current;
    const confirmed = pending && accepted(snapshot, pending);
    const requiresValidation = snapshot.stage === "reflect" && (snapshot.validations[0]?.result.status !== "evaluated" ||
      snapshot.validations[0]?.expression !== savedValue(snapshot, "expression"));
    dispatch({ type: "snapshot", snapshot, ...(requiresValidation || (pending?.operation === "validation" && confirmed) ? { panel: "validation" as Panel } : {}) });
    uncertain.current = null; setNeedsReconcile(false);
    const preservedEdits = Object.values(mergeDrafts(stateRef.current.drafts, snapshot)).some(draft => draft.dirty);
    const checked = preservedEdits ? "Saved progress checked. Your unsaved edits have been preserved on this page." : "Saved progress checked.";
    setNotice(restoring ? "Saved progress restored. Changes not submitted before refreshing may have been lost." :
      confirmed ? `Your submission was saved. ${checked}` : checked);
  }, [api]);
  const boot = useCallback(async (signal: AbortSignal) => {
    setBusy(true); setError("");
    try {
      const metadata = await api.challenge(signal);
      if (signal.aborted) return;
      setChallenge(metadata);
      try {
        session.current = readSession(window.sessionStorage); setHasSession(session.current !== null);
        try { checkStorage(window.sessionStorage); setStorageReady(true); }
        catch {
          setStorageReady(false);
          setStorageWarning("Browser session storage cannot be written. Starting a new attempt is disabled; readable existing credentials can still resume your saved work.");
        }
      } catch {
        setStorageReady(false); setStorageWarning("Browser session storage is unavailable. Enable it before starting; refresh recovery requires it.");
      }
      if (session.current) await reconcile(signal);
    } catch (failure) {
      if (signal.aborted) return;
      if (failure instanceof ApiError && [401, 404].includes(failure.status) && session.current) loseSession();
      else { setError(failure instanceof Error ? failure.message : "Unable to load the challenge. Retry."); setNeedsReconcile(session.current !== null); }
    } finally { if (!signal.aborted) setBusy(false); }
  }, [api, reconcile, loseSession]);
  useEffect(() => {
    const controller = new AbortController(); void boot(controller.signal);
    return () => { controller.abort(); generation.current++; };
  }, [boot]);
  const create = async () => {
    if (locked.current || !storageReady) return;
    locked.current = true; setBusy(true); setError(""); setNotice("");
    const token = ++generation.current;
    try {
      const result = await api.create();
      if (token !== generation.current) return;
      const value = { attemptId: result.attempt.id, secret: result.accessSecret };
      session.current = value; setHasSession(true);
      try { writeSession(window.sessionStorage, value); setStorageWarning(""); }
      catch { setStorageWarning("This attempt is accessible only while this page stays open. Its browser session could not be saved; refreshing will lose access."); }
      uncertain.current = null; setNeedsReconcile(false); dispatch({ type: "reset" }); dispatch({ type: "snapshot", snapshot: result.attempt });
    } catch {
      setError("Starting did not return usable access credentials. An attempt may have been created, but cannot be recovered without its secret. No automatic retry was made. Choose Start again explicitly when ready.");
    } finally { locked.current = false; setBusy(false); }
  };
  const submit = async (operation: Operation, text = "", reflection?: ReflectionRequest) => {
    const value = session.current, before = stateRef.current.snapshot;
    if (locked.current || needsReconcile || !value || !before) return;
    if (operation === "reflection" && stateRef.current.drafts.expression.dirty) {
      setError("Validate your newer unsaved expression before completing. Your reflection has been kept.");
      dispatch({ type: "panel", panel: "validation" }); return;
    }
    locked.current = true; setBusy(true); setError(""); setNotice("");
    const token = generation.current;
    const pending: Pending = { operation, text, reflection, before };
    try {
      const result = operation === "reflection" ? await api.reflection(value, reflection!) : operation === "reveal" ? await api.reveal(value) :
        operation === "prediction" ? await api.prediction(value, text) : operation === "investigation" ? await api.investigation(value, text) :
        operation === "modification" ? await api.modification(value, text) : await api.validation(value, text);
      if (token !== generation.current) return;
      if ("attempt" in result) dispatch({ type: "snapshot", snapshot: result.attempt, validation: result.validation, panel: "validation" });
      else dispatch({ type: "snapshot", snapshot: result, panel: operation === "reveal" ? "reference" : "stage" });
      setNotice(operation === "validation" ? "Validation recorded. Newer unsaved edits are kept." : "Evidence saved. Newer unsaved edits are kept.");
    } catch (failure) {
      if (token !== generation.current) return;
      if (failure instanceof ApiError && [401, 404].includes(failure.status)) { loseSession(); return; }
      if (failure instanceof ApiError && failure.status < 500) {
        setError(failure.message);
        if (failure.status === 409) {
          setNeedsReconcile(true);
          try { await reconcile(); }
          catch (recovery) {
            if (recovery instanceof ApiError && [401, 404].includes(recovery.status)) loseSession();
            else { setNeedsReconcile(true); setNotice("Saved progress could not be checked. Your unsaved work is still here."); }
          }
          if (failure.code === "REVALIDATION_REQUIRED") dispatch({ type: "panel", panel: "validation" });
        }
      } else {
        uncertain.current = pending; setNeedsReconcile(true);
        setError(failure instanceof Error ? failure.message : "Unable to confirm this submission.");
        try { await reconcile(); }
        catch (recovery) {
          if (recovery instanceof ApiError && [401, 404].includes(recovery.status)) loseSession();
          else setNotice("Saved progress could not be checked. Keep this page open and use Check saved progress before retrying.");
        }
      }
    } finally { locked.current = false; setBusy(false); }
  };
  const retry = async () => {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError("");
    try {
      if (!challenge) await boot(new AbortController().signal);
      else if (session.current) await reconcile();
      else {
        checkStorage(window.sessionStorage); setStorageReady(true); setStorageWarning("");
        session.current = readSession(window.sessionStorage); setHasSession(session.current !== null);
        if (session.current) await reconcile();
      }
    } catch (failure) {
      if (failure instanceof ApiError && [401, 404].includes(failure.status) && session.current) loseSession();
      else setError(failure instanceof Error ? failure.message : "Recovery failed. Try again.");
    } finally { locked.current = false; setBusy(false); }
  };
  useEffect(() => {
    if (!Object.values(state.drafts).some(draft => draft.dirty)) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [state.drafts]);
  const sessionVersion = useCallback(() => generation.current, []);
  const reportState = useReport(api, session.current, hasSession && !busy && !needsReconcile && state.snapshot?.stage === "completed", loseSession, sessionVersion);
  return { ...state, ...reportState, challenge, busy, error, notice, storageWarning, storageReady, hasSession, needsReconcile,
    create, submit, retry, edit: (key: DraftKey, text: string) => dispatch({ type: "edit", key, value: text }),
    showPanel: (panel: Panel) => { setError(""); dispatch({ type: "panel", panel }); } };
}
export type AttemptCoordinator = ReturnType<typeof useAttempt>;
