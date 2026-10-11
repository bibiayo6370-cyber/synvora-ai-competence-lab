import { z } from "zod";

export const rejectionCodes = ["TOO_LONG", "SYNTAX", "UNSUPPORTED", "NODE_LIMIT", "DEPTH_LIMIT", "DIVISION_BY_ZERO", "NON_FINITE"] as const;
export const validationResultSchema = z.discriminatedUnion("status", [
  z.strictObject({ status: z.literal("rejected"), code: z.enum(rejectionCodes), message: z.string().min(1).max(300) }),
  z.strictObject({ status: z.literal("evaluated"), passed: z.number().int().min(0).max(5),
    total: z.literal(5), allPassed: z.boolean(),
    example: z.strictObject({ passed: z.boolean(), actual: z.number().finite(), expected: z.literal(4050) })
  }).refine(value => value.allPassed === (value.passed === value.total), "Inconsistent test counts")
]);
export const validationRunSchema = z.strictObject({ id: z.uuid(), expression: z.string().max(200),
  sequence: z.number().int().positive(), createdAt: z.iso.datetime(), result: validationResultSchema });
export type ValidationResult = z.infer<typeof validationResultSchema>;
export type ValidationRun = z.infer<typeof validationRunSchema>;
export type RejectionCode = typeof rejectionCodes[number];
