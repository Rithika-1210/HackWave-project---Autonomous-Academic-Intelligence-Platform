from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# --------------------------------------------------------------------------
# Auth & User Schemas
# --------------------------------------------------------------------------
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserBase(BaseModel):
    email: str
    full_name: str
    role: str  # admin, hod, faculty, student, exam_cell
    department_id: Optional[int] = None
    is_active: bool = True
    approval_status: Optional[str] = "Approved"

class UserCreate(UserBase):
    password: str
    semester: Optional[int] = None
    course_code: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    department_id: Optional[int] = None
    is_active: Optional[bool] = None
    approval_status: Optional[str] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# --------------------------------------------------------------------------
# Department Schemas
# --------------------------------------------------------------------------
class DepartmentBase(BaseModel):
    name: str
    code: str
    hod_name: Optional[str] = None
    description: Optional[str] = None
    status: str = "Active"

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    hod_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class DepartmentOut(DepartmentBase):
    id: int
    created_at: datetime
    faculty_count: Optional[int] = 0
    student_count: Optional[int] = 0

    class Config:
        from_attributes = True

# --------------------------------------------------------------------------
# Faculty Schemas
# --------------------------------------------------------------------------
class FacultyBase(BaseModel):
    faculty_id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    department_id: int
    designation: str = "Assistant Professor"
    specialization: Optional[str] = None
    max_weekly_workload: int = 18
    status: str = "Active"

class FacultyCreate(FacultyBase):
    create_user_account: bool = False
    password: Optional[str] = None

class FacultyUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department_id: Optional[int] = None
    designation: Optional[str] = None
    specialization: Optional[str] = None
    max_weekly_workload: Optional[int] = None
    status: Optional[str] = None

class FacultyOut(FacultyBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    department_name: Optional[str] = None
    current_workload_hours: Optional[int] = 0

    class Config:
        from_attributes = True

# --------------------------------------------------------------------------
# Student Schemas
# --------------------------------------------------------------------------
class StudentBase(BaseModel):
    student_id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    department_id: int
    course_id: Optional[int] = None
    semester: int = 1
    batch: str = "Batch 2022-2026"
    enrollment_year: int = 2022
    status: str = "Active"

class StudentCreate(StudentBase):
    create_user_account: bool = False
    password: Optional[str] = None

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department_id: Optional[int] = None
    course_id: Optional[int] = None
    semester: Optional[int] = None
    batch: Optional[str] = None
    enrollment_year: Optional[int] = None
    status: Optional[str] = None

class StudentOut(StudentBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    department_name: Optional[str] = None
    course_name: Optional[str] = None

    class Config:
        from_attributes = True

# --------------------------------------------------------------------------
# Course Schemas
# --------------------------------------------------------------------------
class CourseBase(BaseModel):
    name: str
    code: str
    department_id: int
    duration_years: int = 4
    degree_type: str = "Undergraduate"
    status: str = "Active"

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    department_id: Optional[int] = None
    duration_years: Optional[int] = None
    degree_type: Optional[str] = None
    status: Optional[str] = None

class CourseOut(CourseBase):
    id: int
    created_at: datetime
    department_name: Optional[str] = None
    subjects_count: Optional[int] = 0

    class Config:
        from_attributes = True

# --------------------------------------------------------------------------
# Subject Schemas
# --------------------------------------------------------------------------
class SubjectBase(BaseModel):
    name: str
    code: str
    department_id: int
    course_id: Optional[int] = None
    semester: int = 1
    weekly_periods: int = 4
    subject_type: str = "Theory"
    assigned_faculty_id: Optional[int] = None
    status: str = "Active"

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    department_id: Optional[int] = None
    course_id: Optional[int] = None
    semester: Optional[int] = None
    weekly_periods: Optional[int] = None
    subject_type: Optional[str] = None
    assigned_faculty_id: Optional[int] = None
    status: Optional[str] = None

class SubjectOut(SubjectBase):
    id: int
    created_at: datetime
    department_name: Optional[str] = None
    course_name: Optional[str] = None
    assigned_faculty_name: Optional[str] = None

    class Config:
        from_attributes = True

# --------------------------------------------------------------------------
# Resource (Classroom & Lab) Schemas
# --------------------------------------------------------------------------
class ClassroomBase(BaseModel):
    name: str
    resource_type: str = "Classroom"  # Classroom, Computer Laboratory, Science Laboratory, Seminar Hall, Examination Hall
    building: str
    room_number: str
    capacity: int = 60
    equipment: Optional[str] = None
    availability_status: str = "Available"

class ClassroomCreate(ClassroomBase):
    pass

class ClassroomUpdate(BaseModel):
    name: Optional[str] = None
    resource_type: Optional[str] = None
    building: Optional[str] = None
    room_number: Optional[str] = None
    capacity: Optional[int] = None
    equipment: Optional[str] = None
    availability_status: Optional[str] = None

class ClassroomOut(ClassroomBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --------------------------------------------------------------------------
# Timetable & Entry Schemas
# --------------------------------------------------------------------------
class TimetableEntryBase(BaseModel):
    department_id: int
    course_id: Optional[int] = None
    semester: int = 1
    batch: str = "All"
    subject_id: int
    faculty_id: int
    classroom_id: int
    day_of_week: str  # Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
    start_time: str   # "09:00"
    end_time: str     # "10:00"

class TimetableEntryCreate(TimetableEntryBase):
    timetable_id: Optional[int] = None

class TimetableEntryUpdate(BaseModel):
    department_id: Optional[int] = None
    course_id: Optional[int] = None
    semester: Optional[int] = None
    batch: Optional[str] = None
    subject_id: Optional[int] = None
    faculty_id: Optional[int] = None
    classroom_id: Optional[int] = None
    day_of_week: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None

class TimetableEntryOut(TimetableEntryBase):
    id: int
    timetable_id: Optional[int] = None
    created_at: datetime
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None
    faculty_name: Optional[str] = None
    classroom_name: Optional[str] = None
    room_number: Optional[str] = None
    department_name: Optional[str] = None

    class Config:
        from_attributes = True

# --------------------------------------------------------------------------
# Examination Schemas
# --------------------------------------------------------------------------
class ExaminationBase(BaseModel):
    name: str
    exam_type: str = "Mid-Term"
    subject_id: int
    department_id: int
    semester: int = 1
    exam_date: str  # "2026-10-15"
    start_time: str # "10:00"
    end_time: str   # "13:00"
    classroom_id: int
    status: str = "Scheduled"

class ExaminationCreate(ExaminationBase):
    pass

class ExaminationUpdate(BaseModel):
    name: Optional[str] = None
    exam_type: Optional[str] = None
    subject_id: Optional[int] = None
    department_id: Optional[int] = None
    semester: Optional[int] = None
    exam_date: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    classroom_id: Optional[int] = None
    status: Optional[str] = None

class ExaminationOut(ExaminationBase):
    id: int
    created_at: datetime
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None
    department_name: Optional[str] = None
    classroom_name: Optional[str] = None
    room_number: Optional[str] = None

    class Config:
        from_attributes = True

# --------------------------------------------------------------------------
# Notification Schemas
# --------------------------------------------------------------------------
class NotificationBase(BaseModel):
    role_target: str = "all"
    title: str
    message: str
    notification_type: str = "info"

class NotificationCreate(NotificationBase):
    user_id: Optional[int] = None

class NotificationOut(NotificationBase):
    id: int
    user_id: Optional[int] = None
    is_read: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

# --------------------------------------------------------------------------
# Dashboard Schemas
# --------------------------------------------------------------------------
class AdminDashboardStats(BaseModel):
    total_students: int
    total_faculty: int
    total_departments: int
    total_courses: int
    total_classrooms: int
    total_laboratories: int
    student_enrollment_chart: List[Dict[str, Any]]
    department_distribution: List[Dict[str, Any]]
    faculty_distribution: List[Dict[str, Any]]
    recent_activities: List[Dict[str, Any]]

class HodDashboardStats(BaseModel):
    department_name: str
    department_code: str
    total_faculty: int
    total_students: int
    total_subjects: int
    avg_faculty_workload_hours: float
    faculty_workload_summary: List[Dict[str, Any]]
    subject_distribution: List[Dict[str, Any]]
    recent_activities: List[Dict[str, Any]]

class FacultyDashboardStats(BaseModel):
    faculty_name: str
    designation: str
    department_name: str
    weekly_teaching_hours: int
    total_assigned_courses: int
    today_classes: List[Dict[str, Any]]
    upcoming_classes: List[Dict[str, Any]]

class StudentDashboardStats(BaseModel):
    student_name: str
    student_id: str
    department_name: str
    course_name: str
    semester: int
    batch: str
    enrolled_subjects_count: int
    today_classes: List[Dict[str, Any]]
    upcoming_examinations: List[Dict[str, Any]]

class ExamCellDashboardStats(BaseModel):
    total_examinations: int
    upcoming_examinations_count: int
    total_exam_halls: int
    pending_tasks_count: int
    upcoming_examinations: List[Dict[str, Any]]
    hall_occupancy: List[Dict[str, Any]]
    recent_activities: List[Dict[str, Any]]
