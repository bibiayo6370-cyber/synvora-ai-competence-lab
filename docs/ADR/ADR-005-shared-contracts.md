# ADR-005: Shared Contracts Between Application Boundaries

**Status:** Accepted
**Date:** 2026-10-02

## Context

The web and API applications need consistent definitions for data exchanged across their boundary. Independently recreating request, response, and domain shapes would create drift and duplicated validation logic.

## Decision

Create `packages/shared` as the authoritative location for contracts genuinely shared across application boundaries. It may contain Zod domain/API schemas, TypeScript types, enums, constants, and API contract definitions.

## Rationale

A shared contract package reduces duplication while preserving the separation between applications. Zod schemas can provide runtime validation while TypeScript provides compile-time types.

## Consequences

- Shared contracts should be reused rather than independently recreated.
- `packages/shared` must remain framework-agnostic where practical.
- It must not contain React components, Express controllers, repositories, PostgreSQL-specific code, browser-specific code, or API business logic.
- Not every type belongs in the shared package; application-local concepts stay local.

## Alternatives Considered

- **Duplicate frontend/backend contracts:** rejected because drift would undermine validation and maintainability.
- **A general-purpose shared utilities package:** rejected as the purpose of this package is deliberately narrower: cross-boundary contracts.

## Related Decisions

- `docs/ARCHITECTURE/SYSTEM_ARCHITECTURE.md`
- `AGENTS.md`
