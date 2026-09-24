import React, { useState, useEffect } from 'react';
import { aiApi } from '@/services/api';
import { RecommendationItem } from '@/types';
import {
  Sparkles, CheckCircle2, XCircle, PlayCircle, Clock,
  ArrowRight, ShieldCheck, RefreshCw, AlertTriangle, Layers
} from 'lucide-react';

export const AiRecommendationCenter: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await aiApi.getRecommendations();
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (recId: string, action: 'approve' | 'reject' | 'simulate') => {
    setActionLoading(recId);
    try {
      const res = await aiApi.actOnRecommendation(recId, action);
      setFeedback(`Recommendation ${recId} marked as ${res.status}.`);
      loadRecommendations();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Explainable Operations Advisor
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            AI Academic Recommendation Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Actionable prescriptive recommendations synthesized from live timetable collisions, workload imbalances, and spatial bottlenecks.
          </p>
        </div>

        <button
          onClick={loadRecommendations}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-all"
        >
          <RefreshCw className="w-4 h-4 text-sky-400" />
          Refresh Advisory
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-slate-900 border-2 border-emerald-500/50 text-white text-sm flex items-center justify-between shadow-xl shadow-emerald-950/30">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-medium text-slate-100">{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs text-emerald-400 hover:text-white font-bold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-20 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mr-2" />
          Generating explainable recommendations...
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map(rec => (
            <div
              key={rec.recommendation_id}
              className={`p-6 rounded-2xl border transition-all ${
                rec.status === 'Approved'
                  ? 'bg-slate-900 border-2 border-emerald-500/50 shadow-xl shadow-emerald-950/30'
                  : rec.status === 'Rejected'
                  ? 'bg-slate-900 border-2 border-rose-500/50 shadow-xl shadow-rose-950/30'
                  : rec.status === 'Simulated'
                  ? 'bg-slate-900 border-2 border-purple-500/40 shadow-xl shadow-purple-950/30'
                  : 'bg-slate-900 border-slate-800 shadow-xl hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {rec.category}
                  </span>
                  <h3 className="font-bold text-lg text-white">{rec.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500">{rec.recommendation_id}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 shadow-xs ${
                    rec.status === 'Approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : rec.status === 'Simulated'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : rec.status === 'Rejected'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {rec.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {rec.status === 'Rejected' && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    {rec.status === 'Simulated' && <PlayCircle className="w-3.5 h-3.5 text-purple-400" />}
                    {rec.status === 'Active' && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                    {rec.status}
                  </span>
                </div>
              </div>

              {/* Problem vs Recommendation Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className={`p-4 rounded-xl border ${
                  rec.status === 'Rejected'
                    ? 'bg-slate-950 border-rose-500/30'
                    : 'bg-slate-950 border-slate-800/80'
                }`}>
                  <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Problem Identified
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{rec.problem_identified}</p>
                </div>

                <div className={`p-4 rounded-xl border ${
                  rec.status === 'Approved'
                    ? 'bg-slate-950 border-emerald-500/30'
                    : 'bg-slate-950 border-slate-800/80'
                }`}>
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Prescribed Action
                  </div>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed">{rec.recommended_action}</p>
                </div>
              </div>

              {/* Natural Language Explanation Box */}
              <div className="bg-gradient-to-r from-sky-950/30 to-indigo-950/20 p-4 rounded-xl border border-sky-800/30 text-xs text-slate-300 mb-4 leading-relaxed">
                <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Explainable Justification
                </div>
                <p>{rec.explanation}</p>
              </div>

              {/* Trade-offs & Affected Stakeholders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400 mb-5">
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                  <div className="text-slate-500 font-semibold mb-0.5">Affected Resources</div>
                  <div className="text-white truncate">{rec.affected_users_resources || 'Institutional'}</div>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                  <div className="text-slate-500 font-semibold mb-0.5">Expected Operational Gain</div>
                  <div className="text-emerald-400 truncate">{rec.expected_benefits || 'Zero conflict compliance'}</div>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                  <div className="text-slate-500 font-semibold mb-0.5">Potential Trade-offs</div>
                  <div className="text-amber-400 truncate">{rec.potential_tradeoffs || 'Minimal coordination required'}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleAction(rec.recommendation_id, 'simulate')}
                  disabled={actionLoading === rec.recommendation_id}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Simulate
                </button>
                <button
                  onClick={() => handleAction(rec.recommendation_id, 'reject')}
                  disabled={actionLoading === rec.recommendation_id}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-semibold transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
                <button
                  onClick={() => handleAction(rec.recommendation_id, 'approve')}
                  disabled={actionLoading === rec.recommendation_id}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve Recommendation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
