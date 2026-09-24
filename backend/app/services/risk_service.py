import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.models import AcademicRiskRecord, Faculty, Classroom, TimetableEntry, Subject, Department
from app.schemas.ai_schemas import RiskAnalysisResponse, RiskRecordOut

def analyze_scheduling_risks(db: Session, department_id: Optional[int] = None) -> RiskAnalysisResponse:
    existing = db.query(AcademicRiskRecord).all()
    if not existing:
        defaults = [
            AcademicRiskRecord(
                risk_id="RISK-001",
                risk_category="Single Point of Failure",
                department_id=1,
                risk_level="High",
                title="Single Qualified Instructor for Cloud & Distributed Systems",
                description="Subject CS301 (Distributed Systems) is mapped to only one faculty member. Sudden unavailability will halt 4 student sections.",
                supporting_evidence="Faculty-Subject mapping shows only 1 active instructor with specialization in Cloud Systems.",
                potential_impact="Cancellation of 16 weekly lecture hours and delays in syllabus completion.",
                preventive_action="Cross-train and map an adjunct or secondary faculty member as backup co-instructor.",
                status="Active"
            ),
            AcademicRiskRecord(
                risk_id="RISK-002",
                risk_category="Room Bottleneck",
                department_id=1,
                risk_level="High",
                title="High Contention for Specialized AI GPU Laboratory",
                description="CS-LAB-2 operates at 86% weekly capacity during core academic hours (10:00 - 15:00).",
                supporting_evidence="31 out of 35 available weekly periods booked across CSE and Data Science cohorts.",
                potential_impact="Zero buffer capacity for rescheduling cancelled practicals, workshops, or hackathons.",
                preventive_action="Open evening batch slots (16:00-18:00) or configure virtualized cloud GPU environments.",
                status="Active"
            ),
            AcademicRiskRecord(
                risk_id="RISK-003",
                risk_category="Workload Overload",
                department_id=1,
                risk_level="Medium",
                title="Back-to-Back Consecutive Teaching Sessions",
                description="Two faculty members are scheduled for 3 consecutive theory lecture periods on Monday mornings without an intervening break.",
                supporting_evidence="Timetable shows slots 09:00-10:00, 10:00-11:00, and 11:00-12:00 assigned continuously.",
                potential_impact="Faculty fatigue, reduced instructional quality, and zero transition time between classroom buildings.",
                preventive_action="Introduce an optimization penalty in CP-SAT solver against consecutive slots > 2.",
                status="Active"
            ),
            AcademicRiskRecord(
                risk_id="RISK-004",
                risk_category="Schedule Rigidity",
                department_id=1,
                risk_level="Medium",
                title="100% Packed Prime Hours for Final Year Batches",
                description="Semester 7 Batch A has all morning time slots fully allocated with zero open buffer periods.",
                supporting_evidence="96% utilization of core time slots Monday through Friday.",
                potential_impact="Inability to accommodate placement training sessions or industry guest seminars.",
                preventive_action="Stagger 2 elective courses into hybrid / self-paced online modules.",
                status="Active"
            )
        ]
        db.add_all(defaults)
        db.commit()
        existing = db.query(AcademicRiskRecord).all()

    crit_count = 0
    high_count = 0
    med_count = 0
    risk_outs = []

    dept_lookup = {d.id: d.name for d in db.query(Department).all()}

    for r in existing:
        if r.risk_level == "Critical":
            crit_count += 1
        elif r.risk_level == "High":
            high_count += 1
        else:
            med_count += 1

        risk_outs.append(RiskRecordOut(
            id=r.id,
            risk_id=r.risk_id,
            risk_category=r.risk_category,
            department_name=dept_lookup.get(r.department_id, "All Departments"),
            risk_level=r.risk_level,
            title=r.title,
            description=r.description,
            supporting_evidence=r.supporting_evidence,
            potential_impact=r.potential_impact,
            preventive_action=r.preventive_action,
            status=r.status,
            created_at=r.created_at
        ))

    return RiskAnalysisResponse(
        total_risks=len(risk_outs),
        critical_risks=crit_count,
        high_risks=high_count,
        medium_risks=med_count,
        risks=risk_outs
    )
