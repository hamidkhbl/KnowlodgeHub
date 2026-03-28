# KnowledgeHub - Error Handling Specification

## 1. Goal

This document defines consistent API error behavior for the MVP.

The backend should return predictable status codes and clear JSON error responses.

This consistency is important for:
- frontend behavior
- debugging
- automation testing

---

## 2. General Response Shape

Recommended error shape:

```json
{
  "detail": "Human-readable error message"
}
```

FastAPI default behavior is acceptable if kept consistent.

---

## 3. Standard Status Codes

## 400 Bad Request
Use when:
- request is syntactically valid but logically invalid

Examples:
- malformed filter combinations
- invalid operation state

---

## 401 Unauthorized
Use when:
- token is missing
- token is invalid
- login credentials are invalid

Examples:
- bad email/password
- expired or malformed JWT

---

## 403 Forbidden
Use when:
- user is authenticated but not allowed to perform the action

Examples:
- employee trying to create a user
- employee trying to edit another employee’s article

---

## 404 Not Found
Use when:
- requested resource does not exist
- requested resource is outside accessible scope

Examples:
- article ID does not exist
- cross-tenant article lookup should often appear as not found

---

## 409 Conflict
Use when:
- unique or conflict-based business rule is violated

Examples:
- duplicate organization slug
- duplicate user email
- duplicate department name within same organization

---

## 422 Unprocessable Entity
Use when:
- request validation fails

Examples:
- missing required fields
- invalid email format
- invalid enum value

This should be handled by FastAPI/Pydantic where possible.

---

## 4. Recommended Error Cases by Feature

## Authentication
### Register Organization
- 409 duplicate organization slug
- 409 duplicate email
- 422 invalid payload

### Login
- 401 invalid credentials
- 422 invalid payload

### Current User
- 401 missing/invalid token

---

## Users
### Get Users
- 401 unauthenticated
- 403 forbidden

### Create User
- 401 unauthenticated
- 403 forbidden
- 409 duplicate email
- 422 invalid payload

---

## Departments
### Get Departments
- 401 unauthenticated

### Create Department
- 401 unauthenticated
- 403 forbidden
- 409 duplicate name in same organization
- 422 invalid payload

---

## Articles
### Get Articles
- 401 unauthenticated

### Get Article By ID
- 401 unauthenticated
- 404 not found / inaccessible

### Create Article
- 401 unauthenticated
- 422 invalid payload

### Update Article
- 401 unauthenticated
- 403 forbidden
- 404 not found

### Delete Article
- 401 unauthenticated
- 403 forbidden
- 404 not found

---

## 5. Frontend Expectations

Frontend should:
- show user-friendly error messages
- not expose raw stack traces
- handle 401 by redirecting to login where appropriate
- handle 403 with permission messaging where appropriate

---

## 6. Logging Guidance

For MVP:
- log errors on backend console for development
- do not expose internal exception traces in API responses

Keep backend logs useful for debugging but keep API responses clean.
