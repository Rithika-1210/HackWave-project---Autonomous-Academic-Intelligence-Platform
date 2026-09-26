from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.models import Faculty, Department, User, TimetableEntry
from app.schemas.schemas import FacultyOut, FacultyCreate, FacultyUpdate
from app.api.deps import get_current_user, require_roles, log_audit_action
from app.core.security import get_password_hash

router = APIRouter(prefix="/faculty", tags=["Faculty Management"])

@router.get("", response_model=List[FacultyOut])
def list_faculty(
    department_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Faculty)
    
    # Role Scoping
    if current_user.role == "faculty":
        # One faculty should NOT see other faculty members
        query = query.filter((Faculty.user_id == current_user.id) | (Faculty.email == current_user.email))
    elif current_user.role == "hod" and current_user.department_id:
        # HOD only sees faculty in their department
        query = query.filter(Faculty.department_id == current_user.department_id)
    elif current_user.role == "student" and current_user.department_id:
        # Student only sees faculty in their department
        query = query.filter(Faculty.department_id == current_user.department_id)
    elif department_id:
        query = query.filter(Faculty.department_id == department_id)
    
    if status_filter:
        query = query.filter(Faculty.status == status_filter)
    
    if search:
        query = query.filter(
            (Faculty.full_name.ilike(f"%{search}%")) |
            (Faculty.faculty_id.ilike(f"%{search}%")) |
            (Faculty.email.ilike(f"%{search}%")) |
            (Faculty.specialization.ilike(f"%{search}%"))
        )
    
    faculty_list = query.order_by(Faculty.full_name.asc()).all()
    
    result = []
    for f in faculty_list:
        # Calculate teaching hours based on timetable entries
        workload = db.query(func.count(TimetableEntry.id)).filter(TimetableEntry.faculty_id == f.id).scalar() or 0
        
        result.append(FacultyOut(
            id=f.id,
            user_id=f.user_id,
            faculty_id=f.faculty_id,
            full_name=f.full_name,
            email=f.email,
            phone=f.phone,
            department_id=f.department_id,
            designation=f.designation,
            specialization=f.specialization,
            max_weekly_workload=f.max_weekly_workload,
            status=f.status,
            created_at=f.created_at,
            department_name=f.department.name if f.department else None,
            current_workload_hours=workload
        ))
    return result

