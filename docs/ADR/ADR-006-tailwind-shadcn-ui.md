# ADR-006: Tailwind CSS + shadcn/ui UI Foundation

**Status:** Accepted
**Date:** 2026-10-02

## Context

The learner-facing application needs a consistent, accessible, customizable UI foundation without introducing a large opaque component framework.

## Decision

Use Tailwind CSS for styling and shadcn/ui as the default UI primitive layer.

## Rationale

This combination provides reusable accessible primitives while keeping component source and design decisions within the project. It supports a coherent design system without preventing project-specific customization.

## Consequences

- shadcn/ui is the default component primitive layer.
- Project-specific styling should build on the design system rather than create unrelated ad-hoc patterns.
- A second component library requires an explicit architectural decision.
- Accessibility remains an application responsibility even when primitives provide accessible defaults.

## Alternatives Considered

- **Large packaged UI frameworks:** not selected because they may impose stronger visual and architectural conventions than the Lab needs.
- **Entirely hand-built primitives:** not selected because it would spend POC time recreating common accessible UI building blocks.

## Related Decisions

- `docs/ARCHITECTURE/SYSTEM_ARCHITECTURE.md`
- `AGENTS.md`
