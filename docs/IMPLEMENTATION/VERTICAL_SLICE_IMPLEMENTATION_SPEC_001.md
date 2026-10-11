# SYNVORA — Vertical Slice Implementation Specification
## Challenge 001: Function Comprehension and Bounded Modification

| Field | Value |
|---|---|
| Version | 0.1 — approved for implementation |
| Date | 10 October 2026 |
| Parent | `docs/PRD/PRODUCT_REQUIREMENTS.md` v0.1 |
| Architecture | `docs/ARCHITECTURE/SYSTEM_ARCHITECTURE.md`, ADR-001–010, `AGENTS.md` |
| Delivery | Codex Assignment 002, phased and human-reviewed |
| Scope | One complete learner-facing challenge and evidence-based report |

## 1. Goal and exclusions

Deliver one working, locally demonstrable journey: **Challenge → Predict → Run → Investigate → Modify → Validate → Reflect → Competence Report**, followed by a next learning step. No general LMS, multi-challenge catalog, learner-facing chatbot, arbitrary JavaScript execution, automated SOLO rating, or certification of mastery.

## 2. Challenge content

**Title:** Understand and extend `calculateTotal`.

**Competency:** Trace function parameters and arithmetic; predict output; explain behavior; implement and validate a percentage discount.

Starter code:

```js
function calculateTotal(price, quantity) {
  return price * quantity;
}
console.log(calculateTotal(1500, 3));
```

Initial observed result: `4500`. Display it only after the learner submits a prediction. Label this **reference result** rather than implying learner-authored code has been executed.

Modification task: complete the **expression only** in a protected template:

```js
function calculateTotal(price, quantity, discount) {
  const total = price * quantity;
  return /* learner expression */;
}
```

The learner should implement `total - (total * discount / 100)` or an equivalent permitted expression. Show an example of the desired behavior (e.g., 1500 × 3 with 10% discount → 4050), not the completed expression.

## 3. Learner journey and transition rules

1. **Challenge:** Display objective, starter code, and accessible learning resource explaining JavaScript functions, parameters, and return values. Create a persisted attempt on explicit start.
2. **Predict:** Collect predicted console output as text; persist before revealing `4500`. Prediction is immutable once submitted. A refresh must not unlock or erase it.
3. **Run:** Reveal the **precomputed reference result** and whether the prediction matches. Require an explicit continue action; record reveal state.
4. **Investigate:** Collect learner explanation of parameter values, multiplication, and any prediction discrepancy. Store verbatim as unassessed reasoning evidence.
5. **Modify:** Show protected code template with a single plain-text expression input. Preserve the draft across validation errors and refreshes as appropriate.
6. **Validate:** Parse, allowlist-check, and safely evaluate the expression against defined test cases. Invalid syntax/unsupported input returns clear corrective feedback, does **not** advance the stage, and permits retries. Valid but failing test cases also permit retries. Store validation attempts with bounded size/retention. Learner may proceed to reflection after a valid validation attempt even if tests fail, so gaps can be reported honestly.
7. **Reflect:** Collect what changed, why, what tests demonstrated, and remaining uncertainty. Optionally collect a declared AI-use note; absence is not treated as misconduct.
8. **Report:** Generate seven mandatory sections, evidence limitations, and a recommended next learning step. The report is read-only for the completed attempt.

Stage transitions are server-authoritative; out-of-order submissions return structured `409 Conflict` without altering state. Malformed requests return structured `400` responses. Missing resources return `404`.

## 4. Bounded expression input — mandatory security contract

Treat learner input as **untrusted plain text**. Do not evaluate raw input using `eval`, `new Function`, `vm`, dynamic import, shell commands, or execution in the API process. Do not rely on a regular expression alone as a JavaScript parser.

**Input constraints:** Maximum 200 characters, single expression, ASCII digits, whitespace, parentheses, operators `+ - * /`, and identifiers `total` and `discount` only. No statement separators, quotes, brackets, braces, property access, function calls, assignment, template literals, loops, comments, or other identifiers. Reject malformed or unsupported syntax.

**Parser:** Use a small purpose-built expression parser or an established parser with a strict AST node allowlist. Permitted nodes: finite numeric literals, identifier references (`total`, `discount`), grouping, unary `+`/`-`, and binary `+`, `-`, `*`, `/`. If using an AST parser, fail closed on every other node type. Enforce maximum AST nodes (e.g., 50) and maximum nesting depth (e.g., 12). Never coerce unknown values or call properties on learner input.

