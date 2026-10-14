import { buildChallenge001Report } from "../assessment/challenge-001-report.js";
import { ApplicationError } from "../http/errors.js";
import type { AttemptService } from "./attempt.service.js";

export class ReportService {
  constructor(private readonly attempts: Pick<AttemptService, "get">) {}
  async get(id: string, secret: string) {
    // Input/authentication is handled by the existing attempt boundary. Internal
    // evidence/output Zod failures must never be translated into learner 400s.
    const snapshot = await this.attempts.get(id, secret).catch((error: unknown) => {
      if (error instanceof ApplicationError && error.status === 404) throw error;
      throw new ApplicationError(500, "INTERNAL_ERROR", "The report could not be generated. Please try again.");
    });
    if (snapshot.stage !== "completed") {
      throw new ApplicationError(409, "REPORT_NOT_READY", "Complete this attempt before requesting its report.");
    }
    try { return buildChallenge001Report(snapshot); }
    catch { throw new ApplicationError(500, "INTERNAL_ERROR", "The report could not be generated. Please try again."); }
  }
}
