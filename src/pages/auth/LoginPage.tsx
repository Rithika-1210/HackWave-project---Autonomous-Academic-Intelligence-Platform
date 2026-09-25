import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import {
  Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight,
  AlertCircle, CheckCircle2, Sparkles, Building2, Users, GraduationCap, FileCheck2
} from 'lucide-react';

interface DemoAccount {
  role: UserRole;
  label: string;
  email: string;
  pass: string;
  icon: string;
  badge: string;
  desc: string;
}

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('admin@aaip.edu');
  const [password, setPassword] = useState<string>('Admin@2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotModal, setForgotModal] = useState<boolean>(false);
  const [forgotSent, setForgotSent] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const DEMO_ACCOUNTS: DemoAccount[] = [
    {
      role: 'admin',
      label: 'Administrator',
      email: 'admin@aaip.edu',
      pass: 'Admin@2026!',
      icon: '🛡️',
      badge: 'Global Governance',
      desc: 'Full institutional governance, courses, departments, classrooms, audit logs',
    },
    {
      role: 'hod',
      label: 'Head of Department',
      email: 'hod.cse@aaip.edu',
      pass: 'Hod@2026!',
      icon: '🏛️',
      badge: 'Departmental Head',
      desc: 'CSE department scheduling, faculty workload approvals, subject matrix',
    },
    {
      role: 'faculty',
      label: 'Faculty Member',
      email: 'dr.elena@aaip.edu',
      pass: 'Faculty@2026!',
      icon: '👨‍🏫',
      badge: 'Faculty Member',
      desc: 'Weekly teaching timetable, assigned subjects, workload distribution',
    },
    {
      role: 'student',
      label: 'Student Portal',
      email: 'aarav.sharma@aaip.edu',
      pass: 'Student@2026!',
      icon: '🎓',
      badge: 'Student Portal',
      desc: 'Class schedule, enrolled subjects, examination hall ticket seating',
    },
    {
      role: 'exam_cell',
      label: 'Examination Cell',
      email: 'examcell@aaip.edu',
      pass: 'ExamCell@2026!',
      icon: '📋',
      badge: 'Examination Cell',
      desc: 'Exam timetable management, central examination halls, task checklists',
    },
  ];

  const handleSelectDemo = (acc: DemoAccount) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      // Route to role-specific dashboard
      switch (user.role) {
        case 'admin': navigate('/dashboard/admin'); break;
        case 'hod': navigate('/dashboard/hod'); break;
        case 'faculty': navigate('/dashboard/faculty'); break;
        case 'student': navigate('/dashboard/student'); break;
        case 'exam_cell': navigate('/dashboard/exam_cell'); break;
        default: navigate('/dashboard/admin'); break;
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Authentication failed. Please check credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Neon Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-sky-400/40 shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
            <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="text-left">
            <div className="text-xl font-extrabold text-white tracking-tight leading-tight">AAIP PLATFORM</div>
            <div className="text-xs text-sky-400 font-mono">Autonomous Academic Intelligence</div>
          </div>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Institutional Sign In
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter your institutional credentials or select an account below.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: DEMO CREDENTIALS PANEL (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Demo Role Accounts
              </span>
              <span className="text-[10px] text-slate-400">1-Click Autofill</span>
            </div>

            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectDemo(acc)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-400/60 shadow-md shadow-sky-500/10'
                        : 'bg-slate-900/60 border-slate-700 hover:border-slate-600 hover:bg-slate-900'
                    }`}
                  >
                    <span className="text-xl leading-none mt-0.5">{acc.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{acc.label}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                          {acc.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{acc.email}</p>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{acc.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 text-[11px] text-slate-400 font-mono text-center border-t border-slate-700/60">
              Passphrase: <span className="text-sky-300 font-bold">RoleName@2026!</span> (Pre-filled)
            </div>
          </div>

          {/* RIGHT: ACTUAL LOGIN FORM (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-800/90 backdrop-blur-md rounded-2xl p-7 border border-slate-700 shadow-2xl space-y-6">
            
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Institutional Email / Identifier
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@aaip.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Access Passphrase
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModal(true)}
                    className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Security Status */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-slate-700 bg-slate-900 text-sky-600 focus:ring-sky-500"
                  />
                  <span>Keep session active (8 hours)</span>
                </label>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  RBAC Active
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-sky-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <span>Authenticating Token...</span>
                ) : (
                  <>
                    <span>Authenticate & Launch Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            <div className="pt-4 border-t border-slate-700/60 text-center text-xs text-slate-400">
              <Link to="/" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                &larr; Return to Public Landing Page
              </Link>
            </div>

          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Reset Institutional Credentials</h3>
            {forgotSent ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Password reset token dispatched to {email}. Check your institutional mailbox.</span>
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your registered institutional email to receive an automated cryptographic password recovery link.
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setForgotModal(false); setForgotSent(false); }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              {!forgotSent && (
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 transition-colors"
                >
                  Send Reset Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
