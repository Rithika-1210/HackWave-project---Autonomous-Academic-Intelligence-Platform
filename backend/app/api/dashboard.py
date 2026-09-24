from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.session import get_db
from app.models.models import (
    User, Department, Faculty, Student, Course, Subject, Classroom,
    TimetableEntry, Examination, AuditLog
)
from app.schemas.schemas import (
    AdminDashboardStats, HodDashboardStats, FacultyDashboardStats,
    StudentDashboardStats, ExamCellDashboardStats
)
from app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/dashboard", tags=["Role-Based Dashboards"])

@router.get("/admin", response_model=AdminDashboardStats)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    total_students = db.query(func.count(Student.id)).scalar() or 0
    total_faculty = db.query(func.count(Faculty.id)).scalar() or 0
    total_departments = db.query(func.count(Department.id)).scalar() or 0
    total_courses = db.query(func.count(Course.id)).scalar() or 0
    
    total_classrooms = db.query(func.count(Classroom.id)).filter(
        Classroom.resource_type == "Classroom"
    ).scalar() or 0
    total_laboratories = db.query(func.count(Classroom.id)).filter(
        Classroom.resource_type.ilike("%Laboratory%")
    ).scalar() or 0

    # Enrollment Chart
    enrollments = db.query(
        Student.enrollment_year, func.count(Student.id)
    ).group_by(Student.enrollment_year).order_by(Student.enrollment_year.asc()).all()
    enrollment_chart = [
        {"year": str(year), "count": count} for year, count in enrollments
    ]
    if not enrollment_chart:
        enrollment_chart = [{"year": "2023", "count": 120}, {"year": "2024", "count": 180}, {"year": "2025", "count": 240}]

    # Department Distribution
    depts = db.query(Department).all()
    dept_distribution = []
    for d in depts:
        s_cnt = db.query(func.count(Student.id)).filter(Student.department_id == d.id).scalar() or 0
        f_cnt = db.query(func.count(Faculty.id)).filter(Faculty.department_id == d.id).scalar() or 0
        dept_distribution.append({
            "name": d.code,
            "fullName": d.name,
            "students": s_cnt,
            "faculty": f_cnt
        })

    # Faculty Distribution by Designation
    faculty_desigs = db.query(
        Faculty.designation, func.count(Faculty.id)
    ).group_by(Faculty.designation).all()
    faculty_distribution = [
        {"designation": desig or "Lecturer", "count": count} for desig, count in faculty_desigs
    ]

    # Recent Audit Log Activities
    recent_logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(8).all()
    activities = [
        {
            "id": l.id,
            "user": l.user_email,
            "action": l.action,
            "resource": l.resource,
            "details": l.details,
            "time": l.created_at.strftime("%b %d, %H:%M")
        } for l in recent_logs
    ]

    return AdminDashboardStats(
        total_students=total_students,
        total_faculty=total_faculty,
        total_departments=total_departments,
        total_courses=total_courses,
        total_classrooms=total_classrooms,
        total_laboratories=total_laboratories,
        student_enrollment_chart=enrollment_chart,
        department_distribution=dept_distribution,
        faculty_distribution=faculty_distribution,
        recent_activities=activities
    )

