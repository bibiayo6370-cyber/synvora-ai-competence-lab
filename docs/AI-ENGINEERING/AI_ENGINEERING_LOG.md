# AI Engineering Log

## Purpose

This log records significant uses of ChatGPT, Codex, and other approved AI engineering tools during development of the AI Engineering Competency Lab.

It is an engineering evidence trail, not a transcript archive. Record interactions that materially influenced implementation, architecture, troubleshooting, testing, or engineering decisions.

The log complements Git history, Architecture Decision Records, tests, and project documentation. AI output is not treated as accepted engineering work until it has been reviewed and appropriately validated.

## Entry Template

### YYYY-MM-DD — Short task or decision title

**Phase:**
**Engineering task:**
**AI tool:** ChatGPT / Codex / Other
**AI contribution:**
**Human review and decision:**
**Corrections / rejected suggestions:**
**Validation performed:**
**Outcome:**
**Git reference:**
**Related documentation:**

---

## Logging Guidance

Record significant interactions such as:

- architecture or design proposals that materially affect implementation
- implementation assistance for meaningful features
- debugging or troubleshooting where AI materially contributed
- test generation or test-strategy assistance that was reviewed and validated
- AI suggestions that were rejected or corrected for an important engineering reason
- refactoring or security recommendations that materially changed the solution

Do not record every prompt, conversational clarification, spelling correction, or routine command.

Entries should describe what actually happened. Do not reconstruct or exaggerate AI contributions for presentation purposes.

### 2026-10-08 — Shared Contracts Foundation

**Phase:** Step 16 — Shared Contracts Implementation

**Engineering task:** Establish the `@synvora/shared` workspace package and implement the first reusable API health-response contract.

**AI tool:** ChatGPT

**AI contribution:** Assisted with package structure, TypeScript configuration, Zod schema design, automated test cases, and troubleshooting Node.js and pnpm environment configuration.

**Human review and decision:** Approved the minimal shared-package structure, adopted native WSL Node.js through NVM, aligned the project with pnpm 12.10.1, and retained pnpm's automatically selected store on the Windows-mounted filesystem.

**Corrections / rejected suggestions:** Removed the obsolete `node.exe` alias, corrected the missing Git ignore rule for `node_modules/`, and resolved the apparent pnpm version mismatch caused by the repository's package-manager pin.

**Validation performed:** TypeScript check passed. Vitest executed four tests successfully, confirming acceptance of a valid health response and rejection of three invalid responses.

**Outcome:** First reusable shared contract implemented and validated. Frontend/backend integration remains pending.

**Git reference:** Pending implementation checkpoint.

**Related documentation:** ADR-005, ADR-008, ADR-009, ADR-010.

### 2026-10-10 — Assignment 001: API HTTP Integration Testing

**Phase:** Backend testing foundation.

**Engineering task:** Establish reproducible Vitest + Supertest HTTP integration
tests for the existing Express API without changing application behavior.

**AI tool:** Codex.

**AI contribution:** Installed API-local Vitest 5.0.3, Supertest 7.3.1, and
@types/supertest 7.2.1; aligned direct @types/node with Node 24 (24.19.1).
Added two HTTP tests, an explicit shared-build-before-test script, and a
no-emit TypeScript configuration covering production and test source.
Updated the command reference. Preserved the existing AGENTS.md modification.

**Human review and decision:** Implementation plan approved before changes.
Permission granted for dependency registry/store access and a test rerun
requiring localhost listener access. Implementation review remains pending.

**Corrections / rejected suggestions:** No dedicated Vitest configuration was
needed. The initial sandboxed install stalled without output and was interrupted;
the approved retry succeeded. The initial HTTP test run failed with sandbox
`listen EPERM` on 127.0.0.1; the same command passed with listener permission.

**Validation performed:**

- `pnpm --filter @synvora/shared run check` — passed.
- `pnpm --filter @synvora/shared run build` — passed.
- `pnpm --filter @synvora/shared run test` — four tests passed.
- `pnpm --filter @synvora/api run check` — production and test source passed.
- `pnpm --filter @synvora/api run build` — passed; output contains app/server
  JavaScript and source maps, with no emitted tests.
- `pnpm --filter @synvora/api run test` — initially blocked by sandbox binding;
  approved rerun passed both HTTP tests and rebuilt shared successfully.
- `git diff --check` — passed; final status and diff reviewed.

**Outcome:** Health response status, content type, service identity, shared
schema validity, and unsupported-route 404 behavior covered. Existing app and
server source unchanged. No frontend/database changes. Tests require localhost
binding permission; standalone API checks/builds require shared build output.
Transitive dependencies retain Node 26 type packages despite direct alignment.

**Git reference:** Pending human review; no commit or push performed.

**Related documentation:** ADR-003, ADR-005, ADR-008, ADR-009, ADR-010;
docs/DEVELOPMENT/COMMAND_REFERENCE.md.

**Human verification addendum — 2026-10-10:**

The implementation was independently reviewed after Codex completed Assignment 001.

The human reviewer inspected the API package configuration, test TypeScript
configuration, HTTP integration tests, and documentation changes.

Independent verification in the WSL development environment confirmed:

- Shared TypeScript build and check passed.
- All four shared schema tests passed.
- API TypeScript check and production build passed.
- Both API HTTP integration tests passed.
- git diff --check passed.
- No unintended repository changes were identified.

The earlier localhost listener EPERM restriction did not recur during
independent testing.

