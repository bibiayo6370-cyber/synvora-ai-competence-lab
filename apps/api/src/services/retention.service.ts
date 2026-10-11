import type { AttemptRepository } from "../repositories/attempt.repository.js";
export class RetentionService {
  constructor(private readonly repository: AttemptRepository) {}
  cleanup() { return this.repository.deleteExpired(); }
}
