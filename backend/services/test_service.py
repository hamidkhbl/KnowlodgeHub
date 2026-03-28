from sqlalchemy.orm import Session

from core.database import Base, engine
from core.security import hash_password
from models.article import Article, ArticleStatus
from models.department import Department
from models.organization import Organization
from models.user import User, UserRole


def reset_database() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def seed_database(db: Session) -> None:
    # Fail fast if data already exists
    if db.query(Organization).first():
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Database already contains data. Run reset first.",
        )

    # --- Organizations ---
    acme = Organization(name="Acme Corp", slug="acme")
    globex = Organization(name="Globex", slug="globex")
    db.add_all([acme, globex])
    db.flush()

    # --- Departments ---
    acme_eng = Department(organization_id=acme.id, name="Engineering")
    acme_hr = Department(organization_id=acme.id, name="HR")
    acme_sales = Department(organization_id=acme.id, name="Sales")
    globex_eng = Department(organization_id=globex.id, name="Engineering")
    globex_support = Department(organization_id=globex.id, name="Support")
    db.add_all([acme_eng, acme_hr, acme_sales, globex_eng, globex_support])
    db.flush()

    # --- Users ---
    pw = hash_password("Password123!")

    acme_admin = User(
        organization_id=acme.id,
        name="Acme Admin",
        email="admin@acme.com",
        password_hash=pw,
        role=UserRole.ORG_ADMIN,
    )
    acme_manager = User(
        organization_id=acme.id,
        name="Acme Manager",
        email="manager@acme.com",
        password_hash=pw,
        role=UserRole.MANAGER,
    )
    acme_employee = User(
        organization_id=acme.id,
        name="Acme Employee",
        email="employee@acme.com",
        password_hash=pw,
        role=UserRole.EMPLOYEE,
    )
    globex_admin = User(
        organization_id=globex.id,
        name="Globex Admin",
        email="admin@globex.com",
        password_hash=pw,
        role=UserRole.ORG_ADMIN,
    )
    globex_employee = User(
        organization_id=globex.id,
        name="Globex Employee",
        email="employee@globex.com",
        password_hash=pw,
        role=UserRole.EMPLOYEE,
    )
    db.add_all([acme_admin, acme_manager, acme_employee, globex_admin, globex_employee])
    db.flush()

    # --- Articles ---
    db.add_all([
        Article(
            organization_id=acme.id,
            department_id=acme_hr.id,
            author_id=acme_admin.id,
            title="Employee Onboarding Guide",
            content="This guide covers everything a new employee needs to know during onboarding.",
            tags="onboarding,hr,policy",
            status=ArticleStatus.PUBLISHED,
        ),
        Article(
            organization_id=acme.id,
            department_id=acme_eng.id,
            author_id=acme_manager.id,
            title="VPN Access Setup",
            content="Step-by-step instructions for configuring VPN access on your device.",
            tags="vpn,it,onboarding",
            status=ArticleStatus.PUBLISHED,
        ),
        Article(
            organization_id=acme.id,
            department_id=acme_sales.id,
            author_id=acme_employee.id,
            title="Quarterly Sales Process",
            content="Overview of the Q1 sales process and pipeline management steps.",
            tags="sales,process,q1",
            status=ArticleStatus.DRAFT,
        ),
        Article(
            organization_id=globex.id,
            department_id=globex_support.id,
            author_id=globex_admin.id,
            title="Support Escalation Process",
            content="Guidelines for escalating support incidents to the appropriate team.",
            tags="support,incident,process",
            status=ArticleStatus.PUBLISHED,
        ),
    ])

    db.commit()
