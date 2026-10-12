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

## 11 October 2026 — Assignment 002B learner frontend

**Human authority:** Approved reviewed conversational/file-level plan and frontend
specification, with credentials-only sessionStorage, work-preserving reconciliation,
complete vertical slice and dependency compatibility clarifications. Implementation
is limited to web source/tooling/tests and approved documentation. Backend/shared
source, schemas, manifests and migrations remain unchanged; no Playwright/reporting.

**Contribution:** Created React/Vite/Tailwind web workspace and minimal source-owned
shadcn/Radix primitives. Shared contracts drive forms and typed API boundary. 422
validation envelopes update the snapshot and preserve expression text. Explicit
reveal, immutable prediction, safe-but-failing reflection, actionable revalidation,
completion honesty and session loss/recovery are implemented. Dirty drafts stay
in memory and are never overwritten by older snapshots; unsaved-work copy view,
refresh warning and scoped storage notices make retention/access limits explicit.

**Dependency decision:** Checked Node 24.21.0, pnpm 12.10.1, TypeScript 7.0.2,
Vitest 5.0.3 and shared Zod 4.6.5, then registry engines/peers before installation.
React 19.3.0, Vite 8.3.3, Tailwind 4.3.3, RHF 7.89.0 and resolver 5.9.1 selected.
All existing lockfile resolutions and API/shared importer entries were retained;
frontend optional peers have new separate contexts. pnpm's multi-document lockfile
required corrections during preservation; final frozen installation passed.

**Validation so far:** Root check/build passed. Existing backend suites: shared 14,
API unit 46, database/HTTP 14, compiled restart 2 passed. Existing isolated database
and restart cleanup authorization used; no migration or database reset performed.
Mounted-drive frontend tests timed out during worker startup without executing
cases. Direct jsdom import took 107315 ms, exceeding the fixed worker allowance.
A native /tmp copy of identical source/dependencies is being prepared for actual
frontend verification; final results will be recorded below and in the verification
record. No backend/shared toolchain patch or package downgrade was made.

**Browser limitation:** No usable browser/connector available. Manual real-backend
smoke is pending human execution with Command Reference steps; no browser results
are fabricated. Human acceptance and any Git checkpoint remain outstanding.

**Final automated evidence:** Native-copy frontend Vitest: 49 tests in 5 files
passed (22.46 seconds). All 48 web source/config files matched repository bytes.
Native application and config TypeScript checks passed. Full root build passed;
web JS 124.35 kB gzip. Combined actual suites: 125 tests passed (49 native-copy
frontend plus 76 workspace backend/shared). Mounted frontend pnpm test startup
remains a documented filesystem limitation: one forks and two threads runs timed
out before cases. No modified Vitest/toolchain code or browser automation used.

Final source/config whitespace, scope and original lockfile-resolution checks
passed. Backend/shared/infrastructure files unchanged. The Command Reference
contains manual real-backend smoke steps; that verification and human acceptance
remain pending. No staging, commits, pushes, merges or Git-history changes.

**Final review correction:** Readable existing credentials now resume even if
sessionStorage writes are denied, while creation remains disabled. Added regression
and reran all frontend tests: **50 passed in 5 files**, 15.92 seconds on the identical
native copy. Combined final suites: **126 passed** (50 frontend plus 76 backend/shared).
Final root check passed. Final web build and Git-status review follow this correction.

Final corrected web build passed with application/test/config checks; JS 124.41 kB
gzip. Initial compilation exposed a panel naming collision and generic-schema
comparison error, both corrected before passing builds. No native frontend test
case failed. Final byte comparison, scope, no-Playwright and whitespace checks
passed. Git status understood: five tracked modifications, new web/verification
files and the two preserved planning documents. Browser smoke and human acceptance
remain pending; no commit/push/history operation performed.

## 12 October 2026 — Assignment 002B Targeted Correction 001

**Human request:** Six focused human browser tests passed; refresh recovery notice
incorrectly claimed that unsaved edits had been kept. Correct only message context
and add regression coverage, preserving approved storage/state/draft behavior.

