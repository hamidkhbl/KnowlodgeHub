# KnowledgeHub - Product Requirements Document (PRD)

## 1. Product Overview

KnowledgeHub is a multi-tenant Knowledge Management System (KMS) where organizations can register, create internal users, organize departments, and manage internal knowledge articles.

The application is intended to serve as:
1. A realistic SaaS-style application
2. An Application Under Test (AUT) for showcasing UI and API automation skills

---

## 2. MVP Goal

The MVP should support the following:

- Organization registration
- Authentication (login / current user)
- Multi-tenant isolation
- User management
- Department management
- Knowledge article management
- Search and filtering for articles
- Role-based access control

The MVP should be simple, clean, and testable.

---

## 3. Target Users

### 3.1 ORG_ADMIN
A company administrator who manages users, departments, and all knowledge content in their organization.

### 3.2 MANAGER
A manager-level user who can manage knowledge content within the organization.

### 3.3 EMPLOYEE
A regular employee who can create and manage their own knowledge content and view published content within the organization.

---

## 4. Core User Stories

### Organization & Authentication
- As a new company, I want to register my organization and create the first admin account.
- As a user, I want to log in and access my organization’s knowledge portal.
- As a logged-in user, I want the system to know who I am and what role I have.

### User Management
- As an org admin, I want to create users for my organization.
- As an org admin, I want to assign roles to users.
- As an org admin, I want to assign users to departments.

### Department Management
- As an org admin, I want to create departments such as Engineering, HR, or Sales.
- As an org admin, I want users and articles to be associated with departments.

### Knowledge Management
- As a user, I want to create a knowledge article.
- As a user, I want to edit my article.
- As an admin or manager, I want to manage organization articles.
- As a user, I want to search and filter articles.

### Multi-Tenancy
- As a company, I want my data to be isolated from all other organizations.

---

## 5. MVP Features In Scope

### Authentication
- Register organization + first admin
- Login
- Get current logged-in user

### Multi-Tenant Organization Support
- Each organization is isolated
- Users only access data from their own organization

### User Management
- Create users
- List users
- Assign roles
- Assign department

### Department Management
- Create departments
- List departments

### Knowledge Articles
- Create article
- List articles
- View article details
- Edit article
- Delete article
- Search/filter by keyword, status, department

### Testability Features
- Reset database endpoint
- Seed demo data endpoint

---

## 6. Out of Scope for MVP

The following are intentionally excluded from MVP:

- Comments on articles
- Notifications
- File uploads / attachments
- Rich text editor
- SSO / OAuth / LDAP
- Audit logs
- Analytics dashboards
- Article version history
- Email invitations
- Teams / sub-organizations
- Public sharing
- Mobile app

These may be considered in future versions but must NOT be included in MVP.

---

## 7. Success Criteria

The MVP is considered successful if it allows:

1. A company to register and create its first admin
2. Admins to create users and departments
3. Users to create and manage articles
4. Articles to be searchable and filterable
5. Tenant isolation to be enforced correctly
6. The app to be stable enough for UI and API automation

---

## 8. Non-Functional Priorities

The MVP should prioritize:

- Simplicity
- Clean architecture
- Readability
- Testability
- Predictable behavior
- Maintainability

The MVP does NOT need enterprise-scale performance optimization.
