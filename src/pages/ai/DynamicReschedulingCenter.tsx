import React, { useState, useEffect } from 'react';
import { aiApi, departmentsApi, facultyApi, resourcesApi } from '@/services/api';
import {
  Department, Faculty, Classroom, RescheduleSimulationResponse, ReschedulingRequestItem
} from '@/types';
import {
  RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, UserCheck,
  Building2, Calendar, Clock, Layers, Sparkles, Send, Check
} from 'lucide-react';

export const DynamicReschedulingCenter: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  const [selectedDept, setSelectedDept] = useState<number>(1);
  const [reason, setReason] = useState<string>('Faculty Leave');
  const [targetDate, setTargetDate] = useState<string>('Monday');
  const [affectedFacultyId, setAffectedFacultyId] = useState<number | undefined>(undefined);
  const [affectedClassroomId, setAffectedClassroomId] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState<RescheduleSimulationResponse | null>(null);
  const [history, setHistory] = useState<ReschedulingRequestItem[]>([]);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadPrerequisites();
    loadHistory();
  }, []);

  const loadPrerequisites = async () => {
    try {
      const [depts, facs, rooms] = await Promise.all([
        departmentsApi.getAll({ status_filter: 'Active' }),
        facultyApi.getAll({ status_filter: 'Active' }),
        resourcesApi.getAll({ availability_status: 'Available' })
      ]);
      setDepartments(depts);
      setFacultyList(facs);
      setClassrooms(rooms);
      if (depts.length > 0) setSelectedDept(depts[0].id);
      if (facs.length > 0) setAffectedFacultyId(facs[0].id);
      if (rooms.length > 0) setAffectedClassroomId(rooms[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await aiApi.listReschedulingRequests();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulate = async () => {
    setLoading(true);
    setActionMsg(null);
    try {
      const res = await aiApi.simulateReschedule({
        department_id: selectedDept,
        reason,
        target_date: targetDate,
        affected_faculty_id: reason.includes('Faculty') ? affectedFacultyId : undefined,
        affected_classroom_id: reason.includes('Classroom') ? affectedClassroomId : undefined
      });
      setSimulation(res);
      setActionMsg({
        type: 'success',
        text: `Synthesized ${res.proposed_changes.length} substitution solutions with disruption score ${res.disruption_score}!`
      });
      loadHistory();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to simulate rescheduling.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!simulation) return;
    setApproving(true);
    try {
      const res = await aiApi.approveReschedule({
        request_id: simulation.request_id,
        action: 'approve_direct',
        comments: 'Approved via Dynamic Rescheduling Center'
      });
      setActionMsg({ type: 'success', text: res.message });
      loadHistory();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to approve changes.' });
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Autonomous Adaptation Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Dynamic Academic Rescheduling Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Simulate sudden disruptions (faculty leave, room maintenance, events) and synthesize qualified substitutions with minimal syllabus impact.
          </p>
        </div>

        {simulation && (
          <button
            onClick={handleApprove}
            disabled={approving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {approving ? 'Applying Changes...' : 'Approve & Apply Live'}
          </button>
        )}
      </div>

      {actionMsg && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border shadow-xl ${
          actionMsg.type === 'success' 
            ? 'bg-slate-900 border-2 border-emerald-500/50 text-white shadow-emerald-950/30' 
            : 'bg-slate-900 border-2 border-rose-500/50 text-white shadow-rose-950/30'
        }`}>
          {actionMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <span className="font-medium text-slate-100">{actionMsg.text}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Parameter Panel */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            Disruption Configuration
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
            >
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Unforeseen Disruption Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
            >
              <option value="Faculty Leave">Faculty Emergency Leave</option>
              <option value="Emergency Unavailability">Sudden Academic Duty / Conference</option>
              <option value="Classroom Maintenance">Room Hardware / Air-Conditioning Failure</option>
              <option value="Holiday">Institutional Holiday Announcement</option>
              <option value="Campus Event">Placement Drive / Annual Symposium</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Target Day / Date
            </label>
            <select
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
            </select>
          </div>

          {reason.includes('Faculty') && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Absent Faculty Member
              </label>
              <select
                value={affectedFacultyId}
                onChange={(e) => setAffectedFacultyId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
              >
                {facultyList.map(f => (
                  <option key={f.id} value={f.id}>{f.full_name} ({f.designation})</option>
                ))}
              </select>
            </div>
          )}

          {reason.includes('Classroom') && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Unavailable Room / Lab
              </label>
              <select
                value={affectedClassroomId}
                onChange={(e) => setAffectedClassroomId(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
              >
                {classrooms.map(r => (
                  <option key={r.id} value={r.id}>{r.room_number} — {r.name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Synthesizing Alternative Schedule...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Simulate Dynamic Rescheduling
              </>
            )}
          </button>
        </div>

        {/* Right Output Before-and-After Comparison */}
        <div className="lg:col-span-2 space-y-6">
          {simulation ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-sky-400">Request: {simulation.request_id}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Proposed Schedule Adjustments ({simulation.proposed_changes.length} Sessions)
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Disruption Index</div>
                  <div className="text-xl font-bold text-emerald-400">{simulation.disruption_score} Shifts</div>
                </div>
              </div>

              {/* Natural Language Explanation */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <span className="text-sky-400 font-bold uppercase tracking-wider block mb-1">
                  AI Operations Assessment:
                </span>
                {simulation.explanation}
              </div>

              {/* Before and After Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                      <th className="py-2.5 px-3">Subject & Session</th>
                      <th className="py-2.5 px-3 text-rose-400/80">Original Allocation</th>
                      <th className="py-2.5 px-3 text-emerald-400">Proposed Replacement</th>
                      <th className="py-2.5 px-3">Reasoning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {simulation.proposed_changes.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{item.subject_name}</div>
                          <div className="text-slate-500 font-mono text-[11px]">{item.subject_code}</div>
                        </td>

                        <td className="py-3 px-3 space-y-1">
                          <div className="text-slate-300 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-slate-500" /> {item.original_faculty}
                          </div>
                          <div className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                            <Building2 className="w-3 h-3 text-slate-500" /> {item.original_room}
                          </div>
                          <div className="text-slate-500 text-[10px]">{item.original_slot}</div>
                        </td>

                        <td className="py-3 px-3 space-y-1">
                          <div className="text-emerald-300 font-bold flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-emerald-400" /> {item.replacement_faculty}
                          </div>
                          <div className="text-emerald-400/90 flex items-center gap-1 font-mono text-[11px]">
                            <Building2 className="w-3 h-3 text-emerald-400" /> {item.proposed_room}
                          </div>
                          <div className="text-emerald-400/70 text-[10px] font-semibold">{item.proposed_slot}</div>
                        </td>

                        <td className="py-3 px-3 text-slate-400 leading-normal max-w-xs">
                          {item.reasoning}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center space-y-3 shadow-xl">
              <Sparkles className="w-10 h-10 text-sky-400 mx-auto animate-pulse" />
              <h3 className="text-lg font-bold text-white">No Simulation Active</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Select an unexpected operational event on the left and click Simulate to compute clash-free substitutions.
              </p>
            </div>
          )}

          {/* Historical Log */}
          {history.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                Recent Rescheduling Requests ({history.length})
              </h3>

              <div className="space-y-3">
                {history.slice(0, 5).map(h => (
                  <div key={h.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{h.reason} ({h.target_date})</div>
                      <div className="text-slate-500 mt-0.5">{h.changes_count} sessions shifted • Disruption: {h.disruption_score}</div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                      h.status === 'Approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {h.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
