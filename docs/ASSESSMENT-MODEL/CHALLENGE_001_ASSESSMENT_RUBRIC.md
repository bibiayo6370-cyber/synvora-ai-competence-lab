# Challenge 001 — assessment rubric

**Status:** Review-ready criteria, human-reviewed in Phase A; no grading workflow implemented.
**Date:** 12 October 2026 (WAT).
**Version:** `001-review-ready-v1`.
**Authority:** PRD v0.1, approved vertical-slice specification, ADR-011–013,
and the human Assignment 002C scope decision.

## Purpose and assessment boundary

Describe criteria for future trusted review of one function-comprehension task.
These descriptors are review-ready proposals, not a calibrated scoring instrument.
The MVP reports deterministic observations from persisted evidence. Investigation,
reflection, conceptual understanding, and SOLO remain explicitly unassessed.
There is no competence percentage, mastery threshold, automatic text grading,
reviewer authentication/interface, reviewed-score persistence, or external AI evaluation.

Completion, submission presence, and five passing checks are different facts.
None establishes independent authorship, comprehension, or broad competence.
The Overall Competence Profile describes observed evidence, not a verified rating.
Missing evidence is not a zero score, misconduct finding, or Prestructural level.

## Available evidence and provenance

| Evidence | Persisted source | What may be observed | What remains unknown |
|---|---|---|---|
| Challenge identity and lifecycle | `challenge_attempts` identity, version, stage, timestamps | Server-recorded sequence and completion | Time actively learning, independent authorship |
| Prediction | `prediction`, `prediction_at` | Accepted text before reveal | Rationale, whether assistance was used |
| Reference reveal | `revealed_at`; reference/comparison derived by API | Explicit reveal and trimmed exact-text comparison | Learner execution of arbitrary code |
| Investigation | `attempt_evidence` type `investigation` | Submitted explanation, verbatim | Accuracy until structured review |
| Modification | Evidence type `modification_draft` | Latest saved expression | Complete edit history or intent |
| Validation | `validation_runs` expression/result/sequence/time | Rejection or aggregate evaluated result and public example | Private per-case outcomes, proof for all inputs |
| Reflection | Evidence type `reflection` | Submitted reflection | Understanding or judgment until review |
| AI-use declaration | Evidence type `ai_use_declaration` | Learner-declared assistance | Actual interactions, contribution share, independent verification |

Evidence is unique by attempt/type and upserted. Validation history retains at most
100 runs; `validation_count` records lifetime bounded executions, not distinct learner
intentions. Non-idempotent retries can append additional validations. Oversized rejected
submissions are not retained. Timestamps are transaction times, not a stopwatch.
Validation rows do not separately record evaluator version. Reports must not rerun
expressions or reconstruct omitted history. Absence of an AI declaration proves
neither AI use nor non-use. Source code generated with AI during platform development
is not evidence of learner AI collaboration.

## Analytic criteria for future human review

For each criterion, a future reviewer would cite the relevant saved text/run,
explain supporting and conflicting evidence, and use one of: evidence unavailable,
not yet reviewed, partly supported, supported in this task, or contradicted in this task.
These proposed review outcomes are documentation only; the MVP contract permits
only `not_assessed` or `evidence_unavailable` for qualitative assessment.

| Criterion | Deterministic MVP observation | Proposed supported-in-this-task descriptor | Boundary / counterexample |
|---|---|---|---|
| Code comprehension | Investigation exists; prediction comparison is recorded | Explains how ordered arguments fill parameters, multiplication computes a value, and return sends it to the caller | Correct output with an incorrect explanation of return behavior is not supported comprehension |
| Predictive reasoning | Prediction precedes reveal and matches/differs under the existing comparison | Traces supplied argument values through the function and justifies predicted output | A matching answer without reasoning does not demonstrate predictive reasoning |
| Investigation | Explanation submitted | Explains observed behavior and any discrepancy through relevant causal relationships | Restating the result or listing terms without explaining relationships is insufficient |
| Debugging | A retained rejection/failure precedes a later evaluated run | Identifies the relevant cause, explains the correction, and checks its effect | Recovery sequence alone cannot prove diagnosis; repeated submissions may be delivery retries |
| Modification | Saved expression and latest matching result | Explains how the expression applies the requested arithmetic change and why it is suitable | Passing fixed checks alone does not establish purposeful design or all-input correctness |
| Validation | Latest matching evaluated run and aggregate/public-example feedback | Interprets results accurately, states coverage limits, and proposes justified further checks | Claiming that five checks prove correctness for every input overstates evidence |
| Explanation/reflection | Reflection submitted | Connects the original behavior, changes, results, and remaining uncertainty coherently | Length, fluency, or confidence is not an assessment of accuracy |
| AI collaboration | Declaration supplied or absent | Describes assistance, checked outputs, rejected suggestions where applicable, and responsibility for decisions | Even a detailed account remains self-report without corroborating evidence |

