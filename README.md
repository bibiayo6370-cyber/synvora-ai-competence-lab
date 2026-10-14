# SYNVORA — AI Engineering Competence Lab

## Overview

SYNVORA is an AI Engineering Competence Lab focused on developing, assessing, and demonstrating practical AI engineering competence through structured learning, engineering challenges, and evidence-based assessment.

This repository contains the SYNVORA platform implementation together with its supporting product, architecture, assessment, challenge, and UI documentation.

## Project Status

Assignment 002A provides the PostgreSQL-backed attempt lifecycle and bounded expression validation. Assignment 002B adds the learner-facing React journey. Assignment 002C adds the deterministic seven-section report; all seven Phase D human browser scenarios and the subsequent mobile-header checks have been accepted.

The foundational Git repository, GitHub remote, pnpm workspace, TypeScript base configuration, and AI-assisted engineering rules have been established.

Application dependencies and application-specific packages will be introduced incrementally according to the approved implementation sequence.

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
- Docker for local PostgreSQL development

### Shared Contracts

- TypeScript types
- Zod schemas
- API/domain contract definitions

Shared contracts live in `packages/shared`.

### Testing

- Vitest
- React Testing Library
- Supertest
- Playwright

### Package Management

- pnpm
- pnpm workspaces / monorepo

## Repository Structure

```text
synvora-ai-competence-lab/
├── AGENTS.md
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
│
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   └── shared/
│
├── docs/
│   ├── PRD/
│   ├── ARCHITECTURE/
│   ├── ASSESSMENT-MODEL/
│   └── ADR/
│
├── assessment/
├── challenges/
├── ui/
└── infrastructure/
    └── docker/
```

## Architecture

SYNVORA uses a modular monorepo architecture with clear application boundaries.

```text
Presentation
    ↓
Frontend Features
    ↓
Shared Contracts
    ↓
API / Application Services
    ↓
Data Access
    ↓
PostgreSQL
```

### Frontend

The frontend is a React/Vite application written in TypeScript.

The UI foundation uses Tailwind CSS and shadcn/ui.

Application forms use React Hook Form with Zod validation.

### Backend

The backend is a Node.js/Express application written in TypeScript.

HTTP concerns are separated from application/business logic, with routes/controllers, services, and repositories having explicit responsibilities.

### Shared Contracts

`packages/shared` provides contracts shared across application boundaries.

It may contain:

- Zod domain and API schemas
- TypeScript types
- enums and constants
- API contract definitions

It does not contain React components, Express controllers, database repositories, PostgreSQL-specific code, browser-specific code, or API business logic.

### Database

PostgreSQL is the application database.

Local PostgreSQL development will run through Docker.

## Development Environment

The established development environment is:

- Windows host filesystem
- Ubuntu WSL2 for the Linux development shell
- Docker Desktop for container runtime
- PostgreSQL in Docker
- Git and GitHub for source control
- SSH authentication for GitHub
- pnpm for workspace/package management

The project command reference is maintained separately as a living engineering document.

## Engineering Principles

SYNVORA development follows these principles:

1. Keep architecture explicit and maintainable.
2. Prefer simple solutions over unnecessary abstraction.
3. Keep application boundaries clear.
4. Validate data at trust boundaries.
5. Keep business rules out of UI components and HTTP controllers.
6. Reuse shared contracts rather than duplicating them.
7. Avoid unnecessary dependencies.
8. Test observable behavior.
9. Record significant architectural decisions.
10. Keep documentation aligned with implementation.

AI-assisted development is governed by `AGENTS.md`.

## Implementation Roadmap

The approved high-level implementation roadmap is:

1. Documentation baseline
2. Architecture document and ADRs
3. pnpm monorepo
4. Shared contracts
5. React/Vite frontend
6. shadcn/ui and Tailwind design foundation
7. React Hook Form and Zod form foundation
8. Express API skeleton
9. PostgreSQL/Docker foundation
10. Web → API → PostgreSQL health path
11. Testing foundation
12. Codex workflow and engineering rules

## Repository Scaffolding Status

The initial repository scaffolding currently includes:

* Git repository and GitHub remote
* pnpm workspace configuration
* Root `package.json`
* Root TypeScript configuration
* Shared Zod contracts and tests
* Express attempt APIs and PostgreSQL repositories
* Dedicated Docker PostgreSQL development/test services
* Explicit SQL migrations and cleanup CLI
* `AGENTS.md`
* `README.md`

