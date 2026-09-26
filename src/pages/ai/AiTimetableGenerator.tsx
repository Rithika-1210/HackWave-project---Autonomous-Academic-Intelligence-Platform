import React, { useState, useEffect } from 'react';
import { aiApi, departmentsApi } from '@/services/api';
import { Department, GeneratedTimetableEntry, GenerateScheduleResponse } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { getDepartmentSemesters } from '@/utils/academicSemesters';
import {
  Sparkles, Sliders, CheckCircle2, AlertTriangle, ArrowRight,
  Save, Send, RefreshCw, Clock, Building2, User, Layers, Calendar
} from 'lucide-react';

export const AiTimetableGenerator: React.FC = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<number>(user?.department_id || 1);
  const [semester, setSemester] = useState<number>(1);
  const [batch, setBatch] = useState<string>('Batch 2022-2026');
  const [academicYear, setAcademicYear] = useState<string>('2025-2026');
  
  // Weights for soft constraints
  const [weights, setWeights] = useState({
    balance_workload: 8,
    minimize_student_gaps: 9,
    distribute_subjects: 7,
    minimize_room_changes: 6
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<GenerateScheduleResponse | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await departmentsApi.getAll({ status_filter: 'Active' });
      setDepartments(data);
      if (data.length > 0) {
        const defaultDept = user?.department_id && data.some(d => d.id === user.department_id)
          ? user.department_id
          : data[0].id;
        setSelectedDept(defaultDept);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentDept = departments.find(d => d.id === selectedDept);
  const availableSemesters = getDepartmentSemesters(currentDept?.code || currentDept?.name);

  const handleGenerate = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await aiApi.generateSchedule({
        department_id: selectedDept,
        semester,
        batch,
        academic_year: academicYear,
        working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      });
      setResult(data);
      if (data.feasible) {
        setMessage({ type: 'success', text: `Feasible schedule generated successfully with score ${data.optimization_score}/100!` });
      } else {
        setMessage({ type: 'error', text: 'Constraints could not be fully satisfied. Review explanation below.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to generate timetable.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (action: 'save_draft' | 'publish_direct') => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await aiApi.saveGeneratedTimetable({ job_id: result.job_id, action });
      setMessage({ type: 'success', text: res.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to save timetable.' });
    } finally {
      setSaving(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00', // Lunch
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00'
  ];

  const getEntryAt = (day: string, slot: string): GeneratedTimetableEntry | null => {
    if (!result || !result.entries) return null;
    const [start] = slot.split('-');
    return result.entries.find(e => e.day_of_week === day && e.start_time === start) || null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-900/40 via-indigo-900/30 to-slate-900 p-6 rounded-2xl border border-sky-800/40 shadow-xl backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Google OR-Tools CP-SAT Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            AI-Powered Timetable Generator
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Synthesize optimal, 100% clash-free schedules respecting faculty workload, student cohorts, and room capabilities.
          </p>
        </div>

        {result && result.feasible && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave('save_draft')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-all shadow-sm"
            >
              <Save className="w-4 h-4 text-sky-400" />
              Save Draft
            </button>
            <button
              onClick={() => handleSave('publish_direct')}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Publish Timetable
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border shadow-xl ${
          message.type === 'success' 
            ? 'bg-slate-900 border-2 border-emerald-500/50 text-white shadow-emerald-950/30' 
            : 'bg-slate-900 border-2 border-rose-500/50 text-white shadow-rose-950/30'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <span className="font-medium text-slate-100">{message.text}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Config Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-sky-400" />
              Parameters & Scopes
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(Number(e.target.value))}
                disabled={user?.role !== 'admin'}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-75"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {availableSemesters.map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Student Cohort / Batch
              </label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Soft Constraints Weights */}
            <div className="pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Soft Constraint Priorities
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Balance Faculty Hours</span>
                    <span className="text-sky-400 font-semibold">{weights.balance_workload}/10</span>
                  </div>
                  <input
                    type="range" min="1" max="10"
                    value={weights.balance_workload}
                    onChange={(e) => setWeights({...weights, balance_workload: Number(e.target.value)})}
                    className="w-full accent-sky-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Minimize Student Gaps</span>
                    <span className="text-sky-400 font-semibold">{weights.minimize_student_gaps}/10</span>
                  </div>
                  <input
                    type="range" min="1" max="10"
                    value={weights.minimize_student_gaps}
                    onChange={(e) => setWeights({...weights, minimize_student_gaps: Number(e.target.value)})}
                    className="w-full accent-sky-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Distribute Daily Subjects</span>
                    <span className="text-sky-400 font-semibold">{weights.distribute_subjects}/10</span>
                  </div>
                  <input
                    type="range" min="1" max="10"
                    value={weights.distribute_subjects}
                    onChange={(e) => setWeights({...weights, distribute_subjects: Number(e.target.value)})}
                    className="w-full accent-sky-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Solving with CP-SAT...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Timetable
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Output Grid Workspace */}
        <div className="lg:col-span-3 space-y-6">
          {result ? (
            <>
              {/* Optimization KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
                  <div className="text-xs text-slate-400 font-medium">Solver Status</div>
                  <div className={`text-xl font-bold mt-1 ${result.feasible ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {result.status}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Zero hard collisions</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
                  <div className="text-xs text-slate-400 font-medium">Optimization Score</div>
                  <div className="text-xl font-bold text-sky-400 mt-1">
                    {result.optimization_score}/100
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Mathematical grade</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
                  <div className="text-xs text-slate-400 font-medium">Gap Efficiency</div>
                  <div className="text-xl font-bold text-indigo-400 mt-1">
                    {result.gap_efficiency_pct}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Continuous classes</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
                  <div className="text-xs text-slate-400 font-medium">Workload Balance</div>
                  <div className="text-xl font-bold text-purple-400 mt-1">
                    {result.workload_balance_pct}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Faculty hours spread</div>
                </div>
              </div>

              {/* Natural Language Explanation Card */}
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl text-sm leading-relaxed text-slate-300 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
                    AI Explainable Verification
                  </div>
                  <p>{result.explanation}</p>
                </div>
              </div>

              {/* Interactive Weekly Timetable Grid */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sky-400" />
                    Generated Weekly Schedule ({result.entries.length} Sessions)
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-500/20 border border-sky-500/40 inline-block"></span> Theory</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-500/20 border border-purple-500/40 inline-block"></span> Laboratory</span>
                  </div>
                </div>

                <table className="w-full border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                      <th className="py-3 px-3 text-left w-24">Day</th>
                      {timeSlots.map(slot => (
                        <th key={slot} className={`py-3 px-2 text-center text-[11px] ${slot.startsWith('13:') ? 'bg-amber-950/20 text-amber-400/80 font-bold' : ''}`}>
                          {slot.startsWith('13:') ? 'LUNCH' : slot}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {days.map(day => (
                      <tr key={day} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-200 text-xs">{day}</td>
                        {timeSlots.map(slot => {
                          if (slot.startsWith('13:')) {
                            return (
                              <td key={slot} className="py-2 px-1 text-center bg-amber-950/10">
                                <span className="text-[10px] text-amber-400/50 uppercase tracking-widest font-mono">Break</span>
                              </td>
                            );
                          }
                          const entry = getEntryAt(day, slot);
                          return (
                            <td key={slot} className="p-1.5 align-top w-28">
                              {entry ? (
                                <div className={`p-2 rounded-xl border text-left transition-all hover:scale-[1.02] shadow-sm ${
                                  entry.subject_type === 'Practical'
                                    ? 'bg-purple-950/30 border-purple-500/30 text-purple-200'
                                    : 'bg-sky-950/30 border-sky-500/30 text-sky-200'
                                }`}>
                                  <div className="font-bold text-xs truncate" title={entry.subject_name}>
                                    {entry.subject_code}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                    <User className="w-2.5 h-2.5 text-slate-500" />
                                    {entry.faculty_name}
                                  </div>
                                  <div className="text-[10px] font-mono text-sky-400/80 truncate flex items-center gap-1 mt-0.5">
                                    <Building2 className="w-2.5 h-2.5 text-sky-500" />
                                    {entry.room_number}
                                  </div>
                                </div>
                              ) : (
                                <div className="h-14 rounded-lg border border-dashed border-slate-800/80 flex items-center justify-center text-[10px] text-slate-600">
                                  Free
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center space-y-4 shadow-xl">
              <div className="inline-flex p-4 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white">No Timetable Generated Yet</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Configure your target department, semester batch, and soft constraints on the left panel, 
                then click <strong>Generate Timetable</strong> to run Google OR-Tools CP-SAT.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
