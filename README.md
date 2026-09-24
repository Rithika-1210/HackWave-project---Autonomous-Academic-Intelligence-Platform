# Autonomous Academic Intelligence Platform (AAIP)
## Stage 1 & Stage 2 — Full-Stack AI Academic Operations Platform

> ** Problem Statement AG002 — Agentic & Generative AI**  
> *"Smarter Scheduling. Intelligent Academic Operations."*

AAIP is an enterprise-grade virtual Academic Operations Manager designed for universities and higher education institutions. 

Stage 2 transforms the Stage 1 website foundation into a **predictive, constraint-optimized, and adaptive academic intelligence platform**.

---

### 🌐 Live Application Access

| Component | URL | Status | Details |
| :--- | :--- | :--- | :--- |
| **Frontend Web Client** | **[http://localhost:5173](http://localhost:5173)** | 🟢 Active | React 18, TypeScript, Tailwind CSS, Lucide icons, Recharts |
| **FastAPI REST API Engine** | **[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)** | 🟢 Active | Python FastAPI, SQLAlchemy ORM, Google OR-Tools CP-SAT |
| **Interactive API Documentation** | **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)** | 🟢 Active | Interactive Swagger UI (70+ REST endpoints) |

---

### 🔑 SIH Evaluation Demo Credentials

Use the **1-Click Autofill Panel** on the login page (`http://localhost:5173/login`) or enter any of these credentials:

| Role | Institutional Email | Passphrase | Clearance Level & Scope |
| :--- | :--- | :--- | :--- |
| **🛡️ Administrator** | `admin@aaip.edu` | `Admin@123` / `Admin@2026!` | **Level 5**: Global governance, all AI optimization engines, full institutional approvals, user and department administration. |
| **🏛️ Head of Dept (HOD)** | `hod.cse@aaip.edu` | `Hod@123` / `Hod@2026!` | **Level 4**: Computer Science & Engineering department schedules, CP-SAT timetable generation, faculty workload balancing, rescheduling approvals. |
| **👨‍🏫 Faculty** | `faculty.cse@aaip.edu` / `dr.elena@aaip.edu` | `Faculty@123` / `Faculty@2026!` | **Level 3**: Personal teaching timetable, AI Copilot, emergency leave simulation, workload tracking. |
| **🎓 Student** | `student.cse@aaip.edu` / `aarav.sharma@aaip.edu` | `Student@123` / `Student@2026!` | **Level 1**: Semester 6 class schedule, classroom locations, enrolled courses, AI Copilot. |
| **📋 Examination Cell** | `examcell@aaip.edu` | `Exam@123` / `ExamCell@2026!` | **Level 4**: AI exam timetable optimizer, exam hall conflict interception, invigilator assignments. |

*(All passwords are cryptographically hashed using PBKDF2-HMAC-SHA256 with individual salts; no plain-text passwords exist in the database).*

---

### 🧠 Implemented Stage 2 AI Modules

#### Module 1: AI-Powered Timetable Generation (`Google OR-Tools CP-SAT`)
- **Constraint Satisfaction & Optimization Engine**: Formulates boolean decision variables `X[subject, day, period]` and solves with `ortools.sat.python.cp_model.CpSolver`.
- **Hard Constraints Enforced**:
  - No batch attends two classes simultaneously.
  - Faculty cannot teach two classes simultaneously.
  - Classrooms cannot host multiple classes simultaneously.
  - Practical subjects strictly assigned to Computer / Science Laboratories; Theory to Classrooms / Seminar Halls.
  - Lunch break slots (13:00-14:00) blocked from lecture allocation.
  - Maximum 2 periods of the same subject on any single day.
- **Soft Constraints Optimized**:
  - Student gap efficiency (minimizes idle gap periods between classes).
  - Balanced faculty workload distribution across the week.
  - Subject spread across days.
- **Explainability**: Mathematical diagnosis reporting constraint compliance and feasibility score (e.g., 96/100).
- **Workspace**: Interactive configuration panel, soft priority sliders, and weekly schedule calendar grid at `/ai/timetable-generator`.

#### Module 2: Automatic Conflict Detection Engine
- Scans all active institutional timetables and exam schedules:
  - Faculty double-booking
  - Classroom collisions
  - Student cohort / batch overlaps
  - Faculty weekly workload limit breaches
  - Examination hall double-bookings
- Provides root cause diagnosis and suggested AI remediations at `/ai/conflicts` and `/ai/conflict-resolution`.

#### Module 3: Dynamic Rescheduling Engine
- Simulates unexpected academic disruptions:
  - Faculty sudden sick leave / emergency duty
  - Classroom equipment / AC failure
  - Campus placement drives / symposiums
