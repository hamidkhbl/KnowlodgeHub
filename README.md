# KnowledgeHub 🚀

![Status](https://img.shields.io/badge/status-in--progress-yellow)
![Tech](https://img.shields.io/badge/stack-Angular%20%7C%20FastAPI-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Overview

**KnowledgeHub** is a **multi-tenant Knowledge Management System (KMS)** built with **Angular** (frontend) and **FastAPI** (backend).

It allows organizations to:
- register and manage their own tenant
- create users and departments
- manage internal knowledge articles
- enforce strict role-based access and tenant isolation

This project is designed as both:
- a realistic **SaaS-style MVP**
- a powerful **automation showcase platform (API + UI)**

---

## Key Features

### Authentication
- Organization registration with first admin
- Login / logout
- JWT-based authentication

### Multi-Tenancy
- Strict data isolation per organization
- No cross-tenant data access

### User Management
- Create users
- Assign roles (ORG_ADMIN, MANAGER, EMPLOYEE)
- Assign departments

### Departments
- Create and manage departments

### Knowledge Articles
- Create, edit, delete articles
- Search and filter
- Draft vs Published states

### Role-Based Access Control
| Role        | Capabilities |
|------------|-------------|
| ORG_ADMIN  | Full control |
| MANAGER    | Manage articles |
| EMPLOYEE   | Manage own content |

### Built for Testability
- Reset database endpoint
- Seed demo data endpoint
- Predictable API behavior
- Stable UI selectors (planned)

---

## Tech Stack

### Frontend
- Angular
- Reactive Forms
- Angular Router
- HttpClient

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication

### Database
- SQLite (MVP)

---

## Architecture

```
Angular SPA
   |
   | HTTP / JSON
   v
FastAPI REST API
   |
   v
SQLite Database
```

---

## Why This Project Stands Out

Unlike typical demo apps, this project includes:

- Multi-tenancy (real SaaS pattern)
- Role-based authorization
- API + UI integration
- Designed for automation from day one

This makes it ideal for showcasing:

- SDET skills
- Automation framework design
- End-to-end testing strategies
- Real-world system validation

---

## Automation Use Cases (Planned)

### API Testing
- Authentication validation
- CRUD operations
- Schema validation
- Authorization testing
- Tenant isolation testing

### UI Testing
- Login flows
- Role-based UI visibility
- Article workflows
- Search and filtering

### End-to-End
- Create via API → validate via UI
- Cross-tenant isolation scenarios

---

## Project Structure

```
knowledgehub/
├── CLAUDE.md
├── docs/
├── backend/
└── frontend/
```

---

## Getting Started (Planned)

### Backend
```bash
cd backend
# install dependencies
# run FastAPI
```

### Frontend
```bash
cd frontend
# install dependencies
# run Angular app
```

---

## Demo (Planned)

Example credentials (after seed):

```
admin@acme.com / Password123!
```

---

## Roadmap

- Backend implementation
- Angular frontend
- API automation framework
- UI automation framework
- CI/CD pipeline
- Reporting dashboards

---

## Status

🚧 In Progress

---

## Author

Built by **Hamid**  
Focus areas:
- Software Engineering
- Test Automation
- SDET / QA Engineering
- Scalable Testable Systems

---

## License

MIT
