# SYNVORA Code Mentor — Product Requirements Document

**Version:** 0.2 — Proposed / feasibility-gated
**Supersedes:** v0.1 for planning; does not change the existing capstone baseline  
**Date:** 25 October 2026  
**Project:** SYNVORA — AI Engineering Competence Lab  
**Track:** Meta Global AI Developer Hackathon — Indie Developer (application pending)  
**Status:** Planning only; not authorization to begin event-restricted implementation  
**Baseline:** Existing SYNVORA Andela capstone; preserve its Git history and assessment constraints.

## 1. Executive summary

SYNVORA Code Mentor is a focused AI-assisted programming comprehension experience. It guides novice learners through a bounded code challenge, encourages prediction and investigation, supplies progressively more specific contextual hints through Meta Model API, and preserves objective code-validation evidence separately from AI-generated explanations. The hackathon deliverable is **one complete, credible learner journey**, not a general LMS or autonomous AI grading system.

**Product promise:** Understand the code, not just the answer.

**Problem:** Learners can obtain working code without understanding the logic or diagnosing errors. Generic chatbots may provide solutions prematurely; code execution alone does not reveal understanding.

**Target user:** A novice programming learner (JavaScript initially; Python contingent on feasibility) who can read basic expressions and wants structured help interpreting and correcting code.

**Primary outcome:** A learner can make a prediction, inspect actual behaviour, request graduated guidance, submit a correction, validate it, and reflect on the result. The product records the sequence and verified results without claiming to have proven learning gains.

## 2. Goals and measurable success criteria

1. **End-to-end journey:** One learner can complete Challenge → Predict → Run → Investigate with AI → Modify → Validate → Reflect → Report.
2. **Genuine Meta integration:** At least one mentor interaction uses an authorized live Meta Model API call; no simulated success in the submitted demo.
3. **Bounded help:** Three progressively more informative hint levels; no unsolicited final solution or code patch in hint mode.
4. **Assessment separation:** Deterministic test outcomes remain the only source of objective correctness; model text never writes competence ratings or alters validation results.
5. **Reliability:** Explicit loading, timeout, quota, provider error, invalid-response and retry states; the non-AI learner flow remains usable during provider outage.
6. **Traceability:** Record model/provider metadata, hint level, interaction timestamp, learner request and AI-assistance disclosure, with privacy controls.
7. **Engineering evidence:** Shared contracts, unit/API/integration tests, browser acceptance scenarios, documentation and a repeatable demonstration.

**Not success claims:** Improved learning outcomes, accurate SOLO-level inference, comprehensive JavaScript support, job readiness or verified conceptual mastery. These require separate studies or assessment designs.

## 3. Scope

### Must have (P0)
- Preserve the existing bounded-expression challenge and its prediction/run/modify/validate/reflect flow, attempt authorization and report generation as the regression baseline.
- Complete and approve a JavaScript/Python execution feasibility spike before choosing a new runtime, declaring language support, or replacing baseline validation.
- Define a language-neutral execution-provider contract and language-aware challenge fixtures. This design work does not authorize arbitrary code execution.
- AI Mentor panel: learner chooses `concept`, `clue`, or `next_step` and optionally enters a short question.
- Server-side Meta provider adapter with secrets isolated from browser; provider/model configuration is environment-driven.
- Mentor context assembled server-side from the authoritative challenge, current stage, bounded learner submission, deterministic results and prior hint level; do not trust client-supplied answer keys or hidden test data.
- Hint policy with response schema, output checks and anti-answer-leakage tests; explicitly acknowledge that prompt instructions cannot guarantee model compliance.
- Per-attempt usage limits, rate limits, timeouts and structured error responses.
- Persist a minimal AI-interaction audit event; show AI assistance in the report without inflating competence.
- Responsive/accessible UI, automated tests, demo and setup documentation.

### Should have (P1, only if P0 complete)
- A concise learner-facing explanation of why a hint is relevant.
- Teacher/reviewer-readable sequence of hint levels and learner actions.
- Basic metrics: successful mentor responses, failures, latency, hint requests per attempt (no learning-effectiveness inference).

### Explicitly out of scope
- **Until the feasibility gate passes:** free-form JavaScript/Python execution is not a committed MVP deliverable. Also excluded: arbitrary file uploads, package installation, learner-controlled network access, unrestricted processes, autonomous comprehension scoring, automatic SOLO classification, user accounts, payments, curriculum authoring, job matching, gamification, fine-tuning, voice, multi-agent orchestration and a new LMS.

