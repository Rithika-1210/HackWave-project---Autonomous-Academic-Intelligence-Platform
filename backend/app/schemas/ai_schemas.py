from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# -------------------------------------------------------------
# Module 1: AI Timetable Generation Schemas
# -------------------------------------------------------------
class GenerateScheduleRequest(BaseModel):
    department_id: int
    semester: int = 1
    batch: str = "Section A"
    academic_year: str = "2025-2026"
    working_days: List[str] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    start_time: str = "09:00"
    end_time: str = "17:00"
    period_duration_mins: int = 60
    lunch_slot: str = "13:00-14:00"
    weights: Optional[Dict[str, int]] = {
        "balance_workload": 8,
        "minimize_student_gaps": 9,
        "distribute_subjects": 7,
        "minimize_room_changes": 6
    }

class GeneratedTimetableEntry(BaseModel):
    subject_id: int
    subject_code: str
    subject_name: str
    subject_type: str
    faculty_id: int
    faculty_name: str
    classroom_id: int
    room_number: str
    room_type: str
    day_of_week: str
    start_time: str
    end_time: str
    period_index: int

class GenerateScheduleResponse(BaseModel):
    job_id: str
    status: str  # Feasible, Infeasible, Optimizing
    feasible: bool
    optimization_score: int
    hard_conflicts_count: int
    gap_efficiency_pct: int
    workload_balance_pct: int
    entries: List[GeneratedTimetableEntry]
    explanation: str
    infeasibility_reasons: List[str] = []

class SaveGeneratedTimetableRequest(BaseModel):
    job_id: str
    action: str = "save_draft"  # save_draft, submit_approval, publish_direct
    department_id: Optional[int] = None
    semester: Optional[int] = None
    batch: Optional[str] = None
    academic_year: Optional[str] = None
    entries: Optional[List[GeneratedTimetableEntry]] = None

# -------------------------------------------------------------
# Module 2: Conflict Detection Engine Schemas
# -------------------------------------------------------------
class ConflictAnalyzeRequest(BaseModel):
    department_id: Optional[int] = None

class ConflictRecordOut(BaseModel):
    id: int
    conflict_id: str
    conflict_type: str
    severity: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    affected_faculty_id: Optional[int] = None
    affected_faculty_name: Optional[str] = None
    affected_classroom_id: Optional[int] = None
    affected_classroom_name: Optional[str] = None
    affected_subject_id: Optional[int] = None
    affected_subject_code: Optional[str] = None
    affected_batch: Optional[str] = None
    date_or_day: Optional[str] = None
    time_slot: Optional[str] = None
    description: str
    root_cause: Optional[str] = None
    suggested_resolution: Optional[str] = None
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ConflictDashboardSummary(BaseModel):
    total_conflicts: int
    critical_count: int
    high_count: int
    resolved_count: int
    unresolved_count: int
    distribution_by_type: Dict[str, int]
    recent_conflicts: List[ConflictRecordOut]

class ResolveConflictRequest(BaseModel):
    resolution_notes: Optional[str] = "Resolved via AI assisted schedule adjustment"

# -------------------------------------------------------------
# Module 3: Dynamic Rescheduling Schemas
# -------------------------------------------------------------
class RescheduleSimulationRequest(BaseModel):
    department_id: int
    reason: str  # Faculty Leave, Emergency Unavailability, Classroom Maintenance, Holiday, Event
    target_date: str  # e.g., "Monday" or "2026-09-25"
    affected_faculty_id: Optional[int] = None
    affected_classroom_id: Optional[int] = None

class RescheduleProposedChange(BaseModel):
    original_entry_id: int
    subject_name: str
    subject_code: str
    day: str
    time_slot: str
    original_faculty: str
    replacement_faculty: str
    replacement_faculty_id: Optional[int] = None
    original_room: str
    proposed_room: str
    proposed_room_id: Optional[int] = None
    original_slot: str
    proposed_slot: str
    change_type: str  # Faculty Substitution, Room Reallocation, Time Slot Shift
    reasoning: str

class RescheduleSimulationResponse(BaseModel):
    request_id: str
    reason: str
    target_date: str
    affected_entries_count: int
    disruption_score: int
    feasible: bool
    proposed_changes: List[RescheduleProposedChange]
    explanation: str

class RescheduleSubmitRequest(BaseModel):
    request_id: str
    action: str = "submit_for_approval"  # submit_for_approval, approve_direct
    comments: Optional[str] = None

