import uuid
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.models import AIRecommendation, ConflictRecord, Faculty, Classroom, AuditLog, Notification
from app.schemas.ai_schemas import RecommendationOut

def seed_or_get_recommendations(db: Session) -> List[RecommendationOut]:
    existing = db.query(AIRecommendation).all()
    if not existing:
        # Generate initial high-value institutional recommendations
        defaults = [
            AIRecommendation(
                recommendation_id=f"REC-001",
                category="Workload Rebalancing",
                title="Redistribute Core Theory Periods for Overloaded Faculty",
                problem_identified="Ram is scheduled for 20 weekly periods, exceeding the institutional ceiling of 18 hours.",
                recommended_action="Reassign 2 weekly periods of Computer Networks to Sham.",
                explanation="Sham has an identical specialization in Distributed Systems and currently has 6 available teaching hours with zero scheduling clashes on Tuesday and Thursday mornings.",
                affected_users_resources="Ram, Sham, CSE-302 Batch A",
                expected_benefits="Brings Ram's teaching load into 100% compliance while maintaining student continuity and syllabus pace.",
                potential_tradeoffs="Requires co-ordination between faculty for shared assignment grading.",
                supporting_data=json.dumps({"current_workload": 20, "max_limit": 18, "target_available": 6}),
                approval_required=True,
                status="Active"
            ),
            AIRecommendation(
                recommendation_id=f"REC-002",
                category="Room Optimization",
                title="Relocate High-Density Practical to High-Speed Lab 2",
                problem_identified="Advanced AI Lab is currently allocated in Room 204 (General Lab) which lacks dedicated GPU hardware for model training.",
                recommended_action="Move Wednesday 14:00-16:00 session to CS-LAB-2.",
                explanation="CS-LAB-2 features 60 high-performance workstations with Nvidia accelerators and has zero reservations scheduled during Wednesday afternoon periods.",
                affected_users_resources="Room 204, CS-LAB-2, AI & Machine Learning Students",
                expected_benefits="Reduces lab session completion time by 40% and provides hardware acceleration for curriculum benchmarks.",
                potential_tradeoffs="CS-LAB-2 requires swipe-card authorization logging.",
                supporting_data=json.dumps({"gpu_equipped": True, "capacity": 60, "status": "Available"}),
                approval_required=False,
                status="Active"
            ),
            AIRecommendation(
                recommendation_id=f"REC-003",
                category="Conflict Resolution",
                title="Resolve Concurrent Examination Hall Allocation for Mid-Terms",
                problem_identified="Seminar Hall A is scheduled for both Database Systems exam and Departmental Technical Seminar on Nov 14 at 10:00 AM.",
                recommended_action="Reschedule the departmental seminar to Friday 14:00 PM or reassign exam to Exam Hall 3.",
                explanation="Exam Hall 3 has 120 seats which comfortably fits the 85 enrolled examinees and avoids noise interference during the institutional exam window.",
                affected_users_resources="Seminar Hall A, Exam Hall 3, Exam Cell, HOD CSE",
                expected_benefits="Guarantees examination integrity and prevents last-minute room displacement conflicts.",
                potential_tradeoffs="Requires updating student notification circular 48 hours in advance.",
                supporting_data=json.dumps({"exam_students": 85, "hall_capacity": 120}),
                approval_required=True,
                status="Active"
            ),
            AIRecommendation(
                recommendation_id=f"REC-004",
                category="Preventive Risk",
                title="Designate Secondary Faculty for Cloud Computing",
                problem_identified="Only 1 faculty member (Prof. Grace Hopper) is designated to handle Cloud Computing Architecture across all 3 sections.",
                recommended_action="Map Assistant Prof. John McCarthy as secondary co-instructor in Faculty-Subject Mappings.",
                explanation="Creating a secondary instructor qualification ensures zero disruption in the event of unforeseen medical leave or emergency conference travel.",
                affected_users_resources="Prof. Grace Hopper, Prof. John McCarthy, CSE Dept",
                expected_benefits="Eliminates single point of failure risk and facilitates peer teaching collaboration.",
                potential_tradeoffs="Minimal additional syllabus review time for secondary faculty.",
                supporting_data=json.dumps({"risk_level": "High", "single_point_of_failure": True}),
                approval_required=True,
                status="Active"
            )
        ]
        db.add_all(defaults)
        db.commit()
        existing = db.query(AIRecommendation).all()

    return [
        RecommendationOut(
            id=r.id,
            recommendation_id=r.recommendation_id,
            category=r.category,
            title=r.title,
            problem_identified=r.problem_identified,
            recommended_action=r.recommended_action,
            explanation=r.explanation,
            affected_users_resources=r.affected_users_resources,
            expected_benefits=r.expected_benefits,
            potential_tradeoffs=r.potential_tradeoffs,
            approval_required=r.approval_required,
            status=r.status,
            created_at=r.created_at
        ) for r in existing
    ]

def update_recommendation_status(db: Session, rec_id: str, action: str, user_id: int):
    rec = db.query(AIRecommendation).filter(AIRecommendation.recommendation_id == rec_id).first()
    if not rec:
        raise ValueError("Recommendation not found.")

    if action == "approve":
        rec.status = "Approved"
        db.add(Notification(
            role_target="all",
            title=f"AI Recommendation Approved: {rec.title}",
            message=f"Institutional recommendation '{rec.title}' has been officially approved and scheduled for implementation.",
            notification_type="success"
        ))
    elif action == "reject":
        rec.status = "Rejected"
    elif action == "simulate":
        rec.status = "Simulated"

    db.add(AuditLog(
        user_id=user_id,
        action=f"RECOMMENDATION_{action.upper()}",
        resource=f"Recommendation:{rec.recommendation_id}",
        details=f"AI Recommendation {rec.recommendation_id} marked as {rec.status}."
    ))
    db.commit()
    return rec
