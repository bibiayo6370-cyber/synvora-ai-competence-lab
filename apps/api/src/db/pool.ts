import { Pool } from "pg";

export function createPool(connectionString: string) {
  return new Pool({ connectionString, max: 5, connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000, statement_timeout: 10000 });
}
