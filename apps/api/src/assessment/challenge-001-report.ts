import { attemptSnapshotSchema, competenceReportSchema, competencyIds, REPORT_ASSESSMENT_VERSION,
  REPORT_RUBRIC_VERSION, REPORT_SCHEMA_VERSION, type AttemptSnapshot, type CompetenceReport,
  type CompetencyFinding, type ReportEvidenceReference, type ReportFinding, type ReportTechnicalPerformance } from "@synvora/shared";

const scopeLimit = "One guided challenge and five defined checks do not establish comprehension, independence, or mastery.";
const reasoningLimit = "Investigation and reflection are submitted evidence, not assessed understanding.";

/** Derive observations from saved public DTOs only; never evaluate learner text. */
export function buildChallenge001Report(input: AttemptSnapshot): CompetenceReport {
  const snapshot = attemptSnapshotSchema.parse(input);
  const evidence = (type: AttemptSnapshot["evidence"][number]["type"]) => snapshot.evidence.find(item => item.type === type);
  const attemptRef: ReportEvidenceReference[] = [{ kind: "attempt" }];
  const predictionRefs: ReportEvidenceReference[] = [{ kind: "prediction" }, { kind: "reference" }];
  const draft = evidence("modification_draft"), latest = snapshot.validations[0];
  const reason = !draft ? "missing_expression" : !latest ? "missing_validation" : latest.sequence !== snapshot.validationCount ? "latest_validation_missing" :
    latest.result.status !== "evaluated" ? "latest_validation_rejected" : latest.expression !== draft.content ? "expression_mismatch" : null;
  let final: ReportTechnicalPerformance;
  if (reason !== null) final = { status: "inconclusive", finalValidationId: null, reason };
  else if (latest?.result.status === "evaluated") final = { status: latest.result.allPassed ? "checks_met" : "checks_not_met", finalValidationId: latest.id };
  else throw new Error("Final validation evidence unavailable");
  const result = final.status !== "inconclusive" && latest?.result.status === "evaluated" ? latest.result : null;
  const runRefs: ReportEvidenceReference[] = latest ? [{ kind: "validation", id: latest.id }] : attemptRef;
  const technicalSummary = result ? `The final saved expression evaluated safely and passed ${result.passed} of ${result.total} defined checks.` :
    "Final-expression validation evidence is missing or inconsistent; no conclusive technical finding is available.";

  const observations: Record<CompetencyFinding["id"], CompetencyFinding["observations"]> = {
    code_comprehension: [], predictive_reasoning: [], investigation: [], debugging: [],
    modification: [], validation: [], explanation_reflection: [], ai_collaboration: []
  };
  const observe = (id: CompetencyFinding["id"], summary: string, evidenceRefs: ReportEvidenceReference[]) =>
    observations[id].push({ summary, evidenceRefs });
  if (snapshot.prediction) {
    observe("predictive_reasoning", "An immutable prediction was submitted; its reasoning has not been assessed.", [{ kind: "prediction" }]);
    if (snapshot.reference) observe("predictive_reasoning", snapshot.reference.predictionMatches ?
      "The recorded prediction matched the revealed reference under trimmed exact-text comparison." :
      "The recorded prediction differed from the revealed reference under trimmed exact-text comparison.", predictionRefs);
  }
  const investigation = evidence("investigation"), reflection = evidence("reflection"), declaration = evidence("ai_use_declaration");
  if (investigation) {
    observe("code_comprehension", "An investigation explanation was submitted; its accuracy and comprehension have not been assessed.", [{ kind: "evidence", type: "investigation" }]);
    observe("investigation", "Investigation text is recorded verbatim and remains unassessed.", [{ kind: "evidence", type: "investigation" }]);
  }
  const rejection = snapshot.validations.find(run => run.result.status === "rejected");
  if (rejection) {
    observe("debugging", "Retained history includes rejected validation feedback; this does not establish diagnostic understanding.", [{ kind: "validation", id: rejection.id }]);
    const later = snapshot.validations.find(run => run.sequence > rejection.sequence && run.result.status === "evaluated");
    if (later) observe("debugging", "A later retained execution evaluated safely after a rejection; distinct learner intentions are not established.",
      [{ kind: "validation", id: rejection.id }, { kind: "validation", id: later.id }]);
  }
  if (draft) observe("modification", "A learner expression is saved; purpose and design reasoning remain unassessed.", [{ kind: "evidence", type: "modification_draft" }]);
  observe("validation", technicalSummary, final.status === "inconclusive" ? attemptRef : runRefs);
  if (reflection) observe("explanation_reflection", "Reflection text is recorded verbatim and remains unassessed.", [{ kind: "evidence", type: "reflection" }]);
  if (declaration) observe("ai_collaboration", "An AI-use declaration was supplied by the learner; no interactions or contribution metrics were verified.", [{ kind: "evidence", type: "ai_use_declaration" }]);
  const available: Record<CompetencyFinding["id"], boolean> = {
    code_comprehension: Boolean(investigation), predictive_reasoning: Boolean(snapshot.prediction), investigation: Boolean(investigation),
    debugging: Boolean(investigation || reflection || snapshot.validations.length), modification: Boolean(draft),
    validation: Boolean(snapshot.validations.length), explanation_reflection: Boolean(reflection), ai_collaboration: Boolean(declaration)
  };
  const strengths: ReportFinding[] = [], growthAreas: ReportFinding[] = [];
  if (snapshot.prediction && snapshot.reference) {
    if (snapshot.reference.predictionMatches) strengths.push({ code: "prediction_matched", summary: "The recorded prediction matched the reference result.", evidenceRefs: predictionRefs });
    else growthAreas.push({ code: "prediction_differs", summary: "The recorded prediction differed from the reference result; tracing the supplied arguments is a useful practice step.", evidenceRefs: predictionRefs });
  }
  if (result) {
    strengths.push({ code: "safe_evaluation", summary: "The final saved expression evaluated safely on the defined test inputs.", evidenceRefs: runRefs });
    if (result.allPassed) strengths.push({ code: "checks_met", summary: "The final saved expression passed the five defined checks; this is limited technical evidence.", evidenceRefs: runRefs });
    else growthAreas.push({ code: "checks_not_met", summary: `The final saved expression failed ${result.total - result.passed} of the five defined checks.`, evidenceRefs: runRefs });
  } else growthAreas.push({ code: "evidence_inconclusive", summary: "Final-expression evidence needs review before a technical conclusion can be supported.", evidenceRefs: attemptRef });
  const reasoningRefs: ReportEvidenceReference[] = [];
  if (investigation) reasoningRefs.push({ kind: "evidence", type: "investigation" });
  if (reflection) reasoningRefs.push({ kind: "evidence", type: "reflection" });
  growthAreas.push(reasoningRefs.length ? { code: "reasoning_unassessed", summary: "Submitted investigation or reflection needs structured review; no qualitative competence judgment has been made.", evidenceRefs: reasoningRefs } :
    { code: "evidence_inconclusive", summary: "Investigation and reflection evidence is unavailable for qualitative review.", evidenceRefs: attemptRef });
  const nextStep: CompetenceReport["nextStep"] = final.status === "inconclusive" ? {
    code: "request_evidence_review", summary: "Request help reviewing the missing or inconsistent saved evidence. This completed attempt is read-only; further work requires a new attempt.", evidenceRefs: attemptRef, completedAttemptEditable: false
  } : final.status === "checks_not_met" ? {
    code: "review_arithmetic_new_attempt", summary: "Review the arithmetic and percentage-discount behavior, then try a new attempt. This completed attempt cannot be edited.", evidenceRefs: runRefs, completedAttemptEditable: false
  } : snapshot.reference?.predictionMatches === false ? {
    code: "trace_arguments", summary: "Practice substituting arguments into parameters and tracing the returned value. Use a new attempt for further submitted work; this one is read-only.", evidenceRefs: snapshot.prediction ? predictionRefs : [{ kind: "reference" }], completedAttemptEditable: false
  } : {
    code: "explain_additional_inputs", summary: "Explain the function's behavior for two additional inputs and request feedback. These explanations have not been assessed; further submitted work requires a new attempt.", evidenceRefs: reasoningRefs.length ? reasoningRefs : attemptRef, completedAttemptEditable: false
  };
  return competenceReportSchema.parse({
    schemaVersion: REPORT_SCHEMA_VERSION, assessmentVersion: REPORT_ASSESSMENT_VERSION, rubricVersion: REPORT_RUBRIC_VERSION,
    assessmentMode: "deterministic_evidence",
    overall: { summary: `${technicalSummary} Written reasoning remains unassessed; no independently verified competence rating or SOLO level is assigned.`, competenceRating: "not_assessed", scope: "single_challenge_recorded_evidence" },
    competencies: competencyIds.map(id => ({ id, qualitativeAssessment: available[id] ? "not_assessed" : "evidence_unavailable", observations: observations[id], limitations: [reasoningLimit, scopeLimit] })),
    solo: { status: "not_assessed", level: null, reason: "Not assessed; structured review pending. Passing technical checks or submitting text does not establish a SOLO level." },
    technicalPerformance: { final, recordedExecutions: snapshot.validationCount, retainedExecutions: snapshot.validations.length,
      historyTruncated: snapshot.validationCount > snapshot.validations.length, countMeaning: "recorded_executions_not_distinct_intentions",
      limitations: [scopeLimit, "Validation counts are recorded executions, not distinct learner intentions; retries may append runs.",
        "Only aggregate results and the published example are available; historical expressions are not reevaluated.",
        "At most 100 executions are retained. No separate evaluator version is recorded for historical runs."] },
    learningJourney: snapshot,
    aiCollaboration: declaration ? { status: "declared", verification: "not_verified", declaration: declaration.content, evidenceRefs: [{ kind: "evidence", type: "ai_use_declaration" }] } :
      { status: "not_declared", verification: "not_verified", declaration: null, evidenceRefs: [] },
    strengths, growthAreas, nextStep,
    limitations: [scopeLimit, reasoningLimit, "AI-use notes are learner declarations; their absence establishes neither use nor non-use.",
      "Evidence upserts and retained validation history do not establish a complete edit history or distinct retry intentions.",
      "Timestamps record server events, not active learning duration. Independence and transfer are not assessed.",
      "This computed report is not archived. Access expires with the attempt and requires its bearer secret."]
  });
}
