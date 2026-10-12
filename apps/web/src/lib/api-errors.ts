export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) { super(message); }
}
export class TransportError extends Error {
  constructor(public readonly kind: "network" | "timeout" | "protocol") {
    super(kind === "protocol" ? "The server returned an unexpected response. Check your saved progress before retrying." :
      kind === "timeout" ? "The request timed out. It may have been saved; check your progress before retrying." :
      "Unable to reach the server. Your unsaved work is still here. Check your connection and retry.");
  }
}
