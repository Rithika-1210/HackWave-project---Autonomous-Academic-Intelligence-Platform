export type UserRole = 'admin' | 'hod' | 'faculty' | 'student' | 'exam_cell';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: number | null;
  is_active: boolean;
  created_at: string;
  phone?: string;
  designation?: string;
  bio?: string;
  avatar_url?: string;
}

export interface UserCertificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialId?: string;
  fileName?: string;
  fileSize?: string;
  fileData?: string;
}

export interface UserResume {
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  fileData?: string;
}

export interface UserMaterial {
  id: string;
  title: string;
  category: string;
  subject?: string;
  description?: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  fileData?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  hod_name?: string;
  description?: string;
  status: string;
  created_at: string;
  faculty_count?: number;
  student_count?: number;
}

export interface Faculty {
  id: number;
  user_id?: number | null;
  faculty_id: string;
  full_name: string;
  email: string;
  phone?: string;
  department_id: number;
  designation: string;
  specialization?: string;
  max_weekly_workload: number;
  status: string;
  created_at: string;
  department_name?: string;
  current_workload_hours?: number;
}

export interface Student {
  id: number;
  user_id?: number | null;
  student_id: string;
  full_name: string;
  email: string;
  phone?: string;
  department_id: number;
  course_id?: number | null;
  semester: number;
  batch: string;
  enrollment_year: number;
  status: string;
  created_at: string;
  department_name?: string;
  course_name?: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
  department_id: number;
  duration_years: number;
  degree_type: string;
  status: string;
  created_at: string;
  department_name?: string;
  subjects_count?: number;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  department_id: number;
  course_id?: number | null;
  semester: number;
  weekly_periods: number;
  subject_type: string;
  assigned_faculty_id?: number | null;
  status: string;
  created_at: string;
  department_name?: string;
  course_name?: string;
  assigned_faculty_name?: string;
}

export interface Classroom {
  id: number;
  name: string;
  resource_type: string;
  building: string;
  room_number: string;
  capacity: number;
  equipment?: string;
  availability_status: string;
  created_at: string;
}

export interface TimetableEntry {
  id: number;
  timetable_id?: number | null;
  department_id: number;
  course_id?: number | null;
  semester: number;
  batch: string;
  subject_id: number;
  faculty_id: number;
  classroom_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  created_at: string;
  subject_name?: string;
  subject_code?: string;
  faculty_name?: string;
  classroom_name?: string;
  room_number?: string;
  department_name?: string;
}

export interface Examination {
  id: number;
  name: string;
  exam_type: string;
  subject_id: number;
  department_id: number;
  semester: number;
  exam_date: string;
  start_time: string;
  end_time: string;
  classroom_id: number;
  status: string;
  created_at: string;
  subject_name?: string;
  subject_code?: string;
  department_name?: string;
  classroom_name?: string;
  room_number?: string;
}

export interface NotificationItem {
  id: number;
  user_id?: number | null;
  role_target: string;
  title: string;
  message: string;
  notification_type: 'info' | 'warning' | 'success' | 'urgent';
  is_read: boolean;
  created_at: string;
}

export interface AdminStats {
  total_students: number;
  total_faculty: number;
  total_departments: number;
  total_courses: number;
  total_classrooms: number;
  total_laboratories: number;
  student_enrollment_chart: { year: string; count: number }[];
  department_distribution: { name: string; fullName: string; students: number; faculty: number }[];
  faculty_distribution: { designation: string; count: number }[];
  recent_activities: { id: number; user: string; action: string; resource: string; details: string; time: string }[];
}

export interface HodStats {
  department_name: string;
  department_code: string;
  total_faculty: number;
  total_students: number;
  total_subjects: number;
  avg_faculty_workload_hours: number;
  faculty_workload_summary: {
    facultyId: string;
    name: string;
    designation: string;
    workloadHours: number;
    maxWorkload: number;
    utilizationPct: number;
  }[];
  subject_distribution: { type: string; count: number }[];
  recent_activities: { id: number; user: string; action: string; resource: string; details: string; time: string }[];
}

