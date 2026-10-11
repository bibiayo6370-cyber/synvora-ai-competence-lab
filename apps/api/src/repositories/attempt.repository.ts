import type { Evidence, EvidenceType, Stage, ValidationResult, ValidationRun } from "@synvora/shared";
export interface AttemptRecord {
  id: string; challengeId: "001"; challengeVersion: "0.1"; secretDigest: string; stage: Stage;
  createdAt: string; updatedAt: string; expiresAt: string; completedAt: string | null;
  prediction: string | null; predictionAt: string | null; revealedAt: string | null; validationCount: number;
  evidence: Evidence[]; validations: ValidationRun[];
}
export interface AttemptUnit {
  record: AttemptRecord;
  now: string;
  evidence(type: EvidenceType, content: string): Promise<void>;
  validation(expression: string, result: ValidationResult): Promise<void>;
}
export interface AttemptRepository {
  create(id: string, secretDigest: string): Promise<AttemptRecord>;
  withAttempt<T>(id: string, operation: (unit: AttemptUnit) => Promise<T>): Promise<T | undefined>;
  deleteExpired(): Promise<number>;
}