## 4. Personas and jobs to be done

**Primary — novice learner (language to be determined):** “When my program behaves differently than I expected, help me investigate without handing me the answer.”

**Secondary — educator/reviewer:** “Show me what the learner tried, what was objectively validated, and where AI assisted, so I don't confuse assistance with demonstrated competence.”

## 5. Functional user stories and acceptance criteria

### US-01 — Resume a challenge
**As a learner**, I can open an existing attempt and see its current challenge, prediction and validation status.
- Given an authorized attempt, the existing workflow loads without any Meta credentials in browser traffic.
- An unauthorized attempt receives the established authorization failure, without revealing learner evidence.
- Existing baseline challenge behaviour remains unchanged.

### US-02 — Request a contextual hint
**As a learner**, I can ask for a hint tied to the code I am investigating.
- `POST /api/attempts/:attemptId/mentor/hints` accepts a valid `level` and optional bounded `question`.
- The server retrieves the authoritative attempt and challenge context; it never accepts an answer key from the client.
- A successful response contains `hintId`, `level`, `message`, `provider`, `model`, `createdAt` and `usage` if available.
- Empty/oversized/invalid fields fail schema validation with no provider request.
- The mentor is unavailable before the investigation stage if the existing state machine does not permit it; precise stage mapping must be confirmed against repository code.

### US-03 — Progressive hints
**As a learner**, I can request increasingly specific guidance rather than a full solution.
- `concept` focuses on the underlying concept; `clue` directs attention to a relevant observation; `next_step` proposes an investigation action without returning final code.
- The server enforces monotonic escalation per attempt, or explicitly documents why a repeat of a previous level is allowed; a learner cannot silently skip policy limits by editing client state.
- Test fixtures check that hint-mode output does not contain the expected final answer or complete corrected solution.
- Unsafe or noncompliant provider output is rejected or replaced with a safe fallback; never present it as verified.

### US-04 — Recover from model failure
**As a learner**, I can continue my challenge if AI guidance is unavailable.
- Timeouts, rate limits, unavailable credentials and provider failures yield stable error codes and accessible messages.
- No failed call changes code-validation status or attempt progression.
- Retry is explicit; server-side request limits remain effective.

### US-05 — Preserve assessment integrity
**As an educator**, I can distinguish verified technical results from AI assistance.
- Existing deterministic tests remain authoritative for pass/fail.
- A mentor response cannot write `passed`, competence ratings, SOLO levels or objective validation events.
- Report shows whether AI assistance was requested and, if so, counts and levels; report does not infer comprehension from hint count.
- Existing unassessed qualitative fields remain unassessed unless a separately approved assessment method is introduced.

### US-06 — Privacy and authorization
**As a learner**, my attempt and questions are not disclosed to other learners.
- Mentor endpoints use existing bearer-secret attempt authorization.
- No model key is logged or sent to frontend; error responses redact credentials and internal provider payloads.
- Only minimum challenge and learner context is sent to provider; no personal profile or unrelated attempts.
- Retention follows the existing attempt policy unless a documented ADR approves a different limit.

### US-07 — Complete a demo journey
**As a reviewer**, I can see a complete, reproducible workflow.
- One scripted learner scenario covers prediction, run, model hint, edit, validation, reflection and report.
- A separate scenario covers provider failure without breaking the core workflow.
- The demo clearly identifies baseline code versus hackathon changes and avoids unsupported learning-impact claims.

## 6. User flow and UX

1. Open challenge and predict result.
2. Run bounded expression and inspect deterministic output.
3. Investigate discrepancy; open **AI Mentor** panel.
4. Choose hint level; optionally ask a brief question; see loading state and provider-generated response clearly labeled **AI guidance**.
5. Change expression and validate through existing deterministic evaluator.
6. Reflect on what changed and why.
7. View report showing verified performance, learning evidence and AI-assistance disclosure.

**UX rules:** Do not auto-call the model on page load. No prefilled model answer. Provide keyboard navigation, readable error announcements, mobile layout down to 320 px, and distinguish AI text visually from test results. Avoid claiming that the model's explanation is correct merely because the call succeeded.

## 7. Proposed API contracts (subject to repository contract audit)

**Important:** These are *new proposed endpoints and payloads*, not a claim that they exist. Confirm the existing `/api` routing convention, attempt auth mechanism and schema names before implementation. Implement shared Zod schemas in `packages/shared`.

### POST `/api/attempts/:attemptId/mentor/hints`

