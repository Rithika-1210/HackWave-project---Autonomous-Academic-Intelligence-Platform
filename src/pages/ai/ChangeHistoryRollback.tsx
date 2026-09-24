import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History, RotateCcw, ShieldCheck, CheckCircle2, AlertTriangle,
  Clock, User, RefreshCw, FileText, ArrowRight, XCircle, Search
} from 'lucide-react';
import { aiApi } from '@/services/api';
import { ChangeHistoryOut } from '@/types';

export const ChangeHistoryRollback: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ChangeHistoryOut[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedChange, setSelectedChange] = useState<ChangeHistoryOut | null>(null);

  // Rollback Modal State
  const [showRollbackModal, setShowRollbackModal] = useState<boolean>(false);
  const [rollbackTarget, setRollbackTarget] = useState<ChangeHistoryOut | null>(null);
  const [rollbackReason, setRollbackReason] = useState<string>('Operational schedule reversion requested by administrator.');
  const [rollingBack, setRollingBack] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await aiApi.getChangeHistory();
      setHistory(data);
      if (data.length > 0 && !selectedChange) {
        setSelectedChange(data[0]);
      }
    } catch (err) {
      console.error('Failed to load change history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    if (!rollbackTarget) return;
    setRollingBack(true);
    try {
      const res = await aiApi.rollbackChange(rollbackTarget.change_id, rollbackReason);
      setFeedback({
        type: 'success',
        message: res.message || `Change ${rollbackTarget.change_id} successfully rolled back.`
      });
      setShowRollbackModal(false);
      loadHistory();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to rollback change.'
      });
    } finally {
      setRollingBack(false);
    }
  };

  const filteredHistory = history.filter(item =>
    item.change_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.change_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.reason || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Stage 3 Governance & Rollback
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Academic Change History & 1-Click Rollback
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Immutable audit record of all committed timetable modifications with before-and-after state snapshots and safe 1-Click Rollback.
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs md:text-sm font-semibold border border-slate-700 transition-all"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh Audit Trail
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-sm flex items-center justify-between border shadow-xl ${
          feedback.type === 'success'
            ? 'bg-slate-900 border-2 border-emerald-500/50 text-white shadow-emerald-950/30'
            : 'bg-slate-900 border-2 border-rose-500/50 text-white shadow-rose-950/30'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="font-medium text-slate-100">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors">Dismiss</button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter change history by Change ID, type, or reason..."
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-3" />
          Loading audit change history records...
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
          No committed academic changes found. When Digital Twin simulations are committed, their snapshots appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <div
              key={item.change_id}
              className={`p-6 rounded-2xl border transition-all space-y-4 ${
                item.is_rolled_back
                  ? 'bg-slate-900 border-2 border-rose-500/50 shadow-xl shadow-rose-950/30'
                  : 'bg-slate-900 border-2 border-emerald-500/40 shadow-xl shadow-emerald-950/20'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
                    {item.change_id}
                  </span>
                  <h3 className="font-bold text-base text-white">{item.change_type}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 shadow-xs ${
                    item.is_rolled_back
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {item.is_rolled_back ? <RotateCcw className="w-3.5 h-3.5 text-rose-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {item.is_rolled_back ? 'Rolled Back' : 'Active Live Timetable'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!item.is_rolled_back ? (
                    <button
                      onClick={() => {
                        setRollbackTarget(item);
                        setShowRollbackModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      1-Click Rollback
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">
                      Reverted on {new Date(item.rolled_back_at || '').toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Reason & Details */}
              <p className="text-xs md:text-sm text-slate-300">
                <strong>Authorization Reason:</strong> {item.reason || 'Committed via Digital Twin engine.'}
              </p>

              {/* Metadata Badges */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-400">
                <div>
                  <span className="text-slate-500 block mb-0.5">Authorized By:</span>
                  <strong className="text-slate-200">{item.authorized_by_email || 'admin@aaip.edu'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Committed At:</span>
                  <strong className="text-slate-200">{new Date(item.created_at).toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Target Scope:</span>
                  <strong className="text-slate-200">{item.target_entity_type} (Dept ID: {item.target_entity_id || 'All'})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Snapshot Footprint:</span>
                  <strong className="text-cyan-400">{item.before_state?.count || 0} Slots Backed Up</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ROLLBACK CONFIRMATION MODAL */}
      {showRollbackModal && rollbackTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-400" />
                Confirm 1-Click Schedule Rollback
              </h3>
              <button onClick={() => setShowRollbackModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 leading-relaxed">
              <strong>Emergency Reversion Protocol:</strong><br />
              Rolling back change <strong>{rollbackTarget.change_id}</strong> will restore all {rollbackTarget.before_state?.count || 'affected'} slots in the production database back to their exact historical state prior to this simulation commit.
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Rollback Reason / Incident Log</label>
              <textarea
                rows={3}
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                placeholder="Enter justification for rolling back this change..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRollbackModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRollback}
                disabled={rollingBack}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {rollingBack ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                Confirm Rollback to Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
