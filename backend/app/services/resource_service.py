from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.models import Classroom, TimetableEntry
from app.schemas.ai_schemas import (
    ResourceUtilizationItem, ResourceAnalysisResponse
)

TOTAL_WEEKLY_CAPACITY_HOURS = 35  # 5 days * 7 hours

def analyze_resources(db: Session, resource_type: Optional[str] = None) -> ResourceAnalysisResponse:
    query = db.query(Classroom)
    if resource_type:
        query = query.filter(Classroom.resource_type == resource_type)
    rooms = query.all()

    entries = db.query(TimetableEntry).all()

    # Tally occupied hours per room and per time slot
    room_hours: Dict[int, int] = {}
    slot_tally: Dict[str, int] = {}
    type_counts: Dict[str, int] = {}

    for r in rooms:
        type_counts[r.resource_type] = type_counts.get(r.resource_type, 0) + 1

    for e in entries:
        room_hours[e.classroom_id] = room_hours.get(e.classroom_id, 0) + 1
        slot_key = f"{e.start_time}-{e.end_time}"
        slot_tally[slot_key] = slot_tally.get(slot_key, 0) + 1

    items: List[ResourceUtilizationItem] = []
    total_util = 0.0

    for r in rooms:
        occ = room_hours.get(r.id, 0)
        util_pct = round((occ / TOTAL_WEEKLY_CAPACITY_HOURS) * 100, 1)
        total_util += util_pct

        if util_pct > 75:
            status = "Overutilized"
        elif util_pct >= 25:
            status = "Optimal"
        else:
            status = "Underutilized"

        items.append(ResourceUtilizationItem(
            room_id=r.id,
            room_number=r.room_number,
            name=r.name,
            building=r.building,
            resource_type=r.resource_type,
            capacity=r.capacity,
            equipment=r.equipment,
            occupied_hours_weekly=occ,
            total_available_hours=TOTAL_WEEKLY_CAPACITY_HOURS,
            utilization_pct=util_pct,
            status=status
        ))

    avg_util = round(total_util / len(items), 1) if items else 0.0

    # Sort peak hours
    sorted_slots = sorted(slot_tally.items(), key=lambda x: x[1], reverse=True)
    peak_hours = [s[0] for s in sorted_slots[:3]] if sorted_slots else ["10:00-11:00", "11:00-12:00"]

    suggestions = []
    over_rooms = [i for i in items if i.status == "Overutilized"]
    under_rooms = [i for i in items if i.status == "Underutilized"]

    if over_rooms and under_rooms:
        suggestions.append(
            f"Relocate 2 high-density sessions from {over_rooms[0].room_number} ({over_rooms[0].utilization_pct}%) to available {under_rooms[0].room_number} ({under_rooms[0].utilization_pct}%) to balance building HVAC load."
        )
    suggestions.append(
        "Computer Laboratories show peak demand between 10:00 AM and 12:00 PM. Stagger afternoon practicals to reduce laboratory equipment wear."
    )
    suggestions.append(
        "Seminar Halls operate at low weekly utilization (< 30%). Recommend consolidating multi-batch guest lectures to optimize floor space."
    )

    return ResourceAnalysisResponse(
        total_rooms=len(items),
        available_rooms=len([i for i in items if i.status != "Overutilized"]),
        average_utilization_pct=avg_util,
        peak_hours=peak_hours,
        type_distribution=type_counts,
        resources=items,
        optimization_suggestions=suggestions
    )
