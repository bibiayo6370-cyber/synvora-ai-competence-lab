# ADR-010: AI-Assisted Engineering Governance

**Status:** Accepted
**Date:** 2026-10-02

## Context

ChatGPT and Codex are part of the engineering workflow, and the capstone also requires the team to demonstrate how AI software-development tools contributed to the solution. AI assistance must remain subordinate to human engineering judgment, validation, and documented architecture.

## Decision

Govern AI-assisted development through `AGENTS.md`, the project's normal review/testing workflow, Git history, and a lightweight AI Engineering Log for significant interactions. AI-generated proposals and code must be reviewed and validated before they are accepted as engineering decisions.

## Rationale

This preserves human accountability while making AI collaboration reproducible and demonstrable. It also aligns the engineering process with the Lab's own evidence-based philosophy: important claims should be supported by observable evidence.

## Consequences

- AI tools must follow approved architecture and documented decisions.
- Significant AI contributions may be logged with task, contribution, human decision, validation, and outcome.
- The log should capture meaningful engineering interactions, not every prompt.
- AI output does not bypass testing, security, validation, or review.
- Failed or rejected AI suggestions should be recorded when materially useful to the engineering evidence trail.

## Alternatives Considered

- **Unstructured AI usage with no evidence trail:** rejected because it is difficult to audit, explain, or demonstrate.
- **Treating AI output as automatically correct:** rejected because compilation or plausible output is not sufficient engineering validation.
- **Prohibiting AI-generated code:** rejected because AI-assisted engineering is an intentional part of this project workflow.

## Related Decisions

- `docs/ARCHITECTURE/SYSTEM_ARCHITECTURE.md`
- `AGENTS.md`
