# SYNVORA AI Engineering Competency Lab
# System Architecture

**Status:** Approved
**Document:** System Architecture
**Scope:** AI Engineering Competency Lab
**Repository:** `synvora-ai-competence-lab`

---

## 1. Purpose

The AI Engineering Competency Lab is a practical learning and assessment platform designed to help learners develop, demonstrate, and progressively strengthen AI engineering competence.

The Lab is designed around learning that produces observable capability rather than learning that ends with content consumption alone.

The core learning progression is:

```text
Learning
    ↓
Practice
    ↓
Engineering Challenge
    ↓
Evidence
    ↓
Assessment
    ↓
Demonstrated Competence
    ↓
Progress / Gap Identification
    ↓
Next Learning Step
    ↓
Opportunity
```

The system architecture exists to support this progression while keeping the platform modular, testable, maintainable, and extensible.

---

## 2. Architectural Scope

This document defines the high-level technical architecture for the AI Engineering Competency Lab.

It covers:

- system boundaries
- application structure
- frontend architecture
- backend architecture
- shared contracts
- data-access boundaries
- database architecture
- learner journey flow
- assessment and evidence flow
- progression and next-step guidance
- opportunity connection
- security and privacy boundaries
- accessibility and low-bandwidth considerations
- testing architecture
- AI-assisted development boundaries
- extensibility considerations

This document does not define every domain entity, database table, API endpoint, screen, or implementation detail.

Those decisions will be made as the product and implementation are developed.

---

## 3. Architectural Principles

The system follows these principles.

### 3.1 Explicit boundaries

Application responsibilities should be separated clearly.

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

A component should not assume responsibility that belongs to another layer.

### 3.2 Simple before abstract

The platform should use the simplest architecture that adequately supports the required behavior.

Abstraction should be introduced when it solves a demonstrated problem, not merely because it may be useful later.

### 3.3 Business rules belong in application services

Business rules should not be embedded in React components, HTTP controllers, or database repositories.

Application services are responsible for coordinating domain/application behavior.

### 3.4 Validate at trust boundaries

Input should be validated at the point where it crosses a trust boundary.

Client-side validation improves user experience.

Server-side validation is authoritative.

### 3.5 Shared contracts are explicit

Contracts shared between the frontend and backend should have one authoritative definition where practical.

Shared contracts belong in `packages/shared`.

### 3.6 Evidence over assumptions

The Lab should distinguish between:

- learning activity
- submitted evidence
- assessment
- demonstrated competence

Completing an activity should not automatically be treated as proof of competence.

### 3.7 Documentation is part of engineering

Significant architectural decisions must be documented.

The project command reference is a living engineering document and should be updated when important development, Git, Docker, pnpm, PostgreSQL, testing, WSL, or Codex commands are introduced.

---

## 4. System Context

At a high level, the platform consists of:

```text
                    ┌─────────────────────────────┐
                    │          Learner            │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │       Web Application       │
                    │ React + Vite + TypeScript   │
                    │ Tailwind + shadcn/ui        │
                    │ React Hook Form + Zod       │
                    └──────────────┬──────────────┘
                                   │
                         API / Shared Contracts
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │        API Application      │
                    │ Node + Express + TypeScript │
                    └──────────────┬──────────────┘
                                   │
                         Application Services
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │        Data Access          │
                    │       Repositories          │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────┐
                    │         PostgreSQL          │
                    │        Docker runtime       │
                    └─────────────────────────────┘
```

The browser does not communicate directly with PostgreSQL.

The frontend communicates with the API.

The API is responsible for enforcing server-side validation, authorization, application rules, and data-access boundaries.

---

## 5. Monorepo Architecture

The project uses a pnpm monorepo.

