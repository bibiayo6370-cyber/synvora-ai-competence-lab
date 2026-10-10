# SYNVORA AI Engineering Competence Lab

## Project Purpose

SYNVORA is an AI Engineering Competence Lab designed to develop, assess, and demonstrate practical AI engineering competence through structured learning, engineering challenges, and evidence-based assessment.

The repository contains the platform implementation together with supporting assessment, challenge, documentation, and UI assets.

## Engineering Principles

1. Prefer simple, explicit, maintainable solutions over unnecessary abstraction.
2. Follow the approved architecture unless an architectural decision is explicitly changed.
3. Do not introduce dependencies without a clear engineering reason.
4. Reuse existing project capabilities before adding new libraries.
5. Keep application boundaries explicit.
6. Validate data at trust boundaries.
7. Keep business rules out of UI components and HTTP controllers.
8. Favor small, testable modules with clear responsibilities.
9. Record significant architectural decisions in `docs/ADR/`.
10. Update relevant documentation when implementation decisions materially change the system.

## Repository Structure

```text
apps/
  web/                 React frontend
  api/                 Express backend

packages/
  shared/              Shared contracts, types, schemas, and constants

docs/
  PRD/                 Product requirements
  ARCHITECTURE/        Architecture documentation
  ASSESSMENT-MODEL/    Assessment model documentation
  ADR/                 Architecture Decision Records

assessment/             Assessment-related assets
challenges/             Engineering challenges
ui/                     UI/design assets
infrastructure/docker/  Container and infrastructure configuration
```

## Approved Technology Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod

### Backend

- Node.js
- Express
- TypeScript

### Database

- PostgreSQL
- PostgreSQL runs in Docker for local development

### Testing

- Vitest
- React Testing Library
- Supertest
- Playwright

### Package Management

- pnpm
- pnpm workspaces / monorepo

## Frontend Rules

Use shadcn/ui components as the default UI primitive layer.

Do not introduce another component library without an explicit architectural decision.

Customize shadcn/ui components through the project's design system rather than replacing them with ad-hoc component implementations.

Use React Hook Form for application forms.

Use Zod for form validation and structured input validation.

Keep genuinely UI-specific schemas in the web application.

Do not duplicate shared domain or API schemas that belong in `packages/shared`.

## Shared Contracts

`packages/shared` is the boundary for contracts shared between application components.

Allowed:

- Zod domain schemas
- Zod API schemas
- Shared TypeScript types
- Enums and constants
- API contract definitions

Do not place the following in `packages/shared`:

- React components
- Express controllers
- Database repositories
- PostgreSQL-specific code
- Browser-specific code
- API business logic

Shared contracts should be reused rather than independently recreated in the frontend and backend.

## Validation

Validate data on both sides of a trust boundary.

The normal form/request flow is:

```text
User Input
  -> React Component
  -> React Hook Form
  -> Zod
  -> API Client
  -> Express API
  -> Server-side Zod
  -> Application Services
  -> Repository / Data Access
  -> PostgreSQL
```

Client-side validation improves user experience.

Server-side validation is authoritative and must never be omitted because client-side validation exists.

## Backend Rules

Keep HTTP concerns in routes/controllers and application/business rules in services.

Repositories are responsible for data access and should not contain unrelated business rules.

Do not allow controllers to become business-logic containers.

Prefer explicit service boundaries over unnecessary framework abstractions.

## Database Rules

PostgreSQL is the application database.

Local PostgreSQL development should use Docker.

Database schema changes must be handled through the project's migration strategy once established.

Never modify production data or schema manually as a substitute for a tracked migration.

## Testing Rules

New application behavior should have appropriate automated test coverage.

Use:

- Vitest for unit-level testing
- React Testing Library for React behavior
- Supertest for HTTP/API testing
- Playwright for end-to-end browser workflows

Tests should verify observable behavior rather than implementation details wherever practical.

## Git Rules

Use small, focused commits.

Commit messages should clearly describe the change.

Do not commit:

- secrets
- private keys
- credentials
- generated dependency directories
- local environment files containing secrets

Before committing:

```bash
git status
git diff
```

Do not rewrite shared Git history unless explicitly required.

## AI-Assisted Development Rules

AI-assisted development must follow the project's approved architecture and documented decisions.

Before implementing a substantial change:

1. Inspect the relevant existing code and documentation.
2. Identify applicable architectural decisions.
3. Prefer modifying existing structures over creating parallel implementations.
4. Explain significant tradeoffs when they affect architecture.
5. Keep changes scoped to the requested work.
6. Run the relevant checks after implementation.
7. Report failures honestly; do not claim a check passed when it was not run.

AI-generated code must be reviewed as engineering work, not accepted solely because it compiles.

## Dependency Rules

Do not add a dependency merely because it is convenient.

Before adding a package, consider:

- whether the existing stack already provides the capability
- whether the package is actively maintained
- whether the package materially reduces complexity
- whether it introduces unnecessary security or operational risk

Do not install dependencies globally for project-specific functionality.

## Architecture Changes

Do not silently change approved architecture.

Changes involving:

- technology stack
- application boundaries
- database strategy
- shared contract strategy
- authentication architecture
- major infrastructure decisions

should be documented as an Architecture Decision Record in `docs/ADR/` when appropriate.

## Documentation

Documentation is part of the implementation.

When behavior, architecture, commands, workflows, or engineering decisions change materially, update the relevant documentation.

The project's command reference is a living document and should be updated when important development, Git, Docker, pnpm, PostgreSQL, testing, WSL, or Codex commands are introduced.

## Definition of Done

Work is not complete merely because code has been written.

A change is complete when:

1. The implementation satisfies the requested behavior.
2. The relevant architectural rules are followed.
3. Appropriate validation and tests are present.
4. Relevant checks have been run.
5. Documentation is updated when required.
6. Git status is understood and unintended changes are absent.

## TypeScript and ESM Conventions

Node.js workspaces use ESM with TypeScript NodeNext module resolution.

- Use explicit `.js` extensions for relative imports in TypeScript source.
- Use package names for workspace imports, such as `@synvora/shared`.
- Compile TypeScript to JavaScript before Node.js runtime execution.
- Do not import `.ts` files directly in Node.js application source.
- Do not commit generated `dist/` output.
- Build shared packages before applications that consume their compiled exports.
- Keep frontend-specific TypeScript configuration compatible with Vite.

## AI Agent Execution and Review

For each implementation assignment:

1. Inspect the relevant existing code, ADRs, and documentation.
2. Explain the intended approach before making substantial changes.
3. Keep modifications within the authorized task scope.
4. Run applicable TypeScript checks, builds, and automated tests.
5. Report commands executed, results, limitations, and outstanding risks.
6. Do not create Git commits, push branches, or alter Git history without explicit human authorization.
7. Do not access external credentials or unrelated files.
8. Record material AI-assisted engineering contributions in the AI Engineering Log.

Human review is required before implementation is accepted.