Headers: `Authorization: Bearer <attempt-secret>`; `Content-Type: application/json`.

Request:
```json
{
  "level": "concept",
  "question": "Why does the result differ from my prediction?",
  "clientRequestId": "8d65d07a-a06c-4f11-bd4d-7bdca7b9a008"
}
```

- `level`: enum `concept | clue | next_step`.
- `question`: optional, trimmed, 1–500 characters when present.
- `clientRequestId`: optional UUID for deduplication, scoped to attempt; confirm whether needed in baseline.
- No client-supplied challenge solution, hidden tests, learner score or model prompt.

Success: `201 Created` (new persisted hint event):
```json
{
  "hintId": "6c2d5b80-f090-48e5-b6c9-a66a3392e411",
  "attemptId": "6b26f69e-234d-4cb3-9b10-49a10d334992",
  "level": "concept",
  "message": "Consider how the expression is evaluated before comparing it with your prediction.",
  "source": "ai_generated",
  "provider": "meta_model_api",
  "model": "configured-model-id",
  "createdAt": "2026-10-29T14:00:00Z",
  "usage": { "inputTokens": 120, "outputTokens": 35 }
}
```

The example message and model ID are illustrative, not a verified Meta API response. Provider-specific fields must be mapped in the adapter, not exposed directly.

Error envelope:
```json
{
  "error": {
    "code": "MENTOR_UNAVAILABLE",
    "message": "AI guidance is temporarily unavailable. You can continue the challenge without it.",
    "retryable": true
  }
}
```

Proposed codes/statuses: `400 INVALID_REQUEST`, `401 UNAUTHORIZED`, `404 ATTEMPT_NOT_FOUND` (match existing anti-enumeration policy), `409 INVALID_ATTEMPT_STAGE`, `422 HINT_POLICY_REJECTED`, `429 MENTOR_RATE_LIMITED`, `502 MENTOR_INVALID_RESPONSE`, `503 MENTOR_UNAVAILABLE`, `504 MENTOR_TIMEOUT`. Do not expose provider stack traces or tokens. `502` may also represent provider upstream failure; refine mapping during provider research.

### GET `/api/attempts/:attemptId/mentor/hints`

Authenticated attempt-scoped read. Response `200`:
```json
{
  "attemptId": "6b26f69e-234d-4cb3-9b10-49a10d334992",
  "hints": [
    {
      "hintId": "6c2d5b80-f090-48e5-b6c9-a66a3392e411",
      "level": "concept",
      "message": "Consider how the expression is evaluated before comparing it with your prediction.",
      "source": "ai_generated",
      "createdAt": "2026-10-29T14:00:00Z"
    }
  ],
  "remainingRequests": 5
}
```

**Authorization and ordering:** Return only the authorized attempt's events, in creation order. Avoid disclosing sensitive provider metadata beyond what is necessary for audit.

### Internal provider boundary (not public HTTP)

```ts
type MentorRequest = {
  challengeId: string;
  stage: 'investigate';
  level: 'concept' | 'clue' | 'next_step';
  learnerQuestion?: string;
  codeSnapshot: string;
  observedResult?: string;
  prediction?: string;
};

type MentorResponse = {
  message: string;
  model: string;
  providerRequestId?: string;
  inputTokens?: number;
  outputTokens?: number;
};

interface MentorProvider {
  generateHint(input: MentorRequest): Promise<MentorResponse>;
}
```

**Security note:** Do not pass solution keys, private tests, other users' data or arbitrary client-authored system instructions to the model. User-provided code and questions are untrusted content; delimit them and enforce output checks. A provider-neutral interface does not mean supporting additional providers in this MVP.

## 8. Persistence proposal

Add an append-only `mentor_interactions` table, subject to existing schema conventions:

| Column | Type / rule |
|---|---|
| `id` | UUID PK |
| `attempt_id` | FK to existing attempts, indexed |
| `client_request_id` | Nullable UUID; unique per attempt if enabled |
| `hint_level` | Constrained enum/text |
| `learner_question` | Nullable bounded text; avoid storing if privacy review disallows |
| `response_text` | Bounded text |
| `provider` | `meta_model_api` |
| `model_id` | Text |
| `status` | `succeeded` or `rejected`/`failed` as policy requires |
| `input_tokens`, `output_tokens` | Nullable integers |
| `created_at` | Timestamp with timezone |

Decide explicitly whether to persist failed calls or only aggregate failure metrics; avoid leaking sensitive prompts and provider payloads. Use existing transaction-backed migration runner and verify rollback/retry semantics before creating migrations. Report derivation must be deterministic from persisted evidence.