```text
synvora-ai-competence-lab/
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

### `apps/web`

The learner-facing web application.

Responsibilities include:

- presentation
- navigation
- learner-facing workflows
- forms
- client-side validation
- API interaction
- UI state
- accessibility behavior

It must not contain server-side business rules or database access.

### `apps/api`

The backend application.

Responsibilities include:

- HTTP API
- request validation
- authentication and authorization boundaries
- application services
- business rules
- data-access coordination

It must not become a monolithic controller layer.

### `packages/shared`

The shared contract boundary.

Allowed contents include:

- Zod domain schemas
- Zod API schemas
- TypeScript types
- enums
- constants
- API contract definitions

It must not contain:

- React components
- Express controllers
- database repositories
- PostgreSQL-specific code
- browser-specific code
- API business logic

---

## 6. Frontend Architecture

The frontend uses:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod

A recommended internal structure is:

```text
apps/web/src/
├── components/
│   └── ui/
├── features/
├── forms/
├── layouts/
├── pages/
├── hooks/
├── lib/
├── schemas/
├── services/
├── App.tsx
└── main.tsx
```

This structure is a starting convention rather than a requirement that every feature must use every directory.

### UI component layer

shadcn/ui is the default UI primitive layer.

A second component library must not be introduced without an explicit architectural decision.

Project-specific customization should be implemented through the project's design system rather than through unrelated ad-hoc component implementations.

### Forms

Application forms use React Hook Form.

Zod provides structured validation.

Where a schema represents a shared domain or API contract, the authoritative schema belongs in `packages/shared`.

Genuinely UI-specific validation may remain within the web application.

### API interaction

The frontend communicates with the backend through an API client/service boundary.

UI components should not contain raw networking logic when that logic belongs in an application service.

---

## 7. Backend Architecture

The backend uses:

- Node.js
- Express
- TypeScript

The logical request flow is:

```text
HTTP Request
    ↓
Route
    ↓
Controller
    ↓
Request Validation
    ↓
Application Service
    ↓
Repository / Data Access
    ↓
PostgreSQL
```

The response follows the reverse direction.

### Routes

Routes define HTTP endpoints and connect them to controllers.

### Controllers

Controllers translate HTTP requests into application operations and application results into HTTP responses.

Controllers should remain thin.

### Application services

Services contain application/business rules and coordinate domain behavior.

They should not depend on HTTP-specific objects when that dependency is unnecessary.

### Repositories

Repositories isolate persistence concerns.

Repositories should not become containers for unrelated business rules.

---

## 8. Validation Architecture

Validation occurs on both sides of the client/server boundary.

```text
User Input
    ↓
React Hook Form
    ↓
Client-side Zod
    ↓
API Client
    ↓
HTTP
    ↓
Server-side Zod
    ↓
Application Service
    ↓
Data Access
```

The client cannot be trusted as the sole validation boundary.

Server-side validation remains authoritative even when the frontend has already validated the same input.

Shared Zod schemas should be reused when the validation represents the same domain/API contract.

---

## 9. Learner Journey Architecture

The platform's distinguishing product flow is the learner journey.

The intended conceptual flow is:

```text
Learner
   ↓
Learning Path / Competency Target
   ↓
Learning Resource
   ↓
Practice
   ↓
Engineering Challenge
   ↓
Evidence Submission
   ↓
Assessment
   ↓
Competency Demonstrated
   ↓
Progress / Gap
   ↓
Next Learning Step
   ↓
Opportunity / Pathway
```

This flow is a product-level model.

It does not require every stage to become a separate technical service or database entity.

The implementation should begin with the smallest vertical slice that demonstrates the journey.

---

## 10. Competency Model

The Lab is competency-oriented rather than purely content-oriented.

A learner's progress should therefore be represented in terms of demonstrated capability where the product behavior requires it.

The system should distinguish between:

```text
Learning activity
    ≠
Challenge completion
    ≠
Evidence submission
    ≠
Assessment result
    ≠
Demonstrated competence
```

This distinction is important to the Lab's assessment philosophy.

The detailed competency model belongs in the assessment-model documentation and should not be duplicated unnecessarily in the system architecture.

---

## 11. Evidence and Assessment

The platform supports evidence-based assessment.

At a conceptual level:

```text
Challenge
    ↓
Learner Work
    ↓
Evidence
    ↓
Assessment
    ↓
Assessment Result
    ↓
Competency Status
```

The architecture should allow assessment logic to evolve without requiring the presentation layer to understand how competence is calculated.

Assessment rules belong in application/domain services and the assessment model.

---

## 12. Progress and Next-Step Guidance

The Lab should help a learner understand:

- where they are
- what they have demonstrated
- where gaps remain
- what they should work on next

The initial implementation should prefer transparent, explainable progression rules over a complex recommendation engine.

A conceptual model is:

```text
Current Evidence
      ↓
Assessment
      ↓
Competency State
      ↓
Gap / Next Requirement
      ↓
Next Learning Activity
```

Personalization should assist progression without excluding learners who do not fit a predefined profile.

---

## 13. Opportunity Connection

The Lab should be capable of connecting demonstrated learning to meaningful next steps.

The intended relationship is:

```text
Demonstrated Competencies
        ↓
