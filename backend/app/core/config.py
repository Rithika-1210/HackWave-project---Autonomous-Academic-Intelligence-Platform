import os
from pathlib import Path
from typing import List, Union
from pydantic import BaseModel

_BASE_DIR = Path(__file__).resolve().parent.parent.parent
_REPO_ROOT = _BASE_DIR.parent if _BASE_DIR.name == "backend" else _BASE_DIR

# Determine writable database path for Vercel/Serverless
if os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
    tmp_db = Path("/tmp/aaip.db")
    if not tmp_db.exists():
        # Copy pre-existing db if available
        for candidate in [_BASE_DIR / "aaip.db", _REPO_ROOT / "aaip.db", _REPO_ROOT / "backend" / "aaip.db"]:
            if candidate.exists():
                try:
                    import shutil
                    shutil.copyfile(candidate, tmp_db)
                    break
                except Exception:
                    pass
    DEFAULT_DB_PATH = tmp_db.as_posix()
else:
    DEFAULT_DB_PATH = (_BASE_DIR / "aaip.db").as_posix()

class Settings(BaseModel):
    PROJECT_NAME: str = "AAIP - Autonomous Academic Intelligence Platform"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "aaip-super-secret-production-grade-key-2026-ag002")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"]

settings = Settings()
