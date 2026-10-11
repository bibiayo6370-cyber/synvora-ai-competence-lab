import { z } from "zod";
import { CHALLENGE_ID, CHALLENGE_VERSION } from "../constants/challenge.constants.js";
export const challengeSchema = z.strictObject({ id: z.literal(CHALLENGE_ID), version: z.literal(CHALLENGE_VERSION),
  title: z.string().min(1), objective: z.string().min(1), starterCode: z.string().min(1), modificationTemplate: z.string().min(1),
  resource: z.strictObject({ title: z.string().min(1), author: z.literal("SYNVORA"), content: z.string().min(1) }),
  example: z.strictObject({ price: z.literal(1500), quantity: z.literal(3), discount: z.literal(10), expected: z.literal(4050) }),
  permittedSyntax: z.string().min(1), limits: z.strictObject({ length: z.literal(200), nodes: z.literal(50), depth: z.literal(12) })
});
