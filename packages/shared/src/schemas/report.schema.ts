import { z } from "zod";
import { attemptSnapshotSchema } from "./attempt.schema.js";
import { evidenceTypes } from "../constants/challenge.constants.js";

export const REPORT_SCHEMA_VERSION = "1.0";
export const REPORT_ASSESSMENT_VERSION = "001-deterministic-v1";
export const REPORT_RUBRIC_VERSION = "001-review-ready-v1";
export const competencyIds = ["code_comprehension", "predictive_reasoning", "investigation", "debugging",
  "modification", "validation", "explanation_reflection", "ai_collaboration"] as const;

const text = (max: number) => z.string().min(1).max(max).refine(value => value.trim().length > 0, "Enter nonblank text");
export const reportEvidenceReferenceSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("attempt") }),
  z.strictObject({ kind: z.literal("prediction") }),
  z.strictObject({ kind: z.literal("reference") }),
  z.strictObject({ kind: z.literal("evidence"), type: z.enum(evidenceTypes) }),
  z.strictObject({ kind: z.literal("validation"), id: z.uuid() })
]);
const references = z.array(reportEvidenceReferenceSchema).min(1).max(10);
export const reportObservationSchema = z.strictObject({ summary: text(600), evidenceRefs: references });
export const competencyFindingSchema = z.strictObject({
  id: z.enum(competencyIds), qualitativeAssessment: z.enum(["not_assessed", "evidence_unavailable"]),
  observations: z.array(reportObservationSchema).max(8), limitations: z.array(text(600)).min(1).max(8)
});
export const reportFindingSchema = z.strictObject({
  code: z.enum(["prediction_matched", "prediction_differs", "safe_evaluation", "checks_met", "checks_not_met",
    "reasoning_unassessed", "evidence_inconclusive"]),
  summary: text(600), evidenceRefs: references
});
export const reportTechnicalPerformanceSchema = z.discriminatedUnion("status", [
  z.strictObject({ status: z.enum(["checks_met", "checks_not_met"]), finalValidationId: z.uuid() }),
  z.strictObject({ status: z.literal("inconclusive"), finalValidationId: z.null(),
    reason: z.enum(["missing_expression", "missing_validation", "latest_validation_missing", "latest_validation_rejected", "expression_mismatch"]) })
]);