@router.get("/{faculty_id}", response_model=FacultyOut)
def get_faculty(
    faculty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    f = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Faculty member not found")
    
    # HOD scoping check
    if current_user.role == "hod" and current_user.department_id and f.department_id != current_user.department_id:
        raise HTTPException(status_code=403, detail="Forbidden: Cannot view faculty outside your department")
    
    workload = db.query(func.count(TimetableEntry.id)).filter(TimetableEntry.faculty_id == f.id).scalar() or 0
    return FacultyOut(
        id=f.id,
        user_id=f.user_id,
        faculty_id=f.faculty_id,
        full_name=f.full_name,
        email=f.email,
        phone=f.phone,
        department_id=f.department_id,
        designation=f.designation,
        specialization=f.specialization,
        max_weekly_workload=f.max_weekly_workload,
        status=f.status,
        created_at=f.created_at,
        department_name=f.department.name if f.department else None,
        current_workload_hours=workload
    )

@router.post("", response_model=FacultyOut, status_code=status.HTTP_201_CREATED)
def create_faculty(
    f_in: FacultyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "hod"]))
):
    if current_user.role == "hod" and current_user.department_id and f_in.department_id != current_user.department_id:
        raise HTTPException(status_code=403, detail="HOD can only create faculty for their own department")
    
    existing = db.query(Faculty).filter(
        (Faculty.email == f_in.email.lower().strip()) | (Faculty.faculty_id == f_in.faculty_id.strip())
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Faculty with this ID or Email already exists")
    
    # Optionally create linked User login account
    user_id = None
    if f_in.create_user_account and f_in.password:
        existing_user = db.query(User).filter(User.email == f_in.email.lower().strip()).first()
        if not existing_user:
            new_user = User(
                email=f_in.email.lower().strip(),
                hashed_password=get_password_hash(f_in.password),
                full_name=f_in.full_name,
                role="faculty",
                department_id=f_in.department_id,
                is_active=True
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            user_id = new_user.id
        else:
            user_id = existing_user.id

    faculty = Faculty(
        user_id=user_id,
        faculty_id=f_in.faculty_id.strip(),
        full_name=f_in.full_name.strip(),
        email=f_in.email.lower().strip(),
        phone=f_in.phone,
        department_id=f_in.department_id,
        designation=f_in.designation,
        specialization=f_in.specialization,
        max_weekly_workload=f_in.max_weekly_workload,
        status=f_in.status
    )
    db.add(faculty)
    db.commit()
    db.refresh(faculty)

    log_audit_action(db, current_user, "CREATE_FACULTY", "Faculty", f"Added faculty {faculty.full_name} ({faculty.faculty_id})")
    
    dept = db.query(Department).filter(Department.id == faculty.department_id).first()
    return FacultyOut(
        id=faculty.id,
        user_id=faculty.user_id,
        faculty_id=faculty.faculty_id,
        full_name=faculty.full_name,
        email=faculty.email,
        phone=faculty.phone,
        department_id=faculty.department_id,
        designation=faculty.designation,
        specialization=faculty.specialization,
        max_weekly_workload=faculty.max_weekly_workload,
        status=faculty.status,
        created_at=faculty.created_at,
        department_name=dept.name if dept else None,
        current_workload_hours=0
    )

@router.put("/{faculty_id}", response_model=FacultyOut)
def update_faculty(
    faculty_id: int,
    f_in: FacultyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "hod", "faculty"]))
):
    faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    
    # If role is faculty, can only update permitted personal details (phone, specialization)
    if current_user.role == "faculty":
        if faculty.user_id != current_user.id and faculty.email != current_user.email:
            raise HTTPException(status_code=403, detail="Forbidden: You can only update your own profile")
        if f_in.phone is not None:
            faculty.phone = f_in.phone
        if f_in.specialization is not None:
            faculty.specialization = f_in.specialization
    else:
        # Admin or HOD
        if current_user.role == "hod" and current_user.department_id and faculty.department_id != current_user.department_id:
            raise HTTPException(status_code=403, detail="HOD can only update faculty within their department")
        
        if f_in.full_name is not None:
            faculty.full_name = f_in.full_name
        if f_in.email is not None:
            faculty.email = f_in.email.lower().strip()
        if f_in.phone is not None:
            faculty.phone = f_in.phone
        if f_in.department_id is not None:
            faculty.department_id = f_in.department_id
        if f_in.designation is not None:
            faculty.designation = f_in.designation
        if f_in.specialization is not None:
            faculty.specialization = f_in.specialization
        if f_in.max_weekly_workload is not None:
            faculty.max_weekly_workload = f_in.max_weekly_workload
        if f_in.status is not None:
            faculty.status = f_in.status

    db.commit()
    db.refresh(faculty)
    log_audit_action(db, current_user, "UPDATE_FACULTY", "Faculty", f"Updated faculty {faculty.faculty_id}")

    dept = db.query(Department).filter(Department.id == faculty.department_id).first()
    workload = db.query(func.count(TimetableEntry.id)).filter(TimetableEntry.faculty_id == faculty.id).scalar() or 0
    return FacultyOut(
        id=faculty.id,
        user_id=faculty.user_id,
        faculty_id=faculty.faculty_id,
        full_name=faculty.full_name,
        email=faculty.email,
        phone=faculty.phone,
        department_id=faculty.department_id,
        designation=faculty.designation,
        specialization=faculty.specialization,
        max_weekly_workload=faculty.max_weekly_workload,
        status=faculty.status,
        created_at=faculty.created_at,
        department_name=dept.name if dept else None,
        current_workload_hours=workload
    )

@router.delete("/{faculty_id}")
def delete_faculty(
    faculty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    
    name = faculty.full_name
    db.delete(faculty)
    db.commit()
    log_audit_action(db, current_user, "DELETE_FACULTY", "Faculty", f"Deleted faculty {name}")
    return {"message": f"Faculty '{name}' successfully deleted"}
