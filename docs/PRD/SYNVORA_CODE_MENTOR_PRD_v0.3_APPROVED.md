# SYNVORA Code Mentor — Product Requirements Document (PRD)

**Version:** 0.3 — Interactive Learning Experience
**Document status:** **APPROVED — PRODUCT BASELINE (human-approved; conditional feature gates remain)**
**Prepared:** 27 October 2026 (Africa/Lagos)
**Product owner:** Babajide Ibiayo
**Project:** SYNVORA — AI Engineering Competence Lab / Meta Global AI Developer Hackathon 2026
**Submission track/theme:** Indie Developer / Build for Your World
**Supersedes:** `SYNVORA_CODE_MENTOR_PRD_v0.2.md` for forward planning; **does not supersede** the pre-hackathon competence-lab architecture, verified tests, ADRs, or source-history baseline.
**Operating period:** 27 October–4 November 2026; internal submission target **4 November 2026, 18:00 WAT**; official cutoff **5 November 2026, 03:00 WAT** (4 November, 21:00 US Eastern Standard Time).
**Classification:** Product and engineering requirements; proposed contracts are **not claims of existing repository functionality**.

> **Approval record (27 October 2026, Africa/Lagos).** The product owner explicitly approved **PRD v0.3 as proposed** in the META AI HACKATHON 2026 — Engineering Lab conversation. Proposed decisions D-01–D-10 are accepted **with their stated priority and gate conditions**. Sovi remains a provisional name/design; P1 features require their feasibility gates. This does not approve an unsafe code-execution runtime, certify existing repository behavior, or clear contest eligibility/provenance questions.

## 0. Executive approval summary

**Product promise:** **Understand the code, not just the answer.**
**Proposed experience message:** **Think it. Explain it. Test it. Own it.**

SYNVORA Code Mentor is an AI-assisted *programming-comprehension experience*, not a generic chatbot, unrestricted coding playground, learning management system, or autonomous competence certifier. A learner follows a complete **Challenge → Predict → Run → Investigate → Modify → Validate → Reflect → Report** journey. The system records what they predicted and submitted, shows reproducible technical results, offers Meta-powered contextual tutoring, and returns a clearly bounded achievement and evidence report.

Version 0.3 adds **three experience proposals** to v0.2:

1. **Evidence-backed achievement:** a challenge-completion state, positive recognition and an honest, learner-facing achievement summary, without claiming unverified mastery.
2. **Accessible multimodal interaction:** optional spoken input via **Meta Muse Voice Transcribe**, subject to a gated capability and privacy test; optional speech output via **browser/OS speech synthesis**, not a Meta TTS model.
3. **Expressive learning companion:** an original mascot, provisionally **Sovi**, reacting to *verified app events* with a small number of gentle, accessible visual expressions. **Muse Image** may assist with asset *creation*, subject to rights and consistency review; it is not required to render every expression at runtime. **SAM 3.1** has no justified role in the MVP.

**Non-negotiable:** None of the new interaction features may weaken deterministic validation, learner privacy, model-output controls, failure recovery, eligibility provenance, or the ability to submit a demonstrably working product on time.

### Approved decisions and retained conditions

| ID | Proposed decision | Recommended disposition |
|---|---|---|
| D-01 | Retain one fully working, bounded JavaScript learning challenge and existing evaluator until Gate E validates any replacement | **Approve / P0** |
| D-02 | Keep Meta Muse Spark tutor behind a server-only provider boundary and preserve verified-results/AI-inference separation | **Approve / P0** |
| D-03 | On successful completion, show a **Challenge Completed** state and trustworthy learner achievement/evidence report | **Approve / P0** |
| D-04 | Add a small **Sovi** mascot state machine; final name, artwork and brand colors are provisional | **Approve concept / P1 gated** |
| D-05 | Add short **push-to-talk transcription** via Muse Voice Transcribe; require transcript review before submission | **Approve experiment / P1 gated** |
| D-06 | Add optional **Listen / Pause / Stop** using the browser's speech-synthesis capability | **Approve experiment / P1 gated** |
| D-07 | Permit Muse Image for generating candidate, rights-cleared mascot assets; no runtime image generation necessary | **Approve optional design task / P1** |
| D-08 | Exclude SAM, automatic SOLO grading, completion certificates, full achievement progression, streaming voice conversations and unrestricted code execution | **Approve exclusions** |
| D-09 | Continue **Muse Code** as the primary coding agent with bounded tasks and human acceptance; Codex only documented fallback | **Approve process** |
| D-10 | Release gate: if any P1 threatens the live P0 journey, automatically defer P1 without altering P0 acceptance | **Approve rule** |

## 1. Sources, authority and traceability

**Approved hackathon application:** “SYNVORA Code Mentor,” a guided learning experience examining short programs, predicting behavior, investigating results, receiving contextual model explanations/hints, attempting corrections, deterministic code validation, and a concise learning-feedback report. **Only one complete challenge is committed.** Existing SYNVORA capstone work is explicitly described as *prior experience*, not new hackathon work.

**Participant guide:** Build for Your World; use Meta models; public repository; a **three-minute demo** highlighting **features actually built during the hackathon**; judging rubric: impact 30%, Meta AI tooling 25%, technical execution 20%, demo 25%; disqualification risk for unclear prior/new work and generic “AI for Education” chatbots. **New-work rules are an external constraint; prior code may be reused only as permitted by official terms, with provenance clearly documented.**

