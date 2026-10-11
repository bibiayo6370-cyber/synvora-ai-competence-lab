import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import type { Pool } from "pg";

export const migrationDirectory = new URL("../../migrations/", import.meta.url);
const lock = 2002001;

export async function migrationFiles(directory = migrationDirectory) {
  const names = (await readdir(directory)).filter(name => name.endsWith(".sql")).sort();
  const numbers = new Set<string>();
  return Promise.all(names.map(async name => {
    const match = /^(\d{3})_[a-z0-9_]+\.sql$/.exec(name);
    if (!match || numbers.has(match[1])) throw new Error("Invalid or duplicate migration number");
    numbers.add(match[1]);
    const sql = await readFile(new URL(name, directory), "utf8");
    return { name, sql, checksum: createHash("sha256").update(sql).digest("hex") };
  }));
}

export async function migrate(pool: Pool, directory = migrationDirectory): Promise<string[]> {
  const files = await migrationFiles(directory);
  const client = await pool.connect();
  const applied: string[] = [];
  try {
    await client.query("SELECT pg_advisory_lock($1)", [lock]);
    await client.query("BEGIN");
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT clock_timestamp())`);
    await client.query("COMMIT");
    const history = await client.query<{ name: string; checksum: string }>("SELECT name, checksum FROM schema_migrations ORDER BY name");
    for (const row of history.rows) {
      if (!files.some(file => file.name === row.name && file.checksum === row.checksum)) {
        throw new Error("Applied migration missing or checksum changed");
      }
    }
    for (const file of files) {
      if (history.rows.some(row => row.name === file.name)) continue;
      if (history.rows.some(row => row.name > file.name)) throw new Error("Cannot insert migration before applied history");
      await client.query("BEGIN");
      await client.query(file.sql);
      await client.query("INSERT INTO schema_migrations(name, checksum) VALUES ($1, $2)", [file.name, file.checksum]);
      await client.query("COMMIT");
      applied.push(file.name);
    }
    return applied;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    try { await client.query("SELECT pg_advisory_unlock($1)", [lock]); }
    finally { client.release(); }
  }
}

export async function verifySchema(pool: Pool) {
  const files = await migrationFiles();
  const result = await pool.query<{name: string; checksum: string}>("SELECT name, checksum FROM schema_migrations ORDER BY name");
  if (result.rows.length !== files.length || files.some((file, i) =>
    result.rows[i]?.name !== file.name || result.rows[i]?.checksum !== file.checksum)) {
    throw new Error("Database migrations are not current; run the migration CLI");
  }
}
