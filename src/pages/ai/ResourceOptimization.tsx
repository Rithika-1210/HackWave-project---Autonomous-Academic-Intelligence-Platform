import React, { useState, useEffect } from 'react';
import { aiApi } from '@/services/api';
import { ResourceAnalysisResponse } from '@/types';
import {
  DoorOpen, Building2, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, RefreshCw, Cpu, Layers, Sparkles
} from 'lucide-react';

export const ResourceOptimization: React.FC = () => {
  const [data, setData] = useState<ResourceAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const res = await aiApi.getResourceAnalysis();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = data?.resources.filter(r => {
    if (filterType === 'all') return true;
    return r.resource_type === filterType;
  }) || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <DoorOpen className="w-3.5 h-3.5" /> Spatial Infrastructure Intelligence
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Classroom & Laboratory Optimization
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Analyze campus physical infrastructure occupancy, identify room capacity bottlenecks, and balance lab equipment demand.
          </p>
        </div>

        <button
          onClick={loadResources}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-all"
        >
          <RefreshCw className="w-4 h-4 text-sky-400" />
          Refresh Metrics
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mr-2" />
          Analyzing room utilization rates...
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Facilities</div>
              <div className="text-3xl font-bold text-white mt-1">{data?.total_rooms || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Halls, Labs & Studios</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Operational Facilities</div>
              <div className="text-3xl font-bold text-emerald-400 mt-1">{data?.available_rooms || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Available for bookings</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-xs text-sky-400 font-semibold uppercase tracking-wider">Average Utilization</div>
              <div className="text-3xl font-bold text-sky-400 mt-1">{data?.average_utilization_pct || 0}%</div>
              <div className="text-xs text-slate-500 mt-1">Weekly capacity occupied</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Peak Demand Slots</div>
              <div className="text-base font-bold text-purple-300 mt-2 truncate">
                {data?.peak_hours.join(', ') || '10:00-12:00'}
              </div>
              <div className="text-xs text-slate-500 mt-1">High congestion hours</div>
            </div>
          </div>

          {/* AI Suggestions Box */}
          {data?.optimization_suggestions && data.optimization_suggestions.length > 0 && (
            <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Infrastructure Optimization Recommendations
              </h3>

              <div className="space-y-2">
                {data.optimization_suggestions.map((s, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-950/20 text-xs text-slate-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['all', 'Classroom', 'Computer Laboratory', 'Science Laboratory', 'Seminar Hall', 'Examination Hall'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  filterType === t
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t === 'all' ? 'All Facility Types' : t}
              </button>
            ))}
          </div>

          {/* Room Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(r => (
              <div key={r.room_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                    {r.room_number}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    r.status === 'Overutilized'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : r.status === 'Optimal'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {r.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{r.name}</h4>
                  <div className="text-xs text-slate-500 mt-0.5">{r.building} • Capacity: {r.capacity} seats</div>
                </div>

                {r.equipment && (
                  <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-1.5 truncate">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{r.equipment}</span>
                  </div>
                )}

                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Weekly Utilization</span>
                    <span className="font-bold text-white">{r.occupied_hours_weekly}h / {r.total_available_hours}h ({r.utilization_pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        r.utilization_pct > 75
                          ? 'bg-rose-500'
                          : r.utilization_pct > 30
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, r.utilization_pct)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
