# ADR-002: React + Vite + TypeScript Frontend

**Status:** Accepted
**Date:** 2026-10-02

## Context

The learner-facing application requires an interactive, component-based web interface with strong developer tooling, type safety, and a lightweight build environment.

## Decision

Use React with Vite and TypeScript for `apps/web`.

## Rationale

React supports the component and feature composition required by the learner journey. Vite provides a focused development/build toolchain, and TypeScript supports explicit contracts and safer refactoring across the monorepo.

## Consequences

- Frontend code is written in TypeScript.
- Vite owns the frontend development/build pipeline.
- Shared domain/API contracts may be consumed from `packages/shared`.
- Framework-specific server behavior should not be assumed in the frontend architecture.

## Alternatives Considered

- **Server-rendered/full-stack React framework:** not selected because the approved architecture uses a distinct Express API and does not currently require framework-owned server rendering.
- **Plain JavaScript:** rejected because shared typed contracts and strict engineering boundaries are core project requirements.

## Related Decisions

- `docs/ARCHITECTURE/SYSTEM_ARCHITECTURE.md`
- `AGENTS.md`
