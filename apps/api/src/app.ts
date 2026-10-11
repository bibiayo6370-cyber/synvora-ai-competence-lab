import express from "express";
import { healthResponseSchema } from "@synvora/shared";
import type { AttemptService } from "./services/attempt.service.js";
import { attemptRoutes } from "./routes/attempt.routes.js";
import { challengeRoutes } from "./routes/challenge.routes.js";
import { ApplicationError } from "./http/errors.js";
import { errorHandler } from "./http/error-handler.js";

export function createApp(attemptService?: AttemptService) {
  const app = express();
  app.disable("x-powered-by");
  app.use("/api/attempts", (_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
  app.use(express.json({ limit: "32kb", inflate: false }));
  app.get("/api/health", (_req, res) => {
    res.status(200).json(healthResponseSchema.parse({ status: "ok", service: "@synvora/api", timestamp: new Date().toISOString() }));
  });
  app.use("/api/challenges", challengeRoutes());
  if (attemptService) app.use("/api/attempts", attemptRoutes(attemptService));
  app.use((_req, _res, next) => next(new ApplicationError(404, "NOT_FOUND", "Resource not found.")));
  app.use(errorHandler);
  return app;
}
