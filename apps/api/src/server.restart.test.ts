import { spawn, type ChildProcess } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { it, expect } from "vitest";
import { healthResponseSchema } from "@synvora/shared";
import { databaseUrl } from "./config/env.js";

async function launch(overrides: NodeJS.ProcessEnv = {}): Promise<{ child: ChildProcess; port: number }> {
  // Fixed compiled application executable; learner text is never an executable argument.
  const child = spawn(process.execPath, ["--env-file=.env", "dist/server.js"], {
    cwd: fileURLToPath(new URL("../", import.meta.url)), env: { ...process.env, PORT: "0", ...overrides },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const deadline = Date.now() + 60000;
  let phase = "listener announcement";
  let stderrTail = "";
  let sawStderr = false;
  const categories = new Set<string>();
  // Never echo raw child output: allowlist fixed diagnostic categories only.
  child.stderr!.on("data", chunk => {
    sawStderr = true;
    stderrTail = (stderrTail + String(chunk)).slice(-2048);
    for (const [text, category] of [
      ["API startup failed; verify database connectivity and run migrations", "database/schema startup failure"],
      ["API listener failed", "listener failure"],
      ["Database connection error; details suppressed", "database connection failure"]
    ]) if (stderrTail.includes(text)) categories.add(category);
  });
  const diagnostic = (reason: string) => new Error(`${reason}; phase=${phase}; exit=${child.exitCode ?? "pending"}; ` +
    `signal=${child.signalCode ?? "none"}; stderr=${categories.size ? [...categories].join(", ") : sawStderr ? "unrecognized output (content suppressed)" : "none"}`);
  try {
    const port = await new Promise<number>((resolve, reject) => {
      const timer = setTimeout(() => reject(diagnostic("Compiled API startup timed out")), Math.max(1, deadline - Date.now()));
      let text = "";
      child.stdout!.on("data", chunk => {
        text = (text + String(chunk)).slice(-1024);
        const match = /listening on port (\d+)/.exec(text);
        if (match && Number(match[1]) > 0 && Number(match[1]) <= 65535) {
          clearTimeout(timer); resolve(Number(match[1]));
        }
      });
      child.once("error", () => { clearTimeout(timer); reject(diagnostic("Compiled API could not launch")); });
      child.once("close", () => { clearTimeout(timer); reject(diagnostic("Compiled API exited before readiness")); });
    });
    phase = "HTTP health readiness";
    let lastHealth = "not checked";
    while (Date.now() < deadline) {
      if (child.exitCode !== null || child.signalCode !== null) throw diagnostic("Compiled API exited before HTTP readiness");
      try {
        const response = await fetch(`http://127.0.0.1:${port}/api/health`, {
          signal: AbortSignal.timeout(Math.max(1, Math.min(2000, deadline - Date.now())))
        });
        if (response.status === 200) {
          const parsed = healthResponseSchema.safeParse(await response.json());
          if (parsed.success && parsed.data.service === "@synvora/api") return { child, port };
          lastHealth = "invalid health contract or service identity";
        } else {
          lastHealth = `HTTP status ${response.status}`;
          await response.body?.cancel();
        }
      } catch { lastHealth = "health request or JSON decoding failed"; }
      await delay(100);
    }
    throw diagnostic(`Compiled API HTTP readiness timed out (${lastHealth})`);
  } catch (error) {
    await stop(child);
    throw error;
  }
}
async function stop(child: ChildProcess) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  await new Promise<void>((resolve, reject) => {
    const forced = setTimeout(() => { child.kill("SIGKILL"); }, 5000);
    const timeout = setTimeout(() => { reject(new Error("Compiled API did not stop within 10 seconds")); }, 10000);
    child.once("exit", () => { clearTimeout(forced); clearTimeout(timeout); resolve(); });
    child.kill("SIGTERM");
  });
}

it("persists an authorized development smoke attempt across an actual compiled server restart", async () => {
  const pool = new Pool({ connectionString: databaseUrl(process.env.DATABASE_URL, "synvora_dev"), max: 1 });
  let server: Awaited<ReturnType<typeof launch>> | undefined;
  let id: string | undefined;
  try {
    server = await launch();
    let base = `http://127.0.0.1:${server.port}`;
    const create = await fetch(`${base}/api/attempts`, { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: "001", challengeVersion: "0.1" }) });
    expect(create.status).toBe(201);
    const body = await create.json() as { attempt: {id: string}; accessSecret: string };
    id = body.attempt.id;
    const headers = { Authorization: `Bearer ${body.accessSecret}`, "Content-Type": "application/json" };
    const prediction = await fetch(`${base}/api/attempts/${id}/prediction`, { method: "POST", headers, body: JSON.stringify({ prediction: "123" }) });
    expect(prediction.status).toBe(200);
    await stop(server.child); server = await launch(); base = `http://127.0.0.1:${server.port}`;
    const resumed = await fetch(`${base}/api/attempts/${id}`, { headers });
    expect(resumed.status).toBe(200);
    const snapshot = await resumed.json() as { stage: string; prediction: {text: string}; reference: unknown };
    expect(snapshot.stage).toBe("run"); expect(snapshot.prediction.text).toBe("123"); expect(snapshot.reference).toBeNull();
  } finally {
    try { if (server) await stop(server.child); }
    finally {
      // Only the newly created smoke attempt is removed, with cascading child rows.
      try { if (id) await pool.query("DELETE FROM challenge_attempts WHERE id=$1", [id]); }
      finally { await pool.end(); }
    }
  }
}, 180000);

it("reports compiled startup failure with lifecycle diagnostics and suppresses credential-bearing output", async () => {
  // Invalid Node option fails before application startup; this test creates no database data.
  // NODE_OPTIONS causes the fixed marker to appear in Node's startup diagnostic.
  const marker = "synthetic-private-marker";
  let failure: unknown;
  try { await launch({ NODE_OPTIONS: `--${marker}` }); }
  catch (error) { failure = error; }
  expect(failure instanceof Error).toBe(true);
  const message = (failure as Error).message;
  expect(message).toContain("exited before readiness");
  expect(message).toContain("phase=listener announcement");
  expect(message).toContain("exit=9");
  expect(message).toContain("content suppressed");
  expect(message.includes(marker)).toBe(false);
}, 90000);
