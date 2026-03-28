# CLAUDE.md

## Project Summary

This repository contains **KnowledgeHub**, a multi-tenant Knowledge Management System (KMS) built with:

- **Frontend:** Angular
- **Backend:** FastAPI (Python)
- **Database:** SQLite (MVP)

The project has two goals:

1. Build a realistic SaaS-style MVP
2. Serve as an **Application Under Test (AUT)** for showcasing **API and UI automation skills**

This project should remain intentionally **small, clean, testable, and maintainable**.

---

## Source of Truth

Always treat the following files as the source of truth for implementation decisions:

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/API_SPEC.md`
- `docs/UI_SPEC.md`
- `docs/AUTHORIZATION_RULES.md`
- `docs/CONVENTIONS.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/SEED_DATA.md`
- `docs/ERROR_HANDLING.md`

If there is any ambiguity, follow these documents rather than inventing behavior.

Do not introduce features, fields, endpoints, or UI flows that are not supported by these documents unless explicitly requested.

---

## MVP Scope Rules

Stay strictly inside MVP scope.

### Do NOT add:
- comments on articles
- notifications
- file uploads / attachments
- rich text editor
- SSO / OAuth / LDAP
- audit logs
- analytics dashboards
- article version history
- email invitations
- teams / sub-organizations
- public sharing
- mobile app
- websockets
- microservices

If a feature is not clearly in the docs, do not implement it.

---

## Architecture Rules

### Backend
Use:
- FastAPI
- SQLAlchemy ORM
- Pydantic
- JWT Bearer authentication
- service-layer business logic

Backend should be organized into:
- `core/`
- `models/`
- `schemas/`
- `api/routes/`
- `services/`

### Frontend
Use:
- Angular
- Angular Router
- Angular Reactive Forms
- Angular HttpClient
- Route Guards
- Auth Interceptor

Frontend should be organized into:
- `core/`
- `features/`
- `shared/`

---

## Multi-Tenancy Rule (Critical)

This is a **multi-tenant system**.

Tenant isolation is a **critical requirement**.

All organization-scoped records must always be filtered by the authenticated user’s `organization_id`.

This applies to:
- users
- departments
- articles

### Never implement:
- queries that return cross-tenant data
- updates that can affect another tenant’s data
- deletes that can affect another tenant’s data

If unsure, prioritize **security and tenant isolation**.

---

## Authorization Rule (Critical)

Always enforce authorization in the **backend**.

Frontend visibility is only for UX and must never be treated as security.

Use `docs/AUTHORIZATION_RULES.md` as the source of truth.

### Important examples:
- Only `ORG_ADMIN` can create users
- Only `ORG_ADMIN` can create departments
- `EMPLOYEE` can only edit/delete their own articles
- `MANAGER` and `ORG_ADMIN` can manage organization articles

If there is any conflict, backend authorization must be strict.

---

## Implementation Style

Write code that is:

- simple
- readable
- modular
- maintainable
- easy to test

### Prefer:
- explicit code
- small focused functions
- clear naming
- practical structure

### Avoid:
- clever abstractions
- unnecessary patterns
- overengineering
- premature optimization
- large speculative refactors

This is an MVP, not a framework experiment.

---

## Backend Implementation Rules

- Keep route handlers thin
- Put business logic in services
- Use Pydantic schemas for request/response validation
- Use SQLAlchemy ORM consistently
- Use `snake_case` in Python
- Return clean JSON responses
- Use proper HTTP status codes
- Follow `docs/ERROR_HANDLING.md`

Do not put large business logic directly in route handlers.

---

## Frontend Implementation Rules

- Use Angular Reactive Forms for all forms
- Use Angular services for all API calls
- Do not put HTTP calls directly inside components
- Use route guards for auth protection
- Use interceptor for JWT token injection
- Use `camelCase` in TypeScript
- Keep components focused on UI concerns

Do not introduce unnecessary frontend state libraries unless explicitly requested.

---

## UI / Testability Rules

This project is intended to support future **API and UI automation**.

### Build with testability in mind:
- predictable behavior
- stable selectors
- deterministic data
- consistent labels and flows

### Frontend expectation:
Use stable `data-testid` attributes on important interactive elements.

Examples:
- `data-testid="login-email"`
- `data-testid="login-password"`
- `data-testid="login-submit"`
- `data-testid="article-create-submit"`

Avoid random or unstable element identifiers.

---

## Test Support Requirements

The backend must support automation-friendly local testing.

Implement and preserve:
- database reset endpoint
- seed demo data endpoint

These are part of the intended design of the AUT.

Do not remove them unless explicitly instructed.

---

## Working Style for Claude

When asked to implement something:

### Always:
1. Read the relevant docs first
2. Implement only the requested phase/feature
3. Keep changes scoped
4. Avoid unrelated refactors
5. Follow existing structure and conventions

### Do NOT:
- rebuild the entire app in one pass
- modify unrelated files without reason
- introduce extra features not requested
- replace architecture choices defined in docs

---

## Preferred Build Order

Use `docs/IMPLEMENTATION_PLAN.md` as the preferred implementation sequence.

Recommended order:

1. Backend foundation
2. Backend core features
3. Backend testability
4. Frontend foundation
5. Frontend core features
6. UI polish for automation

Do not skip ahead unless explicitly requested.

---

## If Asked to Implement a Feature

Default behavior should be:

- implement the smallest correct version
- keep code production-like but simple
- preserve future extensibility without overbuilding
- align with docs and current repo structure

If something is unclear, prefer:
- consistency
- simplicity
- maintainability
- tenant safety
- testability

---

## Final Principle

This repository should feel like a **small, realistic, well-structured SaaS MVP** that is also an excellent **automation showcase project**.

When making decisions, optimize for:

- correctness
- clarity
- maintainability
- testability
- tenant isolation
- role-based security