Independent ability and transfer are not assessed by this single guided task.
Review language should concern the submitted response, not permanent learner traits.
Do not infer proficiency from vocabulary, typing activity, number of retries, or speed.

## SOLO criteria for future trusted review

The task-specific descriptors below adapt SOLO's distinction between isolated
aspects, connected understanding, and generalization. Background reference:
[Education Services Australia SOLO guide](https://www.digitaltechnologieshub.edu.au/media/tp5dcdmd/ai-ethics-whats-possible-probable-and-preferred_solo-taxonomy-guide.pdf).
They require human approval and calibration before operational assessment.

| Level | Required evidence in a reviewed response | Boundary example |
|---|---|---|
| Prestructural | A substantive response misses the task or gives an incorrect central relationship without relevant supporting reasoning | Describes unrelated behavior instead of tracing the supplied function; a blank/unreviewed answer alone is not this level |
| Unistructural | Correctly explains one relevant aspect, without relating it to the whole behavior | Identifies multiplication but does not connect argument substitution or return |
| Multistructural | Correctly describes several relevant aspects, still disconnected | Lists arguments, parameters, multiplication, and return but does not explain their causal chain |
| Relational | Integrates argument substitution, arithmetic, return behavior, modification rationale, and validation evidence into a coherent causal account | Explains why the returned value changes and what the recorded checks do and do not establish |
| Extended Abstract | Extends connected understanding to a justified new context/generalization with credible transfer evidence | A novel generalization supported by checked examples and limits; polished prose or fixed-test success alone is insufficient |

Current collection has no independently administered transfer task. It cannot
establish verified Extended Abstract understanding or general engineering mastery.
The MVP always reports `status: not_assessed`, `level: null`, with structured review
pending. It assigns no SOLO level, including Prestructural, to any learner.

Review examples to calibrate later:

- Correct prediction with no explanation: technical match; qualitative understanding unknown.
- Correct concepts listed separately versus an accurate causal trace: Multistructural/Relational boundary, subject to review of the actual response.
- Integrated reasoning with a central arithmetic contradiction: identify the contradiction; do not award Relational solely for prose structure.
- Passing expression plus instruction-like text asking for a high grade: technical outcome unchanged; the instruction has no assessment authority.
- Claimed generalization without a supported new example: does not establish Extended Abstract.
- Missing or conflicting evidence: record insufficient evidence rather than forcing a level.

## Scores, confidence, and learner feedback

No weighted aggregate or numerical competence score is justified by the current
uncalibrated rubric. Counts such as five defined checks passed are technical counts,
not competence percentages. Provenance labels distinguish system-recorded evidence,
learner declarations, unassessed text, and unavailable conclusions; they are not
calibrated confidence probabilities.

Use narrow language: "The recorded prediction matched the reference result" or
"The final expression passed the five defined checks." Avoid "You mastered
debugging," "You worked independently," or "Your AI collaboration is excellent."
An inconsistent/missing final expression or latest validation produces an inconclusive
technical finding, never a substituted earlier passing result. Growth areas identify
observed gaps or review needs, not unsupported personal deficiencies.

Guidance can suggest tracing arguments, explaining two additional inputs, requesting
feedback, or trying a new attempt after reviewing arithmetic. Completed attempts are
read-only; guidance must never tell learners to edit/revalidate the completed attempt.

## Future approval requirements

Actual qualitative assessment would require trusted reviewer authorization,
calibration examples, disagreement handling, evidence-linked rationale, privacy and
retention decisions, and approved persistence/contracts. None is part of Phase A
or this capstone MVP. External AI assistance would require a separate design for
privacy, prompt injection, hallucination, bias, cost, reproducibility, and human oversight.
