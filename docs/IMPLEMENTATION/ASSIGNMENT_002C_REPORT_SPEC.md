# Assignment 002C — deterministic evidence report specification

**Status:** Phase A reviewed/corrected; Phase B provisionally accepted following
verification review. Phase C frontend report is implemented and automatically
verified under separate human authorization. All seven Phase D human browser
scenarios and the subsequent mobile-header checks are accepted; see the verification
record for observation boundaries. Git authorization remains separate.
**Date:** 12 October 2026 (WAT).
**Baseline:** `6d061a8e7979f57821c241845470af2cd0346604`, PRD v0.1,
approved vertical-slice specification, ADR-011–013, and human 002C refinements.

## Scope and approval conditions

Report actual persisted evidence for completed Challenge 001 attempts. Technical
observations are deterministic; investigation, reflection, conceptual understanding,
and SOLO remain unassessed. AI-use text is a learner declaration, never verified telemetry.
No numerical competence rating, automated SOLO classifier, reviewer workflow,
external AI evaluation, new database evidence, or report archival is included.

The seven-section learner-facing visual report is a mandatory 002C acceptance target
implemented in Phase C and accepted through Phase D human browser review, using
existing React/Tailwind/shadcn components.
Dashboard polish is deferred to 002D. Mockup identities, percentages, counts, and
mastery claims are visual illustrations, not learner data. Playwright is deferred
for this capstone by explicit human decision; real-backend human browser acceptance
and an actual demonstration are required. Do not claim automated browser results.

## Existing evidence boundary

AttemptService currently exposes `attemptSnapshotSchema` after bearer-secret and
fixed seven-day expiry checks. The repository reads `challenge_attempts`, unique
`attempt_evidence` rows, and up to 100 newest `validation_runs`. Phase B adds the
protected completed-attempt report route without changing this access boundary.
The rubric documents provenance and unavailable conclusions. Reuse public DTOs;
never serialize database secret digests, credentials, or private fixtures.

The reference is an explicitly revealed API-derived value, not learner code execution.
The prediction comparison uses existing trimmed exact text equality. Validation results
are persisted outcomes; do not evaluate expressions again when generating a report.
`validation_count` is recorded executions, including bounded rejections, not distinct
intentions. Retries can append runs; oversized rejected submissions are not retained.
Evidence upserts do not preserve full edit history. No evaluator version per historical
run, active-duration tracking, reviewer judgments, or observed AI interactions exists.

## Wire contract (Phase A)

Authoritative exports: `packages/shared/src/schemas/report.schema.ts` and shared index.
All objects are strict. Summary text is bounded and nonblank. Evidence text remains
plain text, including instruction-like content; schema validation never executes it.

| Group | Fields / semantics |
|---|---|
| Versions | `schemaVersion: 1.0`, `assessmentVersion: 001-deterministic-v1`, `rubricVersion: 001-review-ready-v1`, `assessmentMode: deterministic_evidence` |
| Overall Competence Profile | `overall.summary` (max 1200), `competenceRating: not_assessed`, `scope: single_challenge_recorded_evidence`; describes observations, not a verified competence rating |
| Competency Breakdown | Exactly eight unique `competencies`: code comprehension, predictive reasoning, investigation, debugging, modification, validation, explanation/reflection, AI collaboration; qualitative status only `not_assessed` or `evidence_unavailable`, bounded observations and limitations |
| SOLO Understanding Profile | `solo.status: not_assessed`, `level: null`, bounded reason; no assignment of any level |
| Technical Performance | `technicalPerformance.final`, recorded/retained execution counts, history-truncation flag, literal count meaning, and limitations; aggregate outcomes come from the referenced saved run |
| Learning Journey Evidence | `learningJourney` reuses the existing complete snapshot, including ID, challenge/version, timestamps, prediction, revealed reference, saved evidence, and up to 100 validations |
| AI Collaboration Summary | `aiCollaboration`: declared or not declared; `verification: not_verified`; supplied declaration must match saved text verbatim; no declaration means unknown use, not misconduct or confirmed non-use |
| Strengths & Growth Areas | `strengths` (0–8) and `growthAreas` (1–8), each bounded coded findings with resolvable evidence references |
| Next step | `nextStep` code, bounded authored summary, `completedAttemptEditable: false`, and references |
| Limitations | Required bounded `limitations` list; no implicit broad competence inference |

