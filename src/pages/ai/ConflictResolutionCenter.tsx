import React, { useState, useEffect } from 'react';
import { aiApi } from '@/services/api';
import { ConflictRecord } from '@/types';
import {
  CheckCircle2, AlertTriangle, ShieldCheck, Wrench, RefreshCw,
  ArrowRight, Search, FileText, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ConflictResolutionCenter: React.FC = () => {
  const [conflicts, setConflicts] = useState<ConflictRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadConflicts();
  }, []);

  const loadConflicts = async () => {
    setLoading(true);
    try {
      const summary = await aiApi.getConflicts();
      setConflicts(summary.recent_conflicts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (conflictId: string) => {
    setActionLoading(true);
    try {
      await aiApi.resolveConflict(conflictId, notes || 'Resolved via AI Conflict Resolution Center');
      setSuccessMsg(`Conflict ${conflictId} has been successfully resolved.`);
      setResolvingId(null);
      setNotes('');
      loadConflicts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to resolve conflict.');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = conflicts.filter(c =>
    c.description.toLowerCase().includes(search.toLowerCase()) ||
    c.conflict_type.toLowerCase().includes(search.toLowerCase()) ||
    c.conflict_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Remediation Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Conflict Resolution Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review root causes and execute recommended schedule adjustments to maintain institutional compliance.
          </p>
        </div>

        <Link
          to="/ai/rescheduling"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold shadow-lg shadow-sky-500/20 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Dynamic Rescheduling Engine
        </Link>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-slate-900 border-2 border-emerald-500/50 text-white text-sm flex items-center justify-between shadow-xl shadow-emerald-950/30">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-medium text-slate-100">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors">Dismiss</button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search by conflict ID, subject, room, or collision type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-sm text-slate-200 placeholder-slate-500 focus:outline-none w-full"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mr-2" />
          Loading resolution backlog...
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div
              key={c.conflict_id}
              className={`p-6 rounded-2xl border transition-all ${
                c.status === 'Resolved'
                  ? 'bg-slate-900 border-2 border-emerald-500/50 shadow-xl shadow-emerald-950/30'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-xl'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    c.severity === 'Critical'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {c.severity}
                  </span>
                  <h3 className="font-bold text-base text-white">{c.conflict_type}</h3>
                  <span className="text-xs font-mono text-slate-500">({c.conflict_id})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 shadow-xs ${
                    c.status === 'Resolved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}>
                    {c.status === 'Resolved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {c.status}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-300 mb-4">{c.description}</p>

              {/* Diagnosis Box */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl text-xs mb-4 ${
                c.status === 'Resolved'
                  ? 'bg-slate-950 border border-emerald-500/30'
                  : 'bg-slate-950 border border-slate-800/80'
              }`}>
                <div>
                  <div className="text-slate-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-sky-400" /> Root Cause Diagnosis
                  </div>
                  <p className="text-slate-300">{c.root_cause || 'Schedule collision during manual slot assignment.'}</p>
                </div>
                <div>
                  <div className="text-slate-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Suggested AI Resolution
                  </div>
                  <p className="text-emerald-300 font-medium">{c.suggested_resolution || 'Shift period into vacant afternoon slot.'}</p>
                </div>
              </div>

              {c.status === 'Resolved' ? (
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Conflict Resolved & Validated
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Zero Collision Verified</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-3 pt-2">
                  {resolvingId === c.conflict_id ? (
                    <div className="flex items-center gap-2 w-full max-w-md">
                      <input
                        type="text"
                        placeholder="Resolution notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none w-full"
                      />
                      <button
                        onClick={() => handleResolve(c.conflict_id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setResolvingId(null)}
                        className="px-2 py-1.5 text-slate-400 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setResolvingId(c.conflict_id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                    >
                      <Wrench className="w-3.5 h-3.5 text-amber-400" />
                      Mark As Resolved
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Unresolved Conflicts</h3>
              <p className="text-sm mt-1">All academic schedules satisfy institutional zero-collision constraints.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
