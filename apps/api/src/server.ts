import { createApp } from "./app.js";
import { configuration } from "./config/env.js";
import { createPool } from "./db/pool.js";
import { verifySchema } from "./db/migrations.js";
import { PostgresAttemptRepository } from "./repositories/postgres-attempt.repository.js";
import { AttemptService } from "./services/attempt.service.js";

const config = configuration();
const pool = createPool(config.databaseUrl);
pool.on("error", () => { console.error("Database connection error; details suppressed"); });
try {
  await verifySchema(pool);
  const server = createApp(new AttemptService(new PostgresAttemptRepository(pool))).listen(config.port, "127.0.0.1", () => {
    const address = server.address();
    console.log(`SYNVORA API listening on port ${typeof address === "object" && address ? address.port : config.port}`);
  });
  server.on("error", async () => { console.error("API listener failed"); await pool.end(); process.exitCode = 1; });
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      server.close(() => { void pool.end(); });
    });
  }
} catch {
  console.error("API startup failed; verify database connectivity and run migrations");
  await pool.end(); process.exitCode = 1;
}
