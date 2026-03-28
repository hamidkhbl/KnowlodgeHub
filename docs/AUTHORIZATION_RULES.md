# KnowledgeHub - Authorization Rules

## 1. Overview

KnowledgeHub uses role-based access control (RBAC) within each organization.

Roles:
- ORG_ADMIN
- MANAGER
- EMPLOYEE

Authorization must always be enforced in the backend.

Frontend visibility should reflect permissions, but frontend checks are NOT sufficient for security.

---

## 2. Tenant Isolation Rule (Critical)

Every authenticated user belongs to exactly one organization.

### Critical Security Rule
A user must never be able to:
- view another organization’s users
- view another organization’s departments
- view another organization’s articles
- modify another organization’s data
- delete another organization’s data

This rule overrides all role permissions.

---

## 3. Role Definitions

## 3.1 ORG_ADMIN

### Can
- view all users in organization
- create users
- view all departments in organization
- create departments
- view all articles in organization
- create articles
- edit any article in organization
- delete any article in organization

### Cannot
- access another organization’s data

---

## 3.2 MANAGER

### Can
- view all departments in organization
- view all visible articles in organization
- create articles
- edit any article in organization
- delete any article in organization

### Cannot
- create users
- create departments
- access another organization’s data

---

## 3.3 EMPLOYEE

### Can
- view departments in organization
- view published articles in organization
- create articles
- edit own articles
- delete own articles

### Cannot
- create users
- create departments
- edit other users’ articles
- delete other users’ articles
- access another organization’s data

---

## 4. Resource-Level Rules

## 4.1 Users
### ORG_ADMIN
- can list users
- can create users

### MANAGER
- cannot list users
- cannot create users

### EMPLOYEE
- cannot list users
- cannot create users

---

## 4.2 Departments
### ORG_ADMIN
- can list departments
- can create departments

### MANAGER
- can list departments
- cannot create departments

### EMPLOYEE
- can list departments
- cannot create departments

---

## 4.3 Articles
### ORG_ADMIN
- can view all articles in organization
- can create articles
- can edit any article in organization
- can delete any article in organization

### MANAGER
- can view all articles in organization
- can create articles
- can edit any article in organization
- can delete any article in organization

### EMPLOYEE
- can view published articles in organization
- can create articles
- can edit own articles only
- can delete own articles only

---

## 5. Recommended Backend Enforcement

Backend should enforce authorization using:
- authenticated current user
- user role
- organization_id
- resource ownership where applicable

Examples:
- article ownership for EMPLOYEE
- organization match for all resources

---

## 6. Recommended API Error Behavior

### Unauthenticated
Return:
- `401 Unauthorized`

### Authenticated but forbidden
Return:
- `403 Forbidden`

### Cross-tenant access attempts
Recommended:
- `404 Not Found` for resource fetches
- `403 Forbidden` for explicit forbidden actions

Be consistent across the codebase.

---

## 7. Frontend Authorization Behavior

Frontend should hide inaccessible UI elements, such as:
- Users menu for non-admins
- Departments creation for non-admins
- Edit/Delete buttons when not allowed

However:
### Important
Frontend visibility is only for UX.
Backend authorization is the real security layer.