**Contribution:** Initial restoration now warns that changes not submitted before
refreshing may have been lost. In-page reconciliation uses checked/preserved wording
only when dirty drafts remain after the unchanged pure merge; clean checks make no
preservation claim. Confirmed submissions retain their saved confirmation. Added
one hook regression and strengthened refresh, outage and lost-response UI tests.

**Actual validation:** Native Linux workaround, byte-identical web sources: 51
frontend tests passed in 5 files (36.35 seconds); application/configuration TypeScript
checks and Vite production build passed. No correction test failure. Exact commands
and five changed files are in the 002B verification addendum. Correction diff and
whitespace checks passed. Earlier backend results were not rerun or relabeled.

**Outcome/limits:** Wording correction ready for human review. No additional browser
execution claimed; mounted-drive startup limitation unchanged. Credentials-only
sessionStorage, reducer/merge and server authority unchanged. No backend/shared,
dependency, migration or Playwright changes; no staging, commit, push or history work.

## 12 October 2026 — Assignment 002B final verification and Git handoff

**Human authority:** Reviewer examined API client, session handling, coordinator
and state reducer; recovery-message correction accepted for final verification.
Six focused browser scenarios supplied with environment and actual observations.
No redesign, backend/shared modification, Playwright, scoring or Git operation
authorized.

**Review:** Existing regressions explicitly cover initial refresh restoration,
preserved dirty drafts during in-page reconciliation and neutral clean-check
feedback. Uncertain mutations are not automatically replayed; GET reconciliation
and explicit retry preserve drafts. Source review documented limits: GET can
precede a late POST commit, so explicit retry may record another validation; evidence
upserts avoid duplicate type rows but do not provide request idempotency or revision
ordering. Creation-response loss cannot recover an unreturned secret. No source
or protocol redesign attempted.

**Human browser evidence:** Chrome on Windows 11, web 127.0.0.1:5173 / API
127.0.0.1:8000 with PostgreSQL, 12 October 2026 WAT; browser version not recorded.
Reported PASS: (1) start/prediction locking; (2) reference reveal/investigation;
(3) expression rejection/correction to 5/5 checks; (4) reflection/completion/refresh;
(5) unsaved-work warning and restoration of submitted state; (6) lost-session
credentials return to Challenge. Scenario 5's functional behavior passed, but
corrected wording still needs browser recheck. Horizontal code scroll was minor
usability feedback. Browser 409 conflict, full keyboard and mobile acceptance
were not independently verified. These are human-reported results based on direct
execution/screenshots reviewed in that session, not agent-run or Playwright evidence.
Full six-scenario observations are recorded in the verification addendum.

**Actual automated results:** Repository root checks and production builds passed;
shared 14, API unit 46, database/HTTP 14, compiled restart 2 passed. Concurrent
native frontend run: 48 passed, 3 timed out at 15 seconds. Unchanged complete suite
rerun after repository jobs: all 51 passed (21.86 seconds). Native application/config
TypeScript checks passed. Final passing suites total 127 tests; source-copy equality
verified for all 48 web files. Earlier interrupted command output was not counted.
Repository pnpm pre-run verification emitted sandboxed store-lock warnings but
check/build/shared-test scripts completed successfully with installed dependencies.
No new install/lockfile result is claimed. Detailed commands/timings/locations and
initial failures are in ASSIGNMENT_002B_VERIFICATION.md.

**Scope and outcome:** Only verification record and this log modified this turn;
source/contracts/manifest/config hashes unchanged. Database regression isolation
and cleanup hooks passed; restart removed only its own newly created smoke attempt.
No migrations, resets or unrelated-data changes. Git status understood; main tracks
origin/main, prior implementation remains uncommitted. Diff and whitespace checks
passed. Remaining items: browser wording recheck, stated browser coverage gaps,
non-idempotent delivery and mounted/loaded-system test limitations. Final human Git
authorization pending. No staging, commit, push, merge or history changes.
