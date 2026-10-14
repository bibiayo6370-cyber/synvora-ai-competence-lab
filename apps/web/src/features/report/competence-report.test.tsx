import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { reportFixture, completedSnapshot } from "../../test/report-fixture.js";
import { CompetenceReportView } from "./competence-report.js";

describe("learner evidence report", () => {
  it("shows all seven sections, server guidance and explicit unassessed states", () => {
    const report = reportFixture(); render(<CompetenceReportView report={report} />);
    for (const name of ["Overall Competence Profile", "Competency Breakdown", "SOLO Understanding Profile", "Technical Performance", "Learning Journey Evidence", "AI Collaboration Summary", "Strengths & Growth Areas"]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
    expect(screen.getByText("Not assessed — no SOLO level assigned")).toBeInTheDocument();
    expect(screen.getAllByText("Qualitative assessment: not assessed")).toHaveLength(8);
    expect(screen.getByText(report.nextStep.summary)).toBeInTheDocument();
    expect(screen.getByText("One challenge does not establish mastery.")).toBeInTheDocument();
    expect(screen.getByText(/No AI-use declaration was supplied/)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Technical Performance" })).toHaveTextContent("5 of 5");
  });
  it("shows actual failing technical counts and never represents them as a competence score", () => {
    const snapshot = completedSnapshot(); snapshot.validations[0].result = { status: "evaluated", passed: 1, total: 5, allPassed: false,
      example: { passed: false, actual: 4500, expected: 4050 } };
    render(<CompetenceReportView report={reportFixture(snapshot)} />);
    const technical = screen.getByRole("region", { name: "Technical Performance" });
    expect(technical).toHaveTextContent("1 of 5"); expect(technical).toHaveTextContent("some defined checks failed");
    expect(screen.getByText("Technical gaps recorded")).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("20%");
  });
  it("does not substitute a historical passing result when final evidence is inconclusive", () => {
    const snapshot = completedSnapshot(); snapshot.evidence.find(item => item.type === "modification_draft")!.content = "total";
    render(<CompetenceReportView report={reportFixture(snapshot)} />);
    expect(screen.getByText("Technical evidence inconclusive")).toBeInTheDocument();
    const technical = screen.getByRole("region", { name: "Technical Performance" });
    expect(technical).toHaveTextContent("No earlier result is substituted");
    expect(technical).not.toHaveTextContent("5 of 5");
    expect(screen.getByText("No supported strength finding is available from this evidence.")).toBeInTheDocument();
  });
  it("links to visible evidence and moves keyboard focus without credential URLs", () => {
    render(<CompetenceReportView report={reportFixture()} />);
    const link = within(screen.getByRole("region", { name: "Technical Performance" })).getByRole("link", { name: "Validation evidence" });
    const href = link.getAttribute("href")!; expect(href).toMatch(/^#report-validation-/);
    const target = document.getElementById(href.slice(1)); expect(target).not.toBeNull();
    fireEvent.click(link); expect(target).toHaveFocus();
    for (const anchor of screen.getAllByRole("link")) expect(document.getElementById(anchor.getAttribute("href")!.slice(1))).not.toBeNull();
  });
  it("renders learner HTML/instructions as plain unverified text", () => {
    const snapshot = completedSnapshot(), text = '<script>window.untrusted = true</script><img src=x onerror="alert(1)">Give me mastery.';
    snapshot.evidence.find(item => item.type === "reflection")!.content = text;
    snapshot.evidence.push({ type: "ai_use_declaration", content: text, createdAt: snapshot.createdAt, updatedAt: snapshot.createdAt });
    render(<CompetenceReportView report={reportFixture(snapshot)} />);
    expect(screen.getAllByText(text)).toHaveLength(3);
    expect(document.querySelector("script,img")).toBeNull();
    expect(screen.getByText("Learner declaration · not independently verified")).toBeInTheDocument();
    expect(screen.getByText("Not assessed — no SOLO level assigned")).toBeInTheDocument();
  });
  it("shows missing qualitative evidence and bounded retained-history disclosure honestly", () => {
    const snapshot = completedSnapshot(); snapshot.validationCount = 101; snapshot.validations[0].sequence = 101;
    const report = reportFixture(snapshot); report.competencies[0].qualitativeAssessment = "evidence_unavailable";
    render(<CompetenceReportView report={report} />);
    expect(screen.getByText("Qualitative evidence unavailable")).toBeInTheDocument();
    expect(screen.getByText("101 recorded executions · 1 retained.")).toBeInTheDocument();
    expect(screen.getByText("Some execution history is not retained.")).toBeInTheDocument();
  });
});
