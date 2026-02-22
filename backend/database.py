import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

raw_url = os.environ.get("DATABASE_URL", "").strip().strip('"').strip("'")

if not raw_url or raw_url == "your_neon_db_url_here":
    SQLALCHEMY_DATABASE_URL = "sqlite:////tmp/qumail.db"
else:
    if raw_url.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = raw_url.replace("postgres://", "postgresql+pg8000://", 1)
    elif raw_url.startswith("postgresql://"):
        SQLALCHEMY_DATABASE_URL = raw_url.replace("postgresql://", "postgresql+pg8000://", 1)
    else:
        SQLALCHEMY_DATABASE_URL = raw_url

# SQLite needs "check_same_thread": False, but Postgres doesn't.
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
