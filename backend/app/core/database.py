from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

# A local SQLite database makes the application runnable immediately after
# cloning. Deployments can continue to supply a PostgreSQL DATABASE_URL.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./setu.db"
)


# ============================================================
# DATABASE ENGINE
# ============================================================

engine_options = {
    "pool_pre_ping": True,
    "echo": False,
}

if DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_options)


# ============================================================
# SESSION
# ============================================================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# ============================================================
# BASE MODEL
# ============================================================

Base = declarative_base()


# ============================================================
# DATABASE DEPENDENCY
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