**PRD v0.2 (25 October):** Defines evidence-based learning, bounded hint ladder (`concept`, `clue`, `next_step`), attempt-scoped authorization, provider failures, shared Zod contracts, append-only mentor audit events, deterministic report integrity, bounded code execution, feasibility Gate E, and a test-first engineering workflow. **This version preserves those controls unless a numbered v0.3 change says otherwise.**

**Official Meta documentation (checked 27 October):**
- Models: https://dev.meta.ai/docs/models
- Quickstart: https://dev.meta.ai/docs/quickstart
- Speech-to-text: https://dev.meta.ai/docs/speech-to-text
- Transcribe recording reference: https://dev.meta.ai/docs/api-reference/voice/transcribe
- Muse Code: https://dev.meta.ai/docs/muse-code

**Important factual boundaries:** Model capability and account access are different. At planning time `muse-spark-1.3`, `muse-voice-transcribe-1.0`, and `muse-image-1.0` are documented, but **working credentials, credit balance, authorization, per-account quotas, supported language/accent quality, actual response times and hosting must be verified through scoped tests**. Muse Voice Transcribe is *speech-to-text only*. Muse Spark 1.3's audio understanding has documented limitations; we will use the dedicated transcription model for speech. Exact SDK payloads must be tested, not guessed.

## 2. Problem, audience and intended outcome

### 2.1 Problem

Beginner programmers often obtain code that runs but struggle to predict behavior, diagnose unexpected outcomes, explain why a change matters, or know what they actually demonstrated. A plain AI chat answer risks bypassing these learning steps. Text-only interfaces may add friction for learners who prefer to speak their reasoning.

### 2.2 Target personas

- **Primary — beginner JavaScript learner:** “Help me understand why the program behaved differently from my prediction; let me explain my thinking in my preferred mode.”
- **Secondary — educator/mentor:** “Show the learner's submitted reasoning, validated technical behavior, AI assistance and what remains unassessed.”
- **Tertiary — hackathon judge:** “Let me experience the real differentiated learning loop in less than three minutes and see exactly what was built during the event.”

### 2.3 Final learner outcome: what they gain

The **primary immediate outcome** is a **Challenge Achievement Summary** produced after defined completion conditions. It includes:

1. Clear, encouraging **challenge-completion recognition**.
2. **Verified performance evidence**: challenge/version, prediction and observed behavior, correction attempts, check totals and pass/fail status.
3. **Evidence of reasoning**: learner explanation and reflection, faithfully recorded; any AI commentary explicitly labeled *unverified qualitative feedback*.
4. **Assistance provenance**: model hint levels/counts, if used; using hints does not automatically disqualify completion.
5. **Next learning step** tied to challenge objectives and observed evidence, not an unsupported conclusion about the learner's intelligence or full mastery.

**A successful code test is not the same event as challenge completion.** “Code checks passed” is emitted by the deterministic validation service. “Challenge completed” is emitted only when the defined learner journey and applicable steps have been completed. “Concept demonstrated” and “mastery certified” are **not** emitted without a separately approved assessment framework.

### 2.4 Outcomes not claimed by the MVP

Improved learning gains, automatic SOLO-level classification, ability to assess all kinds of JavaScript, job readiness, psychometric traits, earned professional certification, objective explanation scoring or guaranteed accessibility for every speech/language impairment. Such claims would require further evaluation.

## 3. Scope and priority policy

**P0 (must ship):** Baseline challenge and valid stage progression; authoritative deterministic run/checks; one real, authorized Meta Muse Spark tutoring interaction using server-derived context; three-tier bounded hint policy; attempt-scoped persistence and traceability; reflection; honest learner report **plus visible Challenge Completed recognition**; safe error states; README, test evidence, public code, live URL and three-minute video.

**P1 (feasibility-gated; only after stable P0):** Sovi expressive reactions with accessible control; optional push-to-talk transcription; optional browser text-to-speech; attractive achievement styling or export; a second challenge only if it adds more value than stabilizing the first.

**P2 (explicitly after hackathon):** Competency badge ladders, streaks, XP, certificates, dashboards, portfolios, classrooms, longitudinal learner progression, real-time bidirectional audio conversations, multilingual tutoring promises, a sophisticated avatar animation rig, individual accommodation profiling, autonomous scoring or unrestricted code execution.

**Hard fallback:** If Meta voice fails or exceeds time/cost budgets, keep typed explanations and text-only hints. If artwork work stalls, render an accessible static icon/SVG. If browser TTS is unsupported, preserve all guidance in text. If the mentor model fails, preserve the non-AI learning journey and accurately report tutor unavailability.

## 4. End-to-end learner experience and business rules

**Flow:** Open challenge → **Predict** (type or approved spoken transcript) → **Run** and view observed behavior → **Investigate** with optional graduated Meta hints → **Modify** allowed expression/code → **Validate** against authoritative tests → **Reflect** (type or approved spoken transcript) → **Report + Achievement**.

