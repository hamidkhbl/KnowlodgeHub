# KnowledgeHub - Data Model

## 1. Overview

KnowledgeHub is a multi-tenant application. Most domain entities belong to an organization.

The core entities are:

- Organization
- User
- Department
- Article

---

## 2. Entity Definitions

## 2.1 Organization

Represents a tenant/company.

### Fields
- `id` (integer, primary key)
- `name` (string, required)
- `slug` (string, required, unique)
- `created_at` (datetime)
- `updated_at` (datetime)

### Notes
- `slug` is used as a unique organization identifier
- Example: `acme`, `globex`

---

## 2.2 User

Represents a user within an organization.

### Fields
- `id` (integer, primary key)
- `organization_id` (integer, required, foreign key)
- `department_id` (integer, nullable, foreign key)
- `name` (string, required)
- `email` (string, required, unique)
- `password_hash` (string, required)
- `role` (enum, required)
- `created_at` (datetime)
- `updated_at` (datetime)

### Role Values
- `ORG_ADMIN`
- `MANAGER`
- `EMPLOYEE`

### Notes
- Every user belongs to exactly one organization
- A user may optionally belong to a department

---

## 2.3 Department

Represents a department inside an organization.

### Fields
- `id` (integer, primary key)
- `organization_id` (integer, required, foreign key)
- `name` (string, required)
- `created_at` (datetime)
- `updated_at` (datetime)

### Notes
- Department names do not need to be globally unique
- Department should be unique per organization if practical

Examples:
- Engineering
- HR
- Sales

---

## 2.4 Article

Represents a knowledge article.

### Fields
- `id` (integer, primary key)
- `organization_id` (integer, required, foreign key)
- `department_id` (integer, nullable, foreign key)
- `author_id` (integer, required, foreign key)
- `title` (string, required)
- `content` (text, required)
- `tags` (string, optional)
- `status` (enum, required)
- `created_at` (datetime)
- `updated_at` (datetime)

### Status Values
- `DRAFT`
- `PUBLISHED`

### Notes
- `tags` may be stored as a comma-separated string for MVP
- Articles belong to exactly one organization
- Articles may optionally belong to a department
- Articles always have an author

---

## 3. Relationships

## Organization
- has many Users
- has many Departments
- has many Articles

## User
- belongs to one Organization
- may belong to one Department
- has many Articles as author

## Department
- belongs to one Organization
- has many Users
- has many Articles

## Article
- belongs to one Organization
- belongs to one User as author
- may belong to one Department

---

## 4. Tenant Isolation Rules

The following entities must always be scoped by `organization_id`:
- users
- departments
- articles

### Critical Rule
A user must never access or mutate records belonging to another organization.

This applies to:
- API queries
- update operations
- delete operations
- frontend visibility

---

## 5. Recommended Validation Rules

## Organization
- `name` required
- `slug` required
- `slug` unique

## User
- `name` required
- `email` required
- `email` valid format
- `email` unique
- `password_hash` required
- `role` required

## Department
- `name` required

## Article
- `title` required
- `content` required
- `status` required

---

## 6. Future Extension Notes (Not MVP)

Potential future entities:
- ArticleComment
- AuditLog
- Notification
- Attachment
- Tag (normalized)
- Team / Group

These should NOT be implemented in MVP.
