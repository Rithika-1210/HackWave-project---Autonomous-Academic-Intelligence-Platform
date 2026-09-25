import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { authApi } from '@/services/api';
import {
  Lock, Mail, Eye, EyeOff, ArrowRight,
  AlertCircle, CheckCircle2, User as UserIcon, Building2, Shield, UserPlus, LogIn
} from 'lucide-react';

interface DeptOption {
  id: number;
  name: string;
  code: string;
}

const DEFAULT_DEPARTMENTS: DeptOption[] = [
  { id: 1, name: 'Computer Science & Engineering', code: 'CSE' },
  { id: 2, name: 'Electronics & Communication Engineering', code: 'ECE' },
  { id: 3, name: 'Mechanical Engineering', code: 'MECH' },
  { id: 4, name: 'Data Science & Artificial Intelligence', code: 'DSAI' },
];

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'hod', label: 'Head of Department' },
  { value: 'faculty', label: 'Faculty Member' },
  { value: 'student', label: 'Student' },
  { value: 'exam_cell', label: 'Examination Cell' },
];

export const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Sign In State
  const [email, setEmail] = useState<string>('admin@aaip.edu');
  const [password, setPassword] = useState<string>('Admin@2026!');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Sign Up State
  const [signUpFullName, setSignUpFullName] = useState<string>('');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [signUpRole, setSignUpRole] = useState<UserRole>('faculty');
  const [signUpDeptId, setSignUpDeptId] = useState<number>(1);
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState<string>('');
  const [showSignUpPassword, setShowSignUpPassword] = useState<boolean>(false);

  // General State
  const [departments, setDepartments] = useState<DeptOption[]>(DEFAULT_DEPARTMENTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [forgotModal, setForgotModal] = useState<boolean>(false);
  const [forgotSent, setForgotSent] = useState<boolean>(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch departments for registration dropdown
    const fetchDepts = async () => {
      try {
        const data = await authApi.getPublicDepartments();
        if (data && data.length > 0) {
          setDepartments(data);
          setSignUpDeptId(data[0].id);
        }
      } catch (err) {
        // Fallback to default departments
        setDepartments(DEFAULT_DEPARTMENTS);
      }
    };
    fetchDepts();
  }, []);

  const routeByRole = (role: string) => {
    switch (role) {
      case 'admin': navigate('/dashboard/admin'); break;
      case 'hod': navigate('/dashboard/hod'); break;
      case 'faculty': navigate('/dashboard/faculty'); break;
      case 'student': navigate('/dashboard/student'); break;
      case 'exam_cell': navigate('/dashboard/exam_cell'); break;
      default: navigate('/dashboard/admin'); break;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Please provide your institutional email and access password.');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      routeByRole(user.role);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Authentication failed. Please verify your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!signUpFullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!signUpEmail.trim()) {
      setError('Please enter an institutional email address.');
      return;
    }
    if (signUpPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    try {
      setLoading(true);
      const user = await register({
        full_name: signUpFullName.trim(),
        email: signUpEmail.trim(),
        role: signUpRole,
        department_id: signUpDeptId,
        password: signUpPassword,
      });

      setSuccessMsg('Account registered successfully! Launching your portal...');
      setTimeout(() => {
        routeByRole(user.role);
      }, 700);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. The email may already be registered.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-sky-400/40 shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform bg-slate-900 flex items-center justify-center">
            <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="text-left">
            <div className="text-xl font-extrabold text-white tracking-tight leading-tight">AAIP PLATFORM</div>
            <div className="text-xs text-sky-400 font-mono">Autonomous Academic Intelligence</div>
          </div>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {mode === 'signin' ? 'Institutional Sign In' : 'Register New Member'}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          {mode === 'signin'
            ? 'Access your institutional dashboard with authorized credentials.'
            : 'Add a new member and assign their institutional operational role.'}
        </p>
      </div>

      {/* Central Auth Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl shadow-black/60 space-y-6">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); setSuccessMsg(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'signin'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all font-mono"
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
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all font-mono"
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
                    className="w-4 h-4 rounded-sm border-slate-800 bg-slate-950 text-sky-600 focus:ring-sky-500"
                  />
                  <span>Keep session active</span>
                </label>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  RBAC Active
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-sky-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
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

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="text-xs text-slate-400 hover:text-sky-300 transition-colors"
                >
                  Need to add a new member? <span className="text-sky-400 font-semibold underline underline-offset-2">Sign up here</span>
                </button>
              </div>

            </form>
          )}

          {/* SIGN UP FORM (REGISTER NEW MEMBER WITH ROLE) */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={signUpFullName}
                    onChange={(e) => setSignUpFullName(e.target.value)}
                    placeholder="e.g. Dr. Alan Turing / Sarah Connor"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="member@aaip.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Institutional Role Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Institutional Role</span>
                  <span className="text-[10px] text-sky-400 font-mono">RBAC Governed</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Shield className="w-4 h-4" />
                  </div>
                  <select
                    value={signUpRole}
                    onChange={(e) => setSignUpRole(e.target.value as UserRole)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all cursor-pointer"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value} className="bg-slate-900 text-white">
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Department Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Assigned Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <select
                    value={signUpDeptId}
                    onChange={(e) => setSignUpDeptId(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm focus:outline-hidden focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password Fields in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Min. 6 chars"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-sky-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {loading ? (
                  <span>Registering Member...</span>
                ) : (
                  <>
                    <span>Register Member & Launch Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className="text-xs text-slate-400 hover:text-sky-300 transition-colors"
                >
                  Already have an account? <span className="text-sky-400 font-semibold underline underline-offset-2">Sign in to portal</span>
                </button>
              </div>

            </form>
          )}

          {/* Return to Public Landing Page */}
          <div className="pt-3 border-t border-slate-800/80 text-center text-xs text-slate-400">
            <Link to="/" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
              &larr; Return to Public Landing Page
            </Link>
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
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
              {!forgotSent && (
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 transition-colors cursor-pointer"
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
