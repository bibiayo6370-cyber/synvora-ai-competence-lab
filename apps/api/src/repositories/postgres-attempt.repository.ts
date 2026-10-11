import { randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { validationResultSchema, type Evidence, type EvidenceType, type ValidationResult, type ValidationRun } from "@synvora/shared";
import { transaction } from "../db/transaction.js";
import type { AttemptRecord, AttemptRepository, AttemptUnit } from "./attempt.repository.js";

interface Row {
  id: string; challenge_id: "001"; challenge_version: "0.1"; secret_digest: string; stage: AttemptRecord["stage"];
  created_at: Date; updated_at: Date; expires_at: Date; completed_at: Date | null;
  prediction: string | null; prediction_at: Date | null; revealed_at: Date | null; validation_count: number;
}
function record(row: Row): AttemptRecord {
  return { id: row.id, challengeId: row.challenge_id, challengeVersion: row.challenge_version,
    secretDigest: row.secret_digest, stage: row.stage, createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString(),
    expiresAt: row.expires_at.toISOString(), completedAt: row.completed_at?.toISOString() ?? null,
    prediction: row.prediction, predictionAt: row.prediction_at?.toISOString() ?? null,
    revealedAt: row.revealed_at?.toISOString() ?? null, validationCount: row.validation_count, evidence: [], validations: [] };
}
async function children(client: PoolClient, value: AttemptRecord) {
  const evidence = await client.query<{ type: EvidenceType; content: string; created_at: Date; updated_at: Date }>(
    "SELECT type,content,created_at,updated_at FROM attempt_evidence WHERE attempt_id=$1 ORDER BY type", [value.id]);
  value.evidence = evidence.rows.map(row => ({ type: row.type, content: row.content,
    createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString() }));
  const runs = await client.query<{id: string; expression: string; result: unknown; sequence: number; created_at: Date}>(
    "SELECT id,expression,result,sequence,created_at FROM validation_runs WHERE attempt_id=$1 ORDER BY sequence DESC LIMIT 100", [value.id]);
  value.validations = runs.rows.map(row => ({ id: row.id, expression: row.expression, sequence: row.sequence,
    createdAt: row.created_at.toISOString(), result: validationResultSchema.parse(row.result) }));
}

export class PostgresAttemptRepository implements AttemptRepository {
  constructor(private readonly pool: Pool) {}
  async create(id: string, secretDigest: string): Promise<AttemptRecord> {
    const result = await this.pool.query<Row>(`WITH stamp AS (SELECT date_trunc('milliseconds', clock_timestamp()) AS now)
      INSERT INTO challenge_attempts(id,challenge_id,challenge_version,secret_digest,stage,created_at,updated_at,expires_at)
      SELECT $1,'001','0.1',$2,'predict',now,now,now + interval '168 hours' FROM stamp RETURNING *`, [id, secretDigest]);
    return record(result.rows[0]);
  }
  async withAttempt<T>(id: string, operation: (unit: AttemptUnit) => Promise<T>): Promise<T | undefined> {
    return transaction(this.pool, async client => {
      const selected = await client.query<Row>("SELECT * FROM challenge_attempts WHERE id=$1 FOR UPDATE", [id]);
      if (!selected.rows[0]) return undefined;
      const value = record(selected.rows[0]);
      const timestamp = await client.query<{now: Date}>("SELECT date_trunc('milliseconds', clock_timestamp()) AS now");
      const now = timestamp.rows[0].now.toISOString();
      await children(client, value);
      const before = JSON.stringify(value);
      const result = await operation({ record: value, now,
        evidence: async (type: EvidenceType, content: string) => {
          await client.query(`INSERT INTO attempt_evidence(id,attempt_id,type,content,created_at,updated_at)
            VALUES($1,$2,$3,$4,$5,$5) ON CONFLICT(attempt_id,type) DO UPDATE SET content=EXCLUDED.content,updated_at=EXCLUDED.updated_at`,
          [randomUUID(), id, type, content, now]);
          const existing = value.evidence.find(item => item.type === type);
          if (existing) { existing.content = content; existing.updatedAt = now; }
          else value.evidence.push({ type, content, createdAt: now, updatedAt: now });
        },
        validation: async (expression: string, validation: ValidationResult) => {
          const run: ValidationRun = { id: randomUUID(), expression, sequence: ++value.validationCount, result: validation, createdAt: now };
          await client.query("INSERT INTO validation_runs(id,attempt_id,expression,result,sequence,created_at) VALUES($1,$2,$3,$4,$5,$6)",
            [run.id, id, expression, JSON.stringify(validation), run.sequence, now]);
          await client.query("DELETE FROM validation_runs WHERE attempt_id=$1 AND sequence <= $2", [id, run.sequence - 100]);
          value.validations = [run, ...value.validations].slice(0, 100);
        }
      });
      if (JSON.stringify(value) !== before) {
        value.updatedAt = now;
        await client.query(`UPDATE challenge_attempts SET stage=$2,updated_at=$3,completed_at=$4,
          prediction=$5,prediction_at=$6,revealed_at=$7,validation_count=$8 WHERE id=$1`,
        [id, value.stage, now, value.completedAt, value.prediction, value.predictionAt, value.revealedAt, value.validationCount]);
      }
      return result as T;
    });
  }
  async deleteExpired(): Promise<number> {
    const result = await this.pool.query("DELETE FROM challenge_attempts WHERE expires_at <= clock_timestamp()");
    return result.rowCount ?? 0;
  }
}
