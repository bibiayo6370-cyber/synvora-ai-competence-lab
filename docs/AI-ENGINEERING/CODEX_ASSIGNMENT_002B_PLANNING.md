# SYNVORA — Codex Assignment 002B: Read-only Planning

**Status:** Draft for approval; no implementation authorization.

Read `AGENTS.md`, the approved PRD, `docs/IMPLEMENTATION/VERTICAL_SLICE_IMPLEMENTATION_SPEC_001.md`, `docs/IMPLEMENTATION/ASSIGNMENT_002B_FRONTEND_SPEC.md`, `docs/ARCHITECTURE/SYSTEM_ARCHITECTURE.md`, ADR-001–013, and the current source/exports in `packages/shared`, `apps/api`, and `apps/web` (if present).

**Task:** Produce a read-only, file-by-file implementation plan for a React + Vite + TypeScript learner interface covering Challenge → Predict → Run → Investigate → Modify → Validate → Reflect → Completion. Report and guidance belong to 002C.

Before proposing code, provide:

1. A table mapping each learner stage to **actual** backend route, method, request schema, response schema, error behavior, and required bearer authentication. Flag any contract gaps rather than inventing fields.
2. The proposed frontend directory structure and changes to pnpm/Vite/TypeScript/Tailwind, shared imports, API client, session management, and UI components.
3. Precise UX for immutable prediction, controlled reveal, editable bounded expression, 422 retry, valid-but-failing progression, 409 `REVALIDATION_REQUIRED`, refresh/resume, session loss, and network interruption.
4. Accessible, responsive visual approach with no heavyweight code editor and no fabricated assessment/report.
5. Test strategy: RTL/component and API-client tests, existing backend regression, and manual browser verification.
6. Dependencies and their rationale, risks, sequencing, and approval decisions.

**Rules:** Inspect only. Do not modify files, install dependencies, start containers, run migrations, commit, push, or change configuration. Stop after presenting the plan and await explicit human approval.
