from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.models import Course, Department, Subject, User
from app.schemas.schemas import CourseOut, CourseCreate, CourseUpdate
from app.api.deps import get_current_user, require_roles, log_audit_action

router = APIRouter(prefix="/courses", tags=["Course Management"])

@router.get("", response_model=List[CourseOut])
def list_courses(
    department_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Course)
    if department_id:
        query = query.filter(Course.department_id == department_id)
    if status_filter:
        query = query.filter(Course.status == status_filter)
    
    courses = query.order_by(Course.name.asc()).all()
    
    result = []
    for c in courses:
        s_count = db.query(func.count(Subject.id)).filter(Subject.course_id == c.id).scalar() or 0
        result.append(CourseOut(
            id=c.id,
            name=c.name,
            code=c.code,
            department_id=c.department_id,
            duration_years=c.duration_years,
            degree_type=c.degree_type,
            status=c.status,
            created_at=c.created_at,
            department_name=c.department.name if c.department else None,
            subjects_count=s_count
        ))
    return result

@router.post("", response_model=CourseOut, status_code=status.HTTP_201_CREATED)
def create_course(
    c_in: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    existing = db.query(Course).filter(Course.code == c_in.code.upper().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Course with this code already exists")
    
    course = Course(
        name=c_in.name.strip(),
        code=c_in.code.upper().strip(),
        department_id=c_in.department_id,
        duration_years=c_in.duration_years,
        degree_type=c_in.degree_type,
        status=c_in.status
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    
    log_audit_action(db, current_user, "CREATE_COURSE", "Course", f"Created course {course.code}")
    dept = db.query(Department).filter(Department.id == course.department_id).first()
    return CourseOut(
        id=course.id,
        name=course.name,
        code=course.code,
        department_id=course.department_id,
        duration_years=course.duration_years,
        degree_type=course.degree_type,
        status=course.status,
        created_at=course.created_at,
        department_name=dept.name if dept else None,
        subjects_count=0
    )

@router.put("/{course_id}", response_model=CourseOut)
def update_course(
    course_id: int,
    c_in: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if c_in.name is not None:
        course.name = c_in.name.strip()
    if c_in.code is not None:
        course.code = c_in.code.upper().strip()
    if c_in.department_id is not None:
        course.department_id = c_in.department_id
    if c_in.duration_years is not None:
        course.duration_years = c_in.duration_years
    if c_in.degree_type is not None:
        course.degree_type = c_in.degree_type
    if c_in.status is not None:
        course.status = c_in.status

    db.commit()
    db.refresh(course)
    log_audit_action(db, current_user, "UPDATE_COURSE", "Course", f"Updated course {course.code}")

    dept = db.query(Department).filter(Department.id == course.department_id).first()
    s_count = db.query(func.count(Subject.id)).filter(Subject.course_id == course.id).scalar() or 0
    return CourseOut(
        id=course.id,
        name=course.name,
        code=course.code,
        department_id=course.department_id,
        duration_years=course.duration_years,
        degree_type=course.degree_type,
        status=course.status,
        created_at=course.created_at,
        department_name=dept.name if dept else None,
        subjects_count=s_count
    )

@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    code = course.code
    db.delete(course)
    db.commit()
    log_audit_action(db, current_user, "DELETE_COURSE", "Course", f"Deleted course {code}")
    return {"message": f"Course '{code}' successfully deleted"}
