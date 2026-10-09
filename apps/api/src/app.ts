import express from "express";
import { healthResponseSchema } from "@synvora/shared";

export const app = express();

app.get("/api/health", (_req, res) => {
  const response = healthResponseSchema.parse({
    status: "ok",
    service: "@synvora/api",
    timestamp: new Date().toISOString(),
  });

  res.status(200).json(response);
});
