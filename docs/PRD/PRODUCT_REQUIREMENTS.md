# SYNVORA — AI Engineering Competence Lab
## Product Requirements Document (PRD)

| Document control | Details |
|---|---|
| Version | 0.1 |
| Status | Approved product baseline |
| Original baseline approval | 26 September 2026 |
| Consolidated document | 10 October 2026 |
| Product | SYNVORA AI Engineering Competence Lab |
| Repository | `synvora-ai-competence-lab` |
| Change control | Material scope changes require a subsequent version or an approved implementation specification. |

## 1. Executive Summary

SYNVORA is an evidence-based learning and assessment platform designed to help developing programmers demonstrate genuine code comprehension and engineering competence. Rather than relying on lesson completion or code that merely produces the expected output, the Lab asks learners to predict behavior, investigate results, make purposeful changes, validate those changes, and explain their decisions.

The initial product deliverable is a working web-application vertical slice that takes a learner through a focused programming challenge and produces a competence report grounded in observable evidence.

The Lab is a distinct product from the broader Snyvora learning management system. The Andela capstone provides an initial demonstration and validation context but does not define the Lab's long-term product scope.

## 2. Problem Statement

Learners can become proficient at recognizing syntax, following tutorials, or generating code with AI without developing an equally strong understanding of how that code behaves. Conventional completion metrics and successful test outcomes do not, by themselves, establish that a learner can reason about a program, diagnose an unexpected result, or validate a change independently.

SYNVORA addresses this gap by collecting evidence of both technical performance and reasoning throughout a structured engineering task.

**Core product question:** Can this learner demonstrate that they understand and can apply what they have learned?

## 3. Product Vision and Objectives

### 3.1 Vision

Build a practical competence lab in which learning leads to observable capability, clear feedback, identified gaps, and an actionable next learning step.

### 3.2 Objectives

1. Assess code comprehension through observable learner actions and explanations.
2. Distinguish activity completion, evidence submission, technical correctness, and demonstrated competence.
3. Provide a structured progression from prediction to validation and reflection.
4. Present assessment findings transparently, including where evidence is insufficient.
5. Help learners understand their strengths, growth areas, and next steps.
6. Establish a modular foundation for broader AI engineering competence assessment.

## 4. Target Users and Use Context

### 4.1 Initial audience

Novice and developing programmers who can read or produce basic code but need to strengthen their ability to explain behavior, investigate errors, modify programs intentionally, and verify results.

### 4.2 Initial use case

A learner completes a guided code-comprehension challenge through a browser, submits evidence at each stage, receives objective technical feedback where possible, and reviews a structured competence report.

### 4.3 Longer-term context

The Lab may expand into additional engineering competencies, learning pathways, evidence types, and opportunity guidance. Those expansions are outside the initial vertical slice unless separately approved.

## 5. MVP Scope and Outcome

The MVP shall demonstrate **one complete, meaningful learner journey**, from a focused challenge to an evidence-based competence report and a recommended next learning step.

The MVP prioritizes depth and credibility of the learning interaction over the number of challenges, content volume, administrative features, or AI-generated responses.

The exact challenge, assessment rubric, API operations, persistence schema, and screen design will be defined in an approved vertical-slice implementation specification before coding begins.

## 6. Core Learner Journey

The approved interaction sequence is:

**Challenge → Predict → Run → Investigate → Modify → Validate → Reflect → Competence Report**

| Stage | Learner experience | Evidence or outcome |
|---|---|---|
| Challenge | Review a focused engineering task and learning objective. | Challenge context and attempt start. |
| Predict | Predict what the code will do before seeing the result. | Prediction and its timing relative to the reveal. |
| Run | Observe program behavior or a clearly identified reference execution result. | Observed behavior and comparison with prediction. |
| Investigate | Explain behavior, relevant relationships, and any discrepancy. | Written reasoning and investigation evidence. |
| Modify | Make a purposeful change to the solution. | Modified solution or correction. |
| Validate | Check whether the modification meets defined expectations. | Objective validation outcomes where supported. |
| Reflect | Explain decisions, learning, and remaining uncertainty. | Reflection and engineering judgment evidence. |
| Competence Report | Review the collected evidence and findings. | Competence profile, limitations, gaps, and next step. |

