import type { RequestHandler } from "express";
import { challengeSchema } from "@synvora/shared";
import { publicChallenge } from "../challenges/challenge-001.js";
export const getChallenge: RequestHandler = (_req, res) => { res.json(challengeSchema.parse(publicChallenge)); };
