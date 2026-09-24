import React, { useState, useEffect } from 'react';
import { aiApi } from '@/services/api';
import { ConflictDashboardSummary, ConflictRecord } from '@/types';
import {
  AlertTriangle, ShieldAlert, CheckCircle2, RefreshCw, Filter,
  Building2, User, Clock, ArrowRight, Activity, Zap
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';

const COLORS = ['#f43f5e', '#fb923c', '#38bdf8', '#a855f7', '#10b981'];

export const ConflictPredictionDashboard: React.FC = () => {
  const [data, setData] = useState<ConflictDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const summary = await aiApi.getConflicts();
      setData(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const summary = await aiApi.analyzeConflicts();
      setData(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const chartData = data?.distribution_by_type
    ? Object.entries(data.distribution_by_type).map(([name, value]) => ({ name, value }))
    : [];

  const filteredConflicts = data?.recent_conflicts.filter(c => {
    if (filterSeverity === 'all') return true;
    return c.severity.toLowerCase() === filterSeverity.toLowerCase();
  }) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-400/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Collision Interception Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Academic Conflict Prediction Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time automated validation across faculty, student cohorts, rooms, and examination schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white text-sm font-semibold shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Validating Schedules...' : 'Run Conflict Check'}
          </button>
          <Link
            to="/ai/conflict-resolution"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-all"
          >
            Resolution Center
            <ArrowRight className="w-4 h-4 text-sky-400" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mr-2" />
          Scanning schedule matrix...
        </div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Conflicts</div>
              <div className="text-3xl font-bold text-white mt-1">{data?.total_conflicts || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Detected across institutional matrix</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-xs text-rose-400 font-semibold uppercase tracking-wider">Critical Collisions</div>
              <div className="text-3xl font-bold text-rose-400 mt-1">{data?.critical_count || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Direct double-bookings</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">High Priority</div>
              <div className="text-3xl font-bold text-amber-400 mt-1">{data?.high_count || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Workload or batch overlaps</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Resolved</div>
              <div className="text-3xl font-bold text-emerald-400 mt-1">{data?.resolved_count || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Remediated via AI rescheduling</div>
            </div>
          </div>

          {/* Charts & Distribution Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-sky-400" />
                  Conflict Distribution
                </h3>
                {chartData.length > 0 ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={75}
                          innerRadius={45}
                          paddingAngle={4}
                        >
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-56 flex items-center justify-center text-xs text-slate-500">
                    No active conflicts recorded.
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t border-slate-800/80 pt-4">
                {chartData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      <span className="text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conflict Records Table */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Live Diagnostic Records ({filteredConflicts.length})
                </h3>

                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                  </select>
                </div>
              </div>

              {filteredConflicts.length > 0 ? (
                <div className="space-y-3">
                  {filteredConflicts.map((c) => (
                    <div
                      key={c.conflict_id}
                      className="p-4 rounded-xl border bg-slate-950/50 border-slate-800 hover:border-slate-700 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                            c.severity === 'Critical'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {c.severity}
                          </span>
                          <span className="font-semibold text-sm text-slate-200">{c.conflict_type}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">{c.conflict_id}</span>
                      </div>

                      <p className="text-xs text-slate-300">{c.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                        {c.date_or_day && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-sky-400" /> {c.date_or_day} {c.time_slot}
                          </span>
                        )}
                        {c.affected_classroom_name && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-indigo-400" /> Room: {c.affected_classroom_name}
                          </span>
                        )}
                        {c.affected_faculty_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-purple-400" /> Faculty: {c.affected_faculty_name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12 text-slate-500 text-sm">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  No conflicts detected under current filter!
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
