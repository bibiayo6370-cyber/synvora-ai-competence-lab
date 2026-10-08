# ADR-001: Modular Monolith Architecture

**Status:** Accepted
**Date:** 2026-10-02

## Context

The AI Engineering Competency Lab needs clear internal boundaries while remaining small enough for an invention-sprint proof of concept. Splitting the initial system into independently deployed services would add operational complexity before there is evidence that such separation is needed.

## Decision

Implement the application as a modular monolith. The web application and API remain distinct application boundaries in the monorepo, while backend business capabilities are organized into explicit modules/services rather than independently deployed microservices.

## Rationale

This provides strong separation of concerns without introducing distributed-system overhead. It supports the approved vertical-slice approach and allows future extraction of services if real scaling, ownership, or deployment requirements justify it.

## Consequences

- Application boundaries and module responsibilities must remain explicit.
- Internal modules should communicate through clear interfaces rather than shared mutable state.
- Deployment remains simpler than a microservice architecture.
- Future service extraction remains possible but is not pre-built speculatively.

## Alternatives Considered

- **Microservices:** rejected for the initial system because deployment, networking, observability, and data-consistency complexity are not justified by the POC scope.
- **Unstructured monolith:** rejected because it would weaken the service, repository, and domain boundaries required by the project.

## Related Decisions

- `docs/ARCHITECTURE/SYSTEM_ARCHITECTURE.md`
- `AGENTS.md`
