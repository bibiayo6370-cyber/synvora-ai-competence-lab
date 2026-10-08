# ADR-003: Node.js + Express + TypeScript Backend

**Status:** Accepted
**Date:** 2026-10-02

## Context

The platform requires an HTTP API that enforces server-side validation, application rules, and data-access boundaries while remaining straightforward to understand and test.

## Decision

Use Node.js, Express, and TypeScript for `apps/api`. Organize backend responsibilities around routes/controllers, validation, application services, and repositories.

## Rationale

This stack matches the approved JavaScript/TypeScript engineering environment, keeps the API explicit, and provides enough flexibility to implement the competency vertical slice without imposing a large framework architecture.

## Consequences

- Controllers remain thin and HTTP-focused.
- Business/application rules belong in services.
- Persistence concerns remain behind repositories/data access.
- Server-side validation is authoritative.
- Backend code is written in TypeScript.

## Alternatives Considered

- **Large opinionated backend frameworks:** not selected because the POC does not currently require their additional conventions and abstractions.
- **Frontend-hosted API logic:** rejected because the architecture requires a distinct server trust boundary.

## Related Decisions

- `docs/ARCHITECTURE/SYSTEM_ARCHITECTURE.md`
- `AGENTS.md`