# -------------------------------------------------------------
# Module 4: Faculty Workload Optimization Schemas
# -------------------------------------------------------------
class FacultyWorkloadItem(BaseModel):
    faculty_id: int
    faculty_code: str
    faculty_name: str
    department: str
    designation: str
    specialization: Optional[str] = None
    assigned_subjects: List[str]
    assigned_periods_count: int
    max_weekly_workload: int
    available_hours: int
    utilization_pct: float
    status: str  # Overloaded, Optimal, Underutilized

class WorkloadRebalanceProposal(BaseModel):
    source_faculty: str
    target_faculty: str
    subject_name: str
    periods_to_transfer: int
    reason: str
    projected_source_utilization: float
    projected_target_utilization: float

class WorkloadAnalysisResponse(BaseModel):
    total_faculty: int
    overloaded_count: int
    underutilized_count: int
    balanced_count: int
    average_utilization_pct: float
    faculty_list: List[FacultyWorkloadItem]
    rebalancing_recommendations: List[WorkloadRebalanceProposal]

# -------------------------------------------------------------
# Module 5: Classroom & Laboratory Optimization Schemas
# -------------------------------------------------------------
class ResourceUtilizationItem(BaseModel):
    room_id: int
    room_number: str
    name: str
    building: str
    resource_type: str
    capacity: int
    equipment: Optional[str] = None
    occupied_hours_weekly: int
    total_available_hours: int
    utilization_pct: float
    status: str  # Overutilized, Optimal, Underutilized

class ResourceAnalysisResponse(BaseModel):
    total_rooms: int
    available_rooms: int
    average_utilization_pct: float
    peak_hours: List[str]
    type_distribution: Dict[str, int]
    resources: List[ResourceUtilizationItem]
    optimization_suggestions: List[str]

# -------------------------------------------------------------
# Module 6: Explainable AI Recommendation Schemas
# -------------------------------------------------------------
class RecommendationOut(BaseModel):
    id: int
    recommendation_id: str
    category: str
    title: str
    problem_identified: str
    recommended_action: str
    explanation: str
    affected_users_resources: Optional[str] = None
    expected_benefits: Optional[str] = None
    potential_tradeoffs: Optional[str] = None
    supporting_data: Optional[str] = None
    approval_required: bool = True
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# -------------------------------------------------------------
# Module 7: Examination Timetable Optimization Schemas
# -------------------------------------------------------------
class ExamOptimizeRequest(BaseModel):
    department_id: int
    semester: int
    academic_year: str = "2025-2026"
    start_date: str = "2026-11-10"
    end_date: str = "2026-11-25"
    exam_type: str = "End-Semester"

class ExamSlotProposal(BaseModel):
    subject_id: int
    subject_code: str
    subject_name: str
    exam_date: str
    start_time: str
    end_time: str
    hall_id: int
    hall_name: str
    capacity: int
    invigilator_id: Optional[int] = None
    invigilator_name: Optional[str] = None

class ExamOptimizeResponse(BaseModel):
    feasible: bool
    exams_scheduled_count: int
    conflicts_avoided: int
    schedule: List[ExamSlotProposal]
    explanation: str

# -------------------------------------------------------------
# Module 8: AI Academic Copilot Schemas
# -------------------------------------------------------------
class CopilotChatRequest(BaseModel):
    message: str
    conversation_context: Optional[List[Dict[str, str]]] = None

class CopilotChatResponse(BaseModel):
    reply: str
    action_type: Optional[str] = None  # navigate, view_timetable, run_conflict_check, reschedule
    action_payload: Optional[Dict[str, Any]] = None
    quick_suggestions: List[str] = []

# -------------------------------------------------------------
# Module 9: Scheduling Risk Analysis Schemas
# -------------------------------------------------------------
class RiskRecordOut(BaseModel):
    id: int
    risk_id: str
    risk_category: str
    department_name: Optional[str] = None
    risk_level: str
    title: str
    description: str
    supporting_evidence: Optional[str] = None
    potential_impact: Optional[str] = None
    preventive_action: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class RiskAnalysisResponse(BaseModel):
    total_risks: int
    critical_risks: int
    high_risks: int
    medium_risks: int
    risks: List[RiskRecordOut]

# -------------------------------------------------------------
# Module 10: Approval Workflow Schemas
# -------------------------------------------------------------
class ApprovalRequestCreate(BaseModel):
    request_type: str
    title: str
    department_id: Optional[int] = None
    details_json: Optional[str] = None

class ApprovalActionRequest(BaseModel):
    action: str  # Approve, Reject
    review_notes: Optional[str] = None

