import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { errorResponseSchema } from "@synvora/shared";
import { ApplicationError } from "./errors.js";
export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  let status = 500, code = "INTERNAL_ERROR", message = "The request could not be completed. Please try again.";
  if (error instanceof ApplicationError) { status = error.status; code = error.code; message = error.message; }
  else if (error instanceof ZodError) { status = 400; code = "INVALID_INPUT"; message = "Check the required fields, allowed fields, and text length limits."; }
  else if (typeof error === "object" && error !== null && "type" in error) {
    if (error.type === "entity.too.large") { status = 413; code = "BODY_TOO_LARGE"; message = "Use a request body smaller than 32 KiB."; }
    if (error.type === "entity.parse.failed") { status = 400; code = "INVALID_JSON"; message = "Send a valid JSON object."; }
    if (error.type === "encoding.unsupported" || error.type === "charset.unsupported") { status = 415; code = "UNSUPPORTED_ENCODING"; message = "Send uncompressed UTF-8 JSON."; }
  }
  res.status(status).json(errorResponseSchema.parse({ error: { code, message } }));
};
