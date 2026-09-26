from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from app.database.session import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)  # admin, hod, faculty, student, exam_cell
    description = Column(String(255), nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, index=True)  # admin, hod, faculty, student, exam_cell
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)
    approval_status = Column(String(50), default="Approved")  # Approved, Pending, Rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    department = relationship("Department", back_populates="users", foreign_keys=[department_id])
    faculty_profile = relationship("Faculty", back_populates="user", uselist=False)
    student_profile = relationship("Student", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)  # CSE, ECE, MECH
    hod_name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="Active")  # Active, Inactive
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="department", foreign_keys="User.department_id")
    faculty_members = relationship("Faculty", back_populates="department")
    students = relationship("Student", back_populates="department")
    courses = relationship("Course", back_populates="department")
    subjects = relationship("Subject", back_populates="department")
    timetable_entries = relationship("TimetableEntry", back_populates="department")
    examinations = relationship("Examination", back_populates="department")

class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    faculty_id = Column(String(50), unique=True, nullable=False, index=True)  # FAC-CSE-001
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    designation = Column(String(100), default="Assistant Professor")
    specialization = Column(String(255), nullable=True)
    max_weekly_workload = Column(Integer, default=18)
    status = Column(String(50), default="Active")  # Active, On Leave, Inactive
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="faculty_profile")
    department = relationship("Department", back_populates="faculty_members")
    subjects = relationship("Subject", back_populates="assigned_faculty")
    timetable_entries = relationship("TimetableEntry", back_populates="faculty")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)  # BTECH-CSE
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    duration_years = Column(Integer, default=4)
    degree_type = Column(String(100), default="Undergraduate")  # Undergraduate, Postgraduate, Doctoral
    status = Column(String(50), default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="courses")
    students = relationship("Student", back_populates="course")
    subjects = relationship("Subject", back_populates="course")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    student_id = Column(String(50), unique=True, nullable=False, index=True)  # STU-2022-CS049
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    semester = Column(Integer, default=1)
    batch = Column(String(50), default="Batch 2022-2026")
    enrollment_year = Column(Integer, default=2022)
    status = Column(String(50), default="Active")  # Active, Graduated, Suspended
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="student_profile")
    department = relationship("Department", back_populates="students")
    course = relationship("Course", back_populates="students")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)  # CS301
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    semester = Column(Integer, default=1)
    weekly_periods = Column(Integer, default=4)
    subject_type = Column(String(50), default="Theory")  # Theory, Practical, Seminar
    assigned_faculty_id = Column(Integer, ForeignKey("faculty.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="subjects")
    course = relationship("Course", back_populates="subjects")
    assigned_faculty = relationship("Faculty", back_populates="subjects")
    timetable_entries = relationship("TimetableEntry", back_populates="subject")
    examinations = relationship("Examination", back_populates="subject")

class FacultySubjectMapping(Base):
    __tablename__ = "faculty_subject_mapping"

    id = Column(Integer, primary_key=True, index=True)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    academic_year = Column(String(50), default="2025-2026")
    semester = Column(Integer, default=1)

class StudentEnrollment(Base):
    __tablename__ = "student_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    semester = Column(Integer, default=1)
    academic_year = Column(String(50), default="2025-2026")
    enrollment_status = Column(String(50), default="Enrolled")  # Enrolled, Completed, Dropped
    internal_assessment_1 = Column(Integer, default=45)
    internal_assessment_2 = Column(Integer, default=48)
    assignment_marks = Column(Integer, default=19)
    attendance_pct = Column(Integer, default=92)
    grade = Column(String(10), default="A+")
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student")
    subject = relationship("Subject")

class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    resource_type = Column(String(100), default="Classroom")  # Classroom, Computer Laboratory, Science Laboratory, Seminar Hall, Examination Hall
    building = Column(String(100), nullable=False)
    room_number = Column(String(50), unique=True, nullable=False, index=True)
    capacity = Column(Integer, default=60)
    equipment = Column(String(255), nullable=True)
    availability_status = Column(String(50), default="Available")  # Available, Maintenance, Occupied
    created_at = Column(DateTime, default=datetime.utcnow)

    timetable_entries = relationship("TimetableEntry", back_populates="classroom")
    examinations = relationship("Examination", back_populates="classroom")

class Timetable(Base):
    __tablename__ = "timetables"

    id = Column(Integer, primary_key=True, index=True)
    academic_year = Column(String(50), default="2025-2026")
    semester = Column(Integer, default=1)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    status = Column(String(50), default="Published")  # Draft, Published, Archived
    created_at = Column(DateTime, default=datetime.utcnow)

    entries = relationship("TimetableEntry", back_populates="timetable", cascade="all, delete-orphan")

class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    id = Column(Integer, primary_key=True, index=True)
    timetable_id = Column(Integer, ForeignKey("timetables.id", ondelete="SET NULL"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    semester = Column(Integer, default=1)
    batch = Column(String(50), default="All")  # Section A, Section B, All
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty.id"), nullable=False)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=False)
    day_of_week = Column(String(50), nullable=False)  # Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
    start_time = Column(String(20), nullable=False)  # "09:00"
    end_time = Column(String(20), nullable=False)    # "10:00"
    created_at = Column(DateTime, default=datetime.utcnow)

    timetable = relationship("Timetable", back_populates="entries")
    department = relationship("Department", back_populates="timetable_entries")
    subject = relationship("Subject", back_populates="timetable_entries")
    faculty = relationship("Faculty", back_populates="timetable_entries")
    classroom = relationship("Classroom", back_populates="timetable_entries")

class Examination(Base):
    __tablename__ = "examinations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    exam_type = Column(String(100), default="Mid-Term")  # Mid-Term, End-Semester, Practical, Internal
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    semester = Column(Integer, default=1)
    exam_date = Column(String(50), nullable=False)  # "2026-10-15"
    start_time = Column(String(20), nullable=False)  # "10:00"
    end_time = Column(String(20), nullable=False)    # "13:00"
    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=False)
    status = Column(String(50), default="Scheduled")  # Scheduled, In Progress, Completed, Cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="examinations")
    subject = relationship("Subject", back_populates="examinations")
    classroom = relationship("Classroom", back_populates="examinations")

class ExaminationHall(Base):
    __tablename__ = "examination_halls"

    id = Column(Integer, primary_key=True, index=True)
    examination_id = Column(Integer, ForeignKey("examinations.id", ondelete="CASCADE"), nullable=False)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=False)
    allocated_capacity = Column(Integer, default=40)
    invigilator_faculty_id = Column(Integer, ForeignKey("faculty.id", ondelete="SET NULL"), nullable=True)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    role_target = Column(String(50), default="all")  # all, admin, hod, faculty, student, exam_cell
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info")  # info, warning, success, urgent
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)  # CREATE_DEPARTMENT, LOGIN_SUCCESS, etc.
    resource = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")


# -------------------------------------------------------------
# STAGE 2: AI-POWERED ACADEMIC INTELLIGENCE MODELS
# -------------------------------------------------------------

class SchedulingConstraint(Base):
    __tablename__ = "scheduling_constraints"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    academic_year = Column(String(50), default="2025-2026")
    semester = Column(Integer, default=1)
    working_days = Column(String(255), default="Monday,Tuesday,Wednesday,Thursday,Friday")
    start_time = Column(String(20), default="09:00")
    end_time = Column(String(20), default="17:00")
    period_duration_mins = Column(Integer, default=60)
    lunch_break_start = Column(String(20), default="13:00")
    lunch_break_end = Column(String(20), default="14:00")
    max_faculty_daily_hours = Column(Integer, default=4)
    max_consecutive_periods = Column(Integer, default=2)
    weights_json = Column(Text, nullable=True)  # JSON for soft constraint weights
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department")


class ScheduleJob(Base):
    __tablename__ = "schedule_jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String(100), unique=True, index=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    semester = Column(Integer, default=1)
    batch = Column(String(50), default="Section A")
    academic_year = Column(String(50), default="2025-2026")
    status = Column(String(50), default="Optimizing")  # Queued, Optimizing, Feasible, Infeasible, Approved, Published
    optimization_score = Column(Integer, default=0)
    hard_conflicts_count = Column(Integer, default=0)
    gap_efficiency_pct = Column(Integer, default=0)
    workload_balance_pct = Column(Integer, default=0)
    generated_entries = Column(Text, nullable=True)  # JSON string of generated slots
    infeasibility_reason = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    department = relationship("Department")


class ConflictRecord(Base):
    __tablename__ = "conflict_records"

    id = Column(Integer, primary_key=True, index=True)
    conflict_id = Column(String(100), unique=True, index=True, nullable=False)
    conflict_type = Column(String(100), nullable=False)  # Faculty Double-Booking, Classroom Collision, Batch Overlap, Capacity Violation, Exam Hall Collision, Workload Exceeded
    severity = Column(String(50), default="High")  # Critical, High, Medium, Low
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    affected_faculty_id = Column(Integer, ForeignKey("faculty.id", ondelete="SET NULL"), nullable=True)
    affected_classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="SET NULL"), nullable=True)
    affected_subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    affected_batch = Column(String(50), nullable=True)
    date_or_day = Column(String(50), nullable=True)
    time_slot = Column(String(50), nullable=True)
    description = Column(Text, nullable=False)
    root_cause = Column(Text, nullable=True)
    suggested_resolution = Column(Text, nullable=True)
    status = Column(String(50), default="Unresolved")  # Unresolved, In Progress, Resolved, Dismissed
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    department = relationship("Department")
    affected_faculty = relationship("Faculty")
    affected_classroom = relationship("Classroom")
    affected_subject = relationship("Subject")