## 9. AI guidance and safety policy

- Model role: educational assistant, not evaluator or answer authority.
- Prompt includes challenge concept, learner's prediction and observed output, current code snapshot, selected hint level, and explicit prohibition on complete solution in hint mode.
- The model should ask a useful investigative question or give one actionable clue, rather than generate a corrected program.
- Server validates response length, structure and obvious answer leakage against fixture-specific solution data. This is a best-effort guardrail, not proof of pedagogical correctness.
- Reject or gracefully fall back when the model cannot comply.
- Limit request count per attempt (initial proposal: 6 successful hints) and per-minute rate (to be calibrated against actual provider quotas); cap input and output tokens.
- Ensure secrets are loaded only on server; configure outbound timeouts; log correlation IDs without personal data.
- Never run learner-provided unrestricted JavaScript. Preserve existing bounded expression evaluator.
- Explicitly disclose to learners when a hint is AI-generated and may be inaccurate.

## 10. Non-functional requirements

**Security:** Existing attempt-secret authorization, Zod boundary validation, strict server-side provider access, request-size caps, no credential leakage, bounded outbound requests, auditability.

**Performance:** Target p95 mentor response under 8 seconds *when provider is healthy* (aspirational, not guaranteed); set a hard timeout and show nonblocking progress UI.

**Availability:** Existing learning workflow remains available if provider is down; no model request is required to validate a correction.

**Accessibility:** Keyboard navigable, accessible status messages, mobile 320/375/768 px checks.

**Testing:** Mock provider for deterministic tests; a separately gated real-provider smoke test when credentials are available; no secrets in CI.

**Observability:** Structured success/failure counts, latency and request correlation; no raw credentials or unnecessary learner data in logs.

## 11. Acceptance test matrix

| ID | Scenario | Expected outcome |
|---|---|---|
| AT-01 | Authorized learner requests concept hint | 201 and persisted AI event |
| AT-02 | No/invalid attempt token | Rejected; no provider call |
| AT-03 | Invalid hint level / 501-character question | 400; no provider call |
| AT-04 | Attempt not at investigation stage | 409; no provider call |
| AT-05 | Model timeout | 504; learner workflow remains usable |
| AT-06 | Provider quota exceeded | 429 or mapped 503; clear retry guidance |
| AT-07 | Model emits full corrected answer | Rejected/fallback; no leaked solution shown |
| AT-08 | Model text includes markup | Render as safe text; no HTML execution |
| AT-09 | Learner validates code after hint | Same deterministic result as without hint |
| AT-10 | Report generated after AI assistance | AI event disclosed; objective scoring unchanged |
| AT-11 | Repeat identical client request ID | No duplicate successful interaction, if dedup adopted |
| AT-12 | Browser 320/375/768 px and keyboard | Usable, no clipped critical controls |
| AT-13 | Live Meta smoke test (gated) | Real authenticated response; no mock substituted |
| AT-14 | Unrelated attempt token accesses hints | Rejected; no cross-attempt data |

## 12. Execution feasibility spike — required decision gate

**Status:** research/prototyping only; no commitment to either language. The baseline evaluator remains the source of truth until a replacement is reviewed. Pre-acceptance activity must comply with official event rules; where unclear, restrict work to documentation and review.

### Questions to answer
1. Can a browser-isolated JavaScript worker execute representative beginner programs with reliable cancellation, bounded output and acceptable startup latency? What remains vulnerable to CPU/memory abuse or browser-specific behaviour?
2. Can browser-based Python (for example, a WebAssembly runtime such as Pyodide) load and execute the same learning concepts within acceptable startup, download, memory and mobile-browser limits? Does it require cross-origin isolation or additional assets?
3. Is a vetted isolated server-side execution service available and permitted, with enforceable CPU/memory/wall-clock/output/process/network restrictions, confidential hidden tests and predictable cost? What are its operational and data-protection implications?
4. How can challenge-specific deterministic tests be implemented without revealing private tests to the learner? Can the selected approach safely support authoritative assessment?
5. What is the actual incremental build/test/deployment effort for JS-only versus JS+Python? What happens when the runtime is unavailable?

