import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '@/services/api';
import { ExamCellStats } from '@/types';
import { StatCard } from '@/components/common/StatCard';
import {
  FileCheck2, CalendarDays, DoorOpen, ListTodo, Activity,
  CheckCircle2, PlusCircle, ArrowRight
} from 'lucide-react';

export const ExamCellDashboard: React.FC = () => {
  const [stats, setStats] = useState<ExamCellStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExamStats = async () => {
      try {
        const data = await dashboardApi.getExamCell();
        setStats(data);
      } catch (err) {
        console.error("Failed to load exam cell stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExamStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Exam Cell Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold">
            <span>Central Examination Cell Operations • Level 4</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Examination Coordination & Seating Center
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-normal">
            Autonomous timetable conflict interception, exam hall allocation, and invigilator matrix control.
          </p>
        </div>

        <button
          onClick={() => navigate('/examinations')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Schedule New Examination</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard
          title="Total Examinations"
          value={stats.total_examinations}
          icon={FileCheck2}
          iconColor="text-purple-600"
          iconBg="bg-purple-50 border-purple-100"
          description="Scheduled this academic year"
        />
        <StatCard
          title="Upcoming Exams"
          value={stats.upcoming_examinations_count}
          icon={CalendarDays}
          iconColor="text-sky-600"
          iconBg="bg-sky-50 border-sky-100"
          description="Next 30 days"
        />
        <StatCard
          title="Verified Halls"
          value={stats.total_exam_halls}
          icon={DoorOpen}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
          description="High-capacity venues"
        />
        <StatCard
          title="Pending Checklists"
          value={stats.pending_tasks_count}
          icon={ListTodo}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-100"
          description="Invigilator verifications"
        />
      </div>

      {/* UPCOMING EXAMINATIONS CALENDAR LIST (Section 7.E) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Upcoming Institutional Examinations</h3>
            <p className="text-xs text-slate-500">Conflict-free schedule verified against room and timetable constraints</p>
          </div>
          <button
            onClick={() => navigate('/examinations')}
            className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1"
          >
            <span>Manage All Exams</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-mono">
                <th className="py-2.5 px-3">EXAM TITLE</th>
                <th className="py-2.5 px-3">SUBJECT</th>
                <th className="py-2.5 px-3">DEPT</th>
                <th className="py-2.5 px-3">DATE & TIME</th>
                <th className="py-2.5 px-3">ALLOCATED HALL</th>
                <th className="py-2.5 px-3">CAPACITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.upcoming_examinations.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-900">{ex.name}</td>
                  <td className="py-3 px-3 font-medium text-slate-700">{ex.subject}</td>
                  <td className="py-3 px-3 font-mono font-bold text-purple-700">{ex.department}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    <span className="font-bold text-slate-800">{ex.date}</span> &bull; {ex.time}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    🏛️ {ex.hall}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-500">{ex.capacity} seats</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HALL OCCUPANCY OVERVIEW (Section 7.E) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Examination Hall Capacities</h3>
              <p className="text-xs text-slate-500">Authorized high-capacity exam seating locations</p>
            </div>
            <DoorOpen className="w-5 h-5 text-purple-600" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.hall_occupancy.map((h, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-xs">{h.hall}</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {h.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">{h.type}</div>
                <div className="text-xs font-mono font-bold text-purple-700 pt-1">
                  Capacity: {h.capacity} Students
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Examination Cell Audits</h3>
              <p className="text-xs text-slate-500">Hall ticket and schedule dispatch records</p>
            </div>
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="space-y-3">
            {stats.recent_activities.map((act) => (
              <div key={act.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-800">{act.action}</span>
                  <p className="text-slate-500 text-[11px]">{act.details}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
