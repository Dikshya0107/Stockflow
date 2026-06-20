import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()


def _normalize_database_url(url: str) -> str:
    """Prepare DATABASE_URL for SQLAlchemy and Render PostgreSQL."""
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    # Render external Postgres requires SSL
    if "render.com" in url and "sslmode=" not in url:
        separator = "&" if "?" in url else "?"
        url = f"{url}{separator}sslmode=require"

    return url


DATABASE_URL = _normalize_database_url(
    os.getenv(
        "DATABASE_URL",
        "postgresql://localhost:5432/inventory_db",
    )
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Yield a database session per request; close when done."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> None:
    """Verify PostgreSQL is reachable. Raises on failure."""
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
