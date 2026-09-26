from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Subject, Department, Course, Faculty, User
from app.schemas.schemas import SubjectOut, SubjectCreate, SubjectUpdate
from app.api.deps import get_current_user, require_roles, log_audit_action

router = APIRouter(prefix="/subjects", tags=["Subject Management"])

@router.get("", response_model=List[SubjectOut])
def list_subjects(
    department_id: Optional[int] = None,
    course_id: Optional[int] = None,
    semester: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Subject)
    
    # Department scoping for non-admin users
    if current_user.role in ["hod", "faculty", "student"] and current_user.department_id:
        query = query.filter(Subject.department_id == current_user.department_id)
    elif department_id:
        query = query.filter(Subject.department_id == department_id)

    if course_id:
        query = query.filter(Subject.course_id == course_id)
    if semester:
        query = query.filter(Subject.semester == semester)
    if search:
        query = query.filter(
            (Subject.name.ilike(f"%{search}%")) | (Subject.code.ilike(f"%{search}%"))
        )
    
    subjects = query.order_by(Subject.semester.asc(), Subject.name.asc()).all()
    
    result = []
    for s in subjects:
        result.append(SubjectOut(
            id=s.id,
            name=s.name,
            code=s.code,
            department_id=s.department_id,
            course_id=s.course_id,
            semester=s.semester,
            weekly_periods=s.weekly_periods,
            subject_type=s.subject_type,
            assigned_faculty_id=s.assigned_faculty_id,
            status=s.status,
            created_at=s.created_at,
            department_name=s.department.name if s.department else None,
            course_name=s.course.name if s.course else None,
            assigned_faculty_name=s.assigned_faculty.full_name if s.assigned_faculty else None
        ))
    return result

@router.post("", response_model=SubjectOut, status_code=status.HTTP_201_CREATED)
def create_subject(
    s_in: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "hod"]))
):
    if current_user.role == "hod" and current_user.department_id and s_in.department_id != current_user.department_id:
        raise HTTPException(status_code=403, detail="HOD can only create subjects in their department")
    
    existing = db.query(Subject).filter(Subject.code == s_in.code.upper().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Subject with this code already exists")
    
    subject = Subject(
        name=s_in.name.strip(),
        code=s_in.code.upper().strip(),
        department_id=s_in.department_id,
        course_id=s_in.course_id,
        semester=s_in.semester,
        weekly_periods=s_in.weekly_periods,
        subject_type=s_in.subject_type,
        assigned_faculty_id=s_in.assigned_faculty_id,
        status=s_in.status
    )
    db.add(subject)
    db.commit()
    db.refresh(subject)
    
    log_audit_action(db, current_user, "CREATE_SUBJECT", "Subject", f"Created subject {subject.code}")

    dept = db.query(Department).filter(Department.id == subject.department_id).first()
    course = db.query(Course).filter(Course.id == subject.course_id).first() if subject.course_id else None
    faculty = db.query(Faculty).filter(Faculty.id == subject.assigned_faculty_id).first() if subject.assigned_faculty_id else None
    return SubjectOut(
        id=subject.id,
        name=subject.name,
        code=subject.code,
        department_id=subject.department_id,
        course_id=subject.course_id,
        semester=subject.semester,
        weekly_periods=subject.weekly_periods,
        subject_type=subject.subject_type,
        assigned_faculty_id=subject.assigned_faculty_id,
        status=subject.status,
        created_at=subject.created_at,
        department_name=dept.name if dept else None,
        course_name=course.name if course else None,
        assigned_faculty_name=faculty.full_name if faculty else None
    )

@router.put("/{subject_id}", response_model=SubjectOut)
def update_subject(
    subject_id: int,
    s_in: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "hod"]))
):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    if current_user.role == "hod" and current_user.department_id and subject.department_id != current_user.department_id:
        raise HTTPException(status_code=403, detail="HOD can only update subjects within their department")
    
    if s_in.name is not None:
        subject.name = s_in.name.strip()
    if s_in.code is not None:
        subject.code = s_in.code.upper().strip()
    if s_in.department_id is not None:
        subject.department_id = s_in.department_id
    if s_in.course_id is not None:
        subject.course_id = s_in.course_id
    if s_in.semester is not None:
        subject.semester = s_in.semester
    if s_in.weekly_periods is not None:
        subject.weekly_periods = s_in.weekly_periods
    if s_in.subject_type is not None:
        subject.subject_type = s_in.subject_type
    if s_in.assigned_faculty_id is not None:
        subject.assigned_faculty_id = s_in.assigned_faculty_id
    if s_in.status is not None:
        subject.status = s_in.status

    db.commit()
    db.refresh(subject)
    log_audit_action(db, current_user, "UPDATE_SUBJECT", "Subject", f"Updated subject {subject.code}")

    dept = db.query(Department).filter(Department.id == subject.department_id).first()
    course = db.query(Course).filter(Course.id == subject.course_id).first() if subject.course_id else None
    faculty = db.query(Faculty).filter(Faculty.id == subject.assigned_faculty_id).first() if subject.assigned_faculty_id else None
    return SubjectOut(
        id=subject.id,
        name=subject.name,
        code=subject.code,
        department_id=subject.department_id,
        course_id=subject.course_id,
        semester=subject.semester,
        weekly_periods=subject.weekly_periods,
        subject_type=subject.subject_type,
        assigned_faculty_id=subject.assigned_faculty_id,
        status=subject.status,
        created_at=subject.created_at,
        department_name=dept.name if dept else None,
        course_name=course.name if course else None,
        assigned_faculty_name=faculty.full_name if faculty else None
    )

@router.delete("/{subject_id}")
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "hod"]))
):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    code = subject.code
    db.delete(subject)
    db.commit()
    log_audit_action(db, current_user, "DELETE_SUBJECT", "Subject", f"Deleted subject {code}")
    return {"message": f"Subject '{code}' successfully deleted"}