export interface FacultyStats {
  faculty_name: string;
  designation: string;
  department_name: string;
  weekly_teaching_hours: number;
  total_assigned_courses: number;
  today_classes: {
    subject: string;
    code: string;
    time: string;
    room: string;
    batch: string;
    semester: string;
  }[];
  upcoming_classes: {
    day: string;
    subject: string;
    code: string;
    time: string;
    room: string;
    batch: string;
  }[];
}

export interface StudentStats {
  student_name: string;
  student_id: string;
  department_name: string;
  course_name: string;
  semester: number;
  batch: string;
  enrolled_subjects_count: number;
  today_classes: {
    subject: string;
    code: string;
    faculty: string;
    time: string;
    room: string;
    batch: string;
  }[];
  upcoming_examinations: {
    id: number;
    subject: string;
    code: string;
    type: string;
    date: string;
    time: string;
    hall: string;
  }[];
}

export interface ExamCellStats {
  total_examinations: number;
  upcoming_examinations_count: number;
  total_exam_halls: number;
  pending_tasks_count: number;
  upcoming_examinations: {
    id: number;
    name: string;
    subject: string;
    department: string;
    date: string;
    time: string;
    hall: string;
    capacity: number;
  }[];
  hall_occupancy: {
    hall: string;
    type: string;
    capacity: number;
    status: string;
  }[];
  recent_activities: {
    id: number;
    user: string;
    action: string;
    details: string;
    time: string;
  }[];
}

// -------------------------------------------------------------
// STAGE 2: AI & ACADEMIC INTELLIGENCE TYPES
// -------------------------------------------------------------

export interface GeneratedTimetableEntry {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  subject_type: string;
  faculty_id: number;
  faculty_name: string;
  classroom_id: number;
  room_number: string;
  room_type: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  period_index: number;
}

export interface GenerateScheduleResponse {
  job_id: string;
  status: string;
  feasible: boolean;
  optimization_score: number;
  hard_conflicts_count: number;
  gap_efficiency_pct: number;
  workload_balance_pct: number;
  entries: GeneratedTimetableEntry[];
  explanation: string;
  infeasibility_reasons: string[];
}

export interface ScheduleJobItem {
  id: number;
  job_id: string;
  department_id: number;
  semester: number;
  batch: string;
  academic_year: string;
  status: string;
  optimization_score: number;
  hard_conflicts_count: number;
  gap_efficiency_pct: number;
  workload_balance_pct: number;
  explanation?: string;
  entries_count: number;
  created_at: string;
}

export interface ConflictRecord {
  id: number;
  conflict_id: string;
  conflict_type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  department_id?: number | null;
  department_name?: string | null;
  affected_faculty_id?: number | null;
  affected_faculty_name?: string | null;
  affected_classroom_id?: number | null;
  affected_classroom_name?: string | null;
  affected_subject_id?: number | null;
  affected_subject_code?: string | null;
  affected_batch?: string | null;
  date_or_day?: string | null;
  time_slot?: string | null;
  description: string;
  root_cause?: string | null;
  suggested_resolution?: string | null;
  status: 'Unresolved' | 'Resolved' | 'In Progress';
  created_at: string;
  resolved_at?: string | null;
}

export interface ConflictDashboardSummary {
  total_conflicts: number;
  critical_count: number;
  high_count: number;
  resolved_count: number;
  unresolved_count: number;
  distribution_by_type: Record<string, number>;
  recent_conflicts: ConflictRecord[];
}

export interface RescheduleProposedChange {
  original_entry_id: number;
  subject_name: string;
  subject_code: string;
  day: string;
  time_slot: string;
  original_faculty: string;
  replacement_faculty: string;
  replacement_faculty_id?: number | null;
  original_room: string;
  proposed_room: string;
  proposed_room_id?: number | null;
  original_slot: string;
  proposed_slot: string;
  change_type: string;
  reasoning: string;
}

export interface RescheduleSimulationResponse {
  request_id: string;
  reason: string;
  target_date: string;
  affected_entries_count: number;
  disruption_score: number;
  feasible: boolean;
  proposed_changes: RescheduleProposedChange[];
  explanation: string;
}