Application dependencies and application-specific packages will be introduced incrementally according to the implementation roadmap above.

Dependency installation is intentionally deferred until the relevant implementation phase begins.


## Documentation

| Location | Purpose |
|---|---|
| `docs/PRD/` | Product requirements |
| `docs/ARCHITECTURE/` | System and technical architecture |
| `docs/ASSESSMENT-MODEL/` | Assessment framework and competency model |
| `docs/ADR/` | Architecture Decision Records |
| `assessment/` | Assessment assets |
| `challenges/` | Engineering challenge assets |
| `ui/` | UI and design assets |
| `AGENTS.md` | AI-assisted engineering and repository rules |
| Command Reference | Living development command reference |

## Git Workflow

The repository uses Git with GitHub as the remote source-control platform.

The primary branch is `main`.

Changes should be developed in focused commits and reviewed before being pushed.

Before committing, inspect:

```bash
git status
git diff
```

Never commit secrets, private keys, credentials, or local environment files containing secrets.

## Getting Started

Follow section 13 of the Developer Command Reference for local environment files, Docker databases, builds, explicit migrations, and verification. Keep credentials in ignored environment files and preserve existing database volumes.

## Assignment 002A backend foundation

The backend now implements shared attempt contracts, PostgreSQL evidence persistence,
per-attempt bearer access, seven-day expiration, and bounded arithmetic validation.
Docker Compose provisions separate `synvora_dev` and `synvora_test` services.
Build shared before API, apply explicit migrations, and follow the setup/test/cleanup
commands in `docs/DEVELOPMENT/COMMAND_REFERENCE.md` section 13. Local `.env` files
are ignored and required. Daily cleanup is documented but not scheduled.
Assignment 002B implements the learner frontend; Assignment 002C adds evidence reporting.
Implementation acceptance requires human review and the recorded verification results.

## Assignment 002B learner application

The React application implements Challenge → Predict → Run → Investigate → Modify
→ Validate → Reflect → Completion against the existing API. Completion confirms
evidence capture; Assignment 002C now presents the protected evidence report and next-step guidance.

After installing the workspace dependencies, start the existing configured API
and the web application in separate terminals:

```bash
pnpm --filter @synvora/api run dev
pnpm run dev:web
```

Open http://127.0.0.1:5173. Vite proxies `/api` to the local API on port 8000.
Existing dedicated Docker databases and schema must already be available; frontend
startup does not provision databases or run migrations. See the Command Reference
for the approved database setup procedure.

Only `{attemptId, secret}` is stored under `synvora.attempt.v1` in sessionStorage.
Seven-day server retention does not guarantee seven-day browser access. Closing
the tab/browser can lose access, and there is no secret recovery. Only submitted
evidence survives refresh. Unsaved drafts stay in memory through recoverable
errors and panel changes, remain marked unsaved, and can be copied from the
unsaved-work section. Refresh can discard them.

```bash
pnpm run check
pnpm run build
pnpm --filter @synvora/web run test
```

Full results, dependency versions, scope limitations and the human browser-smoke
checklist are in `docs/AI-ENGINEERING/ASSIGNMENT_002B_VERIFICATION.md`.

## Assignment 002C evidence report

Completion automatically retrieves the protected seven-section report. It displays
recorded technical results, evidence-linked observations, submitted explanations,
unverified AI declarations, assessment limitations, and the server's next learning step.
Qualitative reasoning and SOLO remain unassessed; no competence percentage or mastery
rating is assigned. Completed attempts remain read-only.

Report loading/retry is separate from learner submissions. A failed report read keeps
saved completion evidence and newer in-memory drafts available; Retry report repeats
only GET. Refresh refetches using the existing credentials-only browser session.
Inaccessible report access clears the scoped credentials/report; local evidence can
still be copied. No report or evidence is stored in browser storage.

Phase C automated verification is complete. The human reviewer accepted all seven
Phase D browser scenarios and the subsequent header checks at 320px, 375px and
768px, including keyboard smoke verification. These are human observations, not
automated browser results or exhaustive accessibility/security certification.
See `docs/AI-ENGINEERING/ASSIGNMENT_002C_VERIFICATION.md` and the Command
Reference's Phase C checklist. Playwright remains deferred for this capstone.
