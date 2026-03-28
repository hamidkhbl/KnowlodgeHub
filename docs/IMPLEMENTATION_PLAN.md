# KnowledgeHub - Implementation Plan

## 1. Goal

This plan breaks implementation into manageable phases so the app can be built incrementally and cleanly.

This plan should be followed when using Claude CLI.

Important:
Implement **one phase or one feature at a time**.
Do NOT attempt to build the full system in one prompt.

---

## 2. Phase 1 - Backend Foundation

### Goal
Create the FastAPI backend skeleton and authentication foundation.

### Tasks
- Initialize FastAPI project
- Setup SQLAlchemy database connection
- Create database models:
  - Organization
  - User
  - Department
  - Article
- Setup Pydantic schemas
- Setup JWT authentication utilities
- Implement password hashing
- Implement auth endpoints:
  - register organization
  - login
  - current user

### Deliverable
A working backend that supports registration and login.

---

## 3. Phase 2 - Backend Core Features

### Goal
Implement the main business entities and tenant isolation.

### Tasks
- Implement user endpoints
- Implement department endpoints
- Implement article endpoints
- Enforce role-based access
- Enforce tenant isolation in all queries
- Add filtering/search for articles

### Deliverable
A complete MVP backend API.

---

## 4. Phase 3 - Backend Testability

### Goal
Add deterministic testing/demo support.

### Tasks
- Implement reset database endpoint
- Implement seed demo data endpoint
- Add clear error handling
- Add stable response shapes

### Deliverable
A backend ready for automation and demos.

---

## 5. Phase 4 - Frontend Foundation

### Goal
Create the Angular app shell and auth flow.

### Tasks
- Initialize Angular app
- Setup routing
- Setup auth service
- Setup auth interceptor
- Setup auth guard
- Build login page
- Build register page
- Build protected layout / sidebar

### Deliverable
A working Angular app with authentication flow.

---

## 6. Phase 5 - Frontend Core Features

### Goal
Implement the main application pages.

### Tasks
- Build dashboard page
- Build users page
- Build departments page
- Build articles list page
- Build article details page
- Build create/edit article pages

### Deliverable
A working end-to-end MVP UI.

---

## 7. Phase 6 - UI Polish for Automation

### Goal
Make the UI stable and automation-friendly.

### Tasks
- Add `data-testid` attributes
- Improve validation messages
- Standardize loading/error states
- Ensure role-based UI visibility is consistent

### Deliverable
A UI suitable for Playwright automation later.

---

## 8. Recommended Claude CLI Workflow

## Good Workflow
1. Read the relevant docs
2. Implement one feature only
3. Review generated code
4. Run locally
5. Fix issues
6. Move to next feature

### Example Feature Sequence
1. Auth backend
2. Users backend
3. Departments backend
4. Articles backend
5. Test endpoints
6. Angular auth
7. Angular dashboard
8. Angular users
9. Angular departments
10. Angular articles

---

## 9. Important Constraints

### Do
- build incrementally
- keep changes scoped
- follow docs as source of truth

### Do Not
- build the whole app in one step
- add extra features outside scope
- refactor unrelated files unless needed
- introduce advanced complexity early

---

## 10. Definition of MVP Done

The MVP is done when:

- organization registration works
- login works
- current user works
- admins can create users
- admins can create departments
- users can create and manage articles
- article search/filter works
- tenant isolation is enforced
- reset/seed endpoints work
- Angular UI can perform all major flows
