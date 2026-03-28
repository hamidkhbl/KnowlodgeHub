# KnowledgeHub - Architecture Document

## 1. Architecture Overview

KnowledgeHub is a multi-tenant web application with:

- Angular frontend (SPA)
- FastAPI backend (REST API)
- SQLite database for MVP
- JWT-based authentication

The application is intentionally designed to be simple, modular, and testable.

---

## 2. Tech Stack

## Frontend
- Angular
- Angular Router
- Angular Reactive Forms
- Angular HttpClient
- Angular route guards
- Angular interceptors

Optional:
- Angular Material

## Backend
- Python 3.12+
- FastAPI
- SQLAlchemy ORM
- Pydantic
- JWT authentication
- bcrypt / passlib for password hashing

## Database
- SQLite (MVP)
- SQLAlchemy ORM used for persistence

---

## 3. High-Level Architecture

Angular SPA
↓
HTTP / JSON
↓
FastAPI REST API
↓
SQLite Database

---

## 4. Architectural Principles

The system must follow these principles:

- Keep the MVP simple
- Prefer readability over cleverness
- Build for testability
- Separate concerns clearly
- Keep backend route handlers thin
- Keep business logic in service layers
- Use typed request/response schemas
- Avoid unnecessary abstraction

---

## 5. Multi-Tenancy Strategy

The application uses a **shared database multi-tenant model**.

### Strategy
Each organization is identified by `organization_id`.

The following entities must always belong to an organization:
- users
- departments
- articles

### Enforcement
Every backend query must enforce tenant scoping using the current authenticated user’s `organization_id`.

### Rule
No user should ever be able to access data from another organization.

This is a critical security and testing requirement.

---

## 6. Authentication Strategy

Authentication uses **JWT Bearer tokens**.

### Flow
1. User logs in
2. Backend validates credentials
3. Backend issues JWT token
4. Frontend stores token
5. Frontend sends token on future requests
6. Backend extracts current user from token

### Token Storage
For MVP, the frontend may store the token in localStorage.

---

## 7. Backend Architecture Pattern

Backend should follow this layered approach:

- `routes/` → HTTP layer
- `schemas/` → request/response validation
- `models/` → database models
- `services/` → business logic
- `core/` → config, DB, auth utilities

### Goal
Keep route handlers thin and keep business logic outside the routes.

---

## 8. Frontend Architecture Pattern

Frontend should use a feature-based Angular structure.

Suggested areas:
- auth
- dashboard
- users
- departments
- articles

Core/shared functionality should be separated:
- services
- guards
- interceptors
- shared UI components

---

## 9. Testability Design

The application is intentionally designed to support automation.

### Requirements
- predictable API behavior
- stable selectors in frontend
- deterministic demo data
- resettable test environment
- clear role-based access behavior

### Special Support Endpoints
The backend must include:
- database reset endpoint
- seed data endpoint

These are only for local/test usage.

---

## 10. Deployment Scope

For MVP, local development is the priority.

The application should run locally with:
- frontend on Angular dev server
- backend on FastAPI dev server
- SQLite as local DB

Production deployment is not required for MVP.
