from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    # fallback for local development
    SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres123@127.0.0.1:5432/Ramacoaching_db"
    print("WARNING: DATABASE_URL not set. Using local database.")

# Render gives URLs starting with postgres:// but SQLAlchemy needs postgresql://
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=3,           # keep 3 connections open (Supabase free = limited connections)
    max_overflow=5,        # allow 5 extra under burst traffic
    pool_pre_ping=True,    # test connection before using (prevents stale connection errors)
    pool_recycle=1800,     # recycle every 30 min (prevents Supabase idle timeout drops)
    pool_timeout=30,       # wait max 30s for a free connection before raising error
    connect_args={"connect_timeout": 10},  # fail fast if DB unreachable
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()