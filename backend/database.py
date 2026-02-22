import os
import re
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Capture and sanitize the URL string
raw_input = os.environ.get("DATABASE_URL", "").strip()
# Remove common copy-paste debris: psql prefixes, quotes, and backticks
raw_url = re.sub(r"^(psql\s*|['\"` ]+)", "", raw_input)
raw_url = raw_url.strip().strip('"').strip("'")

# 2. Decision Logic for SQLALCHEMY_DATABASE_URL
if not raw_url or "://" not in raw_url or "your_neon_db_url_here" in raw_url:
    print("🚀 [STATUS] No valid DATABASE_URL found. Using failsafe SQLite.")
    SQLALCHEMY_DATABASE_URL = "sqlite:////tmp/qumail.db"
else:
    # SQLAlchemy 1.4+ requires 'postgresql://' instead of 'postgres://'
    SQLALCHEMY_DATABASE_URL = re.sub(r'^postgres://', 'postgresql://', raw_url)
    print(f"🚀 [STATUS] Attempting to connect to external DB (scheme: {SQLALCHEMY_DATABASE_URL.split('://')[0]})")

# 3. Create Engine with Failsafe Fallback
try:
    # SQLite needs "check_same_thread": False
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            SQLALCHEMY_DATABASE_URL, 
            connect_args={"check_same_thread": False}
        )
    else:
        # Use Standard Postgres settings
        engine = create_engine(
            SQLALCHEMY_DATABASE_URL,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=300
        )
    
    # Test connection immediately
    with engine.connect() as conn:
        print("🚀 [STATUS] Database Engine created and connection verified.")

except Exception as e:
    print(f"❌ [ERROR] Could not initialize external DB: {e}")
    print("🚀 [STATUS] Falling back to emergency SQLite /tmp/qumail.db")
    SQLALCHEMY_DATABASE_URL = "sqlite:////tmp/qumail.db"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