### Spike artifacts and measurements
- `docs/PLANNING/EXECUTION_FEASIBILITY_MATRIX.md`: options, threat boundaries, dependencies, costs, limitations and evidence links.
- `docs/PLANNING/EXECUTION_SPIKE_RESULTS.md`: reproducible experiments using **non-hostile**, bounded sample programs; startup/warm execution latency, output fidelity, cancellation behaviour, browser compatibility, runtime footprint and error normalization.
- Proposed ADR and go/no-go recommendation with a **single** primary execution approach and a fallback.
- No deployment of untrusted arbitrary-code execution to a public endpoint during the spike.

### Gate E — human decision
**GO-JS:** JavaScript runner is accepted for the MVP only if isolation, cancellation, limits, correctness, test confidentiality (if claimed), operational feasibility and regression tests are evidenced. **GO-PY:** Python may join the MVP only if it independently passes the same criteria and fits the remaining schedule. **NO-GO:** Keep the existing bounded evaluator and deliver Meta-guided learning without new language execution. Browser practice execution must never be misrepresented as an authoritative server-side sandbox.

## 13. Execution provider architecture (proposed; subject to Gate E)

Separate the **learning workflow**, **practice execution**, **authoritative validation**, and **AI mentor**. A shared provider interface normalizes results; implementations may differ per language and trust boundary. Server derives challenge, runtime policy, test fixtures and attempt authorization. A browser practice runner is advisory, not trusted for assessment scores.

```ts
type SupportedLanguage = 'javascript' | 'python'; // candidates, not enabled features

type ExecutionMode = 'practice' | 'validation';

type ExecutionRequest = {
  attemptId: string;        // server-authenticated scope
  challengeId: string;      // server-verified
  language: SupportedLanguage;
  sourceCode: string;       // bounded untrusted input
  mode: ExecutionMode;
};

type ExecutionResult = {
  status: 'success' | 'runtime_error' | 'timeout' | 'rejected' | 'internal_error';
  stdout: string;           // bounded and sanitized for display
  stderr: string;           // bounded and sanitized for display
  durationMs: number;
  runtimeVersion: string;
  tests?: { passed: number; failed: number }; // only trusted validation
};

interface ExecutionProvider {
  execute(request: ExecutionRequest, policy: ServerExecutionPolicy): Promise<ExecutionResult>;
}
```

`ServerExecutionPolicy` is a trusted internal type, not supplied by a learner. Public API shape is provisional and must be reconciled against actual repo routes after CODEMENTOR-001. Candidate routes: `POST /api/attempts/:attemptId/executions` for execution and `GET /api/attempts/:attemptId/executions` for evidence retrieval. Both require existing bearer attempt authorization, server-owned challenge/language allowlists, strict body limits and per-attempt quotas. Practice output is never promoted into validated competence evidence. Do not implement routes before Gate E.

### Candidate POST request (not implemented)
```json
{
  "language": "javascript",
  "sourceCode": "let total = 2 + 4; console.log(total);",
  "mode": "practice",
  "clientRequestId": "5f1c1a2e-a11b-4e6c-bcb4-00f5bfcfda11"
}
```

### Candidate success response (not implemented)
```json
{
  "executionId": "9e04a9f0-8185-4bb2-9d35-99f0d7b71a21",
  "status": "success",
  "stdout": "6\n",
  "stderr": "",
  "durationMs": 8,
  "runtimeVersion": "candidate-version",
  "mode": "practice",
  "assessmentEligible": false
}
```

Failure mapping proposal: `400 INVALID_REQUEST`, `401 UNAUTHORIZED`, `404 ATTEMPT_NOT_FOUND`, `409 INVALID_STAGE`, `413 CODE_TOO_LARGE`, `422 UNSUPPORTED_LANGUAGE`, `429 EXECUTION_LIMIT`, `503 EXECUTOR_UNAVAILABLE`, `504 EXECUTION_TIMEOUT`. Avoid revealing host paths, internal logs, hidden fixtures or runtime credentials.

## 14. Sandbox security and operational requirements

- **Isolation:** Never run untrusted learner programs in the Express API process or as a privileged host process. Worker/iframe isolation is not equivalent to hardened server isolation; document its limits. For server execution use a vetted isolation boundary, unprivileged identities, ephemeral environments and strict separation from API/database credentials.
- **Resources:** Enforce wall-clock and CPU budgets, memory/process quotas, output byte limits, source size, request concurrency and per-attempt rate limits. Ensure cancellation actually terminates the isolated computation, not merely the HTTP wait.
- **Capabilities:** Deny network access, package installation, host filesystem mounts, persistent state, privileged system calls and environment secrets by default. Limit allowed runtime APIs and standard libraries to the challenge needs.
- **Assessment integrity:** Keep hidden tests and answer keys server-side; never include them in browser bundles, model prompts or practice results. Only trusted validation may produce authoritative test outcomes.
- **Data handling:** Treat source code, stdout/stderr, learner questions and model replies as untrusted data; render as text, apply retention and size limits, and prevent cross-attempt access. Log sanitized metadata, not secrets or full learner code by default.
- **Abuse and recovery:** Deny excessive parallel jobs, queue fairly, clean up after timeout, degrade gracefully during outages and monitor cost/error/latency. Ensure malformed code does not affect other users.
- **Supply chain:** Pin and review runtime images/WASM packages, verify provenance and scan dependencies. Do not assume containerization alone constitutes a secure sandbox.
- **Research:** Document what threat scenarios were tested and what remains unproven. A passing functional test is not a security certification.

