import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.models import (
    TimetableEntry, Examination, Faculty, Classroom, Subject, Department, ConflictRecord, AuditLog
)
from app.schemas.ai_schemas import (
    ConflictDashboardSummary, ConflictRecordOut
)

def times_overlap(s1: str, e1: str, s2: str, e2: str) -> bool:
    return max(s1, s2) < min(e1, e2)

def run_conflict_analysis(db: Session, department_id: Optional[int] = None) -> ConflictDashboardSummary:
    # 1. Fetch entries
    query = db.query(TimetableEntry)
    if department_id:
        query = query.filter(TimetableEntry.department_id == department_id)
    entries = query.all()

    exam_query = db.query(Examination)
    if department_id:
        exam_query = exam_query.filter(Examination.department_id == department_id)
    exams = exam_query.all()

    faculty_list = db.query(Faculty).all()
    faculty_dict = {f.id: f for f in faculty_list}
    classroom_list = db.query(Classroom).all()
    room_dict = {r.id: r for r in classroom_list}
    subject_list = db.query(Subject).all()
    sub_dict = {s.id: s for s in subject_list}
    dept_list = db.query(Department).all()
    dept_dict = {d.id: d for d in dept_list}

    detected_conflicts: List[Dict[str, Any]] = []

    # Check 1: Faculty Double-Booking
    for i in range(len(entries)):
        for j in range(i + 1, len(entries)):
            e1 = entries[i]
            e2 = entries[j]
            if (e1.faculty_id == e2.faculty_id and 
                e1.day_of_week == e2.day_of_week and 
                times_overlap(e1.start_time, e1.end_time, e2.start_time, e2.end_time)):
                f = faculty_dict.get(e1.faculty_id)
                f_name = f.full_name if f else "Unknown Faculty"
                s1 = sub_dict.get(e1.subject_id)
                s2 = sub_dict.get(e2.subject_id)
                detected_conflicts.append({
                    "conflict_id": f"CONF-FAC-{e1.id}-{e2.id}",
                    "conflict_type": "Faculty Double-Booking",
                    "severity": "Critical",
                    "department_id": e1.department_id,
                    "affected_faculty_id": e1.faculty_id,
                    "affected_classroom_id": e1.classroom_id,
                    "affected_subject_id": e1.subject_id,
                    "affected_batch": e1.batch,
                    "date_or_day": e1.day_of_week,
                    "time_slot": f"{e1.start_time}-{e1.end_time}",
                    "description": f"{f_name} is simultaneously scheduled for '{s1.name if s1 else 'Subject'}' and '{s2.name if s2 else 'Subject'}'.",
                    "root_cause": "Manual schedule overlap or overlapping multi-section assignments.",
                    "suggested_resolution": "Reassign one of the periods to an available co-faculty with matching specialization or shift time slot."
                })

    # Check 2: Classroom Collision
    for i in range(len(entries)):
        for j in range(i + 1, len(entries)):
            e1 = entries[i]
            e2 = entries[j]
            if (e1.classroom_id == e2.classroom_id and 
                e1.day_of_week == e2.day_of_week and 
                times_overlap(e1.start_time, e1.end_time, e2.start_time, e2.end_time)):
                room = room_dict.get(e1.classroom_id)
                r_num = room.room_number if room else "Unknown Room"
                detected_conflicts.append({
                    "conflict_id": f"CONF-ROOM-{e1.id}-{e2.id}",
                    "conflict_type": "Classroom Collision",
                    "severity": "Critical",
                    "department_id": e1.department_id,
                    "affected_faculty_id": e1.faculty_id,
                    "affected_classroom_id": e1.classroom_id,
                    "affected_subject_id": e1.subject_id,
                    "affected_batch": f"{e1.batch} vs {e2.batch}",
                    "date_or_day": e1.day_of_week,
                    "time_slot": f"{e1.start_time}-{e1.end_time}",
                    "description": f"Classroom {r_num} is concurrently reserved by two different class sessions on {e1.day_of_week} at {e1.start_time}.",
                    "root_cause": "Concurrent room reservation across departments or sections.",
                    "suggested_resolution": "Relocate one session to an available vacant room with matching capacity."
                })

    # Check 3: Student Batch Overlap
    for i in range(len(entries)):
        for j in range(i + 1, len(entries)):
            e1 = entries[i]
            e2 = entries[j]
            if (e1.department_id == e2.department_id and
                e1.semester == e2.semester and
                e1.batch == e2.batch and
                e1.day_of_week == e2.day_of_week and
                times_overlap(e1.start_time, e1.end_time, e2.start_time, e2.end_time)):
                detected_conflicts.append({
                    "conflict_id": f"CONF-BATCH-{e1.id}-{e2.id}",
                    "conflict_type": "Batch Overlap",
                    "severity": "High",
                    "department_id": e1.department_id,
                    "affected_faculty_id": e1.faculty_id,
                    "affected_classroom_id": e1.classroom_id,
                    "affected_subject_id": e1.subject_id,
                    "affected_batch": f"Sem {e1.semester} {e1.batch}",
                    "date_or_day": e1.day_of_week,
                    "time_slot": f"{e1.start_time}-{e1.end_time}",
                    "description": f"Students of Sem {e1.semester} ({e1.batch}) have overlapping classes scheduled at {e1.start_time}.",
                    "root_cause": "Clashing timetable entries for the same student cohort.",
                    "suggested_resolution": "Stagger one of the periods into an empty afternoon slot."
                })

    # Check 4: Faculty Workload Limit Exceeded
    faculty_hours = {}
    for e in entries:
        faculty_hours[e.faculty_id] = faculty_hours.get(e.faculty_id, 0) + 1  # 1 hour per period

    for f_id, hours in faculty_hours.items():
        f = faculty_dict.get(f_id)
        if f and hours > f.max_weekly_workload:
            detected_conflicts.append({
                "conflict_id": f"CONF-WORKLOAD-{f.id}",
                "conflict_type": "Workload Exceeded",
                "severity": "Medium",
                "department_id": f.department_id,
                "affected_faculty_id": f.id,
                "affected_classroom_id": None,
                "affected_subject_id": None,
                "affected_batch": None,
                "date_or_day": "Weekly",
                "time_slot": f"{hours}h / {f.max_weekly_workload}h",
                "description": f"{f.full_name} is assigned {hours} weekly hours, exceeding maximum permitted ceiling of {f.max_weekly_workload} hours.",
                "root_cause": "Unbalanced departmental faculty distribution.",
                "suggested_resolution": "Reassign surplus periods to underutilized faculty members."
            })

    # Check 5: Examination Hall Collision
    for i in range(len(exams)):
        for j in range(i + 1, len(exams)):
            x1 = exams[i]
            x2 = exams[j]
            if (x1.classroom_id == x2.classroom_id and
                x1.exam_date == x2.exam_date and
                times_overlap(x1.start_time, x1.end_time, x2.start_time, x2.end_time)):
                room = room_dict.get(x1.classroom_id)
                detected_conflicts.append({
                    "conflict_id": f"CONF-EXAM-{x1.id}-{x2.id}",
                    "conflict_type": "Exam Hall Collision",
                    "severity": "Critical",
                    "department_id": x1.department_id,
                    "affected_faculty_id": None,
                    "affected_classroom_id": x1.classroom_id,
                    "affected_subject_id": x1.subject_id,
                    "affected_batch": None,
                    "date_or_day": x1.exam_date,
                    "time_slot": f"{x1.start_time}-{x1.end_time}",
                    "description": f"Examination hall {room.room_number if room else 'Room'} is double-booked for '{x1.name}' and '{x2.name}' on {x1.exam_date}.",
                    "root_cause": "Simultaneous hall scheduling in Examination Cell.",
                    "suggested_resolution": "Assign an alternative available examination hall."
                })

    # Sync with ConflictRecord table in DB
    existing_records = {c.conflict_id: c for c in db.query(ConflictRecord).all()}
    
    # Insert new detected conflicts if not already present
    for item in detected_conflicts:
        cid = item["conflict_id"]
        if cid not in existing_records:
            rec = ConflictRecord(
                conflict_id=cid,
                conflict_type=item["conflict_type"],
                severity=item["severity"],
                department_id=item["department_id"],
                affected_faculty_id=item["affected_faculty_id"],
                affected_classroom_id=item["affected_classroom_id"],
                affected_subject_id=item["affected_subject_id"],
                affected_batch=item["affected_batch"],
                date_or_day=item["date_or_day"],
                time_slot=item["time_slot"],
                description=item["description"],
                root_cause=item["root_cause"],
                suggested_resolution=item["suggested_resolution"],
                status="Unresolved"
            )
            db.add(rec)
    db.commit()

    # Query all active conflict records for dashboard
    db_conflicts = db.query(ConflictRecord).order_by(ConflictRecord.created_at.desc()).all()
    
    conflict_outs = []
    dist_map: Dict[str, int] = {}
    crit_count = 0
    high_count = 0
    res_count = 0
    unres_count = 0

    for c in db_conflicts:
        f = faculty_dict.get(c.affected_faculty_id)
        r = room_dict.get(c.affected_classroom_id)
        s = sub_dict.get(c.affected_subject_id)
        d = dept_dict.get(c.department_id)

        dist_map[c.conflict_type] = dist_map.get(c.conflict_type, 0) + 1
        if c.severity == "Critical":
            crit_count += 1
        elif c.severity == "High":
            high_count += 1

        if c.status == "Resolved":
            res_count += 1
        else:
            unres_count += 1

        conflict_outs.append(ConflictRecordOut(
            id=c.id,
            conflict_id=c.conflict_id,
            conflict_type=c.conflict_type,
            severity=c.severity,
            department_id=c.department_id,
            department_name=d.name if d else "General",
            affected_faculty_id=c.affected_faculty_id,
            affected_faculty_name=f.full_name if f else None,
            affected_classroom_id=c.affected_classroom_id,
            affected_classroom_name=r.room_number if r else None,
            affected_subject_id=c.affected_subject_id,
            affected_subject_code=s.code if s else None,
            affected_batch=c.affected_batch,
            date_or_day=c.date_or_day,
            time_slot=c.time_slot,
            description=c.description,
            root_cause=c.root_cause,
            suggested_resolution=c.suggested_resolution,
            status=c.status,
            created_at=c.created_at,
            resolved_at=c.resolved_at
        ))

    return ConflictDashboardSummary(
        total_conflicts=len(db_conflicts),
        critical_count=crit_count,
        high_count=high_count,
        resolved_count=res_count,
        unresolved_count=unres_count,
        distribution_by_type=dist_map,
        recent_conflicts=conflict_outs[:20]
    )

def resolve_conflict_record(db: Session, conflict_id: str, resolution_notes: str, user_id: int):
    rec = db.query(ConflictRecord).filter(ConflictRecord.conflict_id == conflict_id).first()
    if rec:
        rec.status = "Resolved"
        rec.resolved_at = datetime.utcnow()
        rec.suggested_resolution = (rec.suggested_resolution or "") + f" [Resolved: {resolution_notes}]"
        
        # Add Audit log
        db.add(AuditLog(
            user_id=user_id,
            action="RESOLVE_CONFLICT",
            resource=f"Conflict:{conflict_id}",
            details=f"Conflict {conflict_id} resolved with notes: {resolution_notes}"
        ))
        db.commit()
    return rec
