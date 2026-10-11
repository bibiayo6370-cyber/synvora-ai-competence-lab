import { configuration } from "../config/env.js";
import { createPool } from "./pool.js";
import { PostgresAttemptRepository } from "../repositories/postgres-attempt.repository.js";
import { RetentionService } from "../services/retention.service.js";
const pool = createPool(configuration().databaseUrl);
try {
  const count = await new RetentionService(new PostgresAttemptRepository(pool)).cleanup();
  console.log(`Expired attempts deleted: ${count}`);
} catch {
  console.error("Cleanup failed; database details suppressed"); process.exitCode = 1;
} finally { await pool.end(); }