Pathway / Opportunity Category
        ↓
Additional Competencies
        ↓
Recommended Next Development
```

The proof of concept does not require a full recruitment marketplace or job board.

Opportunity guidance should remain focused on helping learners understand where demonstrated learning can lead and what they can do next.

---

## 14. Learning Resources

Learning resources should be treated as structured learning assets rather than untraceable content.

Where applicable, resource metadata should support:

- title
- source
- source reference or URL
- learning purpose
- relevance to a competency
- optional localization information

The system should favor credible and traceable learning material.

The resource model should remain extensible without requiring a large content-management system in the initial proof of concept.

---

## 15. Security and Privacy Boundaries

Learner information may include personal, academic, performance, assessment, and evidence-related data.

The architecture therefore treats privacy and security as system concerns rather than UI-only concerns.

Core boundaries include:

```text
Browser
   ↓
Authenticated API Boundary
   ↓
Authorization / Application Rules
   ↓
Data Access
   ↓
PostgreSQL
```

The frontend must not connect directly to the database.

Secrets and credentials must not be embedded in source code.

Environment-specific secrets belong outside committed source files.

Authentication and authorization implementation details will be established through dedicated architecture decisions before the corresponding functionality is implemented.

---

## 16. Accessibility and Inclusion

Accessibility is an implementation requirement across the learner experience.

The frontend should favor:

- semantic HTML
- keyboard-accessible interactions
- accessible form controls
- clear validation feedback
- readable content
- appropriate contrast
- predictable navigation

The architecture should not make accessibility dependent on a particular component implementation.

---

## 17. Low-Bandwidth and Basic-Device Considerations

The Lab is intended to remain useful in environments where learners may have unreliable internet access, limited mobile data, or basic devices.

The proof of concept should therefore prioritize:

- lightweight pages
- text-first learning experiences where appropriate
- efficient API payloads
- progressive loading
- avoidance of unnecessary large assets
- usable responsive layouts

An offline-first architecture is not assumed at this stage.

If offline capabilities become a product requirement, they should be introduced through a documented architectural decision rather than assumed prematurely.

---

## 18. Localization and Local Relevance

The architecture should not prevent future localization.

The product should be capable of supporting learning content and opportunity context that varies by location.

The initial proof of concept may use English as its primary language.

Multilingual content, translation workflows, and local opportunity datasets should not be implemented prematurely unless required by the selected product scope.

---

## 19. External Product Constraint: Andela Capstone

The AI Engineering Competency Lab is not defined by the Andela capstone brief.

The Andela capstone is treated as an external product constraint and validation context.

The current architecture is compatible with the brief's emphasis on:

- sustained engagement in learning
- guidance and pathways
- connection between learning and opportunity
- credible learning resources
- accessibility and inclusion
- low-bandwidth considerations
- privacy and security
- personalization without exclusion
- localization and local relevance

The Lab should not be redesigned solely to satisfy the capstone.

Where the capstone requirements align with the Lab's existing product goals, they should inform design constraints and proof-of-concept scope.

---

## 20. AI in the Product

AI-assisted software development is part of the project development workflow.

The use of AI during development does not automatically mean that the learner-facing product must be an AI chatbot or AI tutor.

Any learner-facing AI capability must solve a defined product problem and have an explicit architectural decision.

AI-generated output must not bypass the platform's validation, security, assessment, or evidence boundaries.

---

## 21. Testing Architecture

Testing is layered according to system responsibility.

### Unit tests

**Vitest**

Used for application logic and isolated units.

### React tests

**React Testing Library**

Used to verify observable React behavior and user interactions.

### API tests

**Supertest**

Used to exercise HTTP/API behavior.

### End-to-end tests

**Playwright**

Used to verify complete browser workflows.

The preferred progression is:

```text
Unit
  ↓
Component / UI behavior
  ↓
API
  ↓
End-to-End
```

Not every implementation detail requires an end-to-end test.

---

## 22. Deployment and Infrastructure Boundary

Local infrastructure uses Docker for PostgreSQL and related infrastructure as required.

The application architecture should remain deployable without coupling application code to a specific local development environment.

Infrastructure configuration belongs under:

```text
infrastructure/
└── docker/
```

Production deployment architecture is intentionally deferred until deployment requirements are established.

---

## 23. Error Handling

Errors should be handled at the appropriate layer.

```text
Database / Infrastructure Error
          ↓