@router.get("/hod", response_model=HodDashboardStats)
def get_hod_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "hod"]))
):
    dept_id = current_user.department_id
    if not dept_id:
        dept = db.query(Department).first()
        dept_id = dept.id if dept else None
    
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not configured for this HOD")

    total_f = db.query(func.count(Faculty.id)).filter(Faculty.department_id == dept.id).scalar() or 0
    total_s = db.query(func.count(Student.id)).filter(Student.department_id == dept.id).scalar() or 0
    total_subj = db.query(func.count(Subject.id)).filter(Subject.department_id == dept.id).scalar() or 0

    # Workload summary per faculty
    dept_faculty = db.query(Faculty).filter(Faculty.department_id == dept.id).all()
    faculty_workload = []
    total_hours = 0
    for f in dept_faculty:
        hrs = db.query(func.count(TimetableEntry.id)).filter(TimetableEntry.faculty_id == f.id).scalar() or 0
        total_hours += hrs
        faculty_workload.append({
            "facultyId": f.faculty_id,
            "name": f.full_name,
            "designation": f.designation,
            "workloadHours": hrs,
            "maxWorkload": f.max_weekly_workload,
            "utilizationPct": round((hrs / max(f.max_weekly_workload, 1)) * 100, 1)
        })

    avg_workload = round(total_hours / max(total_f, 1), 1)

    # Subject distribution
    subj_types = db.query(
        Subject.subject_type, func.count(Subject.id)
    ).filter(Subject.department_id == dept.id).group_by(Subject.subject_type).all()
    subject_distribution = [
        {"type": s_type or "General", "count": count} for s_type, count in subj_types
    ]

    # Department activities
    dept_logs = db.query(AuditLog).filter(
        AuditLog.details.ilike(f"%{dept.code}%")
    ).order_by(AuditLog.created_at.desc()).limit(6).all()
    activities = [
        {
            "id": l.id,
            "user": l.user_email,
            "action": l.action,
            "resource": l.resource,
            "details": l.details,
            "time": l.created_at.strftime("%b %d, %H:%M")
        } for l in dept_logs
    ]

    return HodDashboardStats(
        department_name=dept.name,
        department_code=dept.code,
        total_faculty=total_f,
        total_students=total_s,
        total_subjects=total_subj,
        avg_faculty_workload_hours=avg_workload,
        faculty_workload_summary=faculty_workload,
        subject_distribution=subject_distribution,
        recent_activities=activities
    )

@router.get("/faculty", response_model=FacultyDashboardStats)
def get_faculty_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "faculty", "hod"]))
):
    faculty = db.query(Faculty).filter(
        (Faculty.user_id == current_user.id) | (Faculty.email == current_user.email)
    ).first()
    
    if not faculty:
        faculty = db.query(Faculty).first()
    
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty record not found")

    dept_name = faculty.department.name if faculty.department else "General Department"
    
    assigned_subjects = db.query(Subject).filter(Subject.assigned_faculty_id == faculty.id).all()
    
    # Weekly Teaching Hours from timetable
    weekly_hours = db.query(func.count(TimetableEntry.id)).filter(
        TimetableEntry.faculty_id == faculty.id
    ).scalar() or 0

    # Today's classes
    today_day = datetime.now().strftime("%A")
    today_entries = db.query(TimetableEntry).filter(
        TimetableEntry.faculty_id == faculty.id,
        TimetableEntry.day_of_week == today_day
    ).order_by(TimetableEntry.start_time.asc()).all()

    today_classes = [
        {
            "subject": e.subject.name if e.subject else "Class",
            "code": e.subject.code if e.subject else "",
            "time": f"{e.start_time} - {e.end_time}",
            "room": e.classroom.room_number if e.classroom else "TBA",
            "batch": e.batch,
            "semester": f"Sem {e.semester}"
        } for e in today_entries
    ]

    # Upcoming classes across week
    upcoming_entries = db.query(TimetableEntry).filter(
        TimetableEntry.faculty_id == faculty.id
    ).order_by(TimetableEntry.day_of_week.asc(), TimetableEntry.start_time.asc()).limit(8).all()

    upcoming_classes = [
        {
            "day": e.day_of_week,
            "subject": e.subject.name if e.subject else "Class",
            "code": e.subject.code if e.subject else "",
            "time": f"{e.start_time} - {e.end_time}",
            "room": e.classroom.room_number if e.classroom else "TBA",
            "batch": e.batch
        } for e in upcoming_entries
    ]

    return FacultyDashboardStats(
        faculty_name=faculty.full_name,
        designation=faculty.designation,
        department_name=dept_name,
        weekly_teaching_hours=weekly_hours,
        total_assigned_courses=len(assigned_subjects),
        today_classes=today_classes,
        upcoming_classes=upcoming_classes
    )