## 15. Multi-language learning and assessment requirements

Each challenge defines a **concept ID**, **language**, **runtime profile**, **public examples**, **private validation fixtures** and **rubric version**. Concepts can be shared across JavaScript and Python, but implementations and assessments remain language-specific. No automatic cross-language equivalence or SOLO classification. Meta mentor context includes the selected language and sanitized observed output; it must not see private test data. Competence reports retain provenance (`language`, `runtimeVersion`, `challengeVersion`, `rubricVersion`, `assistanceUsed`, `validationSource`). A two-language UI is conditional on both runtimes passing Gate E.

## 16. Ten-day schedule and gates

**Pre-acceptance:** Verify eligibility and event rules; audit existing contracts and stage transitions; confirm available Meta API documentation and account access; draft ADR and prompts; no irreversible hackathon implementation before rules permit.

| Day | Planned work | Exit evidence |
|---|---|---|
| 1 — Oct 26 | Rules/API discovery; baseline audit | API capability note; baseline test log |
| 2 — Oct 27 | ADR, shared contracts, provider boundary | Reviewed ADR and contract tests |
| 3 — Oct 28 | Meta adapter, errors, rate limits | Mocked adapter/API tests |
| 4 — Oct 29 | Prompt strategy, policy checks | Hint fixtures and leakage tests |
| 5 — Oct 30 | AI Mentor UI | Component tests; responsive screenshots |
| 6 — Oct 31 | Evidence persistence/report integration | DB tests; report invariants |
| 7 — Nov 1 | Complete end-to-end flow | Playwright acceptance |
| 8 — Nov 2 | Hardening and real-provider smoke | Test matrix and provider proof |
| 9 — Nov 3 | Documentation and demo video | Reproducible demo and README |
| 10 — Nov 4 | Regression, submission | Release commit, submission evidence |

**Schedule contingency:** If acceptance/API access is delayed, do not claim the live integration exists. Reduce optional features, not correctness, security or demo truthfulness. Confirm submission cutoff in the official rules and submit with margin.

## 17. Codex implementation assignments

All assignments must follow `AGENTS.md`, preserve existing architecture, use small reviewable changes, and report exact files/tests/results. **Do not run implementation assignments until eligibility, acceptance and event rules authorize the work.** Preparation/audit tasks can be performed beforehand where permitted.

### CODEMENTOR-001 — Repository reconnaissance and integration plan (pre-acceptance safe)

**Objective:** Inspect the existing SYNVORA repo without changing application code. Identify actual routes, schemas, challenge stages, authorization middleware, database migrations, report derivation, test conventions and frontend component structure.

**Codex prompt:**

> You are working in the SYNVORA AI Engineering Competence Lab repository. Read `AGENTS.md` and the approved architecture and ADRs first. Do not modify source code. Inspect the existing challenge/attempt lifecycle, bearer-secret authorization, API route conventions, shared Zod contracts, persistence/migrations, report derivation, and test setup. Produce `docs/PLANNING/CODE_MENTOR_BASELINE_AUDIT.md` containing (1) exact file paths and exported symbols, (2) integration seams for the proposed mentor endpoints, (3) state-machine and schema mismatches with PRD v0.2, (4) regression risks, (5) tests that must remain unchanged, and (6) unresolved questions. Do not assume routes or tables exist without inspecting them. Do not install dependencies or modify runtime behavior. Show `git status` and list every file changed.

**Acceptance:** Audit cites actual repository symbols; no runtime changes; explicit unresolved assumptions; clean tests not required if no code changed.

### CODEMENTOR-001A — Execution feasibility matrix (planning; no public executor)

**Objective:** Evaluate browser JS, browser Python and vetted server execution options without deploying arbitrary-code execution.

**Codex prompt:**

