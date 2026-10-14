# ADR-014: Deterministic evidence reporting without competence scoring

**Status:** Accepted following human review and passing Phase A corrections.
**Date:** 12 October 2026 (WAT).
**Related:** PRD v0.1; vertical-slice specification; ADR-005, ADR-011–013;
Challenge 001 assessment rubric and Assignment 002C report specification.

## Context

Challenge 001 persists prediction/reveal timing, submitted explanations, the latest
expression, bounded validation history, reflection, and optional AI-use declaration.
Technical results do not independently establish comprehension, authorship, transfer,
mastery, or AI collaboration. No trusted review infrastructure or calibrated scoring
model exists. Non-idempotent retries can add validation executions; evidence upserts
and 100-run retention limit provenance. Human has approved deterministic observations
and review-ready criteria, with qualitative evidence and SOLO explicitly unassessed.

## Decision

Produce a versioned report on demand from the authorized completed-attempt snapshot.
Reuse shared strict Zod evidence/validation contracts. Keep assessment rules in the
future API builder/service and presentation in the future frontend. Shared refinements
check DTO consistency; they do not grade text or execute learner expressions.

No report table, migration, ORM, model SDK, reviewer workflow, or reviewed-score
persistence is needed. Report reads do not modify evidence, lifecycle, or retention.
Reuse existing bearer-secret authorization and fixed expiry; no public report links,
credential URLs, localStorage, or persistent browser evidence caches.

The Overall Competence Profile summarizes observed evidence without a numerical or
verified competence rating. Eight criterion findings separate deterministic technical
observations from unassessed reasoning. SOLO is always unassessed with no level. AI
notes remain unverified declarations; absence does not establish non-use or misconduct.

Report final technical outcomes only from the newest recorded evaluated run matching
the current saved expression. Missing/rejected/mismatching or missing-latest evidence
is inconclusive; never substitute a historical best result. Counts mean recorded
executions, not distinct learner intentions. Strengths/growth language is narrow and
supported by included evidence references. Completed-attempt guidance never implies
that the completed attempt can be edited.

The seven-section visual report using existing UI primitives is mandatory for 002C
acceptance. Full dashboard polish is deferred. Human explicitly defers Playwright for
this capstone and requires real-backend human browser acceptance and an actual demo.
This overrides the earlier slice's Playwright delivery expectation for this checkpoint
only; it does not alter the long-term approved testing stack.

## Alternatives considered

- Numerical competence score: rejected for MVP; no calibrated weights or defensible precision.
- Automatic SOLO/keyword grading: rejected; fixed test success and text presence do not establish understanding.
- Trusted human-review application: deferred by human scope decision; requires authorization, calibration, persistence, and dispute handling.
- External AI evaluation: deferred; introduces prompt-injection, hallucination, bias, privacy, cost, and reproducibility risks without solving the immediate evidence boundary.
- Persisted report artifacts: deferred; computed reports avoid migration and archival scope while retaining explicit rule versions.

## Consequences and approval gate

Reports are reproducible for identical evidence and rule versions, but prior report
versions are not archived or guaranteed retrievable. Learners see real technical
findings and actionable practice suggestions, not certificates or fabricated ratings.
The rubric is proposed and uncalibrated; trusted review is not operational.
Authored prose still needs deterministic builder tests and human review because a
schema cannot prove semantic truth. Seven-day expiration and secret loss apply to
reports. Existing cleanup scheduling remains documented, not operationally configured.

Human review conditionally accepted Phase A and this ADR on 12 October 2026.
Required corrections enforce guidance precedence and finding polarity and check
only justified sequence/aggregate consistency. All 60 shared tests, check, build,
and diff checks passed before this status changed to Accepted. Phase B backend
implementation is separately authorized; frontend/report presentation remains
outside Phase B and requires Phase C authorization.
