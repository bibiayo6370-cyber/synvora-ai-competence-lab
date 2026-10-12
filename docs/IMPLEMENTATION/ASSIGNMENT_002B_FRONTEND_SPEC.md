# SYNVORA — Assignment 002B Frontend Implementation Specification

**Status:** Proposed for human review; not yet authorized for implementation\
**Date:** 11 October 2026\
**Baseline:** Git commit `f3cae96`; approved PRD v0.1; `docs/IMPLEMENTATION/VERTICAL_SLICE_IMPLEMENTATION_SPEC_001.md`; ADR-001–013; `AGENTS.md`\
**Boundary:** 002B implements the learner-facing React experience against existing 002A APIs. Reporting and guidance are 002C.

## 1. Goal

Implement one responsive, accessible, usable journey for Challenge 001: Challenge → Predict → Run → Investigate → Modify → Validate → Reflect → Completion. Show completion as **evidence recorded; competence report forthcoming**, not as a fabricated assessment. Preserve all server-authoritative stage transitions and anonymous bearer access.

## 2. Technology and scope

- React + Vite + TypeScript under `apps/web`; pnpm workspace conventions.
- Tailwind CSS; use shadcn/ui components selectively if compatible with the existing setup. React Hook Form and Zod for learner forms. Prefer existing shared Zod contracts/types and avoid duplicate hand-written API DTOs.
- A typed API client, a small attempt/session coordinator, stage-specific components, and frontend tests with Vitest + React Testing Library. Add Playwright smoke coverage if practical; full browser end-to-end acceptance belongs to 002C.
- Do not change database schema, migration history, backend security semantics, public/private fixture boundaries, or report implementation.
- Do not introduce a chatbot, code execution runtime, complex editor/Monaco, account creation, scoring, or additional challenges.

## 3. Mandatory backend-contract inspection

Before designing UI or modifying files, inspect actual exported contracts, endpoints, response envelopes, stage values, error codes, and request body schemas in `packages/shared` and `apps/api`. The examples in the earlier specification are conceptual, not a license to invent field names. Document an endpoint-to-UI contract map and flag incompatibilities before coding. All attempt-specific calls must include `Authorization: Bearer <attemptSecret>`; never place the secret in a URL or log.

## 4. Learner screens and interactions

1. **Challenge:** public objective, starter function, short project-authored learning resource, allowed expression syntax, and explicit Start button. Starting creates an attempt and stores only `{attemptId, secret}` in browser `sessionStorage` under a clearly named SYNVORA key.
2. **Predict:** plain-text predicted console output; explanation of what prediction means; submit once. Do not show reference output until the server authorizes reveal. Submitted prediction cannot be edited.
3. **Run:** explicit Reveal/Run action, display **precomputed reference result** and comparison with prediction; do not imply learner-submitted code was executed.
4. **Investigate:** learner's explanation of function arguments, multiplication, and prediction discrepancy. Persist verbatim via API. Do not automatically assess reasoning.
5. **Modify:** display a non-editable function template with an accessible plain-text expression input for the return expression only. Display permitted syntax, 200-character maximum, character count, and Save/Continue. Keep input on error.
6. **Validate:** submit the current expression; render aggregate pass/fail and public-example feedback only. `422` rejected input: clear inline feedback + `role="alert"`/`aria-live` announcement, no progression, focus guidance, preserve text, allow retry. Safely evaluated but failing checks: explain the gap and allow retry **or** continue to reflection. Safely evaluated passing checks: allow reflection. Do not expose private fixtures or reference expression.
7. **Reflect:** collect reflection and optional AI-use declaration, explain that free-text reasoning is stored but not automatically graded. If API returns `409 REVALIDATION_REQUIRED`, show an actionable message and return the learner to edit/validate the current draft without losing it.
8. **Completion:** display evidence-submitted confirmation and accurate summary of what was captured. Clearly state that competence report/next-step generation is deferred to 002C. No mock mastery score or fictitious report.

## 5. Stage navigation and recovery

- Server is authoritative for stage, accepted evidence, reveal status, and completion. Refresh should call the protected resume endpoint and render the actual persisted state. UI cannot skip stages by local state manipulation.
- Store only the attempt ID and bearer secret in `sessionStorage`, not `localStorage`, URL, telemetry, or console. Use a single scoped API-client authorization mechanism. Avoid printing the full request headers or sensitive response data.
- Explain anonymous demo behavior: session access expires seven days after creation; closing the browser/tab may lose access; no recovery without the secret. Do not promise permanent retention.
- If a saved attempt is inaccessible (expired, unknown, wrong secret), clear only SYNVORA session keys and offer Start again with nontechnical guidance. Network outage is a different error: preserve session and offer Retry.
- Avoid duplicate attempt creation on rerender, double-click, or React StrictMode. Disable submissions while pending and reconcile network errors by fetching the authoritative attempt snapshot before repeating a potentially successful mutation.
- Handle 400, 401, 404, 409, 422, 413, and 5xx without silent state corruption. Never assume the UI stage advanced until API confirms it.

## 6. Accessibility, design and responsiveness

- Clear guided stepper with current/completed states; semantic headings, form labels, keyboard focus visibility, disabled/loading state, and readable monospaced code blocks.
- Error announcements through `role="alert"` or `aria-live`; do not rely on color alone. Move focus thoughtfully after stage transitions and failed validation.
- Responsive from narrow mobile screens to desktop, with no horizontal page overflow; code may scroll within its own container.
- Low-bandwidth and reduced-motion friendly. Use restrained SYNVORA branding and consistent design tokens. Avoid heavy animation and unnecessary dependencies.

## 7. Testing and acceptance

- Component tests: challenge start, prediction locked before reveal, reveal labeling, stage rendering, invalid expression preserves draft and announces error, correction/retry, finite-but-failing choice, `REVALIDATION_REQUIRED`, optional AI declaration, completion honesty, keyboard/label semantics.
- API client tests: auth header on every attempt route, no secret in URL, typed error mapping, network retry/recovery, inaccessible session clearing without clearing unrelated browser data.
- Integration-style UI tests with mocked network responses matching **actual** shared contracts. Avoid testing only invented fixtures or happy paths.
- Manual smoke: local Docker/API/web journey, refresh and resume, mobile viewport, keyboard navigation, browser session loss, network interruption.
- Quality gates: `pnpm install --frozen-lockfile`, shared/API/web checks/build/tests, existing 76 backend tests remain green, `git diff --check`, and no secrets/build artifacts staged.

## 8. Documentation and governance

Update `docs/DEVELOPMENT/COMMAND_REFERENCE.md`, `docs/AI-ENGINEERING/AI_ENGINEERING_LOG.md`, README, and a new `docs/AI-ENGINEERING/ASSIGNMENT_002B_VERIFICATION.md` with **actual** commands/results. First deliver a read-only file-by-file plan and contract map; wait for human approval before implementation. Work in reviewable phases. Never commit or push without explicit human authorization.

## 9. Explicit exclusions and handoff

002C owns seven-section competence report, next-step recommendation, end-to-end Playwright demonstration, final video/submission evidence. 002B must leave a clean completion state that 002C can extend without reworking the learner journey.

## 10. Decisions for approval

1. One guided responsive challenge, no additional catalog/account/chatbot/IDE.
2. `sessionStorage` for attempt credentials, with explicit anonymous demo/expiry/loss notice.
3. Actual 002A contracts are authoritative; frontend never invents stages or scoring.
4. Completion screen shows evidence captured and clearly defers competence reporting to 002C.
5. Human-approved read-only Codex planning first, followed by separately authorized implementation.
