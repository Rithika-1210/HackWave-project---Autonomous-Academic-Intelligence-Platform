from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import StudentEnrollment, Student, Subject, User, Faculty
from app.schemas.schemas import (
    StudentEnrollmentOut, StudentEnrollmentCreate, StudentEnrollmentUpdate
)
from app.api.deps import get_current_user, require_roles, log_audit_action

router = APIRouter(prefix="/enrollments", tags=["Student Enrollments"])

@router.get("", response_model=List[StudentEnrollmentOut])
def list_enrollments(
    semester: Optional[int] = Query(None),
    student_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(StudentEnrollment)

    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student:
            student = db.query(Student).filter(Student.email == current_user.email).first()
        if not student:
            return []
        query = query.filter(StudentEnrollment.student_id == student.id)
    elif student_id:
        query = query.filter(StudentEnrollment.student_id == student_id)
    elif current_user.role in ["hod", "faculty"]:
        # scoped to students in their department
        dept_id = current_user.department_id
        if dept_id:
            query = query.join(Student).filter(Student.department_id == dept_id)

    if semester:
        query = query.filter(StudentEnrollment.semester == semester)

    enrollments = query.all()
    results = []
    for enr in enrollments:
        subject = db.query(Subject).filter(Subject.id == enr.subject_id).first()
        fac_name = "Not Assigned"
        if subject and subject.assigned_faculty_id:
            fac = db.query(Faculty).filter(Faculty.id == subject.assigned_faculty_id).first()
            if fac:
                fac_name = fac.full_name

        item = StudentEnrollmentOut(
            id=enr.id,
            student_id=enr.student_id,
            subject_id=enr.subject_id,
            semester=enr.semester,
            academic_year=enr.academic_year,
            enrollment_status=enr.enrollment_status,
            internal_assessment_1=enr.internal_assessment_1,
            internal_assessment_2=enr.internal_assessment_2,
            assignment_marks=enr.assignment_marks,
            attendance_pct=enr.attendance_pct,
            grade=enr.grade,
            subject_name=subject.name if subject else "Unknown",
            subject_code=subject.code if subject else "N/A",
            subject_type=subject.subject_type if subject else "Theory",
            weekly_periods=subject.weekly_periods if subject else 4,
            faculty_name=fac_name,
            created_at=enr.created_at
        )
        results.append(item)
    return results

@router.post("", response_model=StudentEnrollmentOut, status_code=status.HTTP_201_CREATED)
def enroll_subject(
    payload: StudentEnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = None
    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student:
            student = db.query(Student).filter(Student.email == current_user.email).first()
        if not student:
            raise HTTPException(status_code=404, detail="Student profile not found")
    else:
        raise HTTPException(status_code=400, detail="Only students can enroll in courses directly")

    subject = db.query(Subject).filter(Subject.id == payload.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # Check if already enrolled
    existing = db.query(StudentEnrollment).filter(
        StudentEnrollment.student_id == student.id,
        StudentEnrollment.subject_id == payload.subject_id,
        StudentEnrollment.enrollment_status == "Enrolled"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this subject")

    enrollment = StudentEnrollment(
        student_id=student.id,
        subject_id=payload.subject_id,
        semester=payload.semester or subject.semester or student.semester,
        academic_year=payload.academic_year or "2025-2026",
        enrollment_status="Enrolled",
        internal_assessment_1=45,
        internal_assessment_2=46,
        assignment_marks=19,
        attendance_pct=95,
        grade="A"
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    fac_name = "Not Assigned"
    if subject.assigned_faculty_id:
        fac = db.query(Faculty).filter(Faculty.id == subject.assigned_faculty_id).first()
        if fac:
            fac_name = fac.full_name

    return StudentEnrollmentOut(
        id=enrollment.id,
        student_id=enrollment.student_id,
        subject_id=enrollment.subject_id,
        semester=enrollment.semester,
        academic_year=enrollment.academic_year,
        enrollment_status=enrollment.enrollment_status,
        internal_assessment_1=enrollment.internal_assessment_1,
        internal_assessment_2=enrollment.internal_assessment_2,
        assignment_marks=enrollment.assignment_marks,
        attendance_pct=enrollment.attendance_pct,
        grade=enrollment.grade,
        subject_name=subject.name,
        subject_code=subject.code,
        subject_type=subject.subject_type,
        weekly_periods=subject.weekly_periods,
        faculty_name=fac_name,
        created_at=enrollment.created_at
    )

@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def unenroll_subject(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enrollment = db.query(StudentEnrollment).filter(StudentEnrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment record not found")

    if current_user.role == "student":
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student or student.id != enrollment.student_id:
            raise HTTPException(status_code=403, detail="Cannot drop another student's subject")

    db.delete(enrollment)
    db.commit()
    return None
