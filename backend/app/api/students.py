from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Student, Department, Course, User
from app.schemas.schemas import StudentOut, StudentCreate, StudentUpdate
from app.api.deps import get_current_user, require_roles, log_audit_action
from app.core.security import get_password_hash

router = APIRouter(prefix="/students", tags=["Student Management"])

@router.get("", response_model=List[StudentOut])
def list_students(
    department_id: Optional[int] = None,
    course_id: Optional[int] = None,
    semester: Optional[int] = None,
    batch: Optional[str] = None,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Student)
    
    # HOD department scoping
    if current_user.role == "hod" and current_user.department_id:
        query = query.filter(Student.department_id == current_user.department_id)
    elif department_id:
        query = query.filter(Student.department_id == department_id)
        
    # Student scoping: only view themselves if role is student
    if current_user.role == "student":
        query = query.filter(
            (Student.user_id == current_user.id) | (Student.email == current_user.email)
        )
    
    if course_id:
        query = query.filter(Student.course_id == course_id)
    if semester:
        query = query.filter(Student.semester == semester)
    if batch:
        query = query.filter(Student.batch == batch)
    if status_filter:
        query = query.filter(Student.status == status_filter)
    if search:
        query = query.filter(
            (Student.full_name.ilike(f"%{search}%")) |
            (Student.student_id.ilike(f"%{search}%")) |
            (Student.email.ilike(f"%{search}%"))
        )
    
    students = query.order_by(Student.full_name.asc()).all()
    
    result = []
    for s in students:
        result.append(StudentOut(
            id=s.id,
            user_id=s.user_id,
            student_id=s.student_id,
            full_name=s.full_name,
            email=s.email,
            phone=s.phone,
            department_id=s.department_id,
            course_id=s.course_id,
            semester=s.semester,
            batch=s.batch,
            enrollment_year=s.enrollment_year,
            status=s.status,
            created_at=s.created_at,
            department_name=s.department.name if s.department else None,
            course_name=s.course.name if s.course else None
        ))
    return result

@router.get("/{student_id}", response_model=StudentOut)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    s = db.query(Student).filter(Student.id == student_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Student record not found")
    
    # Scoping check
    if current_user.role == "student" and s.user_id != current_user.id and s.email != current_user.email:
        raise HTTPException(status_code=403, detail="Forbidden: You can only view your own student record")
    if current_user.role == "hod" and current_user.department_id and s.department_id != current_user.department_id:
        raise HTTPException(status_code=403, detail="Forbidden: Student outside your department")

    return StudentOut(
        id=s.id,
        user_id=s.user_id,
        student_id=s.student_id,
        full_name=s.full_name,
        email=s.email,
        phone=s.phone,
        department_id=s.department_id,
        course_id=s.course_id,
        semester=s.semester,
        batch=s.batch,
        enrollment_year=s.enrollment_year,
        status=s.status,
        created_at=s.created_at,
        department_name=s.department.name if s.department else None,
        course_name=s.course.name if s.course else None
    )

@router.post("", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(
    s_in: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "hod"]))
):
    if current_user.role == "hod" and current_user.department_id and s_in.department_id != current_user.department_id:
        raise HTTPException(status_code=403, detail="HOD can only add students to their own department")
    
    existing = db.query(Student).filter(
        (Student.email == s_in.email.lower().strip()) | (Student.student_id == s_in.student_id.strip())
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student with this ID or Email already exists")
    
    user_id = None
    if s_in.create_user_account and s_in.password:
        existing_user = db.query(User).filter(User.email == s_in.email.lower().strip()).first()
        if not existing_user:
            new_user = User(
                email=s_in.email.lower().strip(),
                hashed_password=get_password_hash(s_in.password),
                full_name=s_in.full_name,
                role="student",
                department_id=s_in.department_id,
                is_active=True
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            user_id = new_user.id
        else:
            user_id = existing_user.id

    student = Student(
        user_id=user_id,
        student_id=s_in.student_id.strip(),
        full_name=s_in.full_name.strip(),
        email=s_in.email.lower().strip(),
        phone=s_in.phone,
        department_id=s_in.department_id,
        course_id=s_in.course_id,
        semester=s_in.semester,
        batch=s_in.batch,
        enrollment_year=s_in.enrollment_year,
        status=s_in.status
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    log_audit_action(db, current_user, "CREATE_STUDENT", "Student", f"Added student {student.full_name} ({student.student_id})")

    dept = db.query(Department).filter(Department.id == student.department_id).first()
    course = db.query(Course).filter(Course.id == student.course_id).first() if student.course_id else None
    return StudentOut(
        id=student.id,
        user_id=student.user_id,
        student_id=student.student_id,
        full_name=student.full_name,
        email=student.email,
        phone=student.phone,
        department_id=student.department_id,
        course_id=student.course_id,
        semester=student.semester,
        batch=student.batch,
        enrollment_year=student.enrollment_year,
        status=student.status,
        created_at=student.created_at,
        department_name=dept.name if dept else None,
        course_name=course.name if course else None
    )

@router.put("/{student_id}", response_model=StudentOut)
def update_student(
    student_id: int,
    s_in: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "hod"]))
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if current_user.role == "hod" and current_user.department_id and student.department_id != current_user.department_id:
        raise HTTPException(status_code=403, detail="HOD can only update students within their department")
    
    if s_in.full_name is not None:
        student.full_name = s_in.full_name
    if s_in.email is not None:
        student.email = s_in.email.lower().strip()
    if s_in.phone is not None:
        student.phone = s_in.phone
    if s_in.department_id is not None:
        student.department_id = s_in.department_id
    if s_in.course_id is not None:
        student.course_id = s_in.course_id
    if s_in.semester is not None:
        student.semester = s_in.semester
    if s_in.batch is not None:
        student.batch = s_in.batch
    if s_in.enrollment_year is not None:
        student.enrollment_year = s_in.enrollment_year
    if s_in.status is not None:
        student.status = s_in.status

    db.commit()
    db.refresh(student)
    log_audit_action(db, current_user, "UPDATE_STUDENT", "Student", f"Updated student {student.student_id}")

    dept = db.query(Department).filter(Department.id == student.department_id).first()
    course = db.query(Course).filter(Course.id == student.course_id).first() if student.course_id else None
    return StudentOut(
        id=student.id,
        user_id=student.user_id,
        student_id=student.student_id,
        full_name=student.full_name,
        email=student.email,
        phone=student.phone,
        department_id=student.department_id,
        course_id=student.course_id,
        semester=student.semester,
        batch=student.batch,
        enrollment_year=student.enrollment_year,
        status=student.status,
        created_at=student.created_at,
        department_name=dept.name if dept else None,
        course_name=course.name if course else None
    )

@router.delete("/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    name = student.full_name
    db.delete(student)
    db.commit()
    log_audit_action(db, current_user, "DELETE_STUDENT", "Student", f"Deleted student {name}")
    return {"message": f"Student '{name}' successfully deleted"}
