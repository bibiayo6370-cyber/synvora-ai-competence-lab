# ADR-004: PostgreSQL as Primary Database

**Status:** Accepted
**Date:** 2026-10-02

## Context

The Lab will persist structured relationships among learners, challenges, evidence, assessments, competencies, progress, and related concepts. The system needs transactional consistency and a mature relational data platform.

## Decision

Use PostgreSQL as the primary application database. Run PostgreSQL in Docker for local development.

## Rationale

The domain is naturally relational and benefits from constraints, transactions, indexing, and explicit schema evolution. PostgreSQL also supports future growth without requiring a different persistence model for the initial product.

## Consequences

- Schema changes must use the project migration strategy once established.
- Application code accesses PostgreSQL through the data-access/repository boundary.
- The browser never connects directly to PostgreSQL.
- Local database infrastructure is reproducible through Docker.

## Alternatives Considered

- **MongoDB/document database:** not selected because the core domain has meaningful relationships and consistency requirements that fit a relational model well.
- **SQLite as the primary architecture:** not selected because PostgreSQL is the approved target and avoids changing database behavior between the POC and later development.

## Related Decisions

- `docs/ARCHITECTURE/SYSTEM_ARCHITECTURE.md`
- `AGENTS.md`
