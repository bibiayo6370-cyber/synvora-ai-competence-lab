import { competenceReportSchema, competencyIds, REPORT_SCHEMA_VERSION, REPORT_ASSESSMENT_VERSION, REPORT_RUBRIC_VERSION,
  type AttemptSnapshot, type CompetenceReport, type ReportEvidenceReference, type ReportTechnicalPerformance } from "@synvora/shared";
import { snapshot } from "./contract-fixtures.js";

/** Synthetic public report fixtures; never imported by application presentation. */
export function completedSnapshot(): AttemptSnapshot {
  const time = "2026-10-11T08:00:00.000Z", expression = "total * (1 - discount / 100)";
  return snapshot({ stage: "completed", completedAt: time, validationCount: 1,
    prediction: { text: "4500", submittedAt: time }, reference: { label: "reference result", output: "4500", predictionMatches: true, revealedAt: time },
    evidence: [
      { type: "investigation", content: "Arguments fill the parameters in order.", createdAt: time, updatedAt: time },
      { type: "modification_draft", content: expression, createdAt: time, updatedAt: time },
      { type: "reflection", content: "I checked the arithmetic; other inputs still need consideration.", createdAt: time, updatedAt: time }
    ], validations: [{ id: "00000000-0000-4000-8000-000000000002", expression, sequence: 1, createdAt: time,
      result: { status: "evaluated", passed: 5, total: 5, allPassed: true, example: { passed: true, actual: 4050, expected: 4050 } } }] });
}
export function reportFixture(current = completedSnapshot()): CompetenceReport {
  const saved = current.evidence.find(item => item.type === "modification_draft"), latest = current.validations[0];
  const reason = !saved ? "missing_expression" : !latest ? "missing_validation" : latest.sequence !== current.validationCount ? "latest_validation_missing" :
    latest.result.status !== "evaluated" ? "latest_validation_rejected" : latest.expression !== saved.content ? "expression_mismatch" : null;
  const final: ReportTechnicalPerformance = reason ? { status: "inconclusive", finalValidationId: null, reason } :
    { status: latest.result.status === "evaluated" && latest.result.allPassed ? "checks_met" : "checks_not_met", finalValidationId: latest.id };
  const refs: ReportEvidenceReference[] = [{ kind: "attempt" }];
  const reflection = current.evidence.find(item => item.type === "reflection"), declaration = current.evidence.find(item => item.type === "ai_use_declaration");
  const reflectionRefs: ReportEvidenceReference[] = reflection ? [{ kind: "evidence", type: "reflection" }] : refs;
  return competenceReportSchema.parse({ schemaVersion: REPORT_SCHEMA_VERSION, assessmentVersion: REPORT_ASSESSMENT_VERSION,
    rubricVersion: REPORT_RUBRIC_VERSION, assessmentMode: "deterministic_evidence",
    overall: { summary: "This report describes recorded technical evidence. Written reasoning remains unassessed.", competenceRating: "not_assessed", scope: "single_challenge_recorded_evidence" },
    competencies: competencyIds.map(id => ({ id, qualitativeAssessment: "not_assessed", observations:
      id === "explanation_reflection" && reflection ? [{ summary: "Reflection was submitted; its reasoning has not been assessed.", evidenceRefs: reflectionRefs }] : [], limitations: ["Submitted work does not establish independent competence."] })),
    solo: { status: "not_assessed", level: null, reason: "Not assessed; structured review pending." },
    technicalPerformance: { final, recordedExecutions: current.validationCount, retainedExecutions: current.validations.length,
      historyTruncated: current.validationCount > current.validations.length, countMeaning: "recorded_executions_not_distinct_intentions", limitations: ["Five defined checks do not establish all-input correctness."] },
    learningJourney: current,
    aiCollaboration: declaration ? { status: "declared", verification: "not_verified", declaration: declaration.content, evidenceRefs: [{ kind: "evidence", type: "ai_use_declaration" }] } :
      { status: "not_declared", verification: "not_verified", declaration: null, evidenceRefs: [] },
    strengths: final.status === "checks_met" ? [{ code: "checks_met", summary: "The saved expression passed the five defined checks.", evidenceRefs: [{ kind: "validation", id: final.finalValidationId }] }] : [],
    growthAreas: [{ code: reflection ? "reasoning_unassessed" : "evidence_inconclusive", summary: "Reasoning needs structured review.", evidenceRefs: reflectionRefs }],
    nextStep: { code: final.status === "inconclusive" ? "request_evidence_review" : final.status === "checks_not_met" ? "review_arithmetic_new_attempt" : current.reference?.predictionMatches === false ? "trace_arguments" : "explain_additional_inputs",
      summary: "Review the recorded evidence and practice with a new attempt. This completed attempt cannot be edited.", completedAttemptEditable: false, evidenceRefs: refs },
    limitations: ["One challenge does not establish mastery.", "Validation executions do not establish distinct learner intentions."] });
}
