import { z } from "zod";
export const errorResponseSchema = z.strictObject({ error: z.strictObject({
  code: z.string().min(1), message: z.string().min(1),
  issues: z.array(z.strictObject({ path: z.string(), message: z.string() })).optional()
}) });
