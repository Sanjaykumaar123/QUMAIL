import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

raw_url = os.environ.get("DATABASE_URL", "").strip().strip('"').strip("'")
print(f"🚀 [INIT] Database phase 1: URL processing...")

if not raw_url or raw_url == "your_neon_db_url_here":
    print("🚀 [INIT] No DATABASE_URL provided. Fallback to /tmp/qumail.db")
    SQLALCHEMY_DATABASE_URL = "sqlite:////tmp/qumail.db"
else:
    print(f"🚀 [INIT] Found DATABASE_URL starting with: {raw_url[:15]}")
    if raw_url.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = raw_url.replace("postgres://", "postgresql://", 1)
    else:
        SQLALCHEMY_DATABASE_URL = raw_url

# SQLite needs "check_same_thread": False, but Postgres doesn't.
print(f"🚀 [INIT] Database phase 2: Creating engine for {SQLALCHEMY_DATABASE_URL[:10]}...")
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True
    )
print(f"🚀 [INIT] Database phase 3: Engine ready.")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
