# SYNVORA Code Mentor — Gate E Execution Scope Correction

**Date:** 27 October 2026 (WAT)
**Status:** Product-owner feedback incorporated into architecture-review recommendation; **not an implementation authorization or completed Gate E approval**
**Product baseline:** PRD v0.3, approved 27 October 2026
**Repository inspected:** `bibiayo6370-cyber/synvora-ai-competence-lab` at `9fee8018cc850f68527bbbd8af72fcfd1aa74e46`
**Supersedes:** The *bounded-only as preferred hackathon scope* recommendation in `SYNVORA_GATE_E_LIVE_REVIEW_ADDENDUM_2026-10-27.md`. Prior factual findings from that audit remain valid.

## 1. Correction and intent

The existing Andela-capstone challenge illustrates JavaScript source but reveals a predefined reference output. It validates a restricted arithmetic expression with five private fixtures. This is **an existing implementation fact**, not the intended ceiling for Code Mentor. The product direction previously discussed and reaffirmed by the product owner is learner-selectable **JavaScript and Python** with **actual code execution in a secure sandbox**.

PRD v0.2 and approved v0.3 expressly reserve the final runtime decision for Gate E. This document elevates a real, controlled JS/Python runtime from a mere optional research curiosity to the **preferred target and first Gate E evaluation priority**, without claiming the runtime exists or treating an unverified sandbox as secure.

## 2. Desired learner flow

1. Select a **supported, enabled** language (JavaScript or Python).
2. Choose a language-specific challenge tied to a common programming concept.
3. Predict observable program behaviour before running.
4. Run the actual learner-visible program in a bounded, isolated execution environment and inspect real stdout/stderr/exit status.
5. Investigate the gap between prediction and observed behavior; use Meta Muse Spark's bounded contextual hints when requested.
6. Modify source, rerun and submit for **trusted challenge-specific validation**.
7. Reflect, obtain a report distinguishing observed technical outcomes from unassessed conceptual understanding, and receive appropriate challenge-completion recognition.

The program's actual output must never be passed off as predefined execution. Demo claims must match the final working implementation.

## 3. Architecture design constraints

- **Executor boundary:** `apps/api` orchestrates execution and assessment through a dedicated provider/interface, not through `eval`, Node `vm`, `child_process` running unconstrained user code, or direct execution inside the main API service.
- **Languages:** Language choice must be linked to separately verified runtime profiles. JavaScript and Python must each pass its own checks, even if one infrastructure provider supports both.
- **Isolation and controls:** Ephemeral jobs; unprivileged execution; denial of network, package install, host mounts and secrets by default; enforceable time, CPU, memory, process, output and source limits; reliable cancellation and cleanup; request quotas, anti-abuse limits and audit-safe logging.
- **Assessment boundary:** Practice-run output is observational, not a pass/fail verdict. Private validation fixtures and expected values remain controlled by the server/trusted evaluator, never placed in frontend bundles or transmitted to the AI model. The AI may explain evidence but cannot set authoritative test results.
- **Contracts:** Introduce Zod-validated language-aware challenge, execution and validation contracts in `packages/shared`. Design new route(s) only after reconciling existing `attempt.routes.ts`, service-stage policies and report invariants. Preserve existing access token protections and seven-day expiry unless approved otherwise.
- **Security:** A browser Web Worker or in-browser Python/WASM may be adequate for *local practice* after review, but must not be assumed to protect server-owned private tests. Likewise a container alone does not prove secure isolation. Document the deployment trust model and residual risks.
- **Failure modes:** Runner offline, timeout, resource exhaustion, unsupported language, cancelled run and invalid code are explicit non-success results. No fabricated runtime output or silent substitution of predetermined answers.

## 4. Independent Gate E decision options

| Decision | Minimum evidence | Outcome |
| --- | --- | --- |
| **GO-JS** | Actual JavaScript run, limits/cancellation, no secret/network exposure, isolated private validation, passing tests, reviewed deployment path | Enable JavaScript in the learner UI and demo |
| **GO-PY** | Same independently demonstrated evidence for Python; additionally startup, memory, browser/device or provider latency and package restrictions | Enable Python in the learner UI and demo |
| **NO-GO** | Any blocking safety, correctness, cost or time constraint | Disable unverified language/runtime; retain restricted baseline for internal fallback, revise demo truthfully |

These decisions may be `GO-JS + NO-GO-PY`, both GO, or neither. Gate E cannot be signed off solely from source inspection of the previous interpreter; execute a disposable spike and regression tests first.

## 5. Required feasibility proof and tests

**CM-001B-SP:** Compare at least one viable execution approach for JavaScript and Python, including actual isolation properties, startup and per-run latency, resource enforcement, cancellation, private validation design, deployment cost, API integration, and lower-powered-device behavior.

**CM-001C:** Prove benign real program execution for each candidate language, intentional syntax/runtime failure, timer/cancellation, oversized request denial and output cap. Verify that worker jobs cannot access server environment secrets, database credentials or network according to the selected design. Explicitly document what remains untested.

**CM-001D:** Confirm existing baseline regressions: `pnpm check`, `pnpm build`, shared/web/API unit tests and isolated test DB integration. GitHub Actions did not show existing runs at audit time; do not call tests passed without actual output.

**CM-001E:** Human review of execution contract, isolation evidence, data flow and risk acceptance; record one of GO-JS, GO-PY or NO-GO for each runtime in an ADR.

## 6. Priority and schedule trade-off

The full P0 product—complete journey, Meta Muse Spark, deterministic evidence, reliability and truthful demo—remains essential. Real sandboxed execution is now the **preferred experience**, so the team should investigate it before allocating time to optional polish. Both languages remain independently feasibility-gated. If complexity threatens the submission deadline, prioritize a demonstrably safe JavaScript runtime and defer Python activation rather than misrepresent a partial implementation. **Sovi and voice remain P1 and may be trimmed before reducing security or correctness.**

Proposed sequence: Oct 27–28 runtime spike and access/security design; Oct 29 Gate E decision; Oct 30–Nov 1 accepted runtime integrations and Meta mentor work in parallel only if capacity permits; Nov 2 regression and accessibility; Nov 3 demo/release freeze; Nov 4 final submission checks. These are targets, not evidence of completion.

## 7. How to describe it to judges

- **If both implementations pass:** “SYNVORA supports JavaScript and Python challenges with sandboxed execution and verified tests.” Show both briefly.
- **If only JavaScript passes:** “This demonstration uses sandboxed JavaScript execution; our language-neutral architecture is designed to add Python after separate validation.” Do not imply Python is working.
- **If neither runtime passes:** Demonstrate the bounded evaluator and state precisely what it does. Do not claim genuine source execution.

Judge-facing narration should emphasize learner learning outcomes, Meta tutoring, evidence, accessibility and Sovi only to the extent these are actually demonstrated. There is no need to devote screen time to an obsolete baseline limitation after a replacement is working.

## 8. Decisions pending

- Actual provider/runner selection, resource policy and hosting design.
- Safe support for languages and specific challenge fixture types.
- Required migration and report-contract changes.
- Reproducible execution and security test evidence from an approved environment.
- Product-owner approval of resulting Gate E ADR and final GO decisions.

**This is a corrected architecture direction, not a retroactive claim that safe JS/Python execution already exists.**
