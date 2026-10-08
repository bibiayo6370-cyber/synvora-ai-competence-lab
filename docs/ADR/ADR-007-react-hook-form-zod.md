# ADR-007: React Hook Form + Zod Forms and Validation

**Status:** Accepted
**Date:** 2026-10-02

## Context

The application will contain learner inputs and structured submissions that require responsive client-side form handling and reliable validation at trust boundaries.

## Decision

Use React Hook Form for frontend form state and interaction. Use Zod for structured validation. Reuse shared Zod schemas when the frontend and API are validating the same shared contract. Server-side validation remains authoritative.

## Rationale

React Hook Form provides focused form-state management without making forms application-global state. Zod supports runtime validation and integrates naturally with TypeScript and the shared-contract strategy.

## Consequences

- Client validation improves UX but never replaces API validation.
- UI-only schemas may remain in `apps/web`.
- Shared domain/API schemas belong in `packages/shared`.
- Validation errors should be presented accessibly and clearly.

## Alternatives Considered

- **Manual form state/validation everywhere:** rejected because it would create repeated boilerplate and inconsistent behavior.
- **Frontend-only validation:** rejected because the browser is not a trusted boundary.

## Related Decisions

- `docs/ARCHITECTURE/SYSTEM_ARCHITECTURE.md`
- `AGENTS.md`
