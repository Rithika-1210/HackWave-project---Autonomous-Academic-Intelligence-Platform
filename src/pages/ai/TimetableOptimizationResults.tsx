import React, { useState, useEffect } from 'react';
import { aiApi } from '@/services/api';
import { ScheduleJobItem } from '@/types';
import {
  Sparkles, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  TrendingUp, BarChart3, RefreshCw, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TimetableOptimizationResults: React.FC = () => {
  const [jobs, setJobs] = useState<ScheduleJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<ScheduleJobItem | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await aiApi.listScheduleJobs();
      setJobs(data);
      if (data.length > 0) setSelectedJob(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <TrendingUp className="w-3.5 h-3.5" /> Mathematical Benchmark Archive
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Timetable Optimization Results
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Historical audit log of all constraint satisfaction generation jobs and solver analytics.
          </p>
        </div>

        <Link
          to="/ai/timetable-generator"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold shadow-lg shadow-sky-500/25 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          New Generation Job
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mr-2" />
          Loading optimization records...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left List of Jobs */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              Optimization Jobs ({jobs.length})
            </h2>

            <div className="space-y-3">
              {jobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-950/40 border-sky-500 shadow-md ring-1 ring-sky-500/40'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-sky-400">{job.job_id}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        job.status === 'Feasible' || job.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-200">
                      Semester {job.semester} — {job.batch}
                    </div>

                    <div className="flex items-center justify-between mt-3 text-xs text-slate-400 border-t border-slate-800/80 pt-2">
                      <span>Score: <strong className="text-sky-400">{job.optimization_score}/100</strong></span>
                      <span>{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detail Inspection */}
          <div className="lg:col-span-2">
            {selectedJob ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs text-slate-500 font-mono">Job ID: {selectedJob.job_id}</span>
                    <h2 className="text-xl font-bold text-white mt-0.5">
                      Semester {selectedJob.semester} ({selectedJob.batch})
                    </h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedJob.status === 'Feasible'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {selectedJob.status}
                  </span>
                </div>

                {/* Score Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-xs text-slate-400 font-medium">Optimization Grade</div>
                    <div className="text-2xl font-bold text-sky-400 mt-1">{selectedJob.optimization_score}%</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-xs text-slate-400 font-medium">Student Gap Efficiency</div>
                    <div className="text-2xl font-bold text-indigo-400 mt-1">{selectedJob.gap_efficiency_pct}%</div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="text-xs text-slate-400 font-medium">Workload Balance</div>
                    <div className="text-2xl font-bold text-purple-400 mt-1">{selectedJob.workload_balance_pct}%</div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    Solver Diagnosis & Formulation
                  </h3>
                  <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-sm text-slate-300 leading-relaxed font-sans">
                    {selectedJob.explanation || 'Optimal mathematical solution verified with zero constraint collisions.'}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-4">
                  <span>Academic Year: {selectedJob.academic_year}</span>
                  <span>Created: {new Date(selectedJob.created_at).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-400">
                Select an optimization job to view details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
