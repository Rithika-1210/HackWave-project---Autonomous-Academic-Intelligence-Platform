import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/services/api';
import { HodStats } from '@/types';
import { StatCard } from '@/components/common/StatCard';
import {
  Users, GraduationCap, BookOpen, Clock, Activity,
  PieChart as PieIcon, CheckCircle2, ShieldAlert
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export const HodDashboard: React.FC = () => {
  const [stats, setStats] = useState<HodStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHod = async () => {
      try {
        const data = await dashboardApi.getHod();
        setStats(data);
      } catch (err) {
        console.error("Failed to load HOD stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHod();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const PIE_COLORS = ['#0ea5e9', '#6366f1', '#10b981'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            <span>HOD Operations Clearance • {stats.department_code}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {stats.department_name}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-normal">
            Departmental timetable synchronization, faculty workload ceilings, and subject assignments.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-right">
          <div className="text-[10px] font-mono uppercase text-slate-400">Department Status</div>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Optimal Workloads</span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard
          title="Faculty Members"
          value={stats.total_faculty}
          icon={Users}
          iconColor="text-sky-600"
          iconBg="bg-sky-50 border-sky-100"
          description="In department"
        />
        <StatCard
          title="Enrolled Students"
          value={stats.total_students}
          icon={GraduationCap}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50 border-indigo-100"
          description="Across all semesters"
        />
        <StatCard
          title="Active Subjects"
          value={stats.total_subjects}
          icon={BookOpen}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
          description="Theory & practicals"
        />
        <StatCard
          title="Avg Workload"
          value={`${stats.avg_faculty_workload_hours} h`}
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-100"
          description="Institutional limit: 18h"
        />
      </div>

      {/* FACULTY WORKLOAD SUMMARY (Section 7.B) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Faculty Workload Balance Summary</h3>
            <p className="text-xs text-slate-500">Weekly assigned teaching hours vs maximum workload threshold</p>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded bg-slate-100 text-slate-600 font-bold">
            Max Limit: 18 h/wk
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-mono">
                <th className="py-2.5 px-3">FACULTY ID</th>
                <th className="py-2.5 px-3">INSTRUCTOR NAME</th>
                <th className="py-2.5 px-3">DESIGNATION</th>
                <th className="py-2.5 px-3">HOURS SCHEDULED</th>
                <th className="py-2.5 px-3">UTILIZATION GAUGE</th>
                <th className="py-2.5 px-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.faculty_workload_summary.map((f) => (
                <tr key={f.facultyId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-700">{f.facultyId}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{f.name}</td>
                  <td className="py-3 px-3 text-slate-600">{f.designation}</td>
                  <td className="py-3 px-3 font-mono font-bold text-sky-700">{f.workloadHours} / {f.maxWorkload} hrs</td>
                  <td className="py-3 px-3 min-w-[140px]">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full ${
                          f.utilizationPct > 90 ? 'bg-amber-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${Math.min(f.utilizationPct, 100)}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Normal ({f.utilizationPct}%)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHARTS: Subject Distribution & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Subject Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Curricular Subject Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of theory vs laboratory course units</p>
            </div>
            <PieIcon className="w-5 h-5 text-sky-600" />
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.subject_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="type"
                >
                  {stats.subject_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Activity Feed */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Department Log Events</h3>
              <p className="text-xs text-slate-500">Audited modifications within {stats.department_code}</p>
            </div>
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="space-y-3">
            {stats.recent_activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent department actions recorded.</p>
            ) : (
              stats.recent_activities.map((act) => (
                <div key={act.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800">{act.action}</span>
                    <p className="text-slate-500 text-[11px]">{act.details || act.resource}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">{act.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