**Stage rules:**
- Prediction is captured before revealing the result. Failed/incomplete predictions are not silently rewritten.
- “Run” must show genuine bounded evaluator output, not LLM-simulated execution.
- Hints are available at the authorized investigation stage; the server obtains challenge context, evidence and hint history, not client-fabricated answers or hidden test fixtures.
- Technical checks are objective and versioned; the model cannot change passed/failed fields.
- A successful validation may trigger a small **“Checks passed”** acknowledgment, but **Challenge Completed** requires completing the specified journey (including reflection if required by the baseline state machine).
- Incorrect predictions and unsuccessful modifications are treated as opportunities for investigation, not punishment. No “failure” emotion directed at the learner.
- The learner can choose **text only** throughout. Microphone, audio playback and animations default **off**, except the mascot may show unobtrusive static expressions unless hidden.
- The learner controls when an AI hint is requested, when a recording starts/stops, whether to accept a transcript, and when to play spoken feedback.

## 5. Functional requirements and acceptance criteria

| ID | Priority | Requirement | Required acceptance behavior |
|---|---|---|---|
| FR-01 | P0 | Curated challenge and clear learning objective | One representative challenge loads; its origin/version is traceable |
| FR-02 | P0 | Prediction captured before run | Submitted prediction is saved and cannot be replaced without an explicit new revision |
| FR-03 | P0 | Reproducible observed result | Authoritative evaluator returns reproducible output; no Meta call involved |
| FR-04 | P0 | AI Mentor using Muse Spark | Authorized live request produces contextual guidance bound to this attempt |
| FR-05 | P0 | Three-level hint ladder | `concept`, `clue`, `next_step` follow server-side policy and do not intentionally supply the entire solution |
| FR-06 | P0 | Safe model failure | Timeouts, quota, malformed output and provider errors do not corrupt stage or test data |
| FR-07 | P0 | Modify and validate | Only approved bounded code/expression changes; verified tests decide pass/fail |
| FR-08 | P0 | Reflection and report | Evidence, model assistance and explicitly unassessed fields are correctly labeled |
| **FR-09** | **P0** | **Challenge achievement outcome** | Completed state based on audited, explicit completion predicate; unsuccessful or incomplete attempts not mislabeled |
| **FR-10** | **P1** | **Mascot visual states** | Sovi responds only to approved UI/domain events; learner can hide or disable motion; no false grading |
| **FR-11** | **P1** | **Speech input** | Push-to-talk → authorized Meta transcription → editable transcript → user confirmation → normal typed field submission |
| **FR-12** | **P1** | **Speech output** | Text hint can be spoken by supported browser/OS TTS; playback is opt-in, controllable and does not block reading |
| **FR-13** | **P1** | **Achievement presentation/export** | Beautiful but truthful summary; any export labels outcomes/limitations and contains no arbitrary self-awarded credentials |
| FR-14 | P0 | Security and privacy | Scoped attempt auth, no leaked keys, minimal retention, no cross-attempt evidence access |
| FR-15 | P0 | New-work provenance | Baseline SHA and hackathon-created changes documented in public repository and demo |
| FR-16 | P0 | Accessible usable app | Keyboard, readable statuses, mobile minimum widths and a complete no-voice, reduced-motion pathway |

### 5.1 US-A — learner achievement and recognition

**As a learner**, after finishing the assigned journey I see a meaningful record of what I accomplished and what to try next.

**Acceptance tests:**
- Given passed tests but reflection incomplete, show **“Code checks passed”**, *not* “Challenge Completed” unless the baseline defines reflection as optional and Gate B explicitly confirms this.
- Given all completion conditions satisfied, show **“Challenge Completed”** and a positive animation if motion is enabled.
- Given checks failing, the learner sees the actual failures and a constructive next step; no false completion badge.
- Challenge report identifies exactly what was tested and what was not assessed.
- A learner using hints may complete the challenge; the report identifies assistance used, rather than penalizing it by default.
- The report is reconstructible from authoritative stored events; changing cosmetic UI state cannot grant achievement.

**Proposed achievement record (internal design, not committed DB schema):**

```ts
type ChallengeAchievement = {
  attemptId: string;
  challengeId: string;
  challengeVersion: string;
  status: 'in_progress' | 'checks_passed' | 'completed';
  completedAt?: string; // server timestamp, only for completed
  validation: { passed: number; total: number; source: 'deterministic' };
  explanationReview: 'not_assessed' | 'pending_human_review';
  aiAssistance: { used: boolean; hintCount: number };
  nextStep: string; // sourced from approved mapping or clearly labeled AI suggestion
};
```

**Explicit exclusions:** no credential/certificate-of-mastery issuance; no numerical comprehension score derived from a model; no peer rankings, speed leaderboards or pressured streak mechanics.

### 5.2 US-B — optional speech input (Meta Muse Voice Transcribe)

**As a learner**, I can record a short prediction, explanation or reflection rather than type it, then review and correct the transcript before submission.

**UX states:** `idle → permission_request → recording → uploading → transcribing → review → accepted/submitted`; plus `permission_denied`, `microphone_unavailable`, `too_long`, `network_error`, `transcription_failed`, `cancelled`.

**Controls:** Tap **Record**, **Stop**, **Discard**, **Edit transcript**, **Use this text**. Microphone use requires explicit user action and browser permission. A visible recording indicator remains present during capture. Silence, transcription uncertainty and inaccurate code tokens prompt the learner to edit; no automatic submission to the grading/evaluation stage.

