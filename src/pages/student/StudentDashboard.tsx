import React, { useEffect, useState } from 'react';
import { dashboardApi } from '@/services/api';
import { StudentStats } from '@/types';
import {
  GraduationCap, CalendarDays, FileCheck2, MapPin, Clock,
  BookOpen, CheckCircle2, UserCheck
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await dashboardApi.getStudent();
        setStats(data);
      } catch (err) {
        console.error("Failed to load student stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
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
      
      {/* Student Profile Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <span>Student Academic Portal • Semester {stats.semester}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {stats.student_name}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-mono">
            Roll: <strong className="text-white">{stats.student_id}</strong> &bull; {stats.course_name} ({stats.department_name})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-300 font-mono uppercase">Enrolled Subjects</span>
            <div className="text-xl font-extrabold text-white font-mono">{stats.enrolled_subjects_count} Courses</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] text-slate-300 font-mono uppercase">Upcoming Exams</span>
            <div className="text-xl font-extrabold text-amber-400 font-mono">{stats.upcoming_examinations.length} Scheduled</div>
          </div>
        </div>
      </div>

      {/* TODAY'S CLASSES (Section 7.D) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-sky-600" />
              <span>Today's Classes</span>
            </h3>
            <p className="text-xs text-slate-500">Scheduled classroom lectures for today</p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-bold border border-sky-200">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        {stats.today_classes.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">No classes scheduled for today. Time for self-study and projects!</p>
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
                <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <span>Instructor:</span> <strong className="text-slate-700">{c.faculty}</strong>
                </div>
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

      {/* UPCOMING EXAMINATIONS WITH HALL COORDINATES (Section 7.D) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-600" />
              <span>Upcoming Examination Seating & Hall Tickets</span>
            </h3>
            <p className="text-xs text-slate-500">Official scheduled examinations and assigned hall locations</p>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
            Admit Card Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-mono">
                <th className="py-2.5 px-3">DATE</th>
                <th className="py-2.5 px-3">TIMING</th>
                <th className="py-2.5 px-3">SUBJECT</th>
                <th className="py-2.5 px-3">CODE</th>
                <th className="py-2.5 px-3">EXAM TYPE</th>
                <th className="py-2.5 px-3">EXAMINATION HALL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.upcoming_examinations.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">{ex.date}</td>
                  <td className="py-3 px-3 font-mono text-sky-700 font-semibold">{ex.time}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{ex.subject}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{ex.code}</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                      {ex.type}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      🏛️ {ex.hall}
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
