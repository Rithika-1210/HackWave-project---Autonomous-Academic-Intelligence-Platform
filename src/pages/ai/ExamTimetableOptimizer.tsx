import React, { useState, useEffect } from 'react';
import { aiApi, departmentsApi } from '@/services/api';
import { Department, ExamOptimizeResponse, ExamSlotProposal } from '@/types';
import {
  FileCheck2, Sparkles, CheckCircle2, Clock, Building2, User,
  Calendar, RefreshCw, AlertTriangle
} from 'lucide-react';

export const ExamTimetableOptimizer: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<number>(1);
  const [semester, setSemester] = useState<number>(6);
  const [startDate, setStartDate] = useState<string>('2026-11-10');
  const [endDate, setEndDate] = useState<string>('2026-11-25');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExamOptimizeResponse | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await departmentsApi.getAll({ status_filter: 'Active' });
      setDepartments(data);
      if (data.length > 0) setSelectedDept(data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOptimize = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await aiApi.optimizeExams({
        department_id: selectedDept,
        semester,
        start_date: startDate,
        end_date: endDate,
        exam_type: 'End-Semester'
      });
      setResult(res);
      setMessage({ type: 'success', text: `Examination timetable synthesized for ${res.exams_scheduled_count} papers!` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to optimize exam timetable.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <FileCheck2 className="w-3.5 h-3.5" /> Examination Optimization Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Examination Timetable Optimizer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Automate examination hall assignments, study buffer spacing, and clash-free faculty invigilator scheduling.
          </p>
        </div>
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

      {/* Control Configuration Bar */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Optimization Constraints & Timeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleOptimize}
          disabled={loading}
          className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Optimizing Examination Schedule...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Synthesize Clash-Free Examination Schedule
            </>
          )}
        </button>
      </div>

      {/* Results View */}
      {result ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Feasible Examination Matrix Synthesized
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                Semester {semester} End-Semester Examinations
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Papers Scheduled</div>
                <div className="text-lg font-bold text-sky-400">{result.exams_scheduled_count}</div>
              </div>
              <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Conflicts Avoided</div>
                <div className="text-lg font-bold text-emerald-400">{result.conflicts_avoided}</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="text-sky-400 font-bold uppercase tracking-wider block mb-1">Constraint Satisfaction Report:</span>
            {result.explanation}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Exam Date & Session</th>
                  <th className="py-3 px-3">Assigned Examination Hall</th>
                  <th className="py-3 px-3">Faculty Invigilator</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {result.schedule.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{s.subject_name}</div>
                      <div className="font-mono text-sky-400 text-[11px]">{s.subject_code}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-400" /> {s.exam_date}
                      </div>
                      <div className="text-slate-400 flex items-center gap-1.5 text-[11px] mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" /> {s.start_time} - {s.end_time} (3 Hours)
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200 font-mono flex items-center gap-1.5 font-bold">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" /> {s.hall_name}
                      </div>
                      <div className="text-[11px] text-slate-500">Seating Capacity: {s.capacity} desks</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-300 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-sky-400" /> {s.invigilator_name || 'Designated Invigilator'}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Allocated
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center space-y-3 shadow-xl">
          <FileCheck2 className="w-10 h-10 text-purple-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Schedule Synthesized</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Configure target dates and click Synthesize to run constraint optimization with guaranteed 48-hour student study breaks.
          </p>
        </div>
      )}
    </div>
  );
};