**Implementation candidate (verify at speech Gate V):** Client `MediaRecorder`/microphone acquisition → *authenticated app backend* → Meta speech-to-text `POST /v1/asr/transcribe` with `muse-voice-transcribe-1.0` → bounded transcript → client review → existing prediction/explanation/reflection submission path. Use a short file transcription before attempting realtime WebSockets. Meta currently documents WAV support for the file endpoint; verify recording format conversion/compatibility before selecting the browser capture approach. No Meta key in the browser.

**Initial application caps (proposed, adjustable after measurement):** 60 seconds or 10 MB per recording, whichever occurs first; one recording in flight per attempt; max transcript 1,500 characters (and existing field limits still apply); reject oversized content before provider call. Use a documented audio-format conversion strategy or reject unsupported formats with a useful fallback—never assume the server accepts a browser-generated container directly. The Meta endpoint's published upper bounds are not SYNVORA's recommended bounds.

**Acceptance tests:** permission granted/denied; recording cancelled; silence; 60-second/10-MB limit; invalid MIME/type; file conversion failure; provider 429/5xx; transcription timeout; transcript manually corrected before saving; expected programming tokens/loop variable names checked; no raw audio persisted by default; cross-attempt access rejected; typed fallback remains complete.

**Privacy:** The provider processes audio transiently after explicit consent. No background recording. No raw microphone clips in analytics, app logs or PostgreSQL by default. Transcript retention follows current attempt retention rules. Data disclosures must mention the Meta transcription provider and any necessary transient processing; production privacy claims require confirmation of the actual provider terms. If voice cannot meet privacy expectations, disable it without breaking P0.

### 5.3 US-C — optional audio output (browser speech synthesis)

**As a learner**, I can listen to an on-screen hint, explanation or next-step instruction.

**Requirements:**
- Text is always visible and is the source of truth; auditory output is optional and not exclusive.
- “Listen” is user-initiated. Provide Pause/Resume or Stop, replay where supported, and avoid automatic playback on page load.
- Stop old speech when switching challenge, removing hint, or requesting a replacement; prevent overlapping speech.
- The implementation uses the browser/OS speech synthesis interface where available. **It must not be described as Meta voice generation.**
- Missing synthesis capability or missing language voice results in a disabled play control with accessible explanation, not application failure.
- Do not require text-to-speech for objective grading, progression or reward events.

**Acceptance:** tested in target browsers; readable captions/text; keyboard-accessible controls; sensible behavior on navigation, repeated taps, app backgrounding and synthesis errors. Voice quality/accent depends on the browser/OS, not SYNVORA's own model.

### 5.4 US-D — expressive Sovi learning companion

**As a learner**, I see a small friendly character react to verified learning events without judging or distracting me.

**Working name:** **Sovi** (provisional; product owner approval of name/brand pending).

**Visual direction:** original, cute, slightly funny, small silhouette, expressive eyes; optionally inspired by code brackets, without using Meta-owned characters, trademarks, mascot likenesses or confusing Muse-brand branding. Brand work must respect rights and asset-generation license terms. Creation using Muse Image may be documented as Meta tooling, but cannot be counted as a runtime model interaction.

**Event-to-expression mapping (deterministic UI state machine):**

| Trusted event | Expression | Optional motion | Semantics |
|---|---|---|---|
| `challenge_opened` | Welcoming/neutral | Small wave | Ready to begin |
| `prediction_submitted` | Attentive | None | Acknowledges submission, **not correctness** |
| `prediction_matches_observed` | Happy smile | Gentle bounce | Objective prediction match |
| `prediction_differs_observed` | Curious/head tilt | Subtle tilt | Encourages investigation, **not disappointment** |
| `hint_requested` | Thinking | Short blink | Waiting for tutoring result |
| `hint_available` | Helpful/bright | Gentle glow | Guidance ready, not certified correct |
| `validation_failed` | Curious/thoughtful | None | Suggest retry; no sad/shaming reaction |
| `validation_passed` | Smile | Gentle bounce | Technical checks verified |
| `challenge_completed` | Proud/celebratory | Confetti optional | Completion predicate met |
| `provider_unavailable` | Neutral/supportive | None | Do not imply model output was produced |

**Critical safety rule:** Sovi **never independently estimates a learner's mood, intent, intelligence or mastery**. A submitted explanation receives a warm acknowledgment; Sovi cannot smile to imply it is *correct* unless an approved independent explanation-review process exists. The mapping is driven by application events, not unconstrained LLM text or microphone-inferred emotion.

**Accessibility:** Hide companion, reduce/disable motion, respect `prefers-reduced-motion`, avoid fast flashing and nonessential autoplay, use decorative `aria-hidden` when the same state is already conveyed in visible status text, never convey essential information through facial expression alone. Avoid persistent screen obstruction at 320 px.

**Asset rules:** 1 neutral base design plus 4–6 expression variants maximum; review consistency at small sizes, transparent backgrounds, license and provenance. Prefer SVG/CSS/optimized static assets at runtime; optimize bundle and animation budgets. No SAM 3.1 integration unless a specific user benefit is independently justified and approved.

### 5.5 US-E — differentiated adaptive tutoring

**As a learner**, I receive a next hint relevant to *my actual prediction and verified results*, not a generic “here is the solution.”