> Read `AGENTS.md`, PRD v0.2 and the baseline audit. Research browser-worker JavaScript, browser Python/WASM and a vetted isolated server runner. Record documented security boundaries, licensing, startup/latency considerations, private-test implications, cost, integration complexity and open questions in `docs/PLANNING/EXECUTION_FEASIBILITY_MATRIX.md`. Distinguish verified facts from assumptions; cite primary documentation. Do not implement a public code-execution endpoint, run hostile payloads, add packages or modify the baseline evaluator. Report changed files and unresolved decisions.

**Acceptance:** Evidence-based comparison, explicit threat boundaries and no runtime changes.

### CODEMENTOR-001B — Bounded execution spike and decision report (only when authorized)

**Objective:** Reproduce representative benign JavaScript/Python exercises in isolated disposable test contexts and document feasibility.

**Codex prompt:**

> Read the approved feasibility matrix and repo instructions. With explicit authorization and within event rules, build minimal non-public, disposable prototypes for candidate JS and Python runtimes using only bounded benign programs. Measure startup and warm latency, output, errors, cancellation, mobile/browser limitations, resource footprint and private-test feasibility. Do not run untrusted external submissions, connect prototypes to production, weaken host isolation or alter assessment scores. Write `docs/PLANNING/EXECUTION_SPIKE_RESULTS.md` with reproducible commands, observed results, limits and a GO-JS / GO-PY / NO-GO recommendation. Stop if required isolation cannot be demonstrated.

**Acceptance:** Reproducible measurements, no public executor and a human Gate E review.

### CODEMENTOR-002 — ADR and shared API schemas (conditional on acceptance)

**Objective:** Formalize model/provider boundary and implement request/response schemas without external calls.

**Codex prompt:**

> Read `AGENTS.md`, Code Mentor PRD v0.2, and the baseline audit. Add a focused ADR for the Meta mentor boundary, assessment separation, security/retention and graceful degradation. Implement shared Zod schemas and TypeScript types for the proposed mentor hint request, response and error envelope in `packages/shared`, adapting naming to the actual repo conventions. Write contract tests covering valid/invalid levels, input length, UUID format, bounded output, and forbidden client-controlled fields. Do not add a provider SDK, endpoint or database migration in this assignment. Do not change existing challenge/report schemas unless necessary and explicitly justified. Run relevant tests and provide command/output summary, changed files and risks.

**Acceptance:** Schemas match agreed contract, negative tests pass, no provider dependency, existing tests pass.

### CODEMENTOR-002E — Execution-provider contracts (only after Gate E)

**Objective:** Implement provider-neutral contracts for the **approved** language(s), without exposing arbitrary execution yet.

**Codex prompt:**

> Read `AGENTS.md`, PRD v0.2, the baseline audit and approved Gate E decision. Define shared Zod schemas for the selected execution language(s), normalized results, errors, trusted execution policy and runtime provenance. Do not enable a language that did not pass the gate. Keep existing expression validation and report scoring unchanged. Add contract tests for invalid language, oversized source, forged policy fields, malformed results and assessment provenance. Do not implement public execution endpoints or runtime installation in this task. Show tests and diff.

**Acceptance:** Provider boundary tested; baseline unchanged; no unapproved language enabled.

### CODEMENTOR-003 — Provider adapter and deterministic fake (conditional on acceptance)

**Objective:** Create an isolated server-side Meta provider interface, fake for tests and a production adapter after verifying current API docs.

**Codex prompt:**

> Read `AGENTS.md`, the approved ADR and shared contracts. First inspect the current official Meta Model API documentation and verify endpoint, auth, request/response structure, supported model identifier and quota behaviour. If documentation or credentials are unavailable, stop at a provider interface and deterministic fake; do not invent an endpoint or claim live integration. Implement the provider interface under the existing API service-layer conventions, environment validation, request timeout, bounded output, error mapping and redacted logging. No secrets in code, logs or browser. Unit-test successful fake responses, timeout, 429, upstream 5xx, malformed output and redaction. Do not implement the frontend or assessment scoring. Report exactly what was verified against live documentation versus mocked.

**Acceptance:** Tests deterministic; credentials server-only; provider-specific details isolated; no false live-integration claim.

### CODEMENTOR-004 — Mentor endpoint and policy (conditional on acceptance)

**Objective:** Wire authorized attempt context to provider; enforce stage, rate, hint and response policy.

**Codex prompt:**

