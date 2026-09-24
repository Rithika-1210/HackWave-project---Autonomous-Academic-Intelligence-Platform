import React, { useState, useEffect } from 'react';
import { aiApi } from '@/services/api';
import { RiskAnalysisResponse, RiskRecord } from '@/types';
import {
  AlertTriangle, ShieldAlert, CheckCircle2, TrendingUp,
  RefreshCw, Info, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';

export const AcademicRiskDashboard: React.FC = () => {
  const [data, setData] = useState<RiskAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRisks();
  }, []);

  const loadRisks = async () => {
    setLoading(true);
    try {
      const res = await aiApi.getRiskAnalysis();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Rule-Based Early Warning System
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Academic Scheduling Risk Analysis
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Proactive institutional intelligence identifying single points of failure, resource bottlenecks, and inflexible schedules.
          </p>
        </div>

        <button
          onClick={loadRisks}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-all"
        >
          <RefreshCw className="w-4 h-4 text-sky-400" />
          Refresh Risk Engine
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mr-2" />
          Evaluating scheduling vulnerabilities...
        </div>
      ) : (
        <>
          {/* Risk Summary KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Identified Risks</div>
              <div className="text-3xl font-bold text-white mt-1">{data?.total_risks || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Operational vulnerabilities</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-xs text-rose-400 font-semibold uppercase tracking-wider">Critical Risk Level</div>
              <div className="text-3xl font-bold text-rose-400 mt-1">{data?.critical_risks || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Immediate intervention required</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">High Risk Level</div>
              <div className="text-3xl font-bold text-amber-400 mt-1">{data?.high_risks || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Resource bottlenecks</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-xs text-sky-400 font-semibold uppercase tracking-wider">Medium Risk Level</div>
              <div className="text-3xl font-bold text-sky-400 mt-1">{data?.medium_risks || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Mitigatable via rescheduling</div>
            </div>
          </div>

          {/* Risk Records Grid */}
          <div className="space-y-4">
            {data?.risks.map(r => (
              <div key={r.risk_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-700 transition-all space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      r.risk_level === 'Critical'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : r.risk_level === 'High'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                    }`}>
                      {r.risk_level} Risk
                    </span>
                    <span className="text-xs font-mono text-slate-500">{r.risk_category}</span>
                    <h3 className="font-bold text-base text-white">{r.title}</h3>
                  </div>

                  <span className="text-xs font-mono text-slate-500">{r.risk_id}</span>
                </div>

                <p className="text-sm text-slate-300">{r.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-xs">
                  <div>
                    <div className="text-slate-500 font-semibold uppercase tracking-wider mb-1">Supporting Evidence</div>
                    <div className="text-slate-300">{r.supporting_evidence || 'Observed in active timetable dataset.'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-semibold uppercase tracking-wider mb-1">Potential Operational Impact</div>
                    <div className="text-rose-400/90 font-medium">{r.potential_impact || 'Moderate disruption to lectures.'}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 font-semibold uppercase tracking-wider mb-1">Suggested Preventive Action</div>
                    <div className="text-emerald-400 font-medium">{r.preventive_action || 'Review departmental allocation.'}</div>
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
