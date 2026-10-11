# Codex Assignment 002A — Persistence, Contracts and Safe Expression Validation

**Status:** Approved for Codex read-only planning. Implementation requires a separate explicit human go-ahead after reviewing the plan.

**Approved decisions (10 October 2026):** Implementation specification authority; anonymous per-attempt secret with seven-day retention; strict allowlisted expression parser/interpreter; five server-owned fixtures and progression after valid-but-failing tests.

You are working in the SYNVORA AI Engineering Competence Lab repository. First read `AGENTS.md`, `docs/PRD/PRODUCT_REQUIREMENTS.md`, `docs/ARCHITECTURE/SYSTEM_ARCHITECTURE.md`, relevant ADRs, and `docs/IMPLEMENTATION/VERTICAL_SLICE_IMPLEMENTATION_SPEC_001.md`. Check `git status -sb` and inspect existing packages. Follow NodeNext ESM conventions and shared contract boundaries.

Your goal is **Checkpoint 002A only**: implement PostgreSQL/Docker local foundation, transactional ordered SQL migrations, repository-backed attempts/evidence, strict plain-text bounded expression parser/interpreter, server-owned validation fixtures, shared Zod contracts, application services and Express routes with Supertest/unit tests. Do not build the React UI or report view yet.

Security is non-negotiable: treat expression input as plain text; parse to a strict allowlisted AST; permit only `total`, `discount`, numeric literals, parentheses, unary +/−, binary +/−/*//; cap length, AST nodes and depth; reject everything else; do not use `eval`, `new Function`, `vm`, shell execution, or unrestricted code execution. Rejected inputs return actionable errors and permit retries without stage advancement. Never expose reference solutions or unpublished fixtures prematurely.

Preserve clean route → controller → service → repository boundaries. Use parameterized SQL. Respect approved anonymous attempt-secret policy; do not expose evidence by attempt ID alone. Implement repeatable tests, including invalid stage transitions, unauthorized access, rejected expressions, successful alternative expressions, and database persistence.

**Before changing files:** Present a file-by-file implementation plan, package/dependency changes, migration strategy, security strategy, tests, and any uncertainties. Wait for explicit human approval. **After approval:** Work in small reviewable changes, run checks where permitted, update the AI Engineering Log and Command Reference, and provide exact commands and results. Do not commit or push without human authorization.