- Backend assembles authoritative challenge objective, code snapshot, predicted result, observed result, learner's stated reasoning (if supplied), previous hints and requested level.
- `concept` supplies a conceptual framing; `clue` points to the evidence; `next_step` suggests an investigative action without handing over full corrected source.
- For **two meaningfully different predictions on the same challenge**, test that guidance appropriately reflects each stated misconception; judge-facing demo must show actual real-provider behavior if claimed.
- AI output has length/structure checks and best-effort leakage tests. Do not claim any prompt or checker perfectly guarantees mathematical or pedagogical correctness.
- Model outputs are labeled “AI guidance” and cannot assign authoritative test results, SOLO levels or completion flags.

## 6. Architecture and bounded dependencies

**Existing stack stays:** React + Vite + TypeScript + Tailwind CSS; Node.js + Express + TypeScript; PostgreSQL; shared Zod contracts; pnpm; Docker and GitHub Actions where currently configured; Vitest, Supertest and Playwright by established conventions. Do not invent existing routes or tables—confirm names against repository audit.

**Logical boundaries:**

```text
Browser (React)
  |-- Curated Challenge UI / code display / accessible controls
  |-- Prediction / Reflection text fields
  |-- Optional mic capture -> transcript review (never auto-submit)
  |-- Optional browser speech synthesis for visible hint text
  |-- Sovi event-driven expressions (deterministic, no model call)
  |
Backend (Express + Zod + scoped attempt authorization)
  |-- Challenge and attempt state machine
  |-- Bounded evaluator / trusted tests (authoritative)
  |-- Mentor provider -> Meta Model API -> Muse Spark
  |-- Optional transcription adapter -> Meta ASR / Muse Voice Transcribe
  |-- Completion policy and deterministic achievement projection
  |-- Evidence/event store -> PostgreSQL
  |-- Report composer (evidence vs AI interpretation separated)
```

**Architecture invariants:**
1. No API key in browser requests, built assets or repository.
2. No untrusted arbitrary code in the Express application process; preserve bounded baseline evaluator unless Gate E approves secured isolation.
3. Hidden tests and answer keys never leave trusted validation infrastructure and are not included in model prompts.
4. AI text and voice transcripts are untrusted input; authorization, schema validation, sanitization and output rendering rules apply.
5. All objective scores, checks and completion decisions are deterministic and traceable to server-owned events.
6. Audio is optional and does not change what validation considers correct.
7. UI mascot behavior cannot create authoritative evidence; it only renders existing domain state.

### 6.1 Model and tooling allocation

| Technology | Role | Priority and verification |
|---|---|---|
| `muse-spark-1.3` | Contextual tutoring, hints, follow-up questions | P0 — actual live request and evaluation fixture |
| `muse-voice-transcribe-1.0` | Speech-to-text of learner input | P1 — backend auth, API smoke, format/latency/privacy gates |
| Browser `SpeechSynthesis` | Voice playback of textual feedback | P1 — not Meta model, browser/device gated |
| `muse-image-1.0` | Optional design-time original mascot concept/art refinement | P1 — provenance and asset rights checked |
| SAM 3.1 | No current use | Out of scope |
| Muse Code | **Primary coding agent used by developer**, bounded tasks | Engineering tool, not a runtime substitute for Meta model |

### 6.2 Proposed API extensions — *NOT VERIFIED AGAINST REPOSITORY*

Existing v0.2 candidates remain, subject to repo audit:
- `POST /api/attempts/:attemptId/mentor/hints` — validated per-attempt Meta guidance.
- `GET /api/attempts/:attemptId/mentor/hints` — authorized hint history.

New v0.3 candidates (exact paths to be harmonized with actual Express routing):

**`POST /api/attempts/:attemptId/mentor/transcribe`** — multipart audio with bounded `purpose: prediction | explanation | reflection`; requires attempt auth, stage permission and per-attempt quota; returns `{ transcript, model, durationMs?, expiresAt? }` or stable error envelope. *Do not persist raw audio.* The client must explicitly accept/edit transcript before a regular text-field submission. Use a multipart parser with strict body/cap limits and no durable file backing unless security review approves it.

**`GET /api/attempts/:attemptId/achievement`** — optional projection endpoint only if existing report cannot serve this data. Returns `{ status, validation, assistance, nextStep, challengeVersion }` from authoritative saved evidence. Must not accept completion flags from clients.

**`GET /api/attempts/:attemptId/report`** — prefer existing report endpoint and extend it conservatively with labeled achievement fields; keep legacy response backward compatible where feasible.

**No public endpoint for mascot expressions or browser speech playback is needed**; both are client-side UI projections.

**Common errors:** `400` invalid input; `401/404` unauthorized/missing by established anti-enumeration policy; `409` wrong stage; `413` media too large; `415` unsupported media; `422` invalid/policy-rejected model output; `429` request limit; `502/503` model/provider failures; `504` timeout. Final mapping follows baseline conventions.

### 6.3 Data model / evidence requirements

Prefer preserving existing append-only attempt and mentor events. Proposed *minimal* additions only if baseline cannot already reconstruct them:

- `challenge_completed` domain event (server-authored, idempotent) with completion-policy version, timestamp, challenge version and validation evidence reference.
- Optional `input_modality` (`typed | transcribed`) metadata for submitted prediction/explanation/reflection; do **not** infer quality, fluency or confidence from modality.
- Optional per-request ASR *metadata only*: provider/model, request ID, failure category, latency, clip duration, consent timestamp; raw audio not retained by default.
- No new column for Sovi's facial expression; calculate from trusted events.
- Existing mentor interaction records continue to distinguish model text, prompt version, hint level and usage; do not store secrets or unrelated profile data.

**Retention:** Keep existing attempt retention policy unless a new ADR explicitly revises it. Document deletion behavior for audio buffers and transcripts. Do not claim immediate deletion by upstream vendor without reviewing actual provider terms.

## 7. Non-functional and security requirements

| Dimension | Target / policy | Evidence |
|---|---|---|
| Accuracy / assessment | Deterministic technical validation only; no LLM grading authority | Regression and tampering tests |
| AI reliability | Graceful timeout/quota/malformed-response fallback | Mock/fault-injection tests |
| Tutor responsiveness | v0.2 aspirational healthy-provider p95 under 8 s; calibrate from actual calls | Sampled timing log |
| Transcription | Short 60-s maximum; upload, conversion and timeout bound | Real-device test and API evidence |
| Accessibility | Keyboard, status text, focus order, reduced motion, optional audio | Manual + automated checks |
| Browsers | Desktop Chromium + at least one practical mobile browser; test supported speech features individually | Smoke notes / screenshots |
| Security | Server-only API keys; attempt auth; capped uploads, outputs, quotas | Negative API tests and secret scan |
| Privacy | Opt-in microphone, visible capture state, transcript confirmation, no raw audio DB by default | Privacy checklist and data-flow review |
| Cost | Call budget and Meta API spend limit; P1 voice only after credits/access confirmed | Dashboard check and cost log |
| Provenance | Immutable baseline SHA, changed-file/PR audit, licensed assets | `BASELINE_AND_NEW_WORK.md` |
| Deployment | Live working demo; text-only fallback robust if voice unsupported | Fresh-session E2E |

**Age considerations:** The product is designed for beginners and may eventually serve younger learners; the hackathon MVP must avoid collecting unnecessary personal information, inferential profiling or publishing learner audio/transcripts. Any launch aimed specifically at children requires a separate age/consent/privacy compliance review.

## 8. Verification and test matrix

### Preserve all v0.2 test obligations

AT-01 through AT-14 remain applicable: authorized hint; invalid/foreign token; invalid hint level/oversized question; wrong stage; timeout/quota; response leakage/unsafe markup; validation invariant; report provenance; request idempotency; responsive keyboard use; live Meta smoke; cross-attempt isolation.

### New v0.3 acceptance tests

| ID | Priority | Scenario | Expected result |
|---|---|---|---|
| AT-15 | P0 | Code passes, reflection pending | “Checks passed”; no premature achievement |
| AT-16 | P0 | Completion predicate fulfilled | Server-derived “Challenge Completed”; persisted/projection consistent on reload |
| AT-17 | P0 | Model gives optimistic compliment after failed tests | Objective results and badge unchanged |
| AT-18 | P0 | Attempts with/without AI hints | Both can complete; assistance accurately attributed |
| AT-19 | P1 | Correct prediction / incorrect prediction | Sovi correct verified smile / curious response |
| AT-20 | P1 | Unevaluated explanation submitted | No fabricated “correct explanation” expression |
| AT-21 | P1 | Disable animations / screen-reader / hide mascot | No critical information lost; no motion when reduced |
| AT-22 | P1 | Microphone permission denied | Accessible error; manual typing remains usable |
| AT-23 | P1 | Speech is recorded and transcribed | Reviewable editable transcript; **no auto-submission** |
| AT-24 | P1 | Transcript mishears a JS keyword | Learner corrects before submission; no incorrect hidden conversion |
| AT-25 | P1 | ASR file format invalid / too large / timeout / no credits | Stable errors, privacy-safe logs, typed fallback |
| AT-26 | P1 | Cross-attempt upload or malicious media metadata | Rejected safely; no provider call when unauthorized |
| AT-27 | P1 | TTS available / unavailable / rapid repeated taps | Text stays usable; playback controlled; no overlap |
| AT-28 | P1 | Sovi asset offline/404 | Static default/alt UI without blocking challenge |
| AT-29 | P0 | Full flow on 320px and fresh desktop session | No clipped core actions; core progression succeeds |
| AT-30 | P0 | Three-minute judge demo | Shows *actual* Meta reasoning, deterministic check, achievement and clearly labeled new work |
| AT-31 | P0 | Prior-work traceability audit | Git baseline, new work and rights documented in submission |
| AT-32 | P1 | Two different misconceptions | Distinct, relevant real Meta guidance captured; no false evidence claim |

**Test categories:** pure completion projection/unit tests; Zod contract tests; Supertest auth and error tests; media validation tests; React Testing Library and accessibility checks; Playwright text-only E2E; optional P1 voice/manual testing; provider-smoke results with private secrets redacted. For provider-dependent quality tests, record actual prompts/outputs with synthetic sample inputs and human review; do not make deterministic CI depend on model nondeterminism.

## 9. UX and demo specification

### 9.1 Screen structure

