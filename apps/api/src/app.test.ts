import { describe, expect, it } from "vitest";
import request from "supertest";
import { healthResponseSchema } from "@synvora/shared";
import { createApp } from "./app.js";
const app = createApp();

describe("Express HTTP API", () => {
  it("returns a valid health response with the expected service identity", async () => {
    const response = await request(app)
      .get("/api/health")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const result = healthResponseSchema.safeParse(response.body);

    expect(result.success).toBe(true);
    if (!result.success) {
      throw result.error;
    }
    expect(result.data.service).toBe("@synvora/api");
  });

  it("returns 404 for an unsupported route", async () => {
    await request(app).get("/api/unsupported-route").expect(404);
  });
});
