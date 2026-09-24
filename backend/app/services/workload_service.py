from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.models import Faculty, TimetableEntry, Subject, Department
from app.schemas.ai_schemas import (
    FacultyWorkloadItem, WorkloadRebalanceProposal, WorkloadAnalysisResponse
)

def analyze_faculty_workload(db: Session, department_id: Optional[int] = None) -> WorkloadAnalysisResponse:
    f_query = db.query(Faculty).filter(Faculty.status == "Active")
    if department_id:
        f_query = f_query.filter(Faculty.department_id == department_id)
    faculty_members = f_query.all()

    dept_lookup = {d.id: d.name for d in db.query(Department).all()}
    subjects = db.query(Subject).all()
    sub_map = {s.id: s for s in subjects}

    entries = db.query(TimetableEntry).all()
    
    # Calculate hours per faculty
    workload_map: Dict[int, int] = {}
    faculty_subjects_map: Dict[int, set] = {}

    for e in entries:
        workload_map[e.faculty_id] = workload_map.get(e.faculty_id, 0) + 1
        s = sub_map.get(e.subject_id)
        if s:
            faculty_subjects_map.setdefault(e.faculty_id, set()).add(s.name)

    items: List[FacultyWorkloadItem] = []
    overloaded = []
    underutilized = []
    balanced = []
    total_util = 0.0

    for f in faculty_members:
        hours = workload_map.get(f.id, 0)
        max_hours = f.max_weekly_workload or 18
        avail = max(0, max_hours - hours)
        util_pct = round((hours / max_hours) * 100, 1) if max_hours > 0 else 0.0
        total_util += util_pct

        if hours > max_hours:
            status = "Overloaded"
            overloaded.append(f)
        elif hours >= 12:
            status = "Optimal"
            balanced.append(f)
        else:
            status = "Underutilized"
            underutilized.append(f)

        assigned_subs = list(faculty_subjects_map.get(f.id, set()))
        if not assigned_subs:
            # Fallback to mapped subjects
            assigned_subs = [s.name for s in f.subjects]

        items.append(FacultyWorkloadItem(
            faculty_id=f.id,
            faculty_code=f.faculty_id,
            faculty_name=f.full_name,
            department=dept_lookup.get(f.department_id, "General"),
            designation=f.designation,
            specialization=f.specialization,
            assigned_subjects=assigned_subs,
            assigned_periods_count=hours,
            max_weekly_workload=max_hours,
            available_hours=avail,
            utilization_pct=util_pct,
            status=status
        ))

    avg_util = round(total_util / len(items), 1) if items else 0.0

    # Generate Rebalancing Proposals
    proposals: List[WorkloadRebalanceProposal] = []
    for o_fac in overloaded:
        o_hours = workload_map.get(o_fac.id, 0)
        excess = o_hours - o_fac.max_weekly_workload
        # Find matching underutilized colleague in same department
        peers = [u for u in underutilized if u.department_id == o_fac.department_id]
        if peers:
            target = peers[0]
            t_hours = workload_map.get(target.id, 0)
            subs = list(faculty_subjects_map.get(o_fac.id, {"Core Department Course"}))
            sub_name = list(subs)[0] if subs else "Core Course"

            proj_src = round(((o_hours - excess) / o_fac.max_weekly_workload) * 100, 1)
            proj_tgt = round(((t_hours + excess) / target.max_weekly_workload) * 100, 1)

            proposals.append(WorkloadRebalanceProposal(
                source_faculty=o_fac.full_name,
                target_faculty=target.full_name,
                subject_name=sub_name,
                periods_to_transfer=excess,
                reason=f"{o_fac.full_name} is operating at {round((o_hours/o_fac.max_weekly_workload)*100)}% workload. Transferring {excess} period(s) balances distribution with {target.full_name} (currently {round((t_hours/target.max_weekly_workload)*100)}%).",
                projected_source_utilization=proj_src,
                projected_target_utilization=proj_tgt
            ))

    return WorkloadAnalysisResponse(
        total_faculty=len(items),
        overloaded_count=len(overloaded),
        underutilized_count=len(underutilized),
        balanced_count=len(balanced),
        average_utilization_pct=avg_util,
        faculty_list=items,
        rebalancing_recommendations=proposals
    )
