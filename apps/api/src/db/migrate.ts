import { databaseUrl } from "../config/env.js";
import { createPool } from "./pool.js";
import { migrate } from "./migrations.js";

const target = process.argv[2];
if (target !== "dev" && target !== "test") throw new Error("Specify dev or test");
const pool = createPool(databaseUrl(target === "dev" ? process.env.DATABASE_URL : process.env.TEST_DATABASE_URL,
  target === "dev" ? "synvora_dev" : "synvora_test"));
try {
  const applied = await migrate(pool);
  console.log(`Migrations applied: ${applied.length}`);
} catch {
  console.error("Migration failed; database details suppressed");
  process.exitCode = 1;
} finally { await pool.end(); }
