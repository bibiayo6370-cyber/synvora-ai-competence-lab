import { defineConfig } from "vitest/config";
const database = process.env.SYNVORA_DB_TESTS === "1";
const restart = process.env.SYNVORA_RESTART_TEST === "1";
export default defineConfig({ test: {
  include: restart ? ["src/**/*.restart.test.ts"] : database ? ["src/**/*.integration.test.ts"] : ["src/**/*.test.ts"],
  exclude: database || restart ? [] : ["src/**/*.integration.test.ts", "src/**/*.restart.test.ts"],
  fileParallelism: false,
  testTimeout: 30000,
  hookTimeout: 30000
} });