> Using the approved schemas and provider boundary, implement the mentor hints POST endpoint within existing Express routing conventions. Reuse attempt authorization and authoritative server-side challenge lookup. Enforce stage restrictions, request budgets, input limits, bounded provider context and output checks; never send hidden tests or authoritative solution keys to the model. Keep deterministic validation/report scoring unchanged. Add Supertest cases for unauthorized/cross-attempt access, invalid input, invalid stage, timeout, provider failure, answer leakage and successful request. If persistence is required for idempotency or reporting, propose a transaction-safe migration and obtain review before implementing it. Report tests and diff.

**Acceptance:** No provider call on invalid requests; no objective score mutation; all negative paths tested.

### CODEMENTOR-004E — Isolated execution integration (only after Gate E and human approval)

**Objective:** Implement only the runtime(s) approved by Gate E behind the reviewed provider boundary.

**Codex prompt:**

> Read the approved execution ADR, Gate E decision, security checklist and existing repo conventions. Integrate only the selected runner for bounded beginner challenges. Enforce trusted resource limits, isolated execution, cancellation, quotas, output caps, no network or secret access and server-owned validation fixtures. Keep practice output non-authoritative. Add negative API tests for access control, unsupported language, oversized input, timeout, concurrency limit and runtime outage. Do not add package installation or unrestricted execution. If isolation cannot be verified, stop and report a blocker rather than weaken controls. Show changed files, exact tests and unresolved risks.

**Acceptance:** Isolation and failure cases evidenced; no bypass of deterministic validation; explicit human security review.

### CODEMENTOR-005 — Evidence, report and UI (subsequent; do not start until 001–004 reviewed)

**Objective:** Persist mentor events, disclose AI usage in report and provide accessible learner UI.

**Codex prompt:**

> Extend the existing attempt evidence model with minimal mentor-interaction events, using the established migration runner and retention policy. Add a report subsection for AI assistance without introducing new competence scores or SOLO classifications. Build a responsive, accessible AI Mentor panel using the repository's existing frontend design system and API patterns. Add tests for report invariants, HTML-like output safety, mobile layout and a provider-outage fallback. Preserve baseline learner flow and document migration rollback/retry behaviour. Run the complete relevant suite and report actual results.

**Acceptance:** End-to-end workflow passes; report provenance explicit; baseline score invariants hold; no unsupported pedagogical claims.

## 18. Human review checkpoints

- **Gate A — before coding:** Eligibility, acceptance, official reuse rules, Meta API access and baseline audit reviewed.
- **Gate E — execution scope:** Approve feasibility report, supported languages, execution boundary and fallback before CODEMENTOR-002E/004E.
- **Gate B — architecture:** Approve ADR, contracts, stage policy, data retention and rate limits.
- **Gate C — integration:** Verify a real Meta call and inspect logs for leaked data; approve prompt policy and failure handling.
- **Gate D — release:** Review test evidence, browser demo, truthful attribution of preexisting work and final submission.

## 19. Open questions / risks

1. **Application pending:** May not be selected; event terms may restrict work begun before the event.
2. **Age and eligibility:** Confirm official waiver conditions; do not submit or participate if ineligible.
3. **Provider availability:** Meta Model API credentials, model IDs, costs, quotas and SDK specifics are not yet verified.
4. **Repo drift:** Endpoint names, stage values, migrations and current report schema require CODEMENTOR-001 audit.
5. **Answer leakage:** Prompt-only constraints are insufficient; fixture-specific output screening and human testing required.
6. **Privacy:** Decide whether full questions and generated responses should be stored, and for how long.
7. **Time:** Ten days prioritizes one robust scenario. Both languages are conditional; default fallback is the existing bounded evaluator.
8. **Execution security:** Browser practice is not trusted grading; server isolation requires explicit threat review and operating controls.
9. **Educational evidence:** A successful demo is not proof of learning improvement; plan a later controlled learner study.

## 20. Proposed first commands (human operator)

From WSL Ubuntu:

```bash
cd ~/projects/synvora-ai-competence-lab
git status --short --branch
git log -1 --oneline
git remote -v
pnpm -v
```

Verify the exact baseline commit and clean working tree before creating a feature branch. Do **not** hard-reset or overwrite local work. After acceptance and rules confirmation, choose a branch such as `feat/meta-code-mentor` from the verified baseline. Run tests using the repository's actual scripts discovered in CODEMENTOR-001; do not guess script names.

---

**Approval status:** Draft v0.2 for product-owner review; Gate E not yet passed. This document specifies proposed design, not completed implementation or confirmed Meta API capabilities.
