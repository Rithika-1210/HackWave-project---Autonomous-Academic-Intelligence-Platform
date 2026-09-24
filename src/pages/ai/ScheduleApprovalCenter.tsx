import React, { useState, useEffect } from 'react';
import { aiApi } from '@/services/api';
import { ApprovalRequestItem } from '@/types';
import {
  FileCheck2, CheckCircle2, XCircle, Clock, ShieldCheck,
  RefreshCw, Filter, MessageSquare, ArrowRight
} from 'lucide-react';

export const ScheduleApprovalCenter: React.FC = () => {
  const [approvals, setApprovals] = useState<ApprovalRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<{ [key: string]: string }>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadApprovals();
  }, [filterStatus]);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const statusParam = filterStatus === 'all' ? undefined : filterStatus;
      const data = await aiApi.listApprovals(statusParam);
      setApprovals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reqId: string, action: 'Approve' | 'Reject') => {
    setActionLoading(reqId);
    try {
      const notes = reviewNotes[reqId] || undefined;
      const res = await aiApi.takeApprovalAction(reqId, action, notes);
      setFeedback(res.message);
      loadApprovals();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to process approval.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Governance & Authorization Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Schedule Approval Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Institutional authorization workflow for AI timetables, dynamic reschedulings, workload transfers, and examination schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-slate-900 border-2 border-emerald-500/50 text-white text-sm flex items-center justify-between shadow-xl shadow-emerald-950/30">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-medium text-slate-100">{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs text-emerald-400 font-bold hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-20 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-400 mr-2" />
          Loading authorization backlog...
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map(req => (
            <div
              key={req.request_id}
              className={`p-6 rounded-2xl border transition-all ${
                req.status === 'Approved'
                  ? 'bg-slate-900 border-2 border-emerald-500/50 shadow-xl shadow-emerald-950/30'
                  : req.status === 'Rejected'
                  ? 'bg-slate-900 border-2 border-rose-500/50 shadow-xl shadow-rose-950/30'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-xl'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {req.request_type}
                  </span>
                  <h3 className="font-bold text-base text-white">{req.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500">{req.request_id}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 shadow-xs ${
                    req.status === 'Approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : req.status === 'Rejected'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    {req.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {req.status === 'Rejected' && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    {req.status === 'Pending' && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                    {req.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-4">
                <span>Requester: <strong className="text-slate-200">{req.requester_email || 'Institutional System'}</strong></span>
                {req.reviewer_email && <span>Reviewer: <strong className="text-slate-200">{req.reviewer_email}</strong></span>}
                <span>Submitted: <strong className="text-slate-200">{new Date(req.created_at).toLocaleDateString()}</strong></span>
              </div>

              {req.review_notes && (
                <div className={`p-3 rounded-xl border text-xs text-slate-300 mb-4 flex items-center gap-2 ${
                  req.status === 'Approved'
                    ? 'bg-slate-950 border-emerald-500/30'
                    : req.status === 'Rejected'
                    ? 'bg-slate-950 border-rose-500/30'
                    : 'bg-slate-950 border-slate-800/80'
                }`}>
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>Review Notes: {req.review_notes}</span>
                </div>
              )}

              {req.status === 'Pending' ? (
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="Optional review notes or remarks..."
                    value={reviewNotes[req.request_id] || ''}
                    onChange={(e) => setReviewNotes({ ...reviewNotes, [req.request_id]: e.target.value })}
                    className="w-full md:w-96 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAction(req.request_id, 'Reject')}
                      disabled={actionLoading === req.request_id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 text-xs font-semibold transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(req.request_id, 'Approve')}
                      disabled={actionLoading === req.request_id}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Authorize & Apply
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <span className={`inline-flex items-center gap-1.5 font-medium ${
                    req.status === 'Approved' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {req.status === 'Approved' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Approved & Committed to Live Academic Records
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        Request Rejected & Archived
                      </>
                    )}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Institutional Review Logged</span>
                </div>
              )}
            </div>
          ))}

          {approvals.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Pending Approvals</h3>
              <p className="text-sm mt-1">All academic schedule adjustments and requests are up to date.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