**Human decision:** Assignment 001 implementation accepted.
Git checkpoint authorization remains subject to final staging review.

### 2026-10-10 — Assignment 002A: backend persistence and safe validation

**Phase:** A–E complete; implementation acceptance pending human review.

**Engineering task:** Implement dedicated Docker PostgreSQL foundation, explicit
transactional migrations, shared contracts, bearer-protected attempt lifecycle,
bounded expression interpretation, evidence capture, expiration, and cleanup.

**AI tool:** Codex.

**AI contribution:** Read-only plan followed by human-authorized implementation.
Prepared separate synvora_dev/synvora_test services, generated ignored local
credentials without printing them, implemented pg persistence/service/controller
boundaries, parser/interpreter, shared Zod schemas, and automated coverage.
Added ADR-011–013 and command/setup/retention documentation. No frontend or report
implementation. No commits, pushes, or Git-history changes.

**Human review and decision:** Implementation authorized with specific limits and
staged reporting. Registry/dependency and Docker operations used explicit approval
requests. Docker initially unavailable; human enabled and verified Ubuntu WSL
integration and authorized resumption. Acceptance remains pending human review.

**Corrections / rejected suggestions:** Initial lockfile concern was corrected:
the pnpm lockfile contains multiple YAML documents, and existing workspace entries
were already present in its second document. No lockfile architecture change needed.

**Validation performed:** Dependency installation and frozen-lockfile verification
passed. Added pg 8.23.1, @types/pg 8.23.1, and API-local Zod 4.6.5. Shared/API
checks and compiled builds passed. Final root `pnpm run check` passed. Shared:
12 tests; API unit/health HTTP: 43 tests; PostgreSQL/HTTP integration: 11 tests;
compiled-server restart: 1 test. All 67 tests passed in their respective suites.
The final database suite was rerun after adding explicit validation-row cascade
and no-store assertions; all 11 passed again. Final API test-source check passed.

Docker provisioned new dedicated volumes and healthy PostgreSQL services. Actual
`current_database()` checks returned synvora_dev/synvora_test. Compiled migration
CLI applied one migration to each and zero on rerun. Tests verified advisory-lock
serialization, failed DDL/tracking rollback, checksum rejection, transactional
attempt updates, authorization, expiration, safe expression retries, history cap,
and cleanup cascades. Integration tests checked development counts remained
unchanged and no test IDs appeared there. New random test schemas were removed.
Final read-only database inspection showed one migration and zero attempts in
each public schema, and zero remaining isolated test schemas. The subsequent
strengthened rerun also passed its isolation and schema-removal hooks.

The restart smoke test initially timed out with a 20-second startup allowance.
A retry with a 60-second startup allowance passed an actual compiled server
restart. The test removed only its newly created development attempt, with
explicit approval. Physical cleanup CLI ran successfully and deleted zero rows.

`git diff --check` passed. A separate whitespace scan covered new untracked files.
Generated local database URLs/passwords were checked against every reviewable file
without printing them; no matches. Local credential files remain ignored. Full
tracked diffs and new source/documentation were reviewed; no Git staging or history
operations were performed. Exact command/results and complete file inventory are
in docs/AI-ENGINEERING/ASSIGNMENT_002A_VERIFICATION.md.

**Outcome:** Backend checkpoint implemented and verified for human review.
Daily cleanup is documented but not scheduled. No production deployment, account
recovery, frontend, competence reporting, or automated understanding scoring.
Docker services and named volumes remain available with their data preserved.

**Git reference:** None; uncommitted work for human review.

**Related documentation:** Assignment 002A, approved vertical-slice specification,
ADR-011–013, Command Reference section 13.

## 10 October 2026 — Assignment 002A corrective source review

**Authorization:** Human source review completed; narrow corrective review of
blank drafts, reflect-stage recovery, compiled restart readiness/diagnostics,
and affected verification requested. No broader product changes authorized.

**Contribution:** Confirmed shared modification schemas reject blank text and
validation delegates plain-string rejection to the bounded parser. Reused the
shared modification contract inside the application service to protect direct
calls. Added shared, service, and PostgreSQL/HTTP blank-input regressions.
Preserved the existing completion guard and made HTTP 409 feedback actionable
with REVALIDATION_REQUIRED. Recovery tests verify rejection after safe evaluation
blocks completion until the current draft is safely revalidated, including when
restoring an earlier draft and when technical tests still fail.

Preserved actual compiled-process restart verification. Added HTTP health
readiness before each launch is accepted, bounded startup/shutdown handling,
allowlisted lifecycle diagnostics without raw child output, and a negative
startup test proving synthetic private output is suppressed.

**Actual validation:** Shared check/build passed; shared tests 14 passed. API
check passed; API unit tests 46 passed; PostgreSQL/HTTP integration 14 passed;
compiled restart tests 2 passed, including the negative diagnostic case. Restart
script also rebuilt shared/API successfully. All 76 tests passed with no
corrective failures. Database suites used isolated synvora_test schemas and
passed development-data isolation and schema-removal hooks. Subsequent restart
cleanup removed only its newly created synvora_dev attempt, under existing
authorization. git diff --check passed.

**Scope/outcome:** Five source/test files and two verification/log documents
changed in this correction. No shared-schema definition, dependency, migration,
Docker configuration, or architecture change. Prior implementation remains
uncommitted; no Git history operations performed. Daily cleanup remains
documented but unscheduled. Human acceptance pending. Full command results and
limitations are recorded in ASSIGNMENT_002A_VERIFICATION.md.