**Evaluation:** Interpret the allowlisted AST using only finite numeric operands supplied by server-owned test fixtures. Reject division by zero and non-finite intermediate/final results. Cap evaluation cost. Compare numerical results with a documented tolerance (e.g., absolute error ≤ 1e-8 for these fixtures).

**Test cases (server-owned):**

| Case | price | quantity | discount | expected |
|---|---:|---:|---:|---:|
| Example | 1500 | 3 | 10 | 4050 |
| Zero discount | 1200 | 2 | 0 | 2400 |
| Quarter discount | 800 | 4 | 25 | 2400 |
| Full discount | 500 | 2 | 100 | 0 |
| Fractional discount | 99.5 | 2 | 12.5 | 174.125 |

The backend computes `total = price * quantity` and supplies `total` and `discount` to the expression interpreter. Do not send undisclosed fixtures or reference solution expressions in the challenge-start payload. The validation response may show pass/fail and explanatory public-case feedback, without exposing secret fixtures if any are added later.

**Feedback:** For rejected input, show an accessible inline error and notification, e.g., “Only `total`, `discount`, numbers, parentheses, and + − × ÷ are allowed. Please revise and try again.” More specific feedback may distinguish syntax errors, unknown identifiers, too-long input, division by zero, and non-finite results. Do not erase the input; permit retry without stage advancement.

**Security tests:** Reject `process.exit()`, `globalThis`, `constructor`, `total; ...`, `total = 1`, `Math.random()`, `total ** 2`, `total[0]`, `total.discount`, quoted strings, malformed parentheses, oversized expressions, and deep nesting. Test valid alternative expressions, repeated failures, and non-finite arithmetic.

## 5. Persistence and access policy

Use PostgreSQL in Docker through repository interfaces; no silent in-memory substitution. Suggested minimal tables:

- `challenge_attempts`: UUID, challenge ID/version, current stage, created/updated/completed timestamps, prediction text and submission timestamp, reference-result reveal timestamp.
- `attempt_evidence`: UUID, attempt ID, evidence type (`investigation`, `modification_draft`, `reflection`, `ai_use_declaration`), plain-text content, created/updated timestamps.
- `validation_runs`: UUID, attempt ID, expression text, syntax/allowlist status, aggregate test outcomes, created timestamp.

Implement SQL migrations with a migration tracking table, transactional application, deterministic ordering, and repeat-safe startup/CLI behavior. Do not introduce a large ORM without approval. Avoid storing personal identifiers in the MVP.

**Anonymous demo access:** No account system in the first slice. Generate an unguessable per-attempt bearer secret and store only its hash server-side. Return the secret once on attempt creation; the frontend keeps it in session storage (not URL, logs, or analytics). Require it for every attempt read/write request. Treat browser storage as ephemeral; provide a clear “demo session” notice. Do not expose attempts by ID alone. Add a simple cleanup command or documented retention policy; retention is 7 days, as approved. If the bearer-secret scheme would materially expand scope, stop and request an explicit decision rather than weakening access control.

## 6. Shared contracts and API

