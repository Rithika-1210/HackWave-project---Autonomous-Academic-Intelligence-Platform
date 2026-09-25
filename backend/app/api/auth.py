from datetime import timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.config import settings
from app.models.models import User, Faculty, Student, Department
from app.schemas.schemas import LoginRequest, TokenResponse, UserOut, UserCreate, UserUpdate
from app.api.deps import get_current_user, log_audit_action

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/departments")
def get_public_departments(db: Session = Depends(get_db)):
    depts = db.query(Department).filter(Department.status == "Active").order_by(Department.name.asc()).all()
    return [{"id": d.id, "name": d.name, "code": d.code} for d in depts]

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    email_clean = user_in.email.lower().strip()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An institutional account with this email already exists"
        )
    
    valid_roles = ["admin", "hod", "faculty", "student", "exam_cell"]
    if user_in.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid institutional role. Must be one of: {', '.join(valid_roles)}"
        )
    
    # System Administrator is institutional overall admin across all departments
    if user_in.role == "admin":
        dept_id = None
    elif not user_in.department_id:
        first_dept = db.query(Department).first()
        dept_id = first_dept.id if first_dept else None
    else:
        dept_id = user_in.department_id

    new_user = User(
        email=email_clean,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name.strip(),
        role=user_in.role,
        department_id=dept_id,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    dept = db.query(Department).filter(Department.id == dept_id).first() if dept_id else None
    dept_code = dept.code if dept else "GEN"

    if user_in.role in ["faculty", "hod"]:
        existing_faculty = db.query(Faculty).filter(Faculty.email == email_clean).first()
        if not existing_faculty:
            faculty_count = db.query(Faculty).count() + 1
            designation = "Head of Department" if user_in.role == "hod" else "Faculty Member"
            new_faculty = Faculty(
                user_id=new_user.id,
                faculty_id=f"FAC-{dept_code}-{faculty_count:03d}",
                full_name=new_user.full_name,
                email=new_user.email,
                department_id=dept_id,
                designation=designation,
                max_weekly_workload=18
            )
            db.add(new_faculty)
            db.commit()

    elif user_in.role == "student":
        existing_student = db.query(Student).filter(Student.email == email_clean).first()
        if not existing_student:
            student_count = db.query(Student).count() + 1
            new_student = Student(
                user_id=new_user.id,
                student_id=f"STU-{dept_code}-{student_count:03d}",
                full_name=new_user.full_name,
                email=new_user.email,
                department_id=dept_id,
                semester=1,
                batch="Batch 2026-2030"
            )
            db.add(new_student)
            db.commit()

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=new_user.id,
        role=new_user.role,
        expires_delta=access_token_expires
    )

    log_audit_action(
        db, new_user, "REGISTER_USER", "User",
        f"New institutional user registered: {new_user.email} with role {new_user.role}",
        request.client.host if request.client else None
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    req_email = login_data.email.lower().strip()
    
    # Aliases for simple user names
    EMAIL_ALIASES = {
        "ram@aaip.edu": "admin@aaip.edu",
        "kaviya@aaip.edu": "hod.cse@aaip.edu",
        "sham@aaip.edu": "dr.elena@aaip.edu",
        "faculty@aaip.edu": "dr.elena@aaip.edu",
        "rithika@aaip.edu": "aarav.sharma@aaip.edu",
        "student@aaip.edu": "aarav.sharma@aaip.edu",
        "karthick@aaip.edu": "examcell@aaip.edu",
        "karthik@aaip.edu": "examcell@aaip.edu",
    }
    
    user = db.query(User).filter(User.email == req_email).first()
    if not user and req_email in EMAIL_ALIASES:
        user = db.query(User).filter(User.email == EMAIL_ALIASES[req_email]).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        log_audit_action(
            db, None, "LOGIN_FAILED", "User",
            f"Failed login attempt for {login_data.email}",
            request.client.host if request.client else None
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect institutional email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Institutional account has been suspended or deactivated"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=user.id,
        role=user.role,
        expires_delta=access_token_expires
    )

    log_audit_action(
        db, user, "LOGIN_SUCCESS", "User",
        f"User logged in with role {user.role}",
        request.client.host if request.client else None
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)

@router.put("/profile", response_model=UserOut)
def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.full_name:
        current_user.full_name = profile_data.full_name.strip()
    if profile_data.email:
        new_email = profile_data.email.lower().strip()
        existing = db.query(User).filter(User.email == new_email, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Institutional email is already taken by another account")
        current_user.email = new_email
    if current_user.role == "admin":
        current_user.department_id = None
    elif profile_data.department_id is not None:
        current_user.department_id = profile_data.department_id
    if profile_data.password:
        current_user.hashed_password = get_password_hash(profile_data.password)
    
    db.commit()
    db.refresh(current_user)
    log_audit_action(db, current_user, "UPDATE_PROFILE", "User", f"User {current_user.id} updated their profile settings")
    return UserOut.model_validate(current_user)

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log_audit_action(db, current_user, "LOGOUT", "User", "User logged out")
    return {"message": "Logged out successfully"}


