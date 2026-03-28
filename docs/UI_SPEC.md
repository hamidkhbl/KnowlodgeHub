# KnowledgeHub - UI Specification

## 1. UI Overview

The frontend is an Angular single-page application (SPA) for managing organizations, users, departments, and knowledge articles.

The UI should be:
- clean
- simple
- practical
- easy to automate

The UI is not intended to be visually fancy for MVP.

---

## 2. Main Navigation

Authenticated users should see a left sidebar or equivalent navigation with:

- Dashboard
- Users
- Departments
- Articles
- Logout

### Visibility Rules
- Employees should NOT see admin-only sections like Users and Departments management if not allowed
- Navigation should reflect role-based access

---

## 3. Public Pages

## 3.1 Register Page
### Route
`/register`

### Purpose
Allow a new organization to register and create its first admin user.

### Form Fields
- Organization Name
- Organization Slug
- Admin Name
- Admin Email
- Password
- Submit button

### Behavior
- On success, user is logged in automatically and redirected to Dashboard
- Validation errors should be shown clearly

---

## 3.2 Login Page
### Route
`/login`

### Purpose
Allow existing users to log in.

### Form Fields
- Email
- Password
- Submit button

### Behavior
- On success, redirect to Dashboard
- On failure, show error message

---

## 4. Private Pages

## 4.1 Dashboard
### Route
`/dashboard`

### Purpose
Show a high-level overview of organization data.

### Content
- Total users
- Total departments
- Total articles

Optional:
- Recent articles

---

## 4.2 Users Page
### Route
`/users`

### Access
ORG_ADMIN only

### Purpose
Allow admins to view and create users.

### Content
- Users table
- Create user form or modal

### Users Table Columns
- Name
- Email
- Role
- Department

### Create User Form Fields
- Name
- Email
- Password
- Role
- Department dropdown
- Submit button

---

## 4.3 Departments Page
### Route
`/departments`

### Access
ORG_ADMIN only

### Purpose
Allow admins to view and create departments.

### Content
- Department list/table
- Create department form

### Create Department Form Fields
- Name
- Submit button

---

## 4.4 Articles List Page
### Route
`/articles`

### Access
All authenticated users

### Purpose
Allow users to browse, search, and filter knowledge articles.

### Content
- Search box
- Status filter
- Department filter
- Create article button
- Articles list/table/cards

### Article List Fields
- Title
- Status
- Department
- Author
- Created Date

---

## 4.5 Create Article Page
### Route
`/articles/new`

### Access
All authenticated users

### Purpose
Allow users to create a new article.

### Form Fields
- Title
- Content
- Tags
- Status (DRAFT / PUBLISHED)
- Department dropdown
- Save button

---

## 4.6 Article Details Page
### Route
`/articles/:id`

### Access
All authenticated users with access to the article

### Purpose
Display a full article.

### Content
- Title
- Content
- Tags
- Status
- Department
- Author
- Edit button (if allowed)
- Delete button (if allowed)

---

## 4.7 Edit Article Page
### Route
`/articles/:id/edit`

### Access
Only users with edit permission

### Purpose
Allow editing an existing article.

### Form Fields
Same as create article page

---

## 5. Shared Components

Suggested reusable components:

- Sidebar / Navigation
- Header
- Loading Spinner
- Empty State
- Error Message Alert
- Confirm Delete Dialog
- Search Input
- Role Badge
- Status Badge

---

## 6. Form Behavior

All forms should:
- use Angular Reactive Forms
- show validation errors
- disable submit while invalid
- display backend error messages clearly

---

## 7. Automation-Friendly UI Rules

This UI is intended to support automation.

### Requirements
- Use stable `data-testid` attributes where possible
- Avoid dynamic/random element IDs
- Keep layouts predictable
- Use consistent button labels

### Example test IDs
- `login-email`
- `login-password`
- `login-submit`
- `create-user-submit`
- `article-search-input`

These will help future Playwright/UI automation.

---

## 8. MVP UI Scope Rules

The UI should remain intentionally simple.

Do NOT include:
- advanced dashboards
- charts
- drag-and-drop
- rich text editors
- complex modals everywhere
- animation-heavy UX

Focus on clarity and testability.
