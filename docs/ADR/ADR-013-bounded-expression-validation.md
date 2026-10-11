# ADR-013: Bounded plain-text expression interpretation

**Status:** Approved approach; implementation pending human review
**Date:** 2026-10-10

## Decision

Use a purpose-built tokenizer and recursive-descent arithmetic parser. Only total,
discount, finite decimal literals, grouping, unary +/-, and binary + - * / are allowed.
Decimal grammar is digits optionally followed by a dot and digits. Exponents,
hexadecimal, separators, leading/trailing decimal points, calls, access, statements,
comments, and non-ASCII identifiers/whitespace are rejected. Operators are ASCII;
learner feedback may describe their familiar mathematical meaning.

Reject over 200 characters, over 50 AST nodes, or depth over 12. Count grouping
nodes and unary chains. Check nesting while parsing and actual tree depth afterward,
including left-associative arithmetic chains. Interpret only the allowlisted AST;
reject unknown nodes/operators, non-finite operands/results, and division by zero.
Never execute learner text as JavaScript or pass it to a shell.

Use five server-owned fixtures and absolute result tolerance <= 1e-8. Public
feedback includes aggregate counts and the published example only. Private inputs,
expected outputs, and reference modification solutions are not serialized.

## Lifecycle behavior

Prediction is immutable. Its match rule is trimmed exact reference-output text;
no numeric or expression coercion. Reference output appears only after explicit reveal.
Saving the first modification draft enters validate. Rejected validation returns
422 without advancing stage. Safe evaluation enters reflect even when checks fail.
Retries and draft edits are allowed before completion. Reflection requires the
latest retained run to be evaluated and match the current draft exactly. Completed
attempts reject writes with 409. Reasoning and AI-use text remain unassessed.

Oversized text is rejected while preserving the prior bounded draft and is not
stored. Empty validation text is recorded as a rejection without erasing the draft.
Other bounded expression submissions preserve the exact input as the current draft.

## Consequences

Passing five checks is technical evidence, not proof of comprehension or mastery.
Frontend UX, report generation, report endpoints, and recommendation rules remain
outside Assignment 002A. Parser/security tests are required before acceptance.
