# ADR-009: pnpm Monorepo

**Status:** Accepted
**Date:** 2026-10-02

## Context

The project contains multiple related applications and a shared-contract package that should evolve together while retaining explicit package boundaries.

## Decision

Use pnpm workspaces in a monorepo with `apps/*` and `packages/*` workspace roots.

## Rationale

A monorepo keeps related changes atomic, simplifies shared-contract development, and gives the POC a single engineering workflow. pnpm provides workspace support and efficient dependency management.

## Consequences

- Root configuration defines workspace-wide expectations.
- Applications and packages maintain their own package boundaries.
- Cross-package dependencies should be explicit.
- Project-specific dependencies should not be installed globally.

## Alternatives Considered

- **Separate repositories:** not selected because the applications and shared contracts are tightly coordinated at this stage.
- **Unstructured single package:** rejected because it would weaken application boundaries and shared-contract ownership.

## Related Decisions

- `docs/ARCHITECTURE/SYSTEM_ARCHITECTURE.md`
- `AGENTS.md`
