import React, { useState, useEffect } from 'react';
import { aiApi } from '@/services/api';
import { WorkloadAnalysisResponse, FacultyWorkloadItem } from '@/types';
import {
  Users, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight,
  RefreshCw, Scale, Search, Sparkles
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const FacultyWorkloadOptimization: React.FC = () => {
  const [data, setData] = useState<WorkloadAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadWorkload();
  }, []);

  const loadWorkload = async () => {
    setLoading(true);
    try {
      const res = await aiApi.getWorkloadAnalysis();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = data?.faculty_list.map(f => ({
    name: f.faculty_name.replace('Dr. ', '').replace('Prof. ', ''),
    assigned: f.assigned_periods_count,
    maxLimit: f.max_weekly_workload
  })) || [];

  const filtered = data?.faculty_list.filter(f =>
    f.faculty_name.toLowerCase().includes(search.toLowerCase()) ||
    f.department.toLowerCase().includes(search.toLowerCase()) ||
    f.designation.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Scale className="w-3.5 h-3.5" /> Workload Equilibrium Model
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Faculty Workload Intelligence & Optimization
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time tracking of weekly teaching hours, over-capacity warnings, and automated period rebalancing recommendations.
          </p>
        </div>

        <button
          onClick={loadWorkload}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-all"
        >
          <RefreshCw className="w-4 h-4 text-sky-400" />
          Refresh Workload
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mr-2" />
          Analyzing faculty workload metrics...
        </div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Faculty Analyzed</div>
              <div className="text-3xl font-bold text-white mt-1">{data?.total_faculty || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Active departmental instructors</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-xs text-rose-400 font-semibold uppercase tracking-wider">Overloaded Faculty</div>
              <div className="text-3xl font-bold text-rose-400 mt-1">{data?.overloaded_count || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Exceeding 18 hours/week limit</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Underutilized</div>
              <div className="text-3xl font-bold text-amber-400 mt-1">{data?.underutilized_count || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Below 12 teaching periods</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-xs text-sky-400 font-semibold uppercase tracking-wider">Mean Utilization</div>
              <div className="text-3xl font-bold text-sky-400 mt-1">{data?.average_utilization_pct || 0}%</div>
              <div className="text-xs text-slate-500 mt-1">Institutional teaching load</div>
            </div>
          </div>

          {/* AI Rebalancing Proposals Box */}
          {data?.rebalancing_recommendations && data.rebalancing_recommendations.length > 0 && (
            <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Workload Rebalancing Proposals ({data.rebalancing_recommendations.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.rebalancing_recommendations.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span className="text-rose-400">{p.source_faculty}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-emerald-400">{p.target_faculty}</span>
                    </div>
                    <p className="text-slate-300">{p.reason}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                      <span>Course: <strong className="text-white">{p.subject_name}</strong></span>
                      <span>Transfer: <strong className="text-sky-400">{p.periods_to_transfer} period(s)</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Assigned Hours vs Maximum Permitted Workload
            </h3>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="assigned" name="Assigned Hours" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="maxLimit" name="Max Allowed Ceiling" fill="#475569" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Search & Faculty Table */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white">Faculty Utilization Directory</h3>
              <div className="flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 w-full md:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter faculty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-3">Faculty Member</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">Weekly Hours</th>
                    <th className="py-3 px-3">Capacity Utilization</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map(f => (
                    <tr key={f.faculty_id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">{f.faculty_name}</div>
                        <div className="text-[11px] text-slate-500">{f.designation} • {f.faculty_code}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{f.department}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-white">{f.assigned_periods_count}h</span>
                        <span className="text-slate-500 text-[11px]"> / {f.max_weekly_workload}h</span>
                      </td>
                      <td className="py-3 px-3 w-48">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${
                                f.utilization_pct > 100
                                  ? 'bg-rose-500'
                                  : f.utilization_pct > 65
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, f.utilization_pct)}%` }}
                            ></div>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 w-10 text-right">{f.utilization_pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          f.status === 'Overloaded'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : f.status === 'Optimal'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
