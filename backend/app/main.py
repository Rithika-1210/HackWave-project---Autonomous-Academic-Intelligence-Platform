from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.security import get_password_hash
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
from app.api.enrollments import router as enrollments_router

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
        expected_demo_users = {
            "admin@aaip.edu": ("admin", "Ram", "Admin@2026!"),
            "hod.cse@aaip.edu": ("hod", "Kaviya", "Hod@2026!"),
            "dr.elena@aaip.edu": ("faculty", "Sham", "Faculty@2026!"),
            "aarav.sharma@aaip.edu": ("student", "Rithika", "Student@2026!"),
            "examcell@aaip.edu": ("exam_cell", "Karthick", "ExamCell@2026!"),
        }

        created_any_seed = False
        for email, (role, full_name, password) in expected_demo_users.items():
            user = db_session.query(User).filter(User.email == email).first()
            if user is None:
                existing_by_role = db_session.query(User).filter(User.role == role).order_by(User.id.asc()).first()
                if existing_by_role is not None:
                    existing_by_role.email = email
                    existing_by_role.full_name = full_name
                    existing_by_role.role = role
                    existing_by_role.is_active = True
                    existing_by_role.approval_status = "Approved"
                    existing_by_role.hashed_password = get_password_hash(password)
                    user = existing_by_role
                else:
                    user = User(
                        email=email,
                        hashed_password=get_password_hash(password),
                        full_name=full_name,
                        role=role,
                        department_id=None,
                        is_active=True,
                        approval_status="Approved",
                    )
                    db_session.add(user)
                    created_any_seed = True
            else:
                if user.full_name != full_name:
                    user.full_name = full_name
                if user.role != role:
                    user.role = role
                if user.hashed_password in [None, ""]:
                    user.hashed_password = get_password_hash(password)
                if user.approval_status != "Approved":
                    user.approval_status = "Approved"
                user.is_active = True

        if not db_session.query(User).filter(User.email == "admin@aaip.edu").first():
            seed_database()
            created_any_seed = True

        if created_any_seed:
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
                ("Information Technology", "IT", "Suresh", "Department of applied software systems, web engineering, cloud infrastructure, and cybersecurity."),
                ("Electrical & Electronics Engineering", "EEE", "Rajesh", "Specialized in power electronics, renewable energy, electrical machines, and grid systems."),
                ("Civil Engineering", "CIVIL", "Priya", "Structural engineering, environmental hydraulics, geotechnical, and urban infrastructure."),
                ("Artificial Intelligence & Machine Learning", "AIML", "Manoj", "Core neural architectures, reinforcement learning, NLP, and intelligent agents."),
                ("B.Sc Computing Technologies (CT_UG)", "CT_UG", "Divya", "3-Year B.Sc Program in Computing Technologies."),
                ("Integrated M.Sc Computing Technologies (CT_PG)", "CT_PG", "Divya", "5-Year Integrated M.Sc Program in Computing Technologies."),
                ("Biomedical Engineering", "BME", "Rahul", "Bio-instrumentation, medical imaging, prosthetics, and healthcare technologies."),
                ("Chemical Engineering", "CHEM", "Deepa", "Process engineering, reaction kinetics, separation technologies, and materials synthesis."),
                ("Mechatronics Engineering", "MCT", "Arun", "Synergistic integration of mechanical, electronics, computer engineering, and robotics."),
                ("Aerospace Engineering", "AERO", "Sanjay", "Aerodynamics, flight propulsion, astronautics, and orbital mechanics.")
            ]
            for d_name, d_code, d_hod, d_desc in extra_depts:
                dept_entry = db_session.query(Department).filter(Department.code == d_code).first()
                if not dept_entry:
                    db_session.add(Department(name=d_name, code=d_code, hod_name=d_hod, description=d_desc, status="Active"))
                elif dept_entry.hod_name != d_hod:
                    dept_entry.hod_name = d_hod
            
            # Sync standard departments HOD names
            standard_hods = {
                "CSE": "Kaviya",
                "ECE": "Anitha",
                "MECH": "Vijay",
                "DSAI": "Sneha",
            }
            for code, h_name in standard_hods.items():
                s_dept = db_session.query(Department).filter(Department.code == code).first()
                if s_dept and s_dept.hod_name != h_name:
                    s_dept.hod_name = h_name
            db_session.commit()

            ct_dept = db_session.query(Department).filter(Department.code == "CT").first()
            if ct_dept:
                if not db_session.query(Course).filter(Course.code == "CT_UG").first():
                    db_session.add(Course(name="B.Sc in Computing Technologies (CT_UG)", code="CT_UG", department_id=ct_dept.id, duration_years=3, degree_type="Undergraduate", status="Active"))
                if not db_session.query(Course).filter(Course.code == "CT_PG").first():
                    db_session.add(Course(name="Integrated M.Sc in Computing Technologies (CT_PG)", code="CT_PG", department_id=ct_dept.id, duration_years=5, degree_type="Integrated Postgraduate", status="Active"))
                db_session.commit()

            # Ensure all 14 departments have faculty, classrooms, subjects, and timetables
            try:
                from app.services.seed_departments_timetable import ensure_all_departments_seeded
                ensure_all_departments_seeded(db_session)
            except Exception as tt_seed_err:
                print(f"Department timetable seeding notice: {tt_seed_err}")
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
app.include_router(enrollments_router, prefix=settings.API_V1_STR)
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