The implementation shall preserve the distinction between what a learner submitted, what the system observed, and what an assessor can reasonably conclude.

## 7. Assessment Framework

### 7.1 Assessment principles

SYNVORA combines four complementary foundations:

- **PRIMM:** A structured approach to predicting, running, investigating, modifying, and extending understanding of code, reflected in the Lab's approved learner journey.
- **SOLO taxonomy:** A framework for characterizing the depth and structure of demonstrated understanding.
- **Objective automated testing:** Verification of defined technical behaviors.
- **Structured analytic rubrics:** Explicit criteria for evaluating explanation quality and engineering reasoning.

AI collaboration evidence is also captured where relevant, including how learners use assistance, check outputs, identify errors, and remain accountable for decisions.

### 7.2 Evidence and inference

The system must not equate passing automated tests with understanding. Technical correctness, conceptual comprehension, and responsible AI collaboration are distinct assessment dimensions.

Any reported assessment must identify its evidential basis. Where an explanation has not been evaluated, the report must state that clearly rather than presenting an unsupported score or SOLO level.

### 7.3 Detailed assessment rules

The exact rubric dimensions, SOLO descriptors, weights, mastery thresholds, and assessor responsibilities are to be defined in the assessment-model specification and approved before automated or human-assisted scoring is implemented.

## 8. Competence Report Requirements

The report shall contain the following sections:

| Section | Purpose |
|---|---|
| Overall Competence Profile | Summarize findings supported by available evidence. |
| Competency Breakdown | Organize evidence by relevant skill or competency. |
| SOLO Understanding Profile | Present the assessed depth of understanding and its basis, or indicate that assessment is pending. |
| Technical Performance | Show objective checks, results, and limitations. |
| Learning Journey Evidence | Present relevant predictions, explanations, modifications, validations, and reflections. |
| AI Collaboration Summary | Describe recorded AI assistance and learner validation, or indicate that no evidence was captured. |
| Strengths & Growth Areas | Identify evidence-backed strengths and opportunities for improvement. |

The report should also offer a **next learning step** tied to observed gaps or incomplete evidence. A report is not a certificate of mastery merely because a challenge has been completed.

## 9. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Present a focused programming comprehension challenge with a clear learning objective. | Must |
| FR-02 | Capture a prediction before revealing the observed result. | Must |
| FR-03 | Present observed behavior for comparison with the prediction. | Must |
| FR-04 | Capture the learner's investigation and explanation. | Must |
| FR-05 | Support purposeful code modification or correction. | Must |
| FR-06 | Validate defined technical behavior using objective checks where appropriate. | Must |
| FR-07 | Capture reflection on decisions, results, and learning. | Must |
| FR-08 | Generate an evidence-based report containing the seven required sections. | Must |
| FR-09 | Identify gaps and provide a meaningful next learning step. | Must |
| FR-10 | Persist attempt and evidence data through the approved PostgreSQL data-access boundary. | Must |
| FR-11 | Validate API requests and responses through shared Zod contracts where applicable. | Must |
| FR-12 | Demonstrate one complete challenge before expanding the challenge catalog. | Must for initial slice |

## 10. Technical Architecture

The approved implementation stack is:

| Layer | Technology |
|---|---|
| Web application | React, Vite, TypeScript |
| Styling and UI | Tailwind CSS, shadcn/ui |
| Forms and validation | React Hook Form, Zod |
| Backend API | Node.js, Express, TypeScript |
| Primary database | PostgreSQL |
| Local database runtime | Docker |
| Shared contracts | `packages/shared` with Zod and TypeScript |
| Workspace | pnpm monorepo |
| Tests | Vitest, React Testing Library, Supertest, Playwright |
| Source control and AI development | Git, GitHub, Codex |

The application follows a modular-monolith architecture:

`Browser → Web application/API client → Express routes/controllers → Application services → Repositories → PostgreSQL`

