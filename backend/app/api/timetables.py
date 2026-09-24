from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.database.session import get_db
from app.models.models import TimetableEntry, Department, Subject, Faculty, Classroom, User, Student
from app.schemas.schemas import TimetableEntryOut, TimetableEntryCreate, TimetableEntryUpdate
from app.api.deps import get_current_user, require_roles, log_audit_action

router = APIRouter(prefix="/timetables", tags=["Timetable Management"])

def times_overlap(start1: str, end1: str, start2: str, end2: str) -> bool:
    """Check if two time intervals overlap (HH:MM format)."""
    return max(start1, start2) < min(end1, end2)

@router.get("", response_model=List[TimetableEntryOut])
def list_timetable_entries(
    department_id: Optional[int] = None,
    course_id: Optional[int] = None,
    semester: Optional[int] = None,
    batch: Optional[str] = None,
    faculty_id: Optional[int] = None,
    classroom_id: Optional[int] = None,
    day_of_week: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(TimetableEntry)
    
    # Role Scoping
    if current_user.role == "hod" and current_user.department_id:
        query = query.filter(TimetableEntry.department_id == current_user.department_id)
    elif current_user.role == "faculty":
        # Check if user has linked faculty profile
        faculty = db.query(Faculty).filter(
            (Faculty.user_id == current_user.id) | (Faculty.email == current_user.email)
        ).first()
        if faculty:
            # Default to personal faculty timetable unless explicitly requesting department
            if not department_id:
                query = query.filter(TimetableEntry.faculty_id == faculty.id)
    elif current_user.role == "student":
        student = db.query(Student).filter(
            (Student.user_id == current_user.id) | (Student.email == current_user.email)
        ).first()
        if student:
            query = query.filter(
                TimetableEntry.department_id == student.department_id,
                TimetableEntry.semester == student.semester
            )
    
    if department_id:
        query = query.filter(TimetableEntry.department_id == department_id)
    if course_id:
        query = query.filter(TimetableEntry.course_id == course_id)
    if semester:
        query = query.filter(TimetableEntry.semester == semester)
    if batch and batch != "All":
        query = query.filter(or_(TimetableEntry.batch == batch, TimetableEntry.batch == "All"))
    if faculty_id:
        query = query.filter(TimetableEntry.faculty_id == faculty_id)
    if classroom_id:
        query = query.filter(TimetableEntry.classroom_id == classroom_id)
    if day_of_week:
        query = query.filter(TimetableEntry.day_of_week == day_of_week)

    entries = query.order_by(
        TimetableEntry.day_of_week.asc(),
        TimetableEntry.start_time.asc()
    ).all()

    result = []
    for e in entries:
        result.append(TimetableEntryOut(
            id=e.id,
            timetable_id=e.timetable_id,
            department_id=e.department_id,
            course_id=e.course_id,
            semester=e.semester,
            batch=e.batch,
            subject_id=e.subject_id,
            faculty_id=e.faculty_id,
            classroom_id=e.classroom_id,
            day_of_week=e.day_of_week,
            start_time=e.start_time,
            end_time=e.end_time,
            created_at=e.created_at,
            subject_name=e.subject.name if e.subject else None,
            subject_code=e.subject.code if e.subject else None,
            faculty_name=e.faculty.full_name if e.faculty else None,
            classroom_name=e.classroom.name if e.classroom else None,
            room_number=e.classroom.room_number if e.classroom else None,
            department_name=e.department.name if e.department else None
        ))
    return result

@router.post("", response_model=TimetableEntryOut, status_code=status.HTTP_201_CREATED)
def create_timetable_entry(
    entry_in: TimetableEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "hod"]))
):
    # Time validity check
    if entry_in.start_time >= entry_in.end_time:
        raise HTTPException(
            status_code=400,
            detail="Invalid time range: start_time must be strictly earlier than end_time"
        )
    
    # 1. Conflict Check: Faculty Double Booking
    existing_faculty_entries = db.query(TimetableEntry).filter(
        TimetableEntry.faculty_id == entry_in.faculty_id,
        TimetableEntry.day_of_week == entry_in.day_of_week
    ).all()

    for e in existing_faculty_entries:
        if times_overlap(entry_in.start_time, entry_in.end_time, e.start_time, e.end_time):
            faculty = db.query(Faculty).filter(Faculty.id == entry_in.faculty_id).first()
            f_name = faculty.full_name if faculty else "Selected faculty"
            raise HTTPException(
                status_code=400,
                detail=f"Scheduling Conflict: {f_name} is already booked on {entry_in.day_of_week} between {e.start_time} and {e.end_time}."
            )

    # 2. Conflict Check: Classroom Double Booking
    existing_room_entries = db.query(TimetableEntry).filter(
        TimetableEntry.classroom_id == entry_in.classroom_id,
        TimetableEntry.day_of_week == entry_in.day_of_week
    ).all()

    for e in existing_room_entries:
        if times_overlap(entry_in.start_time, entry_in.end_time, e.start_time, e.end_time):
            room = db.query(Classroom).filter(Classroom.id == entry_in.classroom_id).first()
            r_name = room.room_number if room else "Selected room"
            raise HTTPException(
                status_code=400,
                detail=f"Resource Conflict: Classroom/Lab {r_name} is already occupied on {entry_in.day_of_week} between {e.start_time} and {e.end_time}."
            )

    entry = TimetableEntry(
        timetable_id=entry_in.timetable_id,
        department_id=entry_in.department_id,
        course_id=entry_in.course_id,
        semester=entry_in.semester,
        batch=entry_in.batch,
        subject_id=entry_in.subject_id,
        faculty_id=entry_in.faculty_id,
        classroom_id=entry_in.classroom_id,
        day_of_week=entry_in.day_of_week,
        start_time=entry_in.start_time,
        end_time=entry_in.end_time
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    log_audit_action(
        db, current_user, "CREATE_TIMETABLE_ENTRY", "TimetableEntry",
        f"Scheduled {entry.day_of_week} {entry.start_time}-{entry.end_time} for Subject #{entry.subject_id}"
    )

    return TimetableEntryOut(
        id=entry.id,
        timetable_id=entry.timetable_id,
        department_id=entry.department_id,
        course_id=entry.course_id,
        semester=entry.semester,
        batch=entry.batch,
        subject_id=entry.subject_id,
        faculty_id=entry.faculty_id,
        classroom_id=entry.classroom_id,
        day_of_week=entry.day_of_week,
        start_time=entry.start_time,
        end_time=entry.end_time,
        created_at=entry.created_at,
        subject_name=entry.subject.name if entry.subject else None,
        subject_code=entry.subject.code if entry.subject else None,
        faculty_name=entry.faculty.full_name if entry.faculty else None,
        classroom_name=entry.classroom.name if entry.classroom else None,
        room_number=entry.classroom.room_number if entry.classroom else None,
        department_name=entry.department.name if entry.department else None
    )

@router.put("/{entry_id}", response_model=TimetableEntryOut)
def update_timetable_entry(
    entry_id: int,
    entry_in: TimetableEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "hod"]))
):
    entry = db.query(TimetableEntry).filter(TimetableEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Timetable entry not found")
    
    start_time = entry_in.start_time or entry.start_time
    end_time = entry_in.end_time or entry.end_time
    faculty_id = entry_in.faculty_id or entry.faculty_id
    classroom_id = entry_in.classroom_id or entry.classroom_id
    day_of_week = entry_in.day_of_week or entry.day_of_week

    if start_time >= end_time:
        raise HTTPException(status_code=400, detail="Invalid time range: start_time must be earlier than end_time")

    # Conflict check excluding this current entry
    existing_f = db.query(TimetableEntry).filter(
        TimetableEntry.faculty_id == faculty_id,
        TimetableEntry.day_of_week == day_of_week,
        TimetableEntry.id != entry_id
    ).all()
    for e in existing_f:
        if times_overlap(start_time, end_time, e.start_time, e.end_time):
            raise HTTPException(status_code=400, detail=f"Faculty collision on {day_of_week} ({e.start_time}-{e.end_time})")

    existing_r = db.query(TimetableEntry).filter(
        TimetableEntry.classroom_id == classroom_id,
        TimetableEntry.day_of_week == day_of_week,
        TimetableEntry.id != entry_id
    ).all()
    for e in existing_r:
        if times_overlap(start_time, end_time, e.start_time, e.end_time):
            raise HTTPException(status_code=400, detail=f"Room collision on {day_of_week} ({e.start_time}-{e.end_time})")

    if entry_in.department_id is not None:
        entry.department_id = entry_in.department_id
    if entry_in.course_id is not None:
        entry.course_id = entry_in.course_id
    if entry_in.semester is not None:
        entry.semester = entry_in.semester
    if entry_in.batch is not None:
        entry.batch = entry_in.batch
    if entry_in.subject_id is not None:
        entry.subject_id = entry_in.subject_id
    entry.faculty_id = faculty_id
    entry.classroom_id = classroom_id
    entry.day_of_week = day_of_week
    entry.start_time = start_time
    entry.end_time = end_time

    db.commit()
    db.refresh(entry)
    log_audit_action(db, current_user, "UPDATE_TIMETABLE_ENTRY", "TimetableEntry", f"Updated slot #{entry.id}")

    return TimetableEntryOut(
        id=entry.id,
        timetable_id=entry.timetable_id,
        department_id=entry.department_id,
        course_id=entry.course_id,
        semester=entry.semester,
        batch=entry.batch,
        subject_id=entry.subject_id,
        faculty_id=entry.faculty_id,
        classroom_id=entry.classroom_id,
        day_of_week=entry.day_of_week,
        start_time=entry.start_time,
        end_time=entry.end_time,
        created_at=entry.created_at,
        subject_name=entry.subject.name if entry.subject else None,
        subject_code=entry.subject.code if entry.subject else None,
        faculty_name=entry.faculty.full_name if entry.faculty else None,
        classroom_name=entry.classroom.name if entry.classroom else None,
        room_number=entry.classroom.room_number if entry.classroom else None,
        department_name=entry.department.name if entry.department else None
    )

@router.delete("/{entry_id}")
def delete_timetable_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "hod"]))
):
    entry = db.query(TimetableEntry).filter(TimetableEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Timetable entry not found")
    
    db.delete(entry)
    db.commit()
    log_audit_action(db, current_user, "DELETE_TIMETABLE_ENTRY", "TimetableEntry", f"Deleted slot #{entry_id}")
    return {"message": "Timetable entry successfully removed"}
