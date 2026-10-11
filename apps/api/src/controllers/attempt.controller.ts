import type { Request, RequestHandler } from "express";
import type { z } from "zod";
import { attemptIdSchema, attemptSnapshotSchema, createAttemptSchema, createAttemptResponseSchema,
  predictionSchema, investigationSchema, modificationSchema, validationRequestSchema, reflectionSchema,
  emptyRequestSchema, validationResponseSchema } from "@synvora/shared";
import { ApplicationError } from "../http/errors.js";
import type { AttemptService } from "../services/attempt.service.js";

function credentials(req: Request) {
  const header = req.get("Authorization");
  const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(header ?? "");
  if (!match) throw new ApplicationError(401, "UNAUTHORIZED", "Provide this attempt's bearer secret in the Authorization header.");
  return { id: attemptIdSchema.parse(req.params.id), secret: match[1] };
}
export class AttemptController {
  constructor(private readonly service: AttemptService) {}
  create: RequestHandler = async (req, res) => {
    createAttemptSchema.parse(req.body);
    res.set("Cache-Control", "no-store").status(201).json(createAttemptResponseSchema.parse(await this.service.create()));
  };
  get: RequestHandler = async (req, res) => {
    const { id, secret } = credentials(req);
    res.json(attemptSnapshotSchema.parse(await this.service.get(id, secret)));
  };
  private submit<T>(schema: z.ZodType<T>, operation: (id: string, secret: string, body: T) => Promise<unknown>): RequestHandler {
    return async (req, res) => {
      const { id, secret } = credentials(req);
      const body = schema.parse(req.body ?? {});
      res.json(attemptSnapshotSchema.parse(await operation(id, secret, body)));
    };
  }
  prediction = this.submit(predictionSchema, (id, secret, body) => this.service.prediction(id, secret, body.prediction));
  reveal = this.submit(emptyRequestSchema, (id, secret) => this.service.reveal(id, secret));
  investigation = this.submit(investigationSchema, (id, secret, body) => this.service.investigation(id, secret, body.explanation));
  modification = this.submit(modificationSchema, (id, secret, body) => this.service.modification(id, secret, body.expression));
  reflection = this.submit(reflectionSchema, (id, secret, body) => this.service.reflection(id, secret, body.reflection, body.aiUseDeclaration));
  validation: RequestHandler = async (req, res) => {
    const { id, secret } = credentials(req);
    const body = validationRequestSchema.parse(req.body);
    const result = validationResponseSchema.parse(await this.service.validation(id, secret, body.expression));
    res.status(result.validation.status === "rejected" ? 422 : 200).json(result);
  };
}