Repository
          ↓
Application Service
          ↓
Controller / API Error Boundary
          ↓
Structured API Response
          ↓
Frontend Error State
```

Internal implementation details and sensitive infrastructure information should not be exposed directly to clients.

User-facing errors should be understandable and actionable where practical.

---

## 24. Observability

The initial proof of concept should maintain sufficient logging and diagnostics to support development and troubleshooting.

Observability should not introduce a large monitoring stack prematurely.

As the system grows, structured logging, metrics, tracing, and operational monitoring may be introduced through explicit architectural decisions.

---

## 25. Extensibility

The architecture should allow future evolution in areas such as:

- additional competency frameworks
- additional learning pathways
- additional assessment methods
- richer evidence types
- additional opportunity categories
- localization
- offline capabilities
- richer analytics
- learner-facing AI capabilities
- external learning-resource integrations

Extensibility should not be implemented through speculative abstraction.

Future requirements should be introduced when they become real product needs.

---

## 26. Initial Proof-of-Concept Boundary

The first meaningful vertical slice should demonstrate the central value proposition rather than the entire future platform.

A suitable conceptual slice is:

```text
Learner
  ↓
Competency / Learning Path
  ↓
Learning Resource
  ↓
Engineering Challenge
  ↓
Evidence
  ↓
Assessment
  ↓
Demonstrated Competence
  ↓
Progress / Gap
  ↓
Next Step
  ↓
Opportunity / Pathway
```

The implementation should use the smallest realistic set of screens, API operations, contracts, and persistence required to demonstrate this flow.

The exact slice will be defined in the product requirements and implementation planning documents.

---

## 27. Architectural Boundaries

The following boundaries are mandatory unless explicitly changed through an ADR:

### Frontend

React components do not access PostgreSQL directly.

### API

HTTP controllers do not own business rules.

### Services

Application services do not become generic utility containers.

### Repositories

Repositories do not become business-rule containers.

### Shared package

`packages/shared` does not become a dumping ground for application code.

### Database

Database-specific concerns remain behind the data-access boundary.

### AI

AI-assisted development does not override architecture, security, validation, testing, or documented engineering decisions.

---

## 28. Decision and Change Management

Significant architectural changes should be documented through Architecture Decision Records in:

```text
docs/ADR/
```

An ADR should be considered when a decision changes:

- technology stack
- application boundaries
- database strategy
- shared contract strategy
- authentication architecture
- infrastructure architecture
- significant product/system behavior with architectural consequences

The architecture document should be updated when an accepted decision materially changes the system.

---

## 29. Current Architectural Status

The following decisions are approved at the current stage:

- pnpm monorepo
- React + Vite + TypeScript frontend
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Node + Express + TypeScript backend
- PostgreSQL
- Docker for local PostgreSQL
- shared contracts in `packages/shared`
- Vitest
- React Testing Library
- Supertest
- Playwright
- modular monolith architecture
- explicit application/service/repository boundaries
- AI-assisted development governed by `AGENTS.md`

The architecture remains intentionally open for decisions that depend on detailed product requirements or implementation evidence.

---

## 30. Next Architecture Activities

Following review and approval of this document:

1. Create the initial Architecture Decision Records.
2. Establish the shared-contract package.
3. Define the first concrete product/domain contracts.
4. Scaffold the React/Vite application.
5. Establish the shadcn/ui and Tailwind foundation.
6. Establish React Hook Form and Zod conventions.
7. Scaffold the Express API.
8. Establish the PostgreSQL/Docker foundation.
9. Implement the first Web → API → PostgreSQL health path.
10. Establish the testing foundation.

These activities should proceed through small, reviewable Git checkpoints.

## Assignment 002A implementation boundary (10 October 2026)

The Express composition root uses PostgreSQL repositories and attempt services.
Controllers validate shared Zod contracts and translate HTTP; services authorize
attempt access, enforce expiration/stages, and coordinate transactional evidence.
Repositories own parameterized SQL and locked atomic persistence. Parser and
interpreter code stays API-local; shared packages expose public contracts only.

Dedicated Docker databases are `synvora_dev` and `synvora_test`, with separate
containers/volumes/credentials. Explicit migrations precede API startup. Attempt
secrets, seven-day expiry, migration history, and bounded expression behavior are
documented in ADR-011–013. The cleanup schedule is documented but not installed.
Report generation/endpoints and frontend implementation belong to later assignments.
