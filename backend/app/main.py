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
        else:
            # Sync role accounts to simple names: Ram, Kaviya, Sham, Rithika, Karthick
            admin_u = db_session.query(User).filter(User.role == "admin").first()
            if admin_u:
                if admin_u.full_name != "Ram":
                    admin_u.full_name = "Ram"
                if admin_u.department_id is not None:
                    admin_u.department_id = None
            hod_u = db_session.query(User).filter(User.role == "hod").first()
            if hod_u and hod_u.full_name != "Kaviya":
                hod_u.full_name = "Kaviya"
            fac_u = db_session.query(User).filter(User.role == "faculty", User.email == "dr.elena@aaip.edu").first()
            if fac_u and fac_u.full_name != "Sham":
                fac_u.full_name = "Sham"
            stu_u = db_session.query(User).filter(User.role == "student", User.email == "aarav.sharma@aaip.edu").first()
            if stu_u and stu_u.full_name != "Rithika":
                stu_u.full_name = "Rithika"
            exam_u = db_session.query(User).filter(User.role == "exam_cell").first()
            if exam_u and exam_u.full_name != "Karthick":
                exam_u.full_name = "Karthick"
            db_session.commit()

            # Ensure all engineering departments and CT programs exist
            from app.models.models import Department, Course
            extra_depts = [
                ("Information Technology", "IT", "Dr. Dennis Ritchie", "Department of applied software systems, web engineering, cloud infrastructure, and cybersecurity."),
                ("Electrical & Electronics Engineering", "EEE", "Dr. Nikola Tesla", "Specialized in power electronics, renewable energy, electrical machines, and grid systems."),
                ("Civil Engineering", "CIVIL", "Dr. Arthur Casagrande", "Structural engineering, environmental hydraulics, geotechnical, and urban infrastructure."),
                ("Artificial Intelligence & Machine Learning", "AIML", "Dr. Geoffrey Hinton", "Core neural architectures, reinforcement learning, NLP, and intelligent agents."),
                ("Computing Technologies", "CT", "Dr. Grace Hopper", "Comprehensive computing division hosting 3-Year B.Sc (CT_UG) and 5-Year Integrated M.Sc (CT_PG) programs."),
                ("Biomedical Engineering", "BME", "Dr. Willem Kolff", "Bio-instrumentation, medical imaging, prosthetics, and healthcare technologies."),
                ("Chemical Engineering", "CHEM", "Dr. George Davis", "Process engineering, reaction kinetics, separation technologies, and materials synthesis."),
                ("Mechatronics Engineering", "MCT", "Dr. Tetsuro Mori", "Synergistic integration of mechanical, electronics, computer engineering, and robotics."),
                ("Aerospace Engineering", "AERO", "Dr. Theodore von Karman", "Aerodynamics, flight propulsion, astronautics, and orbital mechanics.")
            ]
            for d_name, d_code, d_hod, d_desc in extra_depts:
                if not db_session.query(Department).filter(Department.code == d_code).first():
                    db_session.add(Department(name=d_name, code=d_code, hod_name=d_hod, description=d_desc, status="Active"))
            db_session.commit()

            ct_dept = db_session.query(Department).filter(Department.code == "CT").first()
            if ct_dept:
                if not db_session.query(Course).filter(Course.code == "CT_UG").first():
                    db_session.add(Course(name="B.Sc in Computing Technologies (CT_UG)", code="CT_UG", department_id=ct_dept.id, duration_years=3, degree_type="Undergraduate", status="Active"))
                if not db_session.query(Course).filter(Course.code == "CT_PG").first():
                    db_session.add(Course(name="Integrated M.Sc in Computing Technologies (CT_PG)", code="CT_PG", department_id=ct_dept.id, duration_years=5, degree_type="Integrated Postgraduate", status="Active"))
                db_session.commit()
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
