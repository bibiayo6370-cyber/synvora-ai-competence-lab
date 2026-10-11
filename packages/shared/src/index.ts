/**
 * Shared contracts for the AI Engineering Competency Lab.
 *
 * This package will expose validated schemas, shared types,
 * and constants used across application boundaries.
 */

export {
  healthResponseSchema,
  type HealthResponse,
} from "./schemas/health.schema.js";

export * from "./constants/challenge.constants.js";
export * from "./schemas/challenge.schema.js";
export * from "./schemas/attempt.schema.js";
export * from "./schemas/validation.schema.js";
export * from "./schemas/error.schema.js";
