from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Examination, Department, Subject, Classroom, User, Student
from app.schemas.schemas import ExaminationOut, ExaminationCreate, ExaminationUpdate
from app.api.deps import get_current_user, require_roles, log_audit_action

router = APIRouter(prefix="/examinations", tags=["Examination Management"])

def times_overlap(start1: str, end1: str, start2: str, end2: str) -> bool:
    return max(start1, start2) < min(end1, end2)

@router.get("", response_model=List[ExaminationOut])
def list_examinations(
    department_id: Optional[int] = None,
    semester: Optional[int] = None,
    status_filter: Optional[str] = None,
    exam_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Examination)
    
    # Role Scoping
    if current_user.role == "hod" and current_user.department_id:
        query = query.filter(Examination.department_id == current_user.department_id)
    elif current_user.role == "student":
        student = db.query(Student).filter(
            (Student.user_id == current_user.id) | (Student.email == current_user.email)
        ).first()
        if student:
            query = query.filter(
                Examination.department_id == student.department_id,
                Examination.semester == student.semester
            )
    
    if department_id:
        query = query.filter(Examination.department_id == department_id)
    if semester:
        query = query.filter(Examination.semester == semester)
    if status_filter:
        query = query.filter(Examination.status == status_filter)
    if exam_type:
        query = query.filter(Examination.exam_type == exam_type)
    if search:
        query = query.filter(
            (Examination.name.ilike(f"%{search}%"))
        )

    exams = query.order_by(Examination.exam_date.asc(), Examination.start_time.asc()).all()

    result = []
    for ex in exams:
        result.append(ExaminationOut(
            id=ex.id,
            name=ex.name,
            exam_type=ex.exam_type,
            subject_id=ex.subject_id,
            department_id=ex.department_id,
            semester=ex.semester,
            exam_date=ex.exam_date,
            start_time=ex.start_time,
            end_time=ex.end_time,
            classroom_id=ex.classroom_id,
            status=ex.status,
            created_at=ex.created_at,
            subject_name=ex.subject.name if ex.subject else None,
            subject_code=ex.subject.code if ex.subject else None,
            department_name=ex.department.name if ex.department else None,
            classroom_name=ex.classroom.name if ex.classroom else None,
            room_number=ex.classroom.room_number if ex.classroom else None
        ))
    return result

@router.post("", response_model=ExaminationOut, status_code=status.HTTP_201_CREATED)
def create_examination(
    ex_in: ExaminationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "exam_cell", "hod", "faculty"]))
):
    if ex_in.start_time >= ex_in.end_time:
        raise HTTPException(status_code=400, detail="start_time must be earlier than end_time")
    
    # Conflict Check: Examination Hall Double Booking
    existing = db.query(Examination).filter(
        Examination.classroom_id == ex_in.classroom_id,
        Examination.exam_date == ex_in.exam_date
    ).all()

    for ex in existing:
        if times_overlap(ex_in.start_time, ex_in.end_time, ex.start_time, ex.end_time):
            hall = db.query(Classroom).filter(Classroom.id == ex_in.classroom_id).first()
            h_name = hall.room_number if hall else "Selected Hall"
            raise HTTPException(
                status_code=400,
                detail=f"Hall Conflict: Examination Hall {h_name} is already booked on {ex_in.exam_date} from {ex.start_time} to {ex.end_time}."
            )

    exam = Examination(
        name=ex_in.name.strip(),
        exam_type=ex_in.exam_type,
        subject_id=ex_in.subject_id,
        department_id=ex_in.department_id,
        semester=ex_in.semester,
        exam_date=ex_in.exam_date,
        start_time=ex_in.start_time,
        end_time=ex_in.end_time,
        classroom_id=ex_in.classroom_id,
        status=ex_in.status
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)

    log_audit_action(db, current_user, "CREATE_EXAMINATION", "Examination", f"Scheduled exam {exam.name} on {exam.exam_date}")

    return ExaminationOut(
        id=exam.id,
        name=exam.name,
        exam_type=exam.exam_type,
        subject_id=exam.subject_id,
        department_id=exam.department_id,
        semester=exam.semester,
        exam_date=exam.exam_date,
        start_time=exam.start_time,
        end_time=exam.end_time,
        classroom_id=exam.classroom_id,
        status=exam.status,
        created_at=exam.created_at,
        subject_name=exam.subject.name if exam.subject else None,
        subject_code=exam.subject.code if exam.subject else None,
        department_name=exam.department.name if exam.department else None,
        classroom_name=exam.classroom.name if exam.classroom else None,
        room_number=exam.classroom.room_number if exam.classroom else None
    )

@router.put("/{exam_id}", response_model=ExaminationOut)
def update_examination(
    exam_id: int,
    ex_in: ExaminationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "exam_cell", "hod", "faculty"]))
):
    exam = db.query(Examination).filter(Examination.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Examination not found")
    
    exam_date = ex_in.exam_date or exam.exam_date
    start_time = ex_in.start_time or exam.start_time
    end_time = ex_in.end_time or exam.end_time
    classroom_id = ex_in.classroom_id or exam.classroom_id

    if start_time >= end_time:
        raise HTTPException(status_code=400, detail="start_time must be earlier than end_time")

    existing = db.query(Examination).filter(
        Examination.classroom_id == classroom_id,
        Examination.exam_date == exam_date,
        Examination.id != exam_id
    ).all()

    for ex in existing:
        if times_overlap(start_time, end_time, ex.start_time, ex.end_time):
            raise HTTPException(status_code=400, detail=f"Hall collision on {exam_date} ({ex.start_time}-{ex.end_time})")

    if ex_in.name is not None:
        exam.name = ex_in.name.strip()
    if ex_in.exam_type is not None:
        exam.exam_type = ex_in.exam_type
    if ex_in.subject_id is not None:
        exam.subject_id = ex_in.subject_id
    if ex_in.department_id is not None:
        exam.department_id = ex_in.department_id
    if ex_in.semester is not None:
        exam.semester = ex_in.semester
    exam.exam_date = exam_date
    exam.start_time = start_time
    exam.end_time = end_time
    exam.classroom_id = classroom_id
    if ex_in.status is not None:
        exam.status = ex_in.status

    db.commit()
    db.refresh(exam)
    log_audit_action(db, current_user, "UPDATE_EXAMINATION", "Examination", f"Updated exam #{exam.id}")

    return ExaminationOut(
        id=exam.id,
        name=exam.name,
        exam_type=exam.exam_type,
        subject_id=exam.subject_id,
        department_id=exam.department_id,
        semester=exam.semester,
        exam_date=exam.exam_date,
        start_time=exam.start_time,
        end_time=exam.end_time,
        classroom_id=exam.classroom_id,
        status=exam.status,
        created_at=exam.created_at,
        subject_name=exam.subject.name if exam.subject else None,
        subject_code=exam.subject.code if exam.subject else None,
        department_name=exam.department.name if exam.department else None,
        classroom_name=exam.classroom.name if exam.classroom else None,
        room_number=exam.classroom.room_number if exam.classroom else None
    )

@router.delete("/{exam_id}")
def delete_examination(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "exam_cell", "hod", "faculty"]))
):
    exam = db.query(Examination).filter(Examination.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Examination not found")
    
    db.delete(exam)
    db.commit()
    log_audit_action(db, current_user, "DELETE_EXAMINATION", "Examination", f"Deleted examination #{exam_id}")
    return {"message": "Examination successfully removed"}