@router.get("/student", response_model=StudentDashboardStats)
def get_student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "student"]))
):
    student = db.query(Student).filter(
        (Student.user_id == current_user.id) | (Student.email == current_user.email)
    ).first()

    if not student:
        student = db.query(Student).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    dept_name = student.department.name if student.department else "General Department"
    course_name = student.course.name if student.course else "Undergraduate Degree"

    # Enrolled subjects for this student's department and semester
    enrolled_count = db.query(func.count(Subject.id)).filter(
        Subject.department_id == student.department_id,
        Subject.semester == student.semester
    ).scalar() or 0

    # Today's classes
    today_day = datetime.now().strftime("%A")
    today_entries = db.query(TimetableEntry).filter(
        TimetableEntry.department_id == student.department_id,
        TimetableEntry.semester == student.semester,
        TimetableEntry.day_of_week == today_day
    ).order_by(TimetableEntry.start_time.asc()).all()

    today_classes = [
        {
            "subject": e.subject.name if e.subject else "Class",
            "code": e.subject.code if e.subject else "",
            "faculty": e.faculty.full_name if e.faculty else "Instructor",
            "time": f"{e.start_time} - {e.end_time}",
            "room": e.classroom.room_number if e.classroom else "TBA",
            "batch": e.batch
        } for e in today_entries
    ]

    # Upcoming examinations
    exams = db.query(Examination).filter(
        Examination.department_id == student.department_id,
        Examination.semester == student.semester,
        Examination.status == "Scheduled"
    ).order_by(Examination.exam_date.asc()).limit(5).all()

    upcoming_exams = [
        {
            "id": ex.id,
            "subject": ex.subject.name if ex.subject else "Exam",
            "code": ex.subject.code if ex.subject else "",
            "type": ex.exam_type,
            "date": ex.exam_date,
            "time": f"{ex.start_time} - {ex.end_time}",
            "hall": ex.classroom.room_number if ex.classroom else "TBA"
        } for ex in exams
    ]

    return StudentDashboardStats(
        student_name=student.full_name,
        student_id=student.student_id,
        department_name=dept_name,
        course_name=course_name,
        semester=student.semester,
        batch=student.batch,
        enrolled_subjects_count=enrolled_count,
        today_classes=today_classes,
        upcoming_examinations=upcoming_exams
    )

@router.get("/exam_cell", response_model=ExamCellDashboardStats)
def get_exam_cell_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "exam_cell"]))
):
    total_exams = db.query(func.count(Examination.id)).scalar() or 0
    upcoming_exams_count = db.query(func.count(Examination.id)).filter(
        Examination.status == "Scheduled"
    ).scalar() or 0
    
    total_exam_halls = db.query(func.count(Classroom.id)).filter(
        Classroom.capacity >= 30,
        Classroom.availability_status == "Available"
    ).scalar() or 0

    pending_tasks = db.query(func.count(Examination.id)).filter(
        Examination.status == "Scheduled"
    ).scalar() or 0

    # Upcoming examinations list
    exams = db.query(Examination).filter(
        Examination.status == "Scheduled"
    ).order_by(Examination.exam_date.asc()).limit(6).all()

    upcoming_exams = [
        {
            "id": ex.id,
            "name": ex.name,
            "subject": ex.subject.name if ex.subject else "Exam",
            "department": ex.department.code if ex.department else "",
            "date": ex.exam_date,
            "time": f"{ex.start_time} - {ex.end_time}",
            "hall": ex.classroom.room_number if ex.classroom else "TBA",
            "capacity": ex.classroom.capacity if ex.classroom else 0
        } for ex in exams
    ]

    # Hall occupancy distribution
    halls = db.query(Classroom).filter(Classroom.capacity >= 30).limit(6).all()
    hall_occupancy = [
        {
            "hall": h.room_number,
            "type": h.resource_type,
            "capacity": h.capacity,
            "status": h.availability_status
        } for h in halls
    ]

    # Recent exam audit logs
    exam_logs = db.query(AuditLog).filter(
        AuditLog.resource == "Examination"
    ).order_by(AuditLog.created_at.desc()).limit(6).all()

    activities = [
        {
            "id": l.id,
            "user": l.user_email,
            "action": l.action,
            "details": l.details,
            "time": l.created_at.strftime("%b %d, %H:%M")
        } for l in exam_logs
    ]

    return ExamCellDashboardStats(
        total_examinations=total_exams,
        upcoming_examinations_count=upcoming_exams_count,
        total_exam_halls=total_exam_halls,
        pending_tasks_count=pending_tasks,
        upcoming_examinations=upcoming_exams,
        hall_occupancy=hall_occupancy,
        recent_activities=activities
    )