// Public evidence is reused, not reevaluated. Refinements validate DTO consistency;
// assessment findings and guidance must be authored by the future API report service.
export const competenceReportSchema = z.strictObject({
  schemaVersion: z.literal(REPORT_SCHEMA_VERSION), assessmentVersion: z.literal(REPORT_ASSESSMENT_VERSION),
  rubricVersion: z.literal(REPORT_RUBRIC_VERSION), assessmentMode: z.literal("deterministic_evidence"),
  overall: z.strictObject({ summary: text(1200), competenceRating: z.literal("not_assessed"),
    scope: z.literal("single_challenge_recorded_evidence") }),
  competencies: z.array(competencyFindingSchema).length(8),
  solo: z.strictObject({ status: z.literal("not_assessed"), level: z.null(), reason: text(600) }),
  technicalPerformance: z.strictObject({ final: reportTechnicalPerformanceSchema,
    recordedExecutions: z.number().int().nonnegative(), retainedExecutions: z.number().int().min(0).max(100),
    historyTruncated: z.boolean(), countMeaning: z.literal("recorded_executions_not_distinct_intentions"),
    limitations: z.array(text(600)).min(1).max(8) }),
  learningJourney: attemptSnapshotSchema,
  aiCollaboration: z.discriminatedUnion("status", [
    z.strictObject({ status: z.literal("declared"), verification: z.literal("not_verified"),
      declaration: text(2000), evidenceRefs: references }),
    z.strictObject({ status: z.literal("not_declared"), verification: z.literal("not_verified"),
      declaration: z.null(), evidenceRefs: z.array(reportEvidenceReferenceSchema).length(0) })
  ]),
  strengths: z.array(reportFindingSchema).max(8), growthAreas: z.array(reportFindingSchema).min(1).max(8),
  nextStep: z.strictObject({ code: z.enum(["review_arithmetic_new_attempt", "trace_arguments", "explain_additional_inputs",
    "request_evidence_review"]), summary: text(600), completedAttemptEditable: z.literal(false), evidenceRefs: references }),
  limitations: z.array(text(600)).min(1).max(12)
}).superRefine((report, ctx) => {
  const invalid = (path: (string | number)[], message: string) => ctx.addIssue({ code: "custom", path, message });
  const journey = report.learningJourney;
  if (journey.stage !== "completed" || journey.completedAt === null) {
    invalid(["learningJourney"], "Reports require a completed attempt and completion timestamp");
  }
  if (new Set(report.competencies.map(item => item.id)).size !== competencyIds.length) {
    invalid(["competencies"], "Include each competency exactly once");
  }
  if (new Set(journey.evidence.map(item => item.type)).size !== journey.evidence.length) {
    invalid(["learningJourney", "evidence"], "Evidence types must be unique");
  }
  const runs = journey.validations;
  // The published example is one of the five recorded checks. Do not infer
  // private-case results or rerun arithmetic; only check impossible aggregates.
  runs.forEach((run, index) => {
    if (run.result.status === "evaluated" &&
        ((run.result.passed === 5 && !run.result.example.passed) || (run.result.passed === 0 && run.result.example.passed))) {
      invalid(["learningJourney", "validations", index, "result"], "Published example must be consistent with aggregate counts");
    }
  });
  if (new Set(runs.map(run => run.id)).size !== runs.length ||
      runs.some((run, index) => run.sequence > journey.validationCount ||
        (index > 0 && runs[index - 1].sequence <= run.sequence))) {
    invalid(["learningJourney", "validations"], "Validation IDs must be unique and sequences newest first within recorded count");
  }
  const technical = report.technicalPerformance;
  if (technical.recordedExecutions !== journey.validationCount || technical.retainedExecutions !== runs.length ||
      technical.recordedExecutions < technical.retainedExecutions ||
      technical.historyTruncated !== (technical.recordedExecutions > technical.retainedExecutions)) {
    invalid(["technicalPerformance"], "Execution counts and history completeness must match persisted evidence");
  }
  const draft = journey.evidence.find(item => item.type === "modification_draft");
  const latest = runs[0];
  const reason = !draft ? "missing_expression" : !latest ? "missing_validation" : latest.sequence !== journey.validationCount ? "latest_validation_missing" :
    latest.result.status !== "evaluated" ? "latest_validation_rejected" :
      latest.expression !== draft.content ? "expression_mismatch" : null;
  if (reason !== null) {
    if (technical.final.status !== "inconclusive" || technical.final.reason !== reason) {
      invalid(["technicalPerformance", "final"], "Missing or inconsistent final evidence requires an inconclusive finding");
    }
  } else if (latest?.result.status === "evaluated") {
    const expected = latest.result.allPassed ? "checks_met" : "checks_not_met";
    if (technical.final.status !== expected || technical.final.finalValidationId !== latest.id) {
      invalid(["technicalPerformance", "final"], "Final finding must reference the latest matching evaluated run");
    }
  }
  const checkRefs = (refs: z.infer<typeof reportEvidenceReferenceSchema>[], path: (string | number)[]) => {
    refs.forEach((ref, index) => {
      const exists = ref.kind === "attempt" ? true : ref.kind === "prediction" ? journey.prediction !== null : ref.kind === "reference" ? journey.reference !== null :
        ref.kind === "evidence" ? journey.evidence.some(item => item.type === ref.type) : runs.some(run => run.id === ref.id);
      if (!exists) invalid([...path, index], "Reference must resolve to evidence included in this report");
    });
  };
  report.competencies.forEach((item, index) => item.observations.forEach((observation, observationIndex) =>
    checkRefs(observation.evidenceRefs, ["competencies", index, "observations", observationIndex, "evidenceRefs"])));
  const checkFindings = (findings: z.infer<typeof reportFindingSchema>[], section: "strengths" | "growthAreas") => {
    findings.forEach((finding, index) => {
      const path = [section, index];
      checkRefs(finding.evidenceRefs, [...path, "evidenceRefs"]);
      if (["checks_met", "checks_not_met", "safe_evaluation"].includes(finding.code)) {
        const final = technical.final;
        if (final.status === "inconclusive" ||
            (finding.code !== "safe_evaluation" && finding.code !== final.status) ||
            !finding.evidenceRefs.some(ref => ref.kind === "validation" && ref.id === final.finalValidationId)) {
          invalid(path, "Technical findings require the final matching evaluated validation reference");
        }
      }
      if (finding.code === "prediction_matched" || finding.code === "prediction_differs") {
        if (!journey.prediction || !journey.reference ||
            journey.reference.predictionMatches !== (finding.code === "prediction_matched") ||
            !finding.evidenceRefs.some(ref => ref.kind === "prediction") ||
            !finding.evidenceRefs.some(ref => ref.kind === "reference")) {
          invalid(path, "Prediction findings require the recorded prediction and comparison");
        }
      }
      if (section === "strengths" && ["checks_not_met", "prediction_differs", "reasoning_unassessed", "evidence_inconclusive"].includes(finding.code)) {
        invalid(path, "A gap or unassessed artifact is not a demonstrated strength");
      }
      if (section === "growthAreas" && ["prediction_matched", "safe_evaluation", "checks_met"].includes(finding.code)) {
        invalid(path, "Positive technical observations are not growth gaps");
      }
    });
  };
  checkFindings(report.strengths, "strengths");
  checkFindings(report.growthAreas, "growthAreas");
  checkRefs(report.nextStep.evidenceRefs, ["nextStep", "evidenceRefs"]);
  const nextCode = technical.final.status === "inconclusive" ? "request_evidence_review" :
    technical.final.status === "checks_not_met" ? "review_arithmetic_new_attempt" :
      journey.reference?.predictionMatches === false ? "trace_arguments" : "explain_additional_inputs";
  if (report.nextStep.code !== nextCode) {
    invalid(["nextStep", "code"], "Guidance must follow inconclusive, failing checks, differing prediction, then explanation precedence");
  }
  const declaration = journey.evidence.find(item => item.type === "ai_use_declaration");
  const ai = report.aiCollaboration;
  if (declaration ? ai.status !== "declared" || ai.declaration !== declaration.content ||
      !ai.evidenceRefs.some(ref => ref.kind === "evidence" && ref.type === "ai_use_declaration") : ai.status !== "not_declared") {
    invalid(["aiCollaboration"], "AI-use disclosure must match the submitted declaration, without verification claims");
  }
  checkRefs(ai.evidenceRefs, ["aiCollaboration", "evidenceRefs"]);
});

export type CompetenceReport = z.infer<typeof competenceReportSchema>;
export type ReportEvidenceReference = z.infer<typeof reportEvidenceReferenceSchema>;
export type CompetencyFinding = z.infer<typeof competencyFindingSchema>;
export type ReportFinding = z.infer<typeof reportFindingSchema>;
export type ReportTechnicalPerformance = z.infer<typeof reportTechnicalPerformanceSchema>;
