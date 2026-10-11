import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { databaseUrl } from "../config/env.js";

export async function isolatedDatabase() {
  const url = databaseUrl(process.env.TEST_DATABASE_URL, "synvora_test");
  if (url === process.env.DATABASE_URL) throw new Error("Test and development connections must differ");
  const admin = new Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 5000 });
  const schema = `synvora_test_${randomUUID().replaceAll("-", "")}`;
  const identity = await admin.query<{name: string}>("SELECT current_database() AS name");
  if (identity.rows[0].name !== "synvora_test") { await admin.end(); throw new Error("Incorrect test database"); }
  await admin.query(`CREATE SCHEMA ${schema}`);
  const pool = new Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 5, connectionTimeoutMillis: 5000, statement_timeout: 10000 });
  return { pool, schema, connectionString: url, async close() {
    await pool.end();
    // Only this test's newly generated schema is removed; public and existing schemas are untouched.
    await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    await admin.end();
  } };
}
