import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu, PlayCircle, RefreshCw, Layers, CheckCircle2, ShieldCheck,
  AlertTriangle, ArrowRight, Save, Trash2, GitCompare, History,
  Calendar, Users, DoorOpen, BookOpen, Clock, Sparkles, Building2,
  FileCheck2, AlertCircle, XCircle
} from 'lucide-react';
import { aiApi, departmentsApi, facultyApi, resourcesApi } from '@/services/api';
import {
  DigitalTwinSimulationOut, Department, Faculty, Classroom,
  DigitalTwinSlotEntry
} from '@/types';

const SCENARIO_TYPES = [
  { id: 'Faculty Leave', label: '1. Faculty Leave / Sudden Unavailability', desc: 'Simulate unexpected faculty medical leave or emergency absence and evaluate substitute allocation.' },
  { id: 'Room Maintenance', label: '2. Classroom or Laboratory Unavailability', desc: 'Simulate classroom equipment breakdown, AC maintenance, or lab overhaul.' },
  { id: 'Course Addition', label: '3. Addition of a New Course / Elective', desc: 'Introduce an elective curriculum into the semester timetable without disturbing core subjects.' },
  { id: 'Workload Shift', label: '4. Faculty Workload Changes & Credit Balancing', desc: 'Rebalance overloaded faculty teaching hours to junior or associate faculty.' },
  { id: 'Placement Drive', label: '5. Placement Drives & Institutional Events', desc: 'Preempt classrooms and auditoriums for campus recruitment or research symposiums.' },
  { id: 'Exam Displacement', label: '6. Examination Schedule Conversion', desc: 'Simulate re-partitioning regular classrooms into 1:1 spaced examination halls.' },
  { id: 'Emergency Modifications', label: '7. Emergency Timetable Modifications', desc: 'Simulate sudden weather disruptions or campus emergencies with virtual room switching.' },
  { id: 'Capacity Change', label: '8. Classroom Capacity & Resource Restrictions', desc: 'Test social distancing or reduced room capacity thresholds across student cohorts.' }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const DigitalTwinDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Tab State: 'studio' | 'history'
  const [activeTab, setActiveTab] = useState<'studio' | 'history'>('studio');

  // Form Inputs
  const [selectedDeptId, setSelectedDeptId] = useState<number>(1);
  const [scenarioName, setScenarioName] = useState<string>('CSE Sem-6 Operational Stress Test');
  const [selectedScenarioType, setSelectedScenarioType] = useState<string>('Faculty Leave');
  
  // Scenario-specific Parameters
  const [targetFacultyId, setTargetFacultyId] = useState<number | ''>('');
  const [targetDay, setTargetDay] = useState<string>('Monday');
  const [leaveReason, setLeaveReason] = useState<string>('Sudden Medical Emergency');
  const [targetRoomId, setTargetRoomId] = useState<number | ''>('');
  const [maintReason, setMaintReason] = useState<string>('Air Conditioning Failure & Projector Overhaul');
  const [newCourseCode, setNewCourseCode] = useState<string>('CS-415');
  const [newCourseName, setNewCourseName] = useState<string>('Autonomous AI Systems & Robotics');
  const [newCourseCredits, setNewCourseCredits] = useState<number>(3);
  const [eventTitle, setEventTitle] = useState<string>('Tier-1 Corporate Recruitment Drive 2026');
  const [capacityScale, setCapacityScale] = useState<number>(75);
  const [emergencyReason, setEmergencyReason] = useState<string>('Severe Weather & Campus Infrastructure Maintenance');

  // Master Data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loadingMaster, setLoadingMaster] = useState<boolean>(true);

  // Simulation State
  const [simulating, setSimulating] = useState<boolean>(false);
  const [activeSimulation, setActiveSimulation] = useState<DigitalTwinSimulationOut | null>(null);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('All');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Commit Modal
  const [showCommitModal, setShowCommitModal] = useState<boolean>(false);
  const [commitNotes, setCommitNotes] = useState<string>('Approved by Academic Head after reviewing zero-conflict simulation results.');
  const [committing, setCommitting] = useState<boolean>(false);

  // Saved Scenarios
  const [savedScenarios, setSavedScenarios] = useState<DigitalTwinSimulationOut[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  useEffect(() => {
    loadMasterData();
    loadScenarios();
  }, []);

  const loadMasterData = async () => {
    setLoadingMaster(true);
    try {
      const [deptRes, facRes, roomRes] = await Promise.all([
        departmentsApi.getAll(),
        facultyApi.getAll(),
        resourcesApi.getAll()
      ]);
      setDepartments(deptRes);
      if (deptRes.length > 0) setSelectedDeptId(deptRes[0].id);
      setFacultyList(facRes);
      if (facRes.length > 0) setTargetFacultyId(facRes[0].id);
      setClassrooms(roomRes);
      if (roomRes.length > 0) setTargetRoomId(roomRes[0].id);
    } catch (err) {
      console.error('Error loading master data:', err);
    } finally {
      setLoadingMaster(false);
    }
  };

  const loadScenarios = async () => {
    setLoadingHistory(true);
    try {
      const res = await aiApi.listDigitalTwinScenarios();
      setSavedScenarios(res);
      if (res.length > 0 && !activeSimulation) {
        setActiveSimulation(res[0]);
      }
    } catch (err) {
      console.error('Error loading scenarios:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    setFeedback(null);

    const parameters: Record<string, any> = {
      day: targetDay,
    };

    if (selectedScenarioType === 'Faculty Leave') {
      parameters.faculty_id = Number(targetFacultyId);
      parameters.leave_reason = leaveReason;
    } else if (selectedScenarioType === 'Room Maintenance') {
      parameters.classroom_id = Number(targetRoomId);
      parameters.maintenance_reason = maintReason;
    } else if (selectedScenarioType === 'Course Addition') {
      parameters.course_code = newCourseCode;
      parameters.course_name = newCourseName;
      parameters.credits = newCourseCredits;
    } else if (selectedScenarioType === 'Placement Drive') {
      parameters.event_title = eventTitle;
      parameters.day = targetDay;
    } else if (selectedScenarioType === 'Capacity Change') {
      parameters.capacity_scale = capacityScale;
      parameters.classroom_id = targetRoomId ? Number(targetRoomId) : null;
    } else if (selectedScenarioType === 'Emergency Modifications') {
      parameters.disruption_reason = emergencyReason;
      parameters.day = targetDay;
    }

    try {
      const result = await aiApi.runDigitalTwinSimulation({
        name: scenarioName || `${selectedScenarioType} Simulation`,
        scenario_type: selectedScenarioType,
        department_id: Number(selectedDeptId),
        parameters
      });
      setActiveSimulation(result);
      setFeedback({
        type: 'success',
        message: `Digital Twin simulation '${result.name}' successfully computed. Production timetable remains untouched.`
      });
      loadScenarios();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to execute Digital Twin simulation.'
      });
    } finally {
      setSimulating(false);
    }
  };

  const handleCommitToLive = async () => {
    if (!activeSimulation) return;
    setCommitting(true);
    try {
      const res = await aiApi.commitSimulation(activeSimulation.scenario_id, commitNotes);
      setFeedback({
        type: 'success',
        message: `Simulation '${activeSimulation.name}' committed to live timetable. Change ID: ${res.change_id}. All affected faculty and students have been notified.`
      });
      setShowCommitModal(false);
      // Reload current scenario and history
      const updated = await aiApi.getDigitalTwinScenario(activeSimulation.scenario_id);
      setActiveSimulation(updated);
      loadScenarios();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to commit simulation to live timetable.'
      });
    } finally {
      setCommitting(false);
    }
  };

  const handleDiscardScenario = async (scenarioId: string) => {
    try {
      await aiApi.discardDigitalTwinScenario(scenarioId);
      setFeedback({
        type: 'success',
        message: `Simulation ${scenarioId} discarded.`
      });
      loadScenarios();
      if (activeSimulation?.scenario_id === scenarioId) {
        setActiveSimulation(prev => prev ? { ...prev, status: 'Discarded' } : null);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to discard scenario.'
      });
    }
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    if (!confirm('Are you sure you want to delete this simulation scenario?')) return;
    try {
      await aiApi.deleteDigitalTwinScenario(scenarioId);
      setFeedback({
        type: 'success',
        message: `Simulation scenario deleted.`
      });
      loadScenarios();
      if (activeSimulation?.scenario_id === scenarioId) {
        setActiveSimulation(null);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to delete scenario.'
      });
    }
  };

  // Filter schedules by day if selected
  const filterEntries = (entries: DigitalTwinSlotEntry[]) => {
    if (selectedDayFilter === 'All') return entries;
    return entries.filter(e => e.day_of_week === selectedDayFilter);
  };

  const originalSlots = filterEntries(activeSimulation?.original_schedule || []);
  const simulatedSlots = filterEntries(activeSimulation?.simulated_schedule || []);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5 animate-pulse" /> Stage 3 Digital Twin Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Academic Operations Digital Twin
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Simulate faculty leaves, infrastructure bottlenecks, new electives, and campus events without altering the live production timetable.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'studio'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Simulation Studio
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              loadScenarios();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            Saved Scenarios ({savedScenarios.length})
          </button>
        </div>
      </div>

      {/* Alert / Feedback message */}
      {feedback && (
        <div className={`p-4 rounded-xl text-sm flex items-center justify-between border shadow-xl ${
          feedback.type === 'success'
            ? 'bg-slate-900 border-2 border-cyan-500/50 text-white shadow-cyan-950/30'
            : 'bg-slate-900 border-2 border-rose-500/50 text-white shadow-rose-950/30'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            <span className="font-medium text-slate-100">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors">Dismiss</button>
        </div>
      )}

      {/* TAB 1: SIMULATION STUDIO */}
      {activeTab === 'studio' && (
        <div className="space-y-8">
          {/* Configuration Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Scenario Modeling & Configuration Panel
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select institutional parameters to construct a virtual sandbox copy of the academic schedule.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Department:</span>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scenario Type Selection Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Select Simulation Scenario Template
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {SCENARIO_TYPES.map((t) => {
                  const isSelected = selectedScenarioType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedScenarioType(t.id);
                        setScenarioName(`${t.label.split('. ')[1]} - Virtual Run`);
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-cyan-400 leading-tight mb-1">{t.label}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{t.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Parameter Fields */}
            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Scenario Parameter Tuning: <span className="text-cyan-400">{selectedScenarioType}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Scenario Title</label>
                  <input
                    type="text"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="E.g., Emergency Leave Simulation for Prof. Vance"
                  />
                </div>

                {/* Day of Week */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Target Day</label>
                  <select
                    value={targetDay}
                    onChange={(e) => setTargetDay(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {DAYS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Faculty Leave specific */}
                {selectedScenarioType === 'Faculty Leave' && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Unavailable Faculty</label>
                    <select
                      value={targetFacultyId}
                      onChange={(e) => setTargetFacultyId(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      {facultyList.map(f => (
                        <option key={f.id} value={f.id}>{f.full_name} ({f.designation})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Room Maintenance specific */}
                {selectedScenarioType === 'Room Maintenance' && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Room Under Maintenance</label>
                    <select
                      value={targetRoomId}
                      onChange={(e) => setTargetRoomId(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      {classrooms.map(r => (
                        <option key={r.id} value={r.id}>{r.room_number} - {r.name} (Cap: {r.capacity})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Course Addition specific */}
                {selectedScenarioType === 'Course Addition' && (
                  <>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">New Elective Code</label>
                      <input
                        type="text"
                        value={newCourseCode}
                        onChange={(e) => setNewCourseCode(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">New Elective Title</label>
                      <input
                        type="text"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </>
                )}

                {/* Placement Drive specific */}
                {selectedScenarioType === 'Placement Drive' && (
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Campus Event / Recruitment Title</label>
                    <input
                      type="text"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                {/* Capacity Change specific */}
                {selectedScenarioType === 'Capacity Change' && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Capacity Ceiling: {capacityScale}%</label>
                    <input
                      type="range"
                      min={30}
                      max={100}
                      value={capacityScale}
                      onChange={(e) => setCapacityScale(Number(e.target.value))}
                      className="w-full accent-cyan-400 mt-2"
                    />
                  </div>
                )}

                {/* Emergency Modifications specific */}
                {selectedScenarioType === 'Emergency Modifications' && (
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Emergency Modification Reason</label>
                    <input
                      type="text"
                      value={emergencyReason}
                      onChange={(e) => setEmergencyReason(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>

              {/* Action Submit */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleRunSimulation}
                  disabled={simulating}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs md:text-sm shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
                >
                  {simulating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Computing Virtual Digital Twin Dynamics...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4" />
                      Run Digital Twin Simulation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* SIMULATION RESULTS & SIDE-BY-SIDE COMPARISON */}
          {activeSimulation && (
            <div className="space-y-6">
              {/* Simulation Header Summary & Actions */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                        {activeSimulation.scenario_id}
                      </span>
                      <h2 className="text-xl font-bold text-white">{activeSimulation.name}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        activeSimulation.status === 'Committed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : activeSimulation.status === 'Discarded'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      }`}>
                        {activeSimulation.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Department: <strong className="text-slate-200">{activeSimulation.department_name}</strong> | Scenario Template: <strong className="text-cyan-400">{activeSimulation.scenario_type}</strong>
                    </p>
                  </div>

                  {/* Lifecycle Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => navigate(`/ai/scenario-comparison?ids=${activeSimulation.scenario_id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                      title="Compare this simulation against others"
                    >
                      <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
                      Compare Scenarios
                    </button>

                    {activeSimulation.status === 'Simulated' && (
                      <>
                        <button
                          onClick={() => handleDiscardScenario(activeSimulation.scenario_id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-rose-400 text-xs font-semibold border border-slate-700 hover:border-rose-500/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Discard
                        </button>

                        <button
                          onClick={() => setShowCommitModal(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Authorize & Commit to Live
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* KPI Metrics Matrix */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Affected Classes</div>
                    <div className="text-2xl font-bold text-white mt-0.5">{activeSimulation.affected_metrics?.affected_classes_count || 0}</div>
                    <div className="text-[10px] text-slate-500">Autonomous shifts</div>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">Disruption Index</div>
                    <div className="text-2xl font-bold text-cyan-400 mt-0.5">{activeSimulation.disruption_score}/100</div>
                    <div className="text-[10px] text-slate-500">{activeSimulation.affected_metrics?.disruption_level || 'Low'} Impact</div>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Conflicts Resolved</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-0.5">{activeSimulation.conflicts_resolved_count}</div>
                    <div className="text-[10px] text-slate-500">Zero new clashes</div>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Room Utilization</div>
                    <div className="text-2xl font-bold text-indigo-400 mt-0.5">
                      {activeSimulation.utilization_before_pct}% → {activeSimulation.utilization_after_pct}%
                    </div>
                    <div className="text-[10px] text-slate-500">Capacity efficiency</div>
                  </div>

                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Inhabitants Touched</div>
                    <div className="text-2xl font-bold text-amber-400 mt-0.5">
                      {(activeSimulation.affected_metrics?.affected_faculty_count || 0) + (activeSimulation.affected_metrics?.affected_batches_count || 0)}
                    </div>
                    <div className="text-[10px] text-slate-500">Faculty & batches</div>
                  </div>
                </div>

                {/* Explainable AI Diagnosis Card */}
                {activeSimulation.xai_explanation && (
                  <div className="bg-cyan-950/20 border border-cyan-500/20 p-4 rounded-xl text-xs text-cyan-200/90 leading-relaxed flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-cyan-300 block mb-0.5">Explainable AI Simulation Rationale:</strong>
                      {activeSimulation.xai_explanation}
                    </div>
                  </div>
                )}
              </div>

              {/* SIDE-BY-SIDE SCHEDULE COMPARISON */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      Side-by-Side Schedule Comparison Matrix
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Live Academic Schedule (Left) versus Autonomous Digital Twin Schedule (Right).
                    </p>
                  </div>

                  {/* Day Filter */}
                  <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setSelectedDayFilter('All')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        selectedDayFilter === 'All' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All Days
                    </button>
                    {DAYS.map(d => (
                      <button
                        key={d}
                        onClick={() => setSelectedDayFilter(d)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          selectedDayFilter === d ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {d.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2-Column Side-by-Side Schedule Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Live Timetable */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        Original Live Schedule ({originalSlots.length} slots)
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">Production Database</span>
                    </div>

                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      {originalSlots.length === 0 ? (
                        <div className="text-center py-12 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                          No timetable entries found for this day.
                        </div>
                      ) : (
                        originalSlots.map((slot, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{slot.subject_code} - {slot.subject_name}</span>
                              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                                {slot.start_time} - {slot.end_time}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-500" />
                                <span className="truncate">{slot.faculty_name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DoorOpen className="w-3 h-3 text-slate-500" />
                                <span>{slot.room_number} (Cap: {slot.room_capacity})</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                <span>{slot.day_of_week}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Simulated Timetable */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                        Simulated Digital Twin Schedule ({simulatedSlots.length} slots)
                      </span>
                      <span className="text-[11px] text-cyan-400/80 font-mono">Virtual Sandbox</span>
                    </div>

                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      {simulatedSlots.length === 0 ? (
                        <div className="text-center py-12 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                          No simulated timetable entries found.
                        </div>
                      ) : (
                        simulatedSlots.map((slot, idx) => {
                          const hasChanged = Boolean(slot.status_note);
                          return (
                            <div
                              key={idx}
                              className={`rounded-xl p-3.5 space-y-2 transition-all ${
                                hasChanged
                                  ? 'bg-cyan-950/30 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                                  : 'bg-slate-950/70 border border-slate-800/80'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white">{slot.subject_code} - {slot.subject_name}</span>
                                  {hasChanged && (
                                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                                      MODIFIED
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                                  {slot.start_time} - {slot.end_time}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300 pt-1 border-t border-slate-800/60">
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3 text-cyan-400" />
                                  <span className="truncate font-semibold">{slot.faculty_name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DoorOpen className="w-3 h-3 text-cyan-400" />
                                  <span className="font-semibold">{slot.room_number}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <span>{slot.day_of_week}</span>
                                </div>
                              </div>

                              {slot.status_note && (
                                <div className="text-[11px] font-medium text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                                  ⚡ {slot.status_note}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SAVED SCENARIOS HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                Saved Digital Twin Simulations Directory
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review past simulations, compare operational metrics, or commit vetted scenarios to the live academic schedule.
              </p>
            </div>
            <button
              onClick={loadScenarios}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-20 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400 mx-auto mb-2" />
              Loading simulated scenarios...
            </div>
          ) : savedScenarios.length === 0 ? (
            <div className="py-20 text-center text-slate-500 text-sm">
              No saved scenarios found. Run your first simulation in the Studio tab.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold uppercase tracking-wider">Scenario ID</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Name & Department</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Scenario Type</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Disruption Index</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Conflicts Resolved</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Utilization</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Status</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {savedScenarios.map(s => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 font-mono text-cyan-400 font-bold">{s.scenario_id}</td>
                      <td className="py-3.5">
                        <div className="font-bold text-white">{s.name}</div>
                        <div className="text-[10px] text-slate-500">{s.department_name}</div>
                      </td>
                      <td className="py-3.5 text-slate-300">{s.scenario_type}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          s.disruption_score < 25 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {s.disruption_score}/100
                        </span>
                      </td>
                      <td className="py-3.5 text-emerald-400 font-bold">{s.conflicts_resolved_count}</td>
                      <td className="py-3.5 text-slate-300">{s.utilization_before_pct}% → {s.utilization_after_pct}%</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          s.status === 'Committed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : s.status === 'Discarded'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setActiveSimulation(s);
                            setActiveTab('studio');
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold text-[11px] transition-colors"
                        >
                          Inspect Studio
                        </button>
                        {s.status === 'Simulated' && (
                          <button
                            onClick={() => handleDiscardScenario(s.scenario_id)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-950/40 text-rose-400 text-[11px] transition-colors"
                            title="Discard scenario"
                          >
                            Discard
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteScenario(s.scenario_id)}
                          className="px-1.5 py-1 text-slate-600 hover:text-rose-400 transition-colors"
                          title="Delete scenario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* COMMIT CONFIRMATION MODAL */}
      {showCommitModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Commit Simulation to Live Timetable
              </h3>
              <button onClick={() => setShowCommitModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
              <strong>Caution: Operational Commitment Step</strong><br />
              This will update the live production timetable for department <strong>{activeSimulation?.department_name}</strong>.
              All modified slots will be committed, affected faculty and students will receive role-aware notifications, and an immutable snapshot will be recorded for 1-Click Rollback.
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Authorization Review Notes / Justification</label>
              <textarea
                rows={3}
                value={commitNotes}
                onChange={(e) => setCommitNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                placeholder="Enter authorization justification..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCommitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCommitToLive}
                disabled={committing}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                {committing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Confirm & Apply to Live Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
