# SYNVORA — AI Engineering Competence Lab

## Overview

SYNVORA is an AI Engineering Competence Lab focused on developing, assessing, and demonstrating practical AI engineering competence through structured learning, engineering challenges, and evidence-based assessment.

This repository contains the SYNVORA platform implementation together with its supporting product, architecture, assessment, challenge, and UI documentation.

## Project Status

The repository is currently in the initial platform scaffolding phase.

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

The project is currently being scaffolded.

The initial repository setup has already been completed. Application dependencies will be installed only after the root configuration and architecture baseline have been reviewed and approved.

At the current stage, avoid running dependency installation commands until the implementation workflow explicitly calls for them.
