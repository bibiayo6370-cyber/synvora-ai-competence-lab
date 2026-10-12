import type { ValidationResult } from "@synvora/shared";
import { Alert } from "../../components/ui/alert.js";
export function ValidationFeedback({ result }: { result: ValidationResult | null }) {
  if (!result) return null;
  if (result.status === "rejected") return <Alert><strong>Expression rejected.</strong> {result.message} Revise the expression and validate again.</Alert>;
  return <section className="notice" aria-label="Validation results"><h3>{result.passed} of {result.total} checks passed</h3>
    <p>{result.allPassed ? "The expression met these technical checks." : "The expression evaluated safely, but some technical checks failed. You can retry or reflect on this gap."}</p>
    <p>Published example: returned {result.example.actual}; expected {result.example.expected}. {result.example.passed ? "Passed." : "Failed."}</p>
    <p>These checks do not establish understanding or mastery. Other fixture details remain server-owned.</p>
  </section>;
}
