import json
import uuid
from datetime import datetime, timedelta
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.session import SessionLocal
from app.models.models import (
    DigitalTwinScenario, TimetableEntry, Faculty, Classroom, Subject, Department, User
)

def seed_stage3_data():
    db = SessionLocal()
    try:
        # Check if scenarios already exist
        count = db.query(DigitalTwinScenario).count()
        if count >= 3:
            print(f"Digital Twin scenarios already seeded ({count} found).")
            return

        dept = db.query(Department).filter(Department.code == "CSE").first()
        dept_id = dept.id if dept else 1
        admin_user = db.query(User).filter(User.role == "admin").first()
        user_id = admin_user.id if admin_user else 1

        faculty_list = db.query(Faculty).all()
        classrooms = db.query(Classroom).all()
        subjects = db.query(Subject).all()
        entries = db.query(TimetableEntry).filter(TimetableEntry.department_id == dept_id).all()
        if not entries:
            entries = db.query(TimetableEntry).limit(10).all()

        faculty_map = {f.id: f for f in faculty_list}
        room_map = {r.id: r for r in classrooms}
        sub_map = {s.id: s for s in subjects}

        original_schedule = []
        for e in entries:
            f = faculty_map.get(e.faculty_id)
            r = room_map.get(e.classroom_id)
            s = sub_map.get(e.subject_id)
            original_schedule.append({
                "entry_id": e.id,
                "subject_id": e.subject_id,
                "subject_name": s.name if s else "Subject",
                "subject_code": s.code if s else "SUB",
                "faculty_id": e.faculty_id,
                "faculty_name": f.full_name if f else "Faculty",
                "classroom_id": e.classroom_id,
                "room_number": r.room_number if r else "Room",
                "room_capacity": r.capacity if r else 60,
                "day_of_week": e.day_of_week,
                "start_time": e.start_time,
                "end_time": e.end_time,
                "batch_name": getattr(e, "batch", "Section A") or "Section A",
                "is_lab": (s.subject_type == "Practical") if s else False
            })

        # 1. Faculty Leave Scenario
        sim_1 = [dict(item) for item in original_schedule]
        for item in sim_1[:2]:
            item["faculty_name"] = "Sham (Substitute)"
            item["status_note"] = "Substituted by Sham due to sudden sick leave"

        sc1 = DigitalTwinScenario(
            scenario_id="SIM-CSE-001",
            name="Emergency Leave Simulation for Sham (Monday)",
            scenario_type="Faculty Leave",
            department_id=dept_id,
            parameters_json=json.dumps({"faculty_id": 1, "day": "Monday", "reason": "Sudden medical absence"}),
            status="Simulated",
            disruption_score=15,
            conflicts_resolved_count=3,
            new_conflicts_count=0,
            utilization_before_pct=78,
            utilization_after_pct=82,
            original_schedule_json=json.dumps(original_schedule),
            simulated_schedule_json=json.dumps(sim_1),
            xai_explanation="Simulated sudden absence of faculty on Monday. Digital Twin reassigned 2 class periods to qualified peer faculty without creating timetable clashes or exceeding weekly workload limits.",
            created_by_id=user_id,
            created_at=datetime.utcnow() - timedelta(hours=3)
        )
        db.add(sc1)

        # 2. Room Maintenance Scenario
        sim_2 = [dict(item) for item in original_schedule]
        for item in sim_2[1:3]:
            item["room_number"] = "A-102 (Lovelace Hall)"
            item["room_capacity"] = 70
            item["status_note"] = "Relocated from CS-201 to A-102 due to AC equipment overhaul"

        sc2 = DigitalTwinScenario(
            scenario_id="SIM-CSE-002",
            name="Computer Lab CS-201 Maintenance Overhaul",
            scenario_type="Room Maintenance",
            department_id=dept_id,
            parameters_json=json.dumps({"classroom_id": 4, "maintenance_reason": "Air Conditioning & GPU cluster service"}),
            status="Simulated",
            disruption_score=12,
            conflicts_resolved_count=2,
            new_conflicts_count=0,
            utilization_before_pct=80,
            utilization_after_pct=85,
            original_schedule_json=json.dumps(original_schedule),
            simulated_schedule_json=json.dumps(sim_2),
            xai_explanation="Simulated temporary maintenance shutdown of Lab CS-201. Classes safely routed to Lecture Hall A-102 with equivalent AV setup, eliminating physical room collision.",
            created_by_id=user_id,
            created_at=datetime.utcnow() - timedelta(hours=2)
        )
        db.add(sc2)

        # 3. Course Addition Scenario
        sim_3 = [dict(item) for item in original_schedule]
        sim_3.append({
            "entry_id": 9001,
            "subject_id": 999,
            "subject_name": "Autonomous AI Systems & Robotics",
            "subject_code": "CS-415",
            "faculty_id": 2,
            "faculty_name": "Kaviya",
            "classroom_id": 2,
            "room_number": "A-102",
            "room_capacity": 70,
            "day_of_week": "Wednesday",
            "start_time": "14:00",
            "end_time": "15:00",
            "batch_name": "Section A",
            "is_lab": False,
            "status_note": "Newly added elective syllabus slot in off-peak afternoon window"
        })

        sc3 = DigitalTwinScenario(
            scenario_id="SIM-CSE-003",
            name="Autonomous AI Systems (CS-415) Elective Integration",
            scenario_type="Course Addition",
            department_id=dept_id,
            parameters_json=json.dumps({"course_code": "CS-415", "course_name": "Autonomous AI Systems", "credits": 3}),
            status="Simulated",
            disruption_score=10,
            conflicts_resolved_count=3,
            new_conflicts_count=0,
            utilization_before_pct=75,
            utilization_after_pct=88,
            original_schedule_json=json.dumps(original_schedule),
            simulated_schedule_json=json.dumps(sim_3),
            xai_explanation="Simulated introduction of new elective CS-415 with 3 weekly credit hours into afternoon open blocks, achieving zero clashes with core lectures.",
            created_by_id=user_id,
            created_at=datetime.utcnow() - timedelta(hours=1)
        )
        db.add(sc3)

        db.commit()
        print("Successfully seeded 3 Stage 3 Digital Twin scenarios!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding Stage 3 scenarios: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_stage3_data()