export interface ReschedulingRequestItem {
  id: number;
  request_id: string;
  reason: string;
  target_date: string;
  disruption_score: number;
  status: string;
  explanation: string;
  changes_count: number;
  created_at: string;
  resolved_at?: string | null;
}

export interface FacultyWorkloadItem {
  faculty_id: number;
  faculty_code: string;
  faculty_name: string;
  department: string;
  designation: string;
  specialization?: string | null;
  assigned_subjects: string[];
  assigned_periods_count: number;
  max_weekly_workload: number;
  available_hours: number;
  utilization_pct: number;
  status: 'Overloaded' | 'Optimal' | 'Underutilized';
}

export interface WorkloadRebalanceProposal {
  source_faculty: string;
  target_faculty: string;
  subject_name: string;
  periods_to_transfer: number;
  reason: string;
  projected_source_utilization: number;
  projected_target_utilization: number;
}

export interface WorkloadAnalysisResponse {
  total_faculty: number;
  overloaded_count: number;
  underutilized_count: number;
  balanced_count: number;
  average_utilization_pct: number;
  faculty_list: FacultyWorkloadItem[];
  rebalancing_recommendations: WorkloadRebalanceProposal[];
}

export interface ResourceUtilizationItem {
  room_id: number;
  room_number: string;
  name: string;
  building: string;
  resource_type: string;
  capacity: number;
  equipment?: string | null;
  occupied_hours_weekly: number;
  total_available_hours: number;
  utilization_pct: number;
  status: 'Overutilized' | 'Optimal' | 'Underutilized';
}

export interface ResourceAnalysisResponse {
  total_rooms: number;
  available_rooms: number;
  average_utilization_pct: number;
  peak_hours: string[];
  type_distribution: Record<string, number>;
  resources: ResourceUtilizationItem[];
  optimization_suggestions: string[];
}

export interface ExamSlotProposal {
  subject_id: number;
  subject_code: string;
  subject_name: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  hall_id: number;
  hall_name: string;
  capacity: number;
  invigilator_id?: number | null;
  invigilator_name?: string | null;
}

export interface ExamOptimizeResponse {
  feasible: boolean;
  exams_scheduled_count: number;
  conflicts_avoided: number;
  schedule: ExamSlotProposal[];
  explanation: string;
}

export interface RecommendationItem {
  id: number;
  recommendation_id: string;
  category: string;
  title: string;
  problem_identified: string;
  recommended_action: string;
  explanation: string;
  affected_users_resources?: string | null;
  expected_benefits?: string | null;
  potential_tradeoffs?: string | null;
  approval_required: boolean;
  status: 'Active' | 'Simulated' | 'Approved' | 'Rejected';
  created_at: string;
}

export interface RiskRecord {
  id: number;
  risk_id: string;
  risk_category: string;
  department_name?: string | null;
  risk_level: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  supporting_evidence?: string | null;
  potential_impact?: string | null;
  preventive_action?: string | null;
  status: string;
  created_at: string;
}

export interface RiskAnalysisResponse {
  total_risks: number;
  critical_risks: number;
  high_risks: number;
  medium_risks: number;
  risks: RiskRecord[];
}

export interface ApprovalRequestItem {
  id: number;
  request_id: string;
  request_type: string;
  title: string;
  department_name?: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  requester_email?: string | null;
  reviewer_email?: string | null;
  review_notes?: string | null;
  details_json?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  action_type?: string | null;
  action_payload?: Record<string, any> | null;
  timestamp: string;
}

// -------------------------------------------------------------
// STAGE 3: DIGITAL TWIN SIMULATION & PREDICTIVE ANALYTICS TYPES
// -------------------------------------------------------------

export interface DigitalTwinSlotEntry {
  entry_id: number;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  faculty_id: number;
  faculty_name: string;
  classroom_id: number;
  room_number: string;
  room_capacity: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  batch_name: string;
  is_lab: boolean;
  status_note?: string;
}

