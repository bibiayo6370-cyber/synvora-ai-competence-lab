import { z } from "zod";

export function databaseUrl(value: unknown, expected: "synvora_dev" | "synvora_test"): string {
  const result = z.string().url().safeParse(value);
  if (!result.success) throw new Error("A valid dedicated database URL is required");
  const url = new URL(result.data);
  if (!["postgres:", "postgresql:"].includes(url.protocol) || url.pathname !== `/${expected}` ||
      !["127.0.0.1", "localhost"].includes(url.hostname)) {
    throw new Error(`Use the dedicated local ${expected} database`);
  }
  return result.data;
}

export function configuration() {
  const port = z.coerce.number().int().min(0).max(65535).safeParse(process.env.PORT ?? 8000);
  if (!port.success) throw new Error("PORT must be an integer from 0 through 65535");
  return { port: port.data, databaseUrl: databaseUrl(process.env.DATABASE_URL, "synvora_dev") };
}
