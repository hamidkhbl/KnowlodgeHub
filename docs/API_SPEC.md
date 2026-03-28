# KnowledgeHub - API Specification

## 1. API Overview

The backend exposes a REST API for authentication, organization management, user management, department management, and article management.

Base path:
`/api`

All authenticated endpoints use JWT Bearer authentication unless stated otherwise.

---

## 2. Authentication Endpoints

## 2.1 Register Organization

### Endpoint
`POST /api/auth/register-organization`

### Purpose
Create a new organization and its first ORG_ADMIN user.

### Auth Required
No

### Request Body
```json
{
  "organizationName": "Acme Corp",
  "organizationSlug": "acme",
  "adminName": "Hamid Admin",
  "adminEmail": "admin@acme.com",
  "password": "Password123!"
}
```

### Success Response
```json
{
  "message": "Organization created successfully",
  "organization": {
    "id": 1,
    "name": "Acme Corp",
    "slug": "acme"
  },
  "user": {
    "id": 1,
    "name": "Hamid Admin",
    "email": "admin@acme.com",
    "role": "ORG_ADMIN"
  },
  "access_token": "jwt-token",
  "token_type": "bearer"
}
```

### Error Cases
- 409 if organization slug already exists
- 409 if email already exists
- 422 if validation fails

---

## 2.2 Login

### Endpoint
`POST /api/auth/login`

### Purpose
Authenticate a user and return a JWT token.

### Auth Required
No

### Request Body
```json
{
  "email": "admin@acme.com",
  "password": "Password123!"
}
```

### Success Response
```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "Hamid Admin",
    "email": "admin@acme.com",
    "role": "ORG_ADMIN",
    "organization_id": 1
  }
}
```

### Error Cases
- 401 if credentials are invalid
- 422 if validation fails

---

## 2.3 Get Current User

### Endpoint
`GET /api/auth/me`

### Purpose
Return the currently authenticated user.

### Auth Required
Yes

### Success Response
```json
{
  "id": 1,
  "name": "Hamid Admin",
  "email": "admin@acme.com",
  "role": "ORG_ADMIN",
  "organization_id": 1,
  "department_id": null
}
```

### Error Cases
- 401 if token is invalid or missing

---

## 3. User Endpoints

## 3.1 Get Users

### Endpoint
`GET /api/users`

### Purpose
Return all users for the current user’s organization.

### Auth Required
Yes

### Allowed Roles
- ORG_ADMIN

### Success Response
```json
[
  {
    "id": 1,
    "name": "Hamid Admin",
    "email": "admin@acme.com",
    "role": "ORG_ADMIN",
    "department_id": null,
    "organization_id": 1
  }
]
```

### Error Cases
- 401 unauthorized
- 403 forbidden

---

## 3.2 Create User

### Endpoint
`POST /api/users`

### Purpose
Create a new user in the current organization.

### Auth Required
Yes

### Allowed Roles
- ORG_ADMIN

### Request Body
```json
{
  "name": "Sarah",
  "email": "sarah@acme.com",
  "password": "Password123!",
  "role": "EMPLOYEE",
  "department_id": 1
}
```

### Success Response
```json
{
  "id": 2,
  "name": "Sarah",
  "email": "sarah@acme.com",
  "role": "EMPLOYEE",
  "department_id": 1,
  "organization_id": 1
}
```

### Error Cases
- 403 forbidden
- 409 duplicate email
- 422 validation failure

---

## 4. Department Endpoints

## 4.1 Get Departments

### Endpoint
`GET /api/departments`

### Purpose
Return all departments for the current organization.

### Auth Required
Yes

### Allowed Roles
- ORG_ADMIN
- MANAGER
- EMPLOYEE

### Success Response
```json
[
  {
    "id": 1,
    "name": "Engineering",
    "organization_id": 1
  }
]
```

---

## 4.2 Create Department

### Endpoint
`POST /api/departments`

### Purpose
Create a department in the current organization.

### Auth Required
Yes

### Allowed Roles
- ORG_ADMIN

