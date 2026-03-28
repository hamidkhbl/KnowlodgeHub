# KnowledgeHub - Seed Data Specification

## 1. Goal

This file defines deterministic demo data for local development, testing, demos, and future automation.

The seed data should always be predictable.

---

## 2. Organizations

## Organization 1
- Name: `Acme Corp`
- Slug: `acme`

## Organization 2
- Name: `Globex`
- Slug: `globex`

---

## 3. Departments

## Acme Corp Departments
- Engineering
- HR
- Sales

## Globex Departments
- Engineering
- Support

---

## 4. Users

## Acme Corp Users

### ORG_ADMIN
- Name: `Acme Admin`
- Email: `admin@acme.com`
- Password: `Password123!`
- Role: `ORG_ADMIN`

### MANAGER
- Name: `Acme Manager`
- Email: `manager@acme.com`
- Password: `Password123!`
- Role: `MANAGER`

### EMPLOYEE
- Name: `Acme Employee`
- Email: `employee@acme.com`
- Password: `Password123!`
- Role: `EMPLOYEE`

---

## Globex Users

### ORG_ADMIN
- Name: `Globex Admin`
- Email: `admin@globex.com`
- Password: `Password123!`
- Role: `ORG_ADMIN`

### EMPLOYEE
- Name: `Globex Employee`
- Email: `employee@globex.com`
- Password: `Password123!`
- Role: `EMPLOYEE`

---

## 5. Articles

## Acme Corp Articles

### Article 1
- Title: `Employee Onboarding Guide`
- Status: `PUBLISHED`
- Department: `HR`
- Author: `Acme Admin`
- Tags: `onboarding,hr,policy`

### Article 2
- Title: `VPN Access Setup`
- Status: `PUBLISHED`
- Department: `Engineering`
- Author: `Acme Manager`
- Tags: `vpn,it,onboarding`

### Article 3
- Title: `Quarterly Sales Process`
- Status: `DRAFT`
- Department: `Sales`
- Author: `Acme Employee`
- Tags: `sales,process,q1`

---

## Globex Articles

### Article 1
- Title: `Support Escalation Process`
- Status: `PUBLISHED`
- Department: `Support`
- Author: `Globex Admin`
- Tags: `support,incident,process`

---

## 6. Purpose of Seed Data

This seed data should support:

- login testing
- role-based access testing
- tenant isolation testing
- search/filter testing
- article CRUD testing

---

## 7. Important Rules

- Seed data should be idempotent where practical
- Seed data should remain stable over time
- Names/emails should not be randomized for MVP
