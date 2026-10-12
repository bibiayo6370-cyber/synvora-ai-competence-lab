import { attemptIdSchema, createAttemptResponseSchema } from "@synvora/shared";
export const SESSION_KEY = "synvora.attempt.v1";
export type AttemptSession = { attemptId: string; secret: string };
const secretSchema = createAttemptResponseSchema.shape.accessSecret;
export function readSession(storage: Storage): AttemptSession | null {
  const raw = storage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Object.keys(value).sort().join() !== "attemptId,secret" ||
        !("attemptId" in value) || !("secret" in value) || !attemptIdSchema.safeParse(value.attemptId).success ||
        !secretSchema.safeParse(value.secret).success) throw new Error("Invalid session");
    return { attemptId: value.attemptId as string, secret: value.secret as string };
  } catch { storage.removeItem(SESSION_KEY); return null; }
}
export function writeSession(storage: Storage, value: AttemptSession) {
  storage.setItem(SESSION_KEY, JSON.stringify({ attemptId: attemptIdSchema.parse(value.attemptId), secret: secretSchema.parse(value.secret) }));
}
export function clearSession(storage: Storage) { storage.removeItem(SESSION_KEY); }
export function checkStorage(storage: Storage) {
  // Probe only the scoped key, preserving an existing session exactly.
  const existing = storage.getItem(SESSION_KEY);
  storage.setItem(SESSION_KEY, existing ?? "");
  if (existing === null) storage.removeItem(SESSION_KEY);
}
