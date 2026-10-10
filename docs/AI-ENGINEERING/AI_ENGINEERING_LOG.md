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
