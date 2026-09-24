import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles, CheckCircle2, XCircle, AlertTriangle, ShieldCheck,
  Scale, Users, DoorOpen, GraduationCap, ArrowRight, RefreshCw,
  HelpCircle, ChevronRight, Layers, FileText
} from 'lucide-react';
import { aiApi } from '@/services/api';
import { XaiDetailedExplanation } from '@/types';

export const AiExplanationCenter: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const decisionIdParam = searchParams.get('id') || 'REC-OPT-CSE-001';
  const [decisionId, setDecisionId] = useState<string>(decisionIdParam);
  const [explanation, setExplanation] = useState<XaiDetailedExplanation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadExplanation(decisionId);
  }, [decisionId]);

  const loadExplanation = async (id: string) => {
    setLoading(true);
    try {
      const res = await aiApi.getXaiExplanation(id);
      setExplanation(res);
    } catch (err) {
      console.error('Failed to load XAI explanation:', err);
    } finally {
      setLoading(false);
    }
  };

  const SAMPLE_DECISIONS = [
    { id: 'REC-OPT-CSE-001', label: 'Faculty Rescheduling & Room Relocation (Room 204)' },
    { id: 'SIM-WORKLOAD-BAL', label: 'Faculty Teaching Workload Credit Rebalancing' },
    { id: 'SIM-EXAM-SEATING', label: 'Mid-Term Examination 1:1 Seating Optimization' },
    { id: 'SIM-LAB-CONSOL', label: 'Computer Lab Concurrent Session Consolidation' }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Stage 3 Transparent Intelligence
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Explainable AI (XAI) Recommendation Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Deterministic mathematical reasoning, constraint satisfaction justifications, trade-off breakdowns, and rejected alternative analyses.
          </p>
        </div>

        {/* Quick Decision Switcher */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
          <span className="text-slate-500 font-semibold">Inspect Decision:</span>
          <select
            value={decisionId}
            onChange={(e) => setDecisionId(e.target.value)}
            className="bg-transparent focus:outline-none text-white font-medium"
          >
            {SAMPLE_DECISIONS.map(d => (
              <option key={d.id} value={d.id}>{d.id} - {d.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
          Synthesizing explainable AI justification from solver traces...
        </div>
      ) : !explanation ? (
        <div className="p-8 text-center text-slate-500">Failed to load XAI explanation.</div>
      ) : (
        <div className="space-y-8">
          {/* Primary Justification Hero Card */}
          <div className="bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                Decision ID: {explanation.decision_id}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Action Type: <strong className="text-white">{explanation.action_type}</strong>
              </span>
            </div>

            <div>
              <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Why this option was selected (Primary Justification):
              </h2>
              <p className="text-base text-white font-medium leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                "{explanation.primary_justification}"
              </p>
            </div>
          </div>

          {/* 3-Column Constraint & Preference Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Constraints Considered */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Constraints Considered ({explanation.constraints_considered.length})
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {explanation.constraints_considered.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Conflicts Resolved */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Conflicts Resolved ({explanation.conflicts_resolved.length})
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {explanation.conflicts_resolved.map((cr, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5"></span>
                    <span>{cr}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trade-offs Made */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <Scale className="w-4 h-4 text-amber-400" />
                Trade-offs Made ({explanation.tradeoffs_made.length})
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {explanation.tradeoffs_made.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Rejected Alternatives Section (Why Other Options Were Not Chosen) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" />
                Rejected Alternative Plans & Algorithmic Rejection Reasons
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every alternative candidate evaluated by the optimization solver is logged with its concrete failure reason.
              </p>
            </div>

            <div className="space-y-3">
              {explanation.rejected_alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-rose-500/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-rose-300 flex items-center gap-2">
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      {alt.alternative}
                    </div>
                    <div className="text-xs text-slate-400 leading-relaxed pl-5">
                      <strong>Rejection Rationale:</strong> {alt.rejection_reason}
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20 shrink-0">
                    Infeasible / Non-Optimal
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stakeholder Impact Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Multi-Stakeholder Impact Assessment
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" /> Faculty Impact
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {explanation.stakeholder_impact.faculty}
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4" /> Student Cohort Impact
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {explanation.stakeholder_impact.students}
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                  <DoorOpen className="w-4 h-4" /> Institutional Governance
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {explanation.stakeholder_impact.administration}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