class ReschedulingRequest(Base):
    __tablename__ = "rescheduling_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(100), unique=True, index=True, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    reason = Column(String(100), nullable=False)  # Faculty Leave, Emergency Unavailability, Classroom Maintenance, Holiday, Event
    target_date = Column(String(50), nullable=False)  # "2026-09-25" or "Monday"
    affected_faculty_id = Column(Integer, ForeignKey("faculty.id", ondelete="SET NULL"), nullable=True)
    affected_classroom_id = Column(Integer, ForeignKey("classrooms.id", ondelete="SET NULL"), nullable=True)
    affected_entries_json = Column(Text, nullable=True)  # List of entry objects
    proposed_solution_json = Column(Text, nullable=True)  # List of modified entries
    disruption_score = Column(Integer, default=0)  # Count of slots shifted
    explanation = Column(Text, nullable=True)
    status = Column(String(50), default="Pending")  # Pending, Approved, Rejected, Applied
    requester_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    review_comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    department = relationship("Department")
    affected_faculty = relationship("Faculty")
    affected_classroom = relationship("Classroom")


class ScheduleRevision(Base):
    __tablename__ = "schedule_revisions"

    id = Column(Integer, primary_key=True, index=True)
    timetable_id = Column(Integer, ForeignKey("timetables.id", ondelete="SET NULL"), nullable=True)
    revision_number = Column(Integer, default=1)
    change_type = Column(String(100), nullable=False)  # Emergency Reschedule, AI Rebalancing, Manual Edit
    original_data = Column(Text, nullable=True)
    modified_data = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=False)  # Conflict Resolution, Workload Rebalancing, Room Optimization, Exam Hall Allocation, Preventive Risk
    title = Column(String(255), nullable=False)
    problem_identified = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    explanation = Column(Text, nullable=False)
    affected_users_resources = Column(Text, nullable=True)  # JSON summary
    expected_benefits = Column(Text, nullable=True)
    potential_tradeoffs = Column(Text, nullable=True)
    supporting_data = Column(Text, nullable=True)  # JSON metrics
    approval_required = Column(Boolean, default=True)
    status = Column(String(50), default="Active")  # Active, Simulated, Approved, Rejected
    created_at = Column(DateTime, default=datetime.utcnow)


