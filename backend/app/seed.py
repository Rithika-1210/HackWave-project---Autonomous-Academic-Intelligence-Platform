import sys
import os
from datetime import datetime, timedelta

# Ensure parent directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.session import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    Role, User, Department, Faculty, Student, Course, Subject,
    Classroom, Timetable, TimetableEntry, Examination, Notification, AuditLog
)

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).filter(User.email == "admin@aaip.edu").first():
            print("Database already contains seed accounts. Skipping duplicate seeding.")
            return

        print("Seeding Roles...")
        roles_data = [
            ("admin", "Full Institutional Administrator with global oversight and RBAC governance"),
            ("hod", "Head of Department with departmental scheduling and faculty workload management"),
            ("faculty", "Academic Faculty Member with personal timetable and subject management"),
            ("student", "Student with access to class schedules, attendance, and exam notifications"),
            ("exam_cell", "Examination Cell Coordinator with exam hall and schedule authorization")
        ]
        for r_name, r_desc in roles_data:
            db.add(Role(name=r_name, description=r_desc))
        db.commit()

        print("Seeding Departments...")
        depts_data = [
            ("Computer Science & Engineering", "CSE", "Prof. Margaret Hamilton", "Leading department in computing, algorithms, software engineering, and systems."),
            ("Electronics & Communication Engineering", "ECE", "Dr. Claude Shannon", "Focusing on signal processing, embedded systems, telecommunications, and VLSI."),
            ("Mechanical Engineering", "MECH", "Dr. Robert Goddard", "Core engineering in thermodynamics, structural robotics, CAD/CAM, and design."),
            ("Data Science & Artificial Intelligence", "DSAI", "Dr. Ada Lovelace", "Specialized division in deep learning, autonomous systems, and predictive modeling.")
        ]
        dept_map = {}
        for name, code, hod, desc in depts_data:
            dept = Department(name=name, code=code, hod_name=hod, description=desc, status="Active")
            db.add(dept)
            db.commit()
            db.refresh(dept)
            dept_map[code] = dept

        print("Seeding Classrooms and Laboratories...")
        classrooms_data = [
            ("Turing Lecture Hall 101", "Classroom", "Block A - Main Academic", "A-101", 75, "4K Laser Projector, Surround Sound, Tiered Seating"),
            ("Lovelace Lecture Hall 102", "Classroom", "Block A - Main Academic", "A-102", 70, "Interactive Smart Board, Podium Mic, Air Conditioned"),
            ("Shannon Lecture Hall 103", "Classroom", "Block B - Electronics", "B-103", 65, "Dual Projectors, Document Camera, Wireless Mic"),
            ("Advanced AI & Graphics Lab", "Computer Laboratory", "Computing Complex", "CS-201", 45, "45x RTX 4080 Workstations, Gigabit LAN, High-Performance GPU Cluster"),
            ("Networks & Distributed Systems Lab", "Computer Laboratory", "Computing Complex", "CS-202", 45, "45x Core i7 Workstations, Cisco Switch Racks, Cloud Sandbox"),
            ("Microprocessors & Embedded Systems Lab", "Science Laboratory", "Block B - Electronics", "EC-105", 40, "ARM Cortex Kits, Digital Storage Oscilloscopes, Logic Analyzers"),
            ("CAD/CAM & Robotics Studio", "Science Laboratory", "Block C - Mechanical", "ME-108", 35, "3D Printers, CNC Simulation Stations, Robotic Arms"),
            ("Dr. Vikram Sarabhai Seminar Hall", "Seminar Hall", "Central Auditorium", "AUD-1", 160, "Acoustic Wall Panels, Stage Lighting, Multi-Camera Recording"),
            ("Central Examination Hall Alpha", "Examination Hall", "Examination Complex", "EXAM-A", 120, "CCTV Monitored, Jammer Equipped, Ergonomic Desks"),
            ("Central Examination Hall Beta", "Examination Hall", "Examination Complex", "EXAM-B", 120, "CCTV Monitored, Individual Partitioned Seating")
        ]
        room_map = {}
        for name, r_type, bldg, room_no, cap, equip in classrooms_data:
            room = Classroom(
                name=name, resource_type=r_type, building=bldg,
                room_number=room_no, capacity=cap, equipment=equip, availability_status="Available"
            )
            db.add(room)
            db.commit()
            db.refresh(room)
            room_map[room_no] = room

        print("Seeding Courses...")
        courses_data = [
            ("B.Tech in Computer Science & Engineering", "BTECH-CSE", dept_map["CSE"].id, 4, "Undergraduate"),
            ("B.Tech in Electronics & Communication", "BTECH-ECE", dept_map["ECE"].id, 4, "Undergraduate"),
            ("B.Tech in Mechanical Engineering", "BTECH-MECH", dept_map["MECH"].id, 4, "Undergraduate"),
            ("M.Tech in Artificial Intelligence", "MTECH-AI", dept_map["DSAI"].id, 2, "Postgraduate")
        ]
        course_map = {}
        for name, code, dept_id, dur, deg in courses_data:
            course = Course(name=name, code=code, department_id=dept_id, duration_years=dur, degree_type=deg, status="Active")
            db.add(course)
            db.commit()
            db.refresh(course)
            course_map[code] = course

        print("Seeding Users & Faculty...")
        # 1. Admin User
        admin_user = User(
            email="admin@aaip.edu",
            hashed_password=get_password_hash("Admin@2026!"),
            full_name="Dr. Alan Turing",
            role="admin",
            department_id=dept_map["CSE"].id,
            is_active=True
        )
        db.add(admin_user)

        # 2. HOD User
        hod_user = User(
            email="hod.cse@aaip.edu",
            hashed_password=get_password_hash("Hod@2026!"),
            full_name="Prof. Margaret Hamilton",
            role="hod",
            department_id=dept_map["CSE"].id,
            is_active=True
        )
        db.add(hod_user)

        # 3. Faculty User
        faculty_user = User(
            email="dr.elena@aaip.edu",
            hashed_password=get_password_hash("Faculty@2026!"),
            full_name="Dr. Elena Vance",
            role="faculty",
            department_id=dept_map["CSE"].id,
            is_active=True
        )
        db.add(faculty_user)

        # 4. Student User
        student_user = User(
            email="aarav.sharma@aaip.edu",
            hashed_password=get_password_hash("Student@2026!"),
            full_name="Aarav Sharma",
            role="student",
            department_id=dept_map["CSE"].id,
            is_active=True
        )
        db.add(student_user)

        # 5. Exam Cell User
        exam_user = User(
            email="examcell@aaip.edu",
            hashed_password=get_password_hash("ExamCell@2026!"),
            full_name="Dr. Kenneth Stone",
            role="exam_cell",
            department_id=dept_map["CSE"].id,
            is_active=True
        )
        db.add(exam_user)

        db.commit()
        db.refresh(admin_user)
        db.refresh(hod_user)
        db.refresh(faculty_user)
        db.refresh(student_user)
        db.refresh(exam_user)

        # Add Faculty Records
        faculty_records = [
            (hod_user.id, "FAC-CSE-001", "Prof. Margaret Hamilton", "hod.cse@aaip.edu", "+91 98765 43210", dept_map["CSE"].id, "Professor & HOD", "Distributed Systems & Fault Tolerance", 16),
            (faculty_user.id, "FAC-CSE-002", "Dr. Elena Vance", "dr.elena@aaip.edu", "+91 98765 43211", dept_map["CSE"].id, "Associate Professor", "Artificial Intelligence & Heuristics", 18),
            (None, "FAC-CSE-003", "Dr. Linus Torvalds", "linus.t@aaip.edu", "+91 98765 43212", dept_map["CSE"].id, "Professor", "Kernel Architecture & Systems Programming", 14),
            (None, "FAC-ECE-001", "Dr. Claude Shannon", "shannon.c@aaip.edu", "+91 98765 43213", dept_map["ECE"].id, "Professor & HOD", "Information Theory & Digital Comms", 16),
            (None, "FAC-DSAI-001", "Dr. Ada Lovelace", "ada.l@aaip.edu", "+91 98765 43214", dept_map["DSAI"].id, "Associate Professor", "Analytical Engine Algorithms", 18),
            (None, "FAC-MECH-001", "Dr. Robert Goddard", "goddard.r@aaip.edu", "+91 98765 43215", dept_map["MECH"].id, "Professor & HOD", "Propulsion & Thermodynamics", 16)
        ]
        faculty_map = {}
        for uid, fid, name, email, phone, dept_id, desig, spec, max_w in faculty_records:
            fac = Faculty(
                user_id=uid, faculty_id=fid, full_name=name, email=email,
                phone=phone, department_id=dept_id, designation=desig,
                specialization=spec, max_weekly_workload=max_w, status="Active"
            )
            db.add(fac)
            db.commit()
            db.refresh(fac)
            faculty_map[fid] = fac

        print("Seeding Students...")
        students_data = [
            (student_user.id, "STU-2022-CS049", "Aarav Sharma", "aarav.sharma@aaip.edu", "+91 91234 56780", dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Batch 2022-2026", 2022),
            (None, "STU-2022-CS050", "Priya Nair", "priya.nair@aaip.edu", "+91 91234 56781", dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Batch 2022-2026", 2022),
            (None, "STU-2023-EC012", "Rohan Verma", "rohan.v@aaip.edu", "+91 91234 56782", dept_map["ECE"].id, course_map["BTECH-ECE"].id, 4, "Batch 2023-2027", 2023),
            (None, "STU-2024-DS008", "Ananya Iyer", "ananya.i@aaip.edu", "+91 91234 56783", dept_map["DSAI"].id, course_map["MTECH-AI"].id, 2, "Batch 2024-2026", 2024),
            (None, "STU-2022-ME024", "Vikramaditya Rao", "vikram.rao@aaip.edu", "+91 91234 56784", dept_map["MECH"].id, course_map["BTECH-MECH"].id, 6, "Batch 2022-2026", 2022)
        ]
        for uid, sid, name, email, phone, dept_id, c_id, sem, batch, yr in students_data:
            st = Student(
                user_id=uid, student_id=sid, full_name=name, email=email,
                phone=phone, department_id=dept_id, course_id=c_id, semester=sem,
                batch=batch, enrollment_year=yr, status="Active"
            )
            db.add(st)
        db.commit()

        print("Seeding Subjects...")
        subjects_data = [
            ("Design & Analysis of Algorithms", "CS301", dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, 4, "Theory", faculty_map["FAC-CSE-002"].id),
            ("Artificial Intelligence & Machine Learning", "CS302", dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, 4, "Theory", faculty_map["FAC-CSE-002"].id),
            ("Distributed Operating Systems", "CS303", dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, 4, "Theory", faculty_map["FAC-CSE-001"].id),
            ("AI & Machine Learning Laboratory", "CS304P", dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, 3, "Practical", faculty_map["FAC-CSE-002"].id),
            ("Compiler Design & Optimization", "CS305", dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, 4, "Theory", faculty_map["FAC-CSE-003"].id),
            ("Digital Signal Processing", "EC201", dept_map["ECE"].id, course_map["BTECH-ECE"].id, 4, 4, "Theory", faculty_map["FAC-ECE-001"].id),
            ("Deep Learning Architectures", "DS501", dept_map["DSAI"].id, course_map["MTECH-AI"].id, 2, 4, "Theory", faculty_map["FAC-DSAI-001"].id),
            ("Thermodynamics & Heat Transfer", "ME301", dept_map["MECH"].id, course_map["BTECH-MECH"].id, 6, 4, "Theory", faculty_map["FAC-MECH-001"].id)
        ]
        subject_map = {}
        for name, code, dept_id, c_id, sem, pds, stype, fac_id in subjects_data:
            sb = Subject(
                name=name, code=code, department_id=dept_id, course_id=c_id,
                semester=sem, weekly_periods=pds, subject_type=stype, assigned_faculty_id=fac_id, status="Active"
            )
            db.add(sb)
            db.commit()
            db.refresh(sb)
            subject_map[code] = sb

        print("Seeding Timetable & Conflict-Free Entries...")
        tt = Timetable(
            academic_year="2025-2026",
            semester=6,
            department_id=dept_map["CSE"].id,
            course_id=course_map["BTECH-CSE"].id,
            status="Published"
        )
        db.add(tt)
        db.commit()
        db.refresh(tt)

        # Weekly timetable slots: Monday to Friday
        timetable_entries_data = [
            # Monday
            (dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Section A", subject_map["CS301"].id, faculty_map["FAC-CSE-002"].id, room_map["A-101"].id, "Monday", "09:00", "10:00"),
            (dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Section A", subject_map["CS302"].id, faculty_map["FAC-CSE-002"].id, room_map["A-101"].id, "Monday", "10:15", "11:15"),
            (dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Section A", subject_map["CS303"].id, faculty_map["FAC-CSE-001"].id, room_map["A-101"].id, "Monday", "11:30", "12:30"),
            (dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Section A", subject_map["CS304P"].id, faculty_map["FAC-CSE-002"].id, room_map["CS-201"].id, "Monday", "13:30", "15:30"),

            # Tuesday
            (dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Section A", subject_map["CS305"].id, faculty_map["FAC-CSE-003"].id, room_map["A-102"].id, "Tuesday", "09:00", "10:00"),
            (dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Section A", subject_map["CS301"].id, faculty_map["FAC-CSE-002"].id, room_map["A-102"].id, "Tuesday", "10:15", "11:15"),
            (dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Section A", subject_map["CS302"].id, faculty_map["FAC-CSE-002"].id, room_map["A-102"].id, "Tuesday", "11:30", "12:30"),

            # Wednesday
            (dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Section A", subject_map["CS303"].id, faculty_map["FAC-CSE-001"].id, room_map["A-101"].id, "Wednesday", "09:00", "10:00"),
            (dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Section A", subject_map["CS305"].id, faculty_map["FAC-CSE-003"].id, room_map["A-101"].id, "Wednesday", "10:15", "11:15"),
            (dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Section A", subject_map["CS301"].id, faculty_map["FAC-CSE-002"].id, room_map["A-101"].id, "Wednesday", "11:30", "12:30"),

            # Thursday
            (dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Section A", subject_map["CS302"].id, faculty_map["FAC-CSE-002"].id, room_map["A-101"].id, "Thursday", "09:00", "10:00"),
            (dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Section A", subject_map["CS305"].id, faculty_map["FAC-CSE-003"].id, room_map["A-101"].id, "Thursday", "10:15", "11:15"),
            (dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Section A", subject_map["CS303"].id, faculty_map["FAC-CSE-001"].id, room_map["A-101"].id, "Thursday", "11:30", "12:30"),

            # Friday
            (dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Section A", subject_map["CS304P"].id, faculty_map["FAC-CSE-002"].id, room_map["CS-201"].id, "Friday", "09:30", "11:30"),
            (dept_map["CSE"].id, course_map["BTECH-CSE"].id, 6, "Section A", subject_map["CS301"].id, faculty_map["FAC-CSE-002"].id, room_map["A-101"].id, "Friday", "11:30", "12:30")
        ]

        for d_id, c_id, sem, batch, sb_id, f_id, r_id, day, s_time, e_time in timetable_entries_data:
            entry = TimetableEntry(
                timetable_id=tt.id, department_id=d_id, course_id=c_id,
                semester=sem, batch=batch, subject_id=sb_id, faculty_id=f_id,
                classroom_id=r_id, day_of_week=day, start_time=s_time, end_time=e_time
            )
            db.add(entry)
        db.commit()

        print("Seeding Examinations...")
        exams_data = [
            ("Mid-Term: Design & Analysis of Algorithms", "Mid-Term", subject_map["CS301"].id, dept_map["CSE"].id, 6, "2026-10-15", "09:30", "11:30", room_map["EXAM-A"].id),
            ("Mid-Term: Artificial Intelligence", "Mid-Term", subject_map["CS302"].id, dept_map["CSE"].id, 6, "2026-10-17", "09:30", "11:30", room_map["EXAM-A"].id),
            ("Mid-Term: Distributed Operating Systems", "Mid-Term", subject_map["CS303"].id, dept_map["CSE"].id, 6, "2026-10-19", "09:30", "11:30", room_map["EXAM-B"].id),
            ("Mid-Term: Digital Signal Processing", "Mid-Term", subject_map["EC201"].id, dept_map["ECE"].id, 4, "2026-10-16", "14:00", "16:00", room_map["EXAM-A"].id),
            ("End-Semester: Compiler Design", "End-Semester", subject_map["CS305"].id, dept_map["CSE"].id, 6, "2026-11-20", "10:00", "13:00", room_map["EXAM-B"].id)
        ]
        for name, etype, sb_id, d_id, sem, edate, stime, etime, r_id in exams_data:
            ex = Examination(
                name=name, exam_type=etype, subject_id=sb_id, department_id=d_id,
                semester=sem, exam_date=edate, start_time=stime, end_time=etime,
                classroom_id=r_id, status="Scheduled"
            )
            db.add(ex)
        db.commit()

        print("Seeding Academic Notifications...")
        notifications_data = [
            (None, "all", "AAIP Autonomous Operations Active", "Welcome to AAIP Stage 1. Academic scheduling, department governance, and resource records are synchronized.", "info"),
            (None, "faculty", "Semester 6 Smart Timetable Finalized", "The Semester 6 CSE timetable has been published with zero faculty workload clashes.", "success"),
            (None, "student", "Mid-Term Examination Seating Released", "Examination Hall Alpha (EXAM-A) allocated for CS301 on October 15. Check your student dashboard.", "warning"),
            (None, "hod", "Faculty Workload Balancing Report", "All CSE faculty workload hours are within the 18 hr/wk institutional threshold.", "info"),
            (None, "exam_cell", "Central Examination Halls Audit", "Hall Alpha and Hall Beta have been inspected and confirmed with 240 cumulative capacity.", "success")
        ]
        for uid, role_tgt, title, msg, ntype in notifications_data:
            notif = Notification(user_id=uid, role_target=role_tgt, title=title, message=msg, notification_type=ntype, is_read=False)
            db.add(notif)
        db.commit()

        print("Seeding Audit Trail Logs...")
        audit_data = [
            (admin_user.id, admin_user.email, "SYSTEM_INITIALIZE", "Database", "Initial database schema generation and baseline configuration."),
            (admin_user.id, admin_user.email, "CREATE_DEPARTMENT", "Department", "Created departments: CSE, ECE, MECH, DSAI."),
            (hod_user.id, hod_user.email, "PUBLISH_TIMETABLE", "Timetable", "Published Sem 6 CSE Master Academic Timetable."),
            (exam_user.id, exam_user.email, "SCHEDULE_EXAM", "Examination", "Scheduled Mid-Term examinations in Hall Alpha & Beta.")
        ]
        for uid, uemail, act, res, det in audit_data:
            log = AuditLog(user_id=uid, user_email=uemail, action=act, resource=res, details=det)
            db.add(log)
        db.commit()

        print("\n=======================================================")
        print("AAIP DATABASE SEEDED SUCCESSFULLY WITH DEMO ACCOUNTS!")
        print("=======================================================")
        print("1. Administrator:   admin@aaip.edu        / Admin@2026!")
        print("2. HOD (CSE):       hod.cse@aaip.edu      / Hod@2026!")
        print("3. Faculty:         dr.elena@aaip.edu     / Faculty@2026!")
        print("4. Student:         aarav.sharma@aaip.edu / Student@2026!")
        print("5. Exam Cell:       examcell@aaip.edu     / ExamCell@2026!")
        print("=======================================================\n")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
