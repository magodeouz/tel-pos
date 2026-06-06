import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent

DATABASE_URL = os.environ.get('DATABASE_URL', f"sqlite:///{BASE_DIR / 'tel_pos.db'}")

# Vercel Postgres uses postgres:// but SQLAlchemy needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

HOST = "0.0.0.0"
PORT = int(os.environ.get('PORT', 8000))

RESTAURANT_NAME = os.environ.get('RESTAURANT_NAME', 'EFE POS')