class AcademicRiskRecord(Base):
    __tablename__ = "academic_risk_records"

    id = Column(Integer, primary_key=True, index=True)
    risk_id = Column(String(100), unique=True, index=True, nullable=False)
    risk_category = Column(String(100), nullable=False)  # Single Point of Failure, Room Bottleneck, Workload Overload, Schedule Rigidity, Event Disruption
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    risk_level = Column(String(50), default="Medium")  # Critical, High, Medium, Low
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    supporting_evidence = Column(Text, nullable=True)
    potential_impact = Column(Text, nullable=True)
    preventive_action = Column(Text, nullable=True)
    status = Column(String(50), default="Active")  # Active, Mitigated
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department")


class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(100), unique=True, index=True, nullable=False)
    request_type = Column(String(100), nullable=False)  # Timetable, Rescheduling, Workload Reassignment, Examination Schedule, Resource Allocation
    title = Column(String(255), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    details_json = Column(Text, nullable=True)
    status = Column(String(50), default="Pending")  # Pending, Approved, Rejected
    requester_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    review_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    requester = relationship("User", foreign_keys=[requester_id])
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    department = relationship("Department")


# -------------------------------------------------------------
# STAGE 3: ADVANCED AI INTELLIGENCE & DIGITAL TWIN MODELS
# -------------------------------------------------------------

class DigitalTwinScenario(Base):
    __tablename__ = "digital_twin_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    scenario_type = Column(String(100), nullable=False)  # Faculty Leave, Room Maintenance, Course Addition, Workload Shift, Placement Drive, Exam Displacement, Capacity Change
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    parameters_json = Column(Text, nullable=True)  # Input parameters
    status = Column(String(50), default="Simulated")  # Draft, Simulated, Approved, Committed, Discarded
    disruption_score = Column(Integer, default=0)
    conflicts_resolved_count = Column(Integer, default=0)
    new_conflicts_count = Column(Integer, default=0)
    utilization_before_pct = Column(Integer, default=0)
    utilization_after_pct = Column(Integer, default=0)
    original_schedule_json = Column(Text, nullable=True)
    simulated_schedule_json = Column(Text, nullable=True)
    xai_explanation = Column(Text, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    department = relationship("Department")
    created_by = relationship("User")


class ScenarioComparison(Base):
    __tablename__ = "scenario_comparisons"

    id = Column(Integer, primary_key=True, index=True)
    comparison_id = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    scenario_ids_json = Column(Text, nullable=False)  # List of scenario IDs compared
    metrics_json = Column(Text, nullable=True)  # Scores per scenario
    tradeoff_analysis = Column(Text, nullable=True)
    recommended_scenario_id = Column(String(100), nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department")


class PredictiveRiskAssessment(Base):
    __tablename__ = "predictive_risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    risk_id = Column(String(100), unique=True, index=True, nullable=False)
    risk_category = Column(String(100), nullable=False)  # Faculty Imbalance, Room Saturation, Lab Deficit, Exam Clash, Event Impact
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    risk_level = Column(String(50), default="Medium")  # Critical, High, Medium, Low
    confidence_score = Column(Integer, default=85)  # Percentage confidence
    affected_resources_json = Column(Text, nullable=True)
    evidence_data_json = Column(Text, nullable=True)
    potential_impact = Column(Text, nullable=False)
    suggested_preventive_action = Column(Text, nullable=False)
    recommended_resolution = Column(Text, nullable=True)
    status = Column(String(50), default="Active")  # Active, Mitigated, Monitoring
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department")


class ChangeHistoryRecord(Base):
    __tablename__ = "change_history_records"

    id = Column(Integer, primary_key=True, index=True)
    change_id = Column(String(100), unique=True, index=True, nullable=False)
    change_type = Column(String(100), nullable=False)  # Simulation Commit, Dynamic Reschedule, Workload Transfer, Timetable Approval
    target_entity_type = Column(String(100), default="Timetable")  # Timetable, TimetableEntry, Classroom, Faculty
    target_entity_id = Column(Integer, nullable=True)
    before_state_json = Column(Text, nullable=True)
    after_state_json = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)
    authorized_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_rolled_back = Column(Boolean, default=False)
    rolled_back_at = Column(DateTime, nullable=True)
    rolled_back_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    authorized_by = relationship("User", foreign_keys=[authorized_by_id])
    rolled_back_by = relationship("User", foreign_keys=[rolled_back_by_id])


