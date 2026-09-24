import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/services/api';
import { FacultyStats } from '@/types';
import { StatCard } from '@/components/common/StatCard';
import {
  Clock, BookOpen, CalendarDays, MapPin, User,
  CheckCircle2, Sparkles, AlertCircle
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const [stats, setStats] = useState<FacultyStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const data = await dashboardApi.getFaculty();
        setStats(data);
      } catch (err) {
        console.error("Failed to load faculty stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
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
      
      {/* Faculty Profile Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold">
            <span>Faculty Instruction Portal • Level 3</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {stats.faculty_name}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-normal">
            {stats.designation} &bull; {stats.department_name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-300 font-mono uppercase">Assigned Subjects</span>
            <div className="text-xl font-extrabold text-white font-mono">{stats.total_assigned_courses} Courses</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-300 font-mono uppercase">Teaching Load</span>
            <div className="text-xl font-extrabold text-sky-400 font-mono">{stats.weekly_teaching_hours} h/wk</div>
          </div>
        </div>
      </div>

      {/* TODAY'S SCHEDULE (Section 7.C) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-sky-600" />
              <span>Today's Class Schedule</span>
            </h3>
            <p className="text-xs text-slate-500">Live lecture slots scheduled for today</p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {stats.today_classes.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">No teaching lectures scheduled for today. You are free for research & office hours.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.today_classes.map((c, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition-colors space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-sky-600">
                  <span>{c.code}</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">{c.time}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{c.subject}</h4>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                  <span className="flex items-center gap-1 font-mono font-semibold text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {c.room}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">
                    {c.batch}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPCOMING CLASSES ACROSS THE WEEK (Section 7.C) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Weekly Schedule Timeline</h3>
            <p className="text-xs text-slate-500">Upcoming lecture slots across the active academic term</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Synchronized with Master Timetable</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-mono">
                <th className="py-2.5 px-3">DAY</th>
                <th className="py-2.5 px-3">TIME</th>
                <th className="py-2.5 px-3">COURSE / SUBJECT</th>
                <th className="py-2.5 px-3">CODE</th>
                <th className="py-2.5 px-3">ALLOCATED VENUE</th>
                <th className="py-2.5 px-3">STUDENT BATCH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.upcoming_classes.map((cls, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-bold text-slate-800">{cls.day}</td>
                  <td className="py-3 px-3 font-mono text-sky-700 font-semibold">{cls.time}</td>
                  <td className="py-3 px-3 font-medium text-slate-900">{cls.subject}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{cls.code}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-700">{cls.room}</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {cls.batch}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