- **Challenge pane:** curated snippet, stated objective and learner prompt.
- **Predict/Explain pane:** typed field with optional microphone action (if P1 passed); transcript confirmation stays in the same field.
- **Observed result / investigation pane:** test-backed output, discrepancy and structured Meta hints.
- **Sovi companion zone (optional):** small nonblocking display; expression matches app event, not speculative user sentiment.
- **Modify / validate:** constrained editor and independent check results.
- **Achievement / report:** completion recognition, verified facts, learner words, hints disclosed, unassessed fields, next step.

### 9.2 Suggested demo narrative (three minutes maximum)

| Approx. sequence | What is shown | Reason it matters |
|---|---|---|
| 0:00–0:20 | Problem and curated challenge | Real educator-identified need |
| 0:20–0:45 | Learner predicts (voice **only if genuinely deployed**) | Optional accessibility difference |
| 0:45–1:05 | Run reveals objective discrepancy; Sovi curious **if shipped** | Verified evidence and humane UX |
| 1:05–1:40 | Muse Spark hint based on learner's prediction | Real Meta integration, not chatbot wrapper |
| 1:40–2:15 | Learner modifies and validates; Sovi reacts **if shipped** | Test result independent of model |
| 2:15–2:40 | Reflection, challenge-completion summary | Reward plus observable learning evidence |
| 2:40–3:00 | Technical originality: baseline vs new contributions | Eligibility + sound engineering |

**Never simulate a live Meta model call in the submitted demo or imply P1 features are shipping if the live build does not support them.** The video must highlight the work completed during the competition.

## 10. Engineering tasks, ownership and review gates

**Roles:** Product owner decides scope and acceptance; ChatGPT helps with PRD/ADRs/tasks/evaluation planning; **Muse Code** is the preferred implementation agent; repository/CI/automated tests and human PR review are authoritative. Each agent task must have explicit permitted files, prohibited changes, expected tests, diff summary and acceptance evidence.

### Ordered backlog (proposed)

| ID | Priority | Task | Gate / evidence |
|---|---|---|---|
| CM-00 | P0 | Confirm event terms, accepted proposal and account/model access | Gate A; rules and quota note |
| CM-01 | P0 | Audit inherited SYNVORA repo; freeze SHA; differentiate new work | Baseline manifest |
| CM-02 | P0 | Review challenge stages, completion predicate and evaluator security (Gate E) | Architecture/ADR approval |
| CM-03 | P0 | Shared mentor schema and Meta provider adapter with mock | Contract/adapter tests |
| CM-04 | P0 | Hint policy, authorized endpoint, real Muse Spark smoke | Negative tests + redacted live response |
| CM-05 | P0 | Full challenge / validation / reflection / report | End-to-end and regression |
| **CM-06** | **P0** | **Completion projection and Challenge Achievement Summary** | **AT-15..18 passing** |
| **CM-07** | **P1** | **Sovi expression asset/style spike and event mapping** | Brand review + AT-19..21 |
| **CM-08** | **P1** | **Speech input feasibility (Meta ASR credentials, format, consent, latency)** | **Gate V GO/NO-GO** |
| **CM-09** | **P1** | **Short recording/upload/transcript-review path** | AT-22..26; only after Gate V |
| **CM-10** | **P1** | **Browser speech playback controls** | AT-27; only after browser support check |
| CM-11 | P0 | Accessibility/privacy/abuse/security/regression pass | Gate C; defect log |
| CM-12 | P0 | Deploy, fresh-browser test, evidence, 3-min recording and submit | Gate D release checklist |

### Gate definitions

- **Gate A — eligibility/account/provenance:** accepted participant and proposal, official terms, API/credits access, source-license review, pre-hackathon SHA.
- **Gate E — architecture/execution:** reviewed stage machine and evaluator isolation; JavaScript/Python execution decisions; source of truth for check outcomes and completion.
- **Gate B — core integration:** approved contracts, hint schema, Meta provider selection, persistence and privacy handling.
- **Gate V — optional voice:** real `muse-voice-transcribe-1.0` response from an authorized account; supported media conversion; measured latency; transcript quality with JavaScript vocabulary; explicit consent/retention; denial and cost fallback. **NO-GO means typed-only product, not release failure.**
- **Gate M — optional mascot:** visual brand owner approval, owned/licensed assets, small-browser performance and reduced-motion tests.
- **Gate C — test/security:** no objective-scoring regression, no key leakage, full user journey in text-only mode, P1 graceful fallback.
- **Gate D — release/submission:** demo build accessible; repo public; video and rights/new-work proof; deadline margin.

### Dates (Africa/Lagos)

| Date | Focus | Deliverable |
|---|---|---|
| **Tue 27 Oct** | Approve PRD v0.3, repo/architecture audit, Gate E, real Muse Spark access | Frozen P0 scope and reviewed ADRs |
| **Wed 28 Oct** | Mentor adapter and schemas; optional short ASR feasibility spike | Mock + first live result; Gate V decision |
| **Thu 29 Oct** | Real hint policy + learner stage integration | Contextual tutor + tests |
| **Fri 30 Oct** | Complete modify, validate, reflect, report, challenge completion | Full P0 thin vertical slice |
| **Sat 31 Oct** | P0 tests/CI/failure handling; Sovi only if green | Stable text-only regression |
| **Sun 1 Nov** | Optional speech input/playback implementation if Gate V green | Tested P1 or explicit NO-GO |
| **Mon 2 Nov** | Deploy and independent browser/privacy/accessibility smoke | Live judge-ready product |
| **Tue 3 Nov** | Feature freeze and video recording | Final repo/README/demo |
| **Wed 4 Nov** | Final verification and submission (internal 18:00 WAT) | Submission confirmation |