Frontend components must not access PostgreSQL directly. HTTP controllers must not contain domain business rules. Shared contracts must not contain React, Express, or database implementation logic.

The authoritative technical design is maintained in `docs/ARCHITECTURE/SYSTEM_ARCHITECTURE.md` and the approved Architecture Decision Records.

## 11. Non-Functional Requirements

### 11.1 Accessibility and inclusion

Use semantic HTML, keyboard-operable controls, readable content, appropriate contrast, accessible form fields, and understandable validation messages.

### 11.2 Low-bandwidth usability

Favor lightweight pages, text-first learning interactions, efficient API payloads, and responsive layouts suitable for basic devices. Offline-first functionality is not an initial requirement.

### 11.3 Security and privacy

Apply server-side validation at trust boundaries, keep credentials out of committed source, protect learner evidence appropriately, and avoid exposing sensitive infrastructure details in API responses. Authentication, authorization, and retention details require a dedicated implementation decision.

### 11.4 Reliability and error handling

Provide actionable error states and sufficient development diagnostics. Invalid submissions and workflow transitions should not silently corrupt an attempt.

### 11.5 Testability

Use unit, component, API, and end-to-end tests as appropriate. Validate both expected behavior and meaningful failure cases.

### 11.6 AI-assisted engineering governance

Codex and other AI development tools operate under `AGENTS.md`, with human approval, independent verification, documented decisions, and controlled Git checkpoints.

## 12. MVP Exclusions

The initial proof of concept does not require:

- A general-purpose learning management system or large course catalog.
- A recruitment marketplace or job board.
- A learner-facing AI chatbot solely because AI is used to develop the product.
- Broad challenge authoring or complex multi-role administration.
- Payments, cohort management, or enterprise dashboards.
- Multilingual rollout or offline-first infrastructure.
- A large monitoring or production-deployment platform.
- Unrestricted execution of untrusted learner code or unsupported automated competence grading.

Deferred capabilities may be introduced through later product versions and architectural decisions.

## 13. MVP Acceptance Criteria

The first vertical slice will be ready for acceptance when:

1. A learner can begin a focused challenge with a clear objective.
2. The learner's prediction is recorded before the observed result is shown.
3. The learner can inspect behavior and submit an investigation.
4. The learner can make a bounded modification and receive accurate validation feedback.
5. The learner can submit a reflection.
6. The report displays technical evidence, reasoning artifacts, and explicit assessment limitations.
7. The report identifies an evidence-based strength, growth area, and next learning step where the evidence supports them.
8. API input is validated at the server boundary using appropriate shared contracts.
9. Attempt evidence is persisted through PostgreSQL and the repository boundary.
10. Core successful and invalid workflows are covered by automated tests and can be demonstrated locally.

These criteria define product acceptance. The detailed implementation approach must be approved separately.

## 14. Open Implementation Decisions

The following matters are intentionally reserved for the vertical-slice specification or dedicated architecture decisions:

1. First challenge content, examples, and expected behavior.
2. Whether the Run stage uses isolated execution or a deterministic reference result.
3. Safe mechanism for validating learner modifications.
4. Database entities, API routes, and attempt state transitions.
5. Detailed rubrics, SOLO-level descriptors, weighting, and mastery thresholds.
6. Manual, rules-based, or AI-assisted assessment responsibilities.
7. Identity, authentication, anonymous attempt access, retention, and deletion.
8. Final interface layouts and capstone demonstration narrative.

Open decisions are not permission for an implementation agent to choose product policy independently. They require human review and approval.

## 15. Delivery and Change Management

The initial delivery sequence is:

1. Approve the first vertical-slice implementation specification and assessment rules.
2. Establish required persistence and API domain boundaries.
3. Implement the learner journey and evidence capture.
4. Implement transparent competence reporting and progression guidance.
5. Verify the workflow through automated tests and a reproducible browser demonstration.

Product changes that materially alter scope or assessment policy must be reflected in a later PRD version or an explicitly approved addendum. Engineering implementation must remain consistent with the system architecture, ADRs, and `AGENTS.md`.

**Next document:** Vertical Slice Implementation Specification — Challenge 001 and Codex Assignment 002.
