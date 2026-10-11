import { Router } from "express";
import { AttemptController } from "../controllers/attempt.controller.js";
import type { AttemptService } from "../services/attempt.service.js";
export function attemptRoutes(service: AttemptService) {
  const router = Router();
  const controller = new AttemptController(service);
  router.use((_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
  router.post("/", controller.create);
  router.get("/:id", controller.get);
  router.post("/:id/prediction", controller.prediction);
  router.post("/:id/reveal", controller.reveal);
  router.post("/:id/investigation", controller.investigation);
  router.put("/:id/modification", controller.modification);
  router.post("/:id/validation", controller.validation);
  router.post("/:id/reflection", controller.reflection);
  return router;
}