class ApprovalRequestOut(BaseModel):
    id: int
    request_id: str
    request_type: str
    title: str
    department_name: Optional[str] = None
    status: str
    requester_email: Optional[str] = None
    reviewer_email: Optional[str] = None
    review_notes: Optional[str] = None
    details_json: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# -------------------------------------------------------------
# STAGE 3: DIGITAL TWIN SIMULATION SCHEMAS
# -------------------------------------------------------------
class CreateSimulationRequest(BaseModel):
    name: str
    scenario_type: str  # Faculty Leave, Room Maintenance, Course Addition, Workload Shift, Placement Drive, Exam Displacement, Capacity Change
    department_id: int
    parameters: Dict[str, Any] = {}

class DigitalTwinSimulationOut(BaseModel):
    id: int
    scenario_id: str
    name: str
    scenario_type: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    status: str
    disruption_score: int
    conflicts_resolved_count: int
    new_conflicts_count: int
    utilization_before_pct: int
    utilization_after_pct: int
    original_schedule: List[Dict[str, Any]] = []
    simulated_schedule: List[Dict[str, Any]] = []
    affected_metrics: Dict[str, Any] = {}
    xai_explanation: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CommitSimulationRequest(BaseModel):
    scenario_id: str
    notes: Optional[str] = "Committed via Digital Twin Simulation Engine"

# -------------------------------------------------------------
# STAGE 3: SCENARIO COMPARISON SCHEMAS
# -------------------------------------------------------------
class CompareScenariosRequest(BaseModel):
    title: str
    department_id: int
    scenario_ids: List[str]
    priority_weights: Optional[Dict[str, int]] = {
        "conflicts": 10,
        "workload_balance": 8,
        "student_convenience": 9,
        "classroom_utilization": 7,
        "minimal_disruption": 8
    }

class ScenarioComparisonOut(BaseModel):
    comparison_id: str
    title: str
    scenarios: List[Dict[str, Any]]
    metrics_matrix: Dict[str, Dict[str, float]]
    radar_data: List[Dict[str, Any]]
    tradeoff_analysis: str
    recommended_scenario_id: str
    recommendation_reason: str

# -------------------------------------------------------------
# STAGE 3: PREDICTIVE RISK INTELLIGENCE SCHEMAS
# -------------------------------------------------------------
class PredictiveRiskOut(BaseModel):
    id: int
    risk_id: str
    risk_category: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    risk_level: str  # Critical, High, Medium, Low
    confidence_score: int
    affected_resources: List[str] = []
    evidence_data: Dict[str, Any] = {}
    potential_impact: str
    suggested_preventive_action: str
    recommended_resolution: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# -------------------------------------------------------------
# STAGE 3: ADVANCED ANALYTICS SCHEMAS
# -------------------------------------------------------------
class AdvancedAnalyticsResponse(BaseModel):
    faculty_workload_distribution: List[Dict[str, Any]]
    department_utilization: List[Dict[str, Any]]
    spatial_utilization_heatmap: List[Dict[str, Any]]
    conflict_trends_historical: List[Dict[str, Any]]
    rescheduling_frequency_by_month: List[Dict[str, Any]]
    simulation_success_rate: Dict[str, Any]
    institutional_kpis: Dict[str, Any]

# -------------------------------------------------------------
# STAGE 3: EXPLAINABLE AI (XAI) SCHEMAS
# -------------------------------------------------------------
class XaiDetailedExplanation(BaseModel):
    decision_id: str
    action_type: str
    primary_justification: str
    constraints_considered: List[str]
    conflicts_resolved: List[str]
    preferences_satisfied: List[str]
    tradeoffs_made: List[str]
    rejected_alternatives: List[Dict[str, str]]
    stakeholder_impact: Dict[str, str]

# -------------------------------------------------------------
# STAGE 3: CHANGE MANAGEMENT & ROLLBACK SCHEMAS
# -------------------------------------------------------------
class ChangeHistoryOut(BaseModel):
    id: int
    change_id: str
    change_type: str
    target_entity_type: str
    target_entity_id: Optional[int] = None
    reason: Optional[str] = None
    authorized_by_email: Optional[str] = None
    is_rolled_back: bool
    rolled_back_at: Optional[datetime] = None
    rolled_back_by_email: Optional[str] = None
    created_at: datetime
    before_state: Optional[Dict[str, Any]] = None
    after_state: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class RollbackRequest(BaseModel):
    change_id: str
    reason: Optional[str] = "Rollback initiated by administrator"