The snapshot carries completion/expiry timestamps; no duplicated attempt metadata,
new public evidence IDs, or dynamic generation timestamp is needed. Repeated reports
for the same snapshot and versions should have equivalent content. Version changes
are explicit; previous report versions are not archived or guaranteed retrievable.

Evidence reference variants are `{kind: attempt}`, `{kind: prediction}`,
`{kind: reference}`, `{kind: evidence, type}`, and `{kind: validation, id}`.
Attempt references support missing-evidence notices using the actual lifecycle record.
Other references must resolve within `learningJourney`; evidence database UUIDs are
not public. Future UI links use anchors into this report, not credential-bearing URLs.

Observation summaries max 600; at most eight per competency. Finding/guidance
summaries max 600; reference lists 1–10. Each competency and technical section
requires 1–8 limitations; top-level limitations 1–12. AI declaration max 2000.
Unknown fields, including scores, credentials, and fixture collections, are rejected.

### Final technical result integrity

`final` is either `{status: checks_met | checks_not_met, finalValidationId}` or
`{status: inconclusive, finalValidationId: null, reason}`. The reason precedence is:

1. `missing_expression`: saved modification evidence unavailable.
2. `missing_validation`: no retained run available.
3. `latest_validation_missing`: newest retained sequence differs from lifetime recorded count.
4. `latest_validation_rejected`: latest run was rejected rather than safely evaluated.
5. `expression_mismatch`: latest evaluated expression differs from saved expression.

Otherwise the final ID must be the latest matching run and the status must agree
with its recorded `allPassed`. Never select an earlier/best passing result. Partial
technical failure still permits completion under the existing lifecycle policy.

Contracts check completed stage/timestamp, unique evidence types, unique run IDs,
descending run sequences, sequences within lifetime count, and matching execution
counts/truncation. Coded technical strengths/gaps require the final matching run;
prediction findings require both recorded prediction and comparison. Gaps or
unassessed artifacts cannot be coded as demonstrated strengths; matched prediction,
safe evaluation, and passing checks cannot be coded as growth gaps. The public
example is one of the five checks: five passes require its pass, and zero passes
require its failure. Intermediate aggregate counts allow either public-example
outcome. No private-case outcomes or numeric comparison rule are invented.
Sequences need not be contiguous when evidence is missing, but must be unique,
descending, and within the lifetime count.

These are DTO consistency checks, not an assessment engine. Schemas cannot establish
the truth of arbitrary prose or understand whether guidance implies an edit. The
future report builder must use approved fixed wording, narrowly supported observation
templates, and tested guidance. Human review remains necessary.

## Backend generation and API (Phase B)

Compute on demand from persisted completed evidence; no report table or migration.
ReportService obtains the protected snapshot through AttemptService.get, checks
completion, builds a report, and validates the output. Controllers remain thin;
repository, parser, and lifecycle semantics stay unchanged. Reads do not mutate
stage, counts, timestamps, evidence, or fixed expiration. Output/data-integrity
failures must be sanitized internal errors, not learner-input Zod errors.

Route: `GET /api/attempts/:id/report`, UUID path, no body, existing bearer
header, 200 shared report response, `Cache-Control: no-store`. Authenticate before
revealing availability. Retain existing 401 missing/malformed authorization, 404
unknown/wrong-secret/expired, 400 invalid request, and sanitized 500 failures. An
authorized incomplete attempt returns 409 `REPORT_NOT_READY`. No creation/review
endpoint is introduced. This route is implemented in Phase B, not Phase A.

