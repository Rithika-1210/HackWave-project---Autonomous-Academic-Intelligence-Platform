import sys
import os
from pathlib import Path

# Set up sys.path for Vercel Serverless environment
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "backend"

for p in [str(BACKEND_DIR), str(PROJECT_ROOT)]:
    if p not in sys.path:
        sys.path.insert(0, p)

# Import the FastAPI application instance
from app.main import app

# Vercel Serverless looks for 'app' or 'handler'
handler = app