### Request Body
```json
{
  "name": "Engineering"
}
```

### Success Response
```json
{
  "id": 1,
  "name": "Engineering",
  "organization_id": 1
}
```

### Error Cases
- 403 forbidden
- 409 duplicate department name within organization
- 422 validation failure

---

## 5. Article Endpoints

## 5.1 Get Articles

### Endpoint
`GET /api/articles`

### Purpose
Return articles visible to the current user within their organization.

### Auth Required
Yes

### Allowed Roles
- ORG_ADMIN
- MANAGER
- EMPLOYEE

### Query Parameters
- `q` → keyword search in title/content
- `status` → DRAFT or PUBLISHED
- `department_id` → filter by department

### Example
`GET /api/articles?q=onboarding&status=PUBLISHED&department_id=1`

### Success Response
```json
[
  {
    "id": 1,
    "title": "VPN Access Setup",
    "content": "Step-by-step VPN setup instructions...",
    "tags": "vpn,it,onboarding",
    "status": "PUBLISHED",
    "department_id": 1,
    "author_id": 1,
    "organization_id": 1
  }
]
```

---

## 5.2 Get Article By ID

### Endpoint
`GET /api/articles/{id}`

### Purpose
Return a single article visible to the current user.

### Auth Required
Yes

### Allowed Roles
- ORG_ADMIN
- MANAGER
- EMPLOYEE

### Error Cases
- 404 if article not found or not accessible

---

## 5.3 Create Article

### Endpoint
`POST /api/articles`

### Purpose
Create a knowledge article in the current organization.

### Auth Required
Yes

### Allowed Roles
- ORG_ADMIN
- MANAGER
- EMPLOYEE

### Request Body
```json
{
  "title": "VPN Access Setup",
  "content": "Step-by-step VPN setup instructions...",
  "tags": "vpn,it,onboarding",
  "status": "PUBLISHED",
  "department_id": 1
}
```

### Success Response
```json
{
  "id": 1,
  "title": "VPN Access Setup",
  "content": "Step-by-step VPN setup instructions...",
  "tags": "vpn,it,onboarding",
  "status": "PUBLISHED",
  "department_id": 1,
  "author_id": 1,
  "organization_id": 1
}
```

---

## 5.4 Update Article

### Endpoint
`PUT /api/articles/{id}`

### Purpose
Update an existing article.

### Auth Required
Yes

### Allowed Roles
- ORG_ADMIN
- MANAGER
- EMPLOYEE (own articles only)

### Request Body
```json
{
  "title": "Updated VPN Access Setup",
  "content": "Updated instructions...",
  "tags": "vpn,it,onboarding",
  "status": "PUBLISHED",
  "department_id": 1
}
```

### Error Cases
- 403 forbidden
- 404 not found

---

## 5.5 Delete Article

### Endpoint
`DELETE /api/articles/{id}`

### Purpose
Delete an article.

### Auth Required
Yes

### Allowed Roles
- ORG_ADMIN
- MANAGER
- EMPLOYEE (own articles only)

### Success Response
```json
{
  "message": "Article deleted successfully"
}
```

### Error Cases
- 403 forbidden
- 404 not found

---

## 6. Test Support Endpoints

These endpoints are for local/test use only.

## 6.1 Reset Database

### Endpoint
`POST /api/test/reset`

### Purpose
Reset the database to an empty baseline.

### Auth Required
No (local/test only)

### Success Response
```json
{
  "message": "Database reset successfully"
}
```

---

## 6.2 Seed Demo Data

### Endpoint
`POST /api/test/seed`

### Purpose
Seed deterministic demo data for testing and demos.

### Auth Required
No (local/test only)

### Success Response
```json
{
  "message": "Demo data seeded successfully"
}
```

---

## 7. General API Rules

- All authenticated endpoints require Bearer token
- All organization-scoped data must be filtered by current user’s `organization_id`
- Responses should be JSON
- Validation should be handled via Pydantic
- Forbidden actions should return proper HTTP status codes