## Findings and guidance policy

Use literal factual observations such as "The recorded prediction matched the
reference result" and "The final expression passed the five defined checks."
Say "Some defined checks failed" rather than asserting lack of understanding.
Unreviewed explanations are a review need, not proof of a learner deficiency.
No outcome is a verified rating, certification, or independence claim.

Guidance precedence:

1. Inconclusive final evidence: `request_evidence_review`; explain the evidence gap.
2. Final evaluated checks fail: `review_arithmetic_new_attempt`; review arithmetic and try a new attempt.
3. Final checks pass but prediction differs: `trace_arguments`; practice tracing argument values and return behavior.
4. Otherwise: `explain_additional_inputs`; explain two further inputs and request feedback.

No guidance instructs editing/revalidating a completed attempt. The contract checks
this code precedence; the future builder authors guidance, while the schema does
not generate feedback or establish the semantic truth of its prose.

## Learner report and recovery acceptance (Phase C)

Show all seven sections in PRD order plus guidance, even where a section states
"Not assessed" or "No declaration supplied." Prefer readable cards and expandable
evidence with factual check counts. No radar scores, mastery badges, invented profile,
AI metrics, or private test details. Escape evidence as text; no HTML interpretation.

Use the private session reference in the coordinator for typed authenticated GET.
Keep sessionStorage exactly `{attemptId, secret}`; report/evidence caches are memory-only.
Keep completion evidence visible during report-specific network errors. Report reads
use a separate memory-only hook with abort/session/generation guards. Retry report
GET without resubmitting reflection/validation. Discard stale responses and clear
report state on session replacement/loss. Preserve unsaved drafts and existing
restoration/reconciliation messages. A lost secret or expiry prevents report access.

## Verification and phase gates

Phase A: shared schemas/tests, rubric, specification, and ADR; human reviewed and
accepted ADR-014 after passing targeted corrections. Phase B separately authorizes
backend report construction and HTTP/database verification. Phase B stopped before
Phase C. Subsequent Phase C authorization covers frontend report presentation,
recovery, RTL tests, and documentation only. No migration, dependency, reviewer,
or AI work is authorized.
Shared contracts must reject unsupported
ratings, inconsistent final results, unresolved references, malformed counts,
fabricated AI disclosure, and unsupported fields. Missing evidence has neutral states.
Tests use synthetic public evidence only, including malicious-looking plain text.

Phase B automated verification adds deterministic builder fixtures, service/HTTP
authorization/expiry/nonmutation tests, isolated PostgreSQL integration, existing
backend regression suites, checks/builds, and diff review. RTL report and recovery
tests are implemented in Phase C. Phase D human browser acceptance is complete;
the mobile-header correction was subsequently human-verified at 320px, 375px and
768px with a keyboard smoke check. These observations do not replace automated tests.
Do not reuse historical passing counts as new results. Document repository versus
native-copy execution and failures honestly.

Human browser acceptance must verify the complete journey/report, safe-but-failing
completion, rejection recovery, revalidation conflict, refresh, lost credentials,
report-network retry, keyboard interaction, and narrow-screen presentation against
the real backend. Playwright is explicitly deferred for this capstone. A demo or
browser pass requires actual execution; no human acceptance is claimed in Phase A.

## Review decisions and limits

Human review approved Phase A conditionally and required contract corrections
before Phase B; those gates passed and ADR-014 is Accepted. Phase B was
provisionally accepted and Phase C authorized; all seven Phase D browser scenarios
and subsequent mobile-header checks have now been accepted by the human reviewer. The
review-ready rubric remains uncalibrated. Computed reports have no archived version
history. Semantics of authored prose require builder tests and human inspection.
The deadline is October 14, 2026, 11:59 PM, assumed WAT. No overall scoring, trusted
review, AI evaluation, or extra evidence capture may be added without approval.
