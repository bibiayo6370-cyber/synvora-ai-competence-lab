export class ApplicationError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) { super(message); }
}
export const notFound = () => new ApplicationError(404, "NOT_FOUND", "Attempt unavailable or expired.");
export const conflict = () => new ApplicationError(409, "STAGE_CONFLICT", "This action is not available at the current stage.");
