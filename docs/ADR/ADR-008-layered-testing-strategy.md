# ADR-008: Layered Automated Testing Strategy

**Status:** Accepted
**Date:** 2026-10-02

## Context

The Lab needs confidence in application logic, UI behavior, HTTP contracts, and the complete learner journey without relying exclusively on slow end-to-end tests.

## Decision

Adopt a layered testing strategy using Vitest for unit tests, React Testing Library for React behavior, Supertest for API/HTTP behavior, and Playwright for end-to-end browser workflows.

## Rationale

Different failure classes are best detected at different layers. This strategy keeps most feedback fast while preserving end-to-end evidence for critical user journeys.

## Consequences

- Tests should focus on observable behavior rather than implementation details where practical.
- New behavior receives testing appropriate to its risk and layer.
- End-to-end tests are reserved for important integrated workflows rather than every code path.
- Relevant checks form part of the Definition of Done.

## Alternatives Considered

- **E2E-only testing:** rejected because it is slower, harder to diagnose, and unnecessarily expensive for isolated behavior.
- **Unit-only testing:** rejected because it cannot demonstrate that application boundaries work together.

## Related Decisions

- `docs/ARCHITECTURE/SYSTEM_ARCHITECTURE.md`
- `AGENTS.md`
