from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.database import Base, engine
from core.logging_config import setup_logging, get_logger
from core.middleware import RequestLoggingMiddleware
import models  # noqa: F401 — ensures all models are registered with Base
from api.routes import auth, users, departments, articles, test

setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s v%s", settings.app_name, "1.0.0")
    logger.info("Database: %s", settings.database_url)
    logger.info("Log level: %s", settings.log_level)

    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ready")

    # Inline migration: add parent_department_id column if it doesn't exist
    with engine.connect() as conn:
        from sqlalchemy import text
        columns = [row[1] for row in conn.execute(text("PRAGMA table_info(departments)")).fetchall()]
        if "parent_department_id" not in columns:
            conn.execute(text(
                "ALTER TABLE departments ADD COLUMN parent_department_id INTEGER REFERENCES departments(id)"
            ))
            conn.commit()
            logger.info("Migrated departments table: added parent_department_id column")

    yield

    logger.info("Shutting down %s", settings.app_name)


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(departments.router, prefix="/api")
app.include_router(articles.router, prefix="/api")
app.include_router(test.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
