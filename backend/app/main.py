from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base
from app.models import models

# Import API Routers
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.departments import router as departments_router
from app.api.faculty import router as faculty_router
from app.api.students import router as students_router
from app.api.courses import router as courses_router
from app.api.subjects import router as subjects_router
from app.api.resources import router as resources_router
from app.api.timetables import router as timetables_router
from app.api.examinations import router as examinations_router
from app.api.notifications import router as notifications_router
from app.api.dashboard import router as dashboard_router
from app.api.ai import router as ai_router

# Ensure all database tables exist safely
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Database initialization notice: {e}")

# Auto-seed initial demo data if database is fresh (crucial for serverless /tmp lifecycle)
try:
    from app.database.session import SessionLocal
    from app.models.models import User
    from app.seed import seed_database
    from app.seed_stage3 import seed_stage3_data

    with SessionLocal() as db_session:
        has_admin = db_session.query(User).filter(User.email == "admin@aaip.edu").first()
        if not has_admin:
            seed_database()
            try:
                seed_stage3_data()
            except Exception as e3:
                print(f"Stage 3 auto-seed notice: {e3}")
except Exception as seed_err:
    print(f"Auto-seeding notice: {seed_err}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend REST API for Autonomous Academic Intelligence Platform (AAIP)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(departments_router, prefix=settings.API_V1_STR)
app.include_router(faculty_router, prefix=settings.API_V1_STR)
app.include_router(students_router, prefix=settings.API_V1_STR)
app.include_router(courses_router, prefix=settings.API_V1_STR)
app.include_router(subjects_router, prefix=settings.API_V1_STR)
app.include_router(resources_router, prefix=settings.API_V1_STR)
app.include_router(timetables_router, prefix=settings.API_V1_STR)
app.include_router(examinations_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "AAIP Autonomous Academic Intelligence Platform Backend",
        "version": "1.0.0",
        "database": "connected"
    }

@app.get("/", tags=["Root"])
def root_endpoint():
    return {
        "message": "AAIP API Server Online. Visit /docs for Swagger interactive documentation.",
        "project": settings.PROJECT_NAME
    }
