# KnowledgeHub - Coding Conventions

## 1. Goal

These conventions exist to keep the codebase:

- consistent
- readable
- maintainable
- easy to extend
- easy to test

Claude or any AI coding assistant must follow these conventions.

---

## 2. General Principles

- Prefer clarity over cleverness
- Keep files focused
- Keep functions reasonably small
- Avoid unnecessary abstraction
- Avoid overengineering
- Do not add features outside MVP scope
- Write production-style but simple code

---

## 3. Backend Conventions (FastAPI / Python)

## 3.1 Structure
Backend should be organized by concern:

- `models/` for SQLAlchemy ORM models
- `schemas/` for Pydantic schemas
- `routes/` for FastAPI routers
- `services/` for business logic
- `core/` for shared infrastructure

## 3.2 Route Handlers
Route handlers should:
- be thin
- delegate logic to services
- validate input with Pydantic
- return clean JSON responses

## 3.3 Services
Business logic should live in service functions/classes.

Examples:
- auth logic
- tenant isolation checks
- article permission checks
- user creation logic

## 3.4 Naming
Use `snake_case` in Python.

Examples:
- `create_user`
- `get_current_user`
- `organization_id`

## 3.5 ORM Usage
Use SQLAlchemy ORM consistently.
Do not mix raw SQL unless absolutely necessary.

## 3.6 Validation
Use Pydantic schemas for:
- request validation
- response serialization

## 3.7 Error Handling
Use FastAPI `HTTPException` or centralized helpers.
Return meaningful status codes and error messages.

---

## 4. Frontend Conventions (Angular)

## 4.1 Structure
Use feature-based organization.

Suggested areas:
- auth
- dashboard
- users
- departments
- articles

Shared/core code should be separated.

## 4.2 Angular Forms
Use **Reactive Forms** for all forms.

Do not use template-driven forms for MVP.

## 4.3 Services
Use Angular services for all backend API communication.

Do not put HTTP calls directly inside components.

## 4.4 Guards / Interceptors
Use:
- route guards for auth protection
- HTTP interceptor for JWT token injection

## 4.5 Naming
Use `camelCase` for variables and methods in TypeScript.

Examples:
- `createUser`
- `currentUser`
- `departmentId`

Use kebab-case for filenames where appropriate.

Examples:
- `auth.service.ts`
- `article-list.component.ts`

## 4.6 Component Responsibility
Components should:
- manage UI state
- delegate API logic to services
- avoid excessive business logic

---

## 5. API Conventions

- Use REST-style routes
- Use plural resource names where practical
- Return JSON only
- Use standard HTTP status codes
- Keep response shapes consistent

Examples:
- `/api/users`
- `/api/departments`
- `/api/articles`

---

## 6. Database Conventions

- Use integer primary keys for MVP
- Use `created_at` and `updated_at` timestamps
- Use foreign keys for relationships
- Enforce organization ownership through `organization_id`

---

## 7. UI / Testability Conventions

This app is intended to support automation.

### Required
- Use stable selectors
- Prefer `data-testid` on important interactive elements
- Avoid random dynamic IDs
- Keep labels and button text consistent

Examples:
- `data-testid="login-email"`
- `data-testid="article-create-submit"`

---

## 8. What NOT to Do

Do NOT:
- add advanced architecture patterns unnecessarily
- introduce microservices
- add Redux/Ngrx unless explicitly required later
- add websocket features
- add file upload support
- add features outside the docs without explicit instruction

Stay inside the MVP.
