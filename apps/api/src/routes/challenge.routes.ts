import { Router } from "express";
import { getChallenge } from "../controllers/challenge.controller.js";
export function challengeRoutes() {
  const router = Router(); router.get("/001", getChallenge); return router;
}