**Change-control:** Any post-approval feature affecting critical path requires a written, explicit product-owner change decision. P1 work is dropped before reducing P0 testing or demo reliability.

## 11. Risk register

| Risk | Severity | Control / owner action |
|---|---|---|
| Voice API credentials/credits unavailable | High for P1, low for P0 | Gate V early; typed input guaranteed |
| Browser recording incompatible with WAV endpoint | Medium | Measured conversion spike before production API work |
| Voice wrongly transcribes code syntax | High UX impact | Editable transcript and user confirmation |
| Speech audio/privacy leak | High | Explicit permission; short limits; transient data; no raw storage; vendor review |
| Avatar consumes time or conveys false praise | Medium | Deterministic event mapping; compact assets; cut P1 promptly |
| Animation distracts or harms accessibility | Medium | Reduced motion, hide control, never essential semantics |
| “Achievement” incorrectly implies mastery | High reputational | Explicit objective conditions and labels; no certificates |
| AI hint reveals answer or invents facts | High | Structured hints, best-effort filters, fixtures, graceful fallback |
| Existing runner is mistaken for secure JS sandbox | High | Keep bounded evaluator; Gate E for alternatives |
| Event new-work rules breached by inherited SYNVORA features | Critical | Baseline SHA/diff/README/three-minute demo attribution |
| Demo overrun or missed cutoff | High | P0-first; freeze 3 Nov; 4 Nov 18:00 WAT internal cutoff |

## 12. Definition of Done and release acceptance

A feature is **Done** only if its approved acceptance conditions pass, tests are reproducible, UI error states are present, accessibility has been checked, and the author supplies code diff, commands/output, known limitations and provenance.

**Hackathon MVP acceptance checklist:**

- [ ] A first-time learner completes one defined challenge in a clean browser session.
- [ ] Prediction is captured before verified output is revealed.
- [ ] Meta Muse Spark supplies an actual contextual hint bound to this learner's evidence.
- [ ] Model text cannot mutate validation outcomes, completion state or report facts.
- [ ] Modify → Validate → Reflect → Report is demonstrably real.
- [ ] “Checks passed” and “Challenge Completed” are appropriately distinguished.
- [ ] Learner sees positive recognition, verified evidence, model-use disclosure and next step.
- [ ] Full journey works with **no microphone, no TTS and no animated mascot**.
- [ ] P1 additions (if present) pass their gates and degrade gracefully.
- [ ] Public repo, clean README, rights/provenance statement, accessible deployment and three-minute demo exist.
- [ ] Official submission confirmed before cutoff.

## 13. Change log: v0.2 → v0.3

| Topic | v0.2 position | v0.3 proposed change |
|---|---|---|
| Primary educational outcome | Evidence report / next step | Adds visible Challenge Completed recognition and achievement summary without mastery claim |
| Gamification | Excluded | **Only** small evidence-based achievement acknowledgment enters P0; broad gamification remains out |
| Voice | Excluded | Push-to-talk Meta transcription and browser TTS added as **P1 feasibility-gated** |
| Mascot/avatar | Not in scope | Event-driven expressive original companion added as **P1** |
| Meta models | Muse Spark tutor | Muse Spark remains P0; Muse Voice Transcribe optional P1; Muse Image design-time only |
| SAM 3.1 | Not integrated | Explicitly excluded: no demonstrated user need |
| AI evaluation | Not allowed to determine correctness | Unchanged; explicitly prevents mascot/voice/achievement from fabricating validation |
| Execution | Gate E and baseline constrained evaluator | Unchanged; no free-form code execution without approval |
| Engineering agent | Original v0.2 mentioned Codex assignments | **Muse Code primary**, Codex contingency (aligned with execution plan v0.2) |
| Deadline | Oct 27–Nov 4 | Unchanged; P1 automatic defer if schedule risks P0 |

## 14. Formal approval record (to be completed by product owner)

**PRD version:** 0.3
**Disposition:** Approved as proposed, with all existing feasibility and release gates retained
**Product owner approval:** Explicit approval in project conversation (no handwritten signature implied)
**Approval date (WAT):** 27 October 2026 (exact clock time not captured in this record)
**Priority exceptions or required changes:** None; P0/P1/P2 assignments and Gate E/V/M remain as defined
**Gate E authority:** separate approval after actual repo/evaluator review.
**Gate V authority:** separate GO/NO-GO after actual ASR feasibility evidence.
**Gate M authority:** separate approval of final mascot name, design and licensed assets.

**Post-approval action:** A versioned approved copy is produced for the repository; committing it and linking ADRs/backlog tickets require authenticated repository access and a reviewed baseline. Optional features remain default-off until their respective gates are passed. No implementation is certified by this approval alone.


---

**Product baseline control:** This approved copy is derived from v0.3 prepared on 27 October 2026. The approval changes *document governance metadata only*; the functional scope, technical requirements, acceptance tests and priority/gate definitions are preserved. A separate approval log holds the checksum and outstanding gate status.
