import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, it, expect } from "vitest";
import { isolatedDatabase } from "../test-support/database.js";
import { migrate, verifySchema } from "./migrations.js";

describe("transactional migrations", () => {
  it("applies once under concurrent runners and verifies schema", async () => {
    const db = await isolatedDatabase();
    try {
      const results = await Promise.all([migrate(db.pool), migrate(db.pool)]);
      expect(results.flat().length).toBe(1);
      expect(await migrate(db.pool)).toEqual([]);
      await verifySchema(db.pool);
      const tables = await db.pool.query("SELECT tablename FROM pg_tables WHERE schemaname=$1", [db.schema]);
      expect(tables.rows.map(row => row.tablename).sort()).toEqual(["attempt_evidence", "challenge_attempts", "schema_migrations", "validation_runs"]);
    } finally { await db.close(); }
  });
  it("rolls back failed DDL and tracking, rejects changed history and out-of-order additions", async () => {
    const db = await isolatedDatabase();
    const directory = await mkdtemp(join(tmpdir(), "synvora-migrations-"));
    const url = pathToFileURL(`${directory}/`);
    try {
      await writeFile(join(directory, "002_good.sql"), "CREATE TABLE first_table(id integer);");
      await writeFile(join(directory, "003_bad.sql"), "CREATE TABLE rolled_back(id integer); SELECT missing_column;");
      await expect(migrate(db.pool, url)).rejects.toThrow();
      const history = await db.pool.query("SELECT name FROM schema_migrations");
      expect(history.rows.map(row => row.name)).toEqual(["002_good.sql"]);
      const exists = await db.pool.query("SELECT to_regclass('rolled_back') AS name");
      expect(exists.rows[0].name).toBeNull();
      await writeFile(join(directory, "003_bad.sql"), "CREATE TABLE rolled_back(id integer);");
      expect(await migrate(db.pool, url)).toEqual(["003_bad.sql"]);
      await writeFile(join(directory, "001_late.sql"), "CREATE TABLE late_table(id integer);");
      await expect(migrate(db.pool, url)).rejects.toThrow("before applied history");
      await writeFile(join(directory, "002_good.sql"), "CREATE TABLE changed(id integer);");
      await expect(migrate(db.pool, url)).rejects.toThrow("checksum");
    } finally { await db.close(); await rm(directory, { recursive: true }); }
  });
});