Define Zod request/response contracts and TypeScript types in `packages/shared`. Suggested endpoints:

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/challenges/001` | Public challenge metadata, starter code, resource, permitted expression syntax |
| POST | `/api/attempts` | Start challenge, return attempt ID and one-time access secret |
| GET | `/api/attempts/:id` | Resume authorized attempt and retrieve current stage/evidence |
| POST | `/api/attempts/:id/prediction` | Lock prediction |
| POST | `/api/attempts/:id/reveal` | Reveal reference output after prediction |
| POST | `/api/attempts/:id/investigation` | Save reasoning and advance |
| PUT | `/api/attempts/:id/modification` | Save plain-text draft |
| POST | `/api/attempts/:id/validation` | Validate expression and store results |
| POST | `/api/attempts/:id/reflection` | Save reflection and complete |
| GET | `/api/attempts/:id/report` | Return evidence-based report |

API responses must never include the reference answer before prediction submission, the reference modification expression, database credentials, other attempts, or internal stack traces. Controllers stay thin; services own stage transitions and reporting; repositories own SQL.

## 7. Assessment policy and report

**Objective evidence:** Prediction match/mismatch, valid expression status, tests passed/failed, and timestamps/order of submissions. **Unassessed evidence:** Investigation explanation, reflection, and AI-use declaration. Do not infer SOLO level or comprehension score automatically from text length, keywords, or passing tests.

Report sections, in PRD order:

1. Overall Competence Profile — concise evidence summary; no mastery claim.
2. Competency Breakdown — prediction, tracing, modification, validation, explanation (unassessed where applicable).
3. SOLO Understanding Profile — “Not assessed; structured review pending” with reason.
4. Technical Performance — counts, named public checks, limits of coverage.
5. Learning Journey Evidence — prediction, reference result, investigation, submitted expression, validation history summary, reflection.
6. AI Collaboration Summary — learner declaration if supplied; otherwise “No AI-use evidence recorded.”
7. Strengths & Growth Areas — evidence-backed technical strengths/gaps, explicitly label unreviewed reasoning.

**Next step rules:** If expression validation failed, recommend reviewing function arithmetic/discount calculations and retrying. If validation passed but explanations remain unreviewed, recommend explaining the behavior using two additional inputs and requesting feedback. If prediction missed, recommend tracing arguments and return values. Prioritize actionable guidance; do not equate any of these with an assessed SOLO level.

## 8. Frontend and accessibility

React + Vite + TypeScript; Tailwind and shadcn/ui where appropriate; React Hook Form + Zod for forms. One responsive guided experience with a visible step indicator, protected code context, one accessible plain-text expression editor, explicit submit/continue actions, progress persistence, retry notifications, loading/error states, and report view. Use semantic labels, keyboard access, focus management, and an `aria-live` feedback region. No heavyweight embedded IDE required.

## 9. Verification and acceptance

- Unit: parser allowlist, AST limits, arithmetic, edge cases, stage transitions, report rules.
- API/Supertest: successful sequence, invalid stage order, missing/incorrect attempt secret, invalid expression and retry, persistence across API restart, no premature answer disclosure.
- React Testing Library: prediction locked before reveal, validation error and retry, keyboard accessibility, stage/report presentation.
- Playwright: complete learner journey in local Docker + API + web stack, including one invalid expression corrected by learner.
- Manual: refresh/resume, mobile viewport, basic-device/low-bandwidth inspection, accessibility spot check.
- Quality gates: `pnpm` install with lockfile integrity, shared/API/web typechecks, builds, tests, `git diff --check`, human review before commit.

**Definition of done:** A learner can complete the eight stages, retry rejected expressions, persist evidence in PostgreSQL, receive a seven-section report with honest assessment limitations and a next step, and repeat the workflow locally from documented setup commands.

## 10. Delivery checkpoints and governance

**002A — Domain + database + contracts:** Implement migrations, repository interfaces, challenge metadata, parser/evaluator, services and API tests. Stop for human review.

**002B — Learner web flow:** Implement accessible React screens and API client with state/resume behavior. Stop for human review.

**002C — Report + end-to-end demo:** Implement report, guidance, browser tests, documentation and recorded demonstration. Stop for human review.

Codex must inspect existing files and ADRs first, propose file-level changes, and await explicit human authorization. Do not commit, push, alter global Codex settings, or make architectural substitutions without approval. Update `docs/AI-ENGINEERING/AI_ENGINEERING_LOG.md` and `docs/DEVELOPMENT/COMMAND_REFERENCE.md` as work proceeds.

## 11. Approved implementation decisions

1. **Approved:** This specification is implementation authority beneath PRD v0.1.
2. **Approved:** Anonymous session-secret access with seven-day retention and a cleanup mechanism.
3. **Approved:** Parser-based strict expression allowlist (rather than exact string matching) to support multiple valid expressions.
4. **Approved:** Five test fixtures and progression to reflection after valid but failing expressions.

All four decisions were explicitly approved on 10 October 2026. Codex may propose an implementation plan but must still wait for separate human authorization before modifying source files.

## 12. Assignment 002A authorized operational details (10 October 2026)

Human implementation authorization confirms: dedicated Docker databases
`synvora_dev` and `synvora_test`; 200 expression characters, 50 AST nodes,
depth 12, absolute tolerance 1e-8, and at most 100 retained validation runs;
fixed seven-day expiration from creation; immutable prediction; explicit reveal;
422 expression rejections; 409 transition conflicts; explicit transactional CLI.
Use a short project-authored learning resource. Report generation, report endpoints,
and frontend work remain outside this assignment.

Persist next-action stages predict/run/investigate/modify/validate/reflect/completed.
Reveal is the explicit Run continue operation. Safe validation permits reflection
with failing checks; latest evaluated expression must match the current draft before
completion. Prediction comparison trims surrounding whitespace and compares text.
Request limits: prediction 200, investigation/reflection 4000, AI declaration 2000
characters; body 32 KiB. Decimal literals require digits on both sides of any dot.
Only ASCII whitespace is supported. Private fixture feedback remains server-side.
