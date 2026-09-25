import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '@/services/api';
import { AdminStats } from '@/types';
import { StatCard } from '@/components/common/StatCard';
import {
  GraduationCap, Users, Building2, BookOpen, DoorOpen,
  PlusCircle, Activity, BarChart3, ShieldCheck, Sparkles, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await dashboardApi.getAdmin();
        setStats(data);
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-mono">Loading real-time institutional metrics...</span>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const PIE_COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Operations Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Institutional Operations Command Center
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
            Real-time synchronization across departments, faculty workloads, timetables, and resource capacities.
          </p>
        </div>

        {/* Decorative Neon Ring */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 6 Key Performance Indicator Cards (Section 7.A) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Students"
          value={stats.total_students}
          icon={GraduationCap}
          iconColor="text-sky-600"
          iconBg="bg-sky-50 border-sky-100"
          description="Enrolled learners"
        />
        <StatCard
          title="Faculty"
          value={stats.total_faculty}
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50 border-indigo-100"
          description="Teaching staff"
        />
        <StatCard
          title="Departments"
          value={stats.total_departments}
          icon={Building2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50 border-emerald-100"
          description="Academic divisions"
        />
        <StatCard
          title="Courses"
          value={stats.total_courses}
          icon={BookOpen}
          iconColor="text-amber-600"
          iconBg="bg-amber-50 border-amber-100"
          description="Degree programs"
        />
        <StatCard
          title="Classrooms"
          value={stats.total_classrooms}
          icon={DoorOpen}
          iconColor="text-purple-600"
          iconBg="bg-purple-50 border-purple-100"
          description="Lecture halls"
        />
        <StatCard
          title="Laboratories"
          value={stats.total_laboratories}
          icon={Sparkles}
          iconColor="text-rose-600"
          iconBg="bg-rose-50 border-rose-100"
          description="Computing & Science"
        />
      </div>

      {/* QUICK ACTIONS ROW (Section 7.A) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
            Institutional Quick Actions
          </h3>
          <span className="text-xs text-slate-400">Direct CRUD Shortcuts</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={() => navigate('/faculty')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-sky-50 hover:border-sky-200 border border-slate-200 text-slate-700 hover:text-sky-700 text-xs font-bold transition-all shadow-2xs"
          >
            <PlusCircle className="w-4 h-4 text-sky-600" />
            <span>Add Faculty</span>
          </button>
          <button
            onClick={() => navigate('/students')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-all shadow-2xs"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span>Add Student</span>
          </button>
          <button
            onClick={() => navigate('/departments')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all shadow-2xs"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Create Department</span>
          </button>
          <button
            onClick={() => navigate('/resources')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 text-slate-700 hover:text-purple-700 text-xs font-bold transition-all shadow-2xs"
          >
            <PlusCircle className="w-4 h-4 text-purple-600" />
            <span>Add Classroom / Lab</span>
          </button>
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200 text-slate-700 hover:text-amber-700 text-xs font-bold transition-all shadow-2xs"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <span>Add Course / Subject</span>
          </button>
        </div>
      </div>

      {/* CHARTS ROW (Section 7.A: Enrollment Chart & Department Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Student Enrollment Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Enrollment Distribution</h3>
              <p className="text-xs text-slate-500">Learners enrolled per academic cohort</p>
            </div>
            <BarChart3 className="w-5 h-5 text-sky-600" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.student_enrollment_chart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Students Enrolled" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Department Faculty Breakdown</h3>
              <p className="text-xs text-slate-500">Faculty count mapped by department</p>
            </div>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.department_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="faculty"
                  nameKey="name"
                >
                  {stats.department_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* RECENT ACTIVITIES TABLE (Section 7.A) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">System Activity & Audit Trail</h3>
            <p className="text-xs text-slate-500">Live tamper-proof records from the institutional audit logs</p>
          </div>
          <Activity className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-mono">
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">OPERATOR</th>
                <th className="py-2.5 px-3">ACTION</th>
                <th className="py-2.5 px-3">RESOURCE</th>
                <th className="py-2.5 px-3">OPERATIONAL DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recent_activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No recent audit activities recorded.
                  </td>
                </tr>
              ) : (
                stats.recent_activities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">{act.time}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{act.user}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                        {act.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-semibold">{act.resource}</td>
                    <td className="py-3 px-3 text-slate-500 max-w-md truncate">{act.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