- **Algorithm**:
  1. Pinpoints affected periods on the target date.
  2. Queries qualified replacement faculty in the same department with matching specialization and zero schedule clash.
  3. Checks room capacity and syllabus continuity.
  4. Generates a **Before-and-After comparison matrix**.
  5. Computes a disruption score (minimizes ripple effects on other classes).
  6. Submits for HOD/Admin authorization and applies live database updates with notifications upon approval at `/ai/rescheduling`.

#### Module 4: Faculty Workload Optimization
- Analyzes assigned teaching hours from real database records against `max_weekly_workload` (18 hrs/week).
- Classifies faculty into Overloaded, Optimal, and Underutilized.
- Visualizes hours vs limits with Recharts Bar Charts.
- Generates automated period rebalancing proposals at `/ai/workload`.

#### Module 5: Classroom & Laboratory Optimization
- Tracks physical spatial utilization (% of weekly 35 hours occupied).
- Identifies peak demand hours (10:00-12:00 AM) and underutilized rooms (< 25%).
- Recommends space consolidation and equipment balancing at `/ai/resources-optimization`.

#### Module 6: Explainable AI Recommendation Center
- Prescriptive recommendations synthesized from live timetable collisions, workload imbalances, and spatial bottlenecks.
- Structured fields: Problem Identified, Prescribed Action, Explainable Justification, Affected Stakeholders, Expected Benefits, and Potential Trade-offs.
- Interactive actions: Simulate, Approve, and Reject at `/ai/recommendations`.

#### Module 7: AI-Powered Examination Scheduling
- Synthesizes clash-free examination timetables.
- Enforces strict 48-hour student study buffers between papers.
- Allocates examination halls matching student capacity and designates clash-free faculty invigilators at `/ai/exam-optimizer`.

#### Module 8: AI Academic Copilot
- Context-aware natural language assistant connected to the live database at `/ai/copilot`.
- Understands queries regarding faculty workloads, room availability, conflict diagnoses, and "what-if" leave scenarios.
- Provides clickable direct action links to relevant operational workspaces.

#### Module 9: Scheduling Risk Analysis
- Predictive risk dashboard identifying institutional vulnerabilities at `/ai/risk-analysis`:
  - Single Point of Failure (specialized courses mapped to only 1 faculty member)
  - Room Bottlenecks (GPU and specialized computer labs operating > 80% capacity)
  - Consecutive High-Stress Teaching Blocks
  - Schedule Rigidity (batches with 100% filled morning hours leaving zero buffer)

#### Module 10: Academic Change Approval Workflow
- Centralized governance hub at `/ai/approvals` for HODs and Administrators.
- Tracks Requester, Reviewer, Details, Remarks, and Status ("Pending", "Approved", "Rejected").
- Commits approved schedule adjustments to database records with tamper-proof audit trails.

#### Module 11: Digital Twin Simulation Preparation
- Virtual campus telemetry prototype modeling footfall congestion, hall density, and laboratory power demand throughout the diurnal cycle at `/ai/digital-twin`.

---

### 🏛️ Database Architecture Extensions (23 Tables Total)

Stage 2 reuses the Stage 1 database models and adds 8 specialized tables:
1. `scheduling_constraints`: Configurable working days, period durations, and soft constraint weightings.
2. `schedule_jobs`: Historical log of all CP-SAT generation jobs with optimization scores and JSON schedules.
3. `conflict_records`: Persistent diagnostic log of all detected schedule collisions and resolution states.
4. `rescheduling_requests`: Dynamic substitution proposals with disruption scores and before-and-after diffs.
5. `schedule_revisions`: Version-controlled revision history of every modified timetable entry.
6. `ai_recommendations`: Actionable prescriptive recommendations with explainable trade-off analyses.
7. `academic_risk_records`: Rule-based early warning risk indicators and preventive actions.
8. `approval_requests`: Institutional authorization workflows for timetables, reschedulings, and workload transfers.

---

### 🛠️ Verification & Test Suite

Run the automated Stage 2 test suite directly:
```bash
python -c "
import requests
auth = requests.post('http://127.0.0.1:8000/api/auth/login', json={'email':'admin@aaip.edu','password':'Admin@123'}).json()
token = auth['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Test CP-SAT Generation
gen = requests.post('http://127.0.0.1:8000/api/ai/schedules/generate', json={'department_id':1,'semester':6,'batch':'Batch 2022-2026'}, headers=headers).json()
print('CP-SAT Job:', gen['job_id'], 'Feasible:', gen['feasible'], 'Score:', gen['optimization_score'])

# Test Conflicts
c = requests.get('http://127.0.0.1:8000/api/ai/conflicts', headers=headers).json()
print('Total Conflicts:', c['total_conflicts'])

# Test Workload
w = requests.get('http://127.0.0.1:8000/api/ai/workload/analysis', headers=headers).json()
print('Faculty Analyzed:', w['total_faculty'])
"
```