export interface DigitalTwinSimulationOut {
  id: number;
  scenario_id: string;
  name: string;
  scenario_type: string;
  department_id?: number | null;
  department_name?: string | null;
  status: 'Simulated' | 'Committed' | 'Discarded';
  disruption_score: number;
  conflicts_resolved_count: number;
  new_conflicts_count: number;
  utilization_before_pct: number;
  utilization_after_pct: number;
  original_schedule: DigitalTwinSlotEntry[];
  simulated_schedule: DigitalTwinSlotEntry[];
  affected_metrics: {
    affected_classes_count?: number;
    affected_faculty_count?: number;
    affected_faculty_list?: string[];
    affected_rooms_count?: number;
    affected_rooms_list?: string[];
    affected_batches_count?: number;
    affected_batches_list?: string[];
    constraints_considered?: string[];
    disruption_level?: 'Low' | 'Moderate' | 'High';
    total_simulated_slots?: number;
  };
  xai_explanation?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateSimulationRequest {
  name: string;
  scenario_type: string;
  department_id: number;
  parameters: Record<string, any>;
}

export interface CompareScenariosRequest {
  title: string;
  department_id: number;
  scenario_ids: string[];
  priority_weights?: {
    conflicts: number;
    workload_balance: number;
    student_convenience: number;
    classroom_utilization: number;
    minimal_disruption: number;
  };
}

export interface ScenarioComparisonOut {
  comparison_id: string;
  title: string;
  scenarios: Array<{
    scenario_id: string;
    name: string;
    scenario_type: string;
    status: string;
    composite_score: number;
    disruption_score: number;
    conflicts_resolved: number;
    utilization_pct: number;
  }>;
  metrics_matrix: Record<string, Record<string, number>>;
  radar_data: Array<Record<string, any>>;
  tradeoff_analysis: string;
  recommended_scenario_id: string;
  recommendation_reason: string;
}

export interface PredictiveRiskOut {
  id: number;
  risk_id: string;
  risk_category: string;
  title?: string | null;
  department_id?: number | null;
  department_name?: string | null;
  risk_level: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence_score: number;
  affected_resources: string[];
  evidence_data: Record<string, any>;
  potential_impact: string;
  suggested_preventive_action: string;
  recommended_resolution?: string | null;
  status: string;
  created_at: string;
}

export interface AdvancedAnalyticsResponse {
  faculty_workload_distribution: Array<{
    faculty_name: string;
    department: string;
    teaching_hours: number;
    min_target: number;
    max_limit: number;
    status: 'Overloaded' | 'Optimal' | 'Underutilized';
  }>;
  department_utilization: Array<{
    department_code: string;
    department_name: string;
    utilization_pct: number;
    total_classes_scheduled: number;
    satisfaction_index: number;
  }>;
  spatial_utilization_heatmap: Array<Record<string, any>>;
  conflict_trends_historical: Array<{
    month: string;
    detected: number;
    resolved: number;
    autonomous_ai_pct: number;
  }>;
  rescheduling_frequency_by_month: Array<{
    month: string;
    faculty_leave: number;
    room_maintenance: number;
    institutional_events: number;
  }>;
  simulation_success_rate: {
    total_simulations_run: number;
    committed_to_live: number;
    under_hod_review: number;
    average_conflict_reduction_pct: number;
    average_time_saved_hours: number;
  };
  institutional_kpis: {
    schedule_compliance_rate: string;
    classroom_fill_factor: string;
    zero_conflict_guarantee: string;
    carbon_energy_savings_hours: string;
    faculty_retention_index: string;
  };
}

export interface XaiDetailedExplanation {
  decision_id: string;
  action_type: string;
  primary_justification: string;
  constraints_considered: string[];
  conflicts_resolved: string[];
  preferences_satisfied: string[];
  tradeoffs_made: string[];
  rejected_alternatives: Array<{
    alternative: string;
    rejection_reason: string;
  }>;
  stakeholder_impact: {
    faculty: string;
    students: string;
    administration: string;
  };
}

export interface ChangeHistoryOut {
  id: number;
  change_id: string;
  change_type: string;
  target_entity_type: string;
  target_entity_id?: number | null;
  reason?: string | null;
  authorized_by_email?: string | null;
  is_rolled_back: boolean;
  rolled_back_at?: string | null;
  rolled_back_by_email?: string | null;
  created_at: string;
  before_state?: { count: number } | null;
  after_state?: { count: number } | null;
}


