import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { authApi } from '@/services/api';
import {
  Lock, Mail, Eye, EyeOff, ArrowRight,
  AlertCircle, CheckCircle2, User as UserIcon, Building2, Shield, UserPlus, LogIn,
  GraduationCap
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
  const [academicTrack, setAcademicTrack] = useState<'engineering' | 'bsc_ct' | 'msc_ct'>('engineering');
  const [signUpSemester, setSignUpSemester] = useState<number>(1);
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

      let effectiveDeptId: number | null = signUpDeptId;
      let courseCode: string | undefined = undefined;
      const ctDept = departments.find(d => d.code === 'CT');

      if (signUpRole !== 'admin') {
        if (academicTrack === 'bsc_ct') {
          effectiveDeptId = ctDept ? ctDept.id : signUpDeptId;
          courseCode = 'CT_UG';
        } else if (academicTrack === 'msc_ct') {
          effectiveDeptId = ctDept ? ctDept.id : signUpDeptId;
          courseCode = 'CT_PG';
        } else {
          // Engineering
          const engDept = departments.find(d => d.id === signUpDeptId);
          courseCode = engDept ? `BTECH-${engDept.code}` : undefined;
        }
      } else {
        effectiveDeptId = null;
      }

      const user = await register({
        full_name: signUpFullName.trim(),
        email: signUpEmail.trim(),
        role: signUpRole,
        department_id: effectiveDeptId,
        password: signUpPassword,
        semester: signUpSemester,
        course_code: courseCode,
      });

      if (signUpRole === 'faculty') {
        setSuccessMsg('Access Request Submitted! Your Department HOD will review and approve your credentials before login is enabled.');
        setMode('signin');
      } else if (signUpRole === 'hod') {
        setSuccessMsg('Access Request Submitted! Institutional Administrator (Ram) will review and approve your HOD credentials before login is enabled.');
        setMode('signin');
      } else {
        setSuccessMsg('Account registered successfully! Launching your portal...');
        setTimeout(() => {
          routeByRole(user.role);
        }, 700);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. The email may already be registered.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50/40 to-slate-50 text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-400/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8 relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-sky-200 shadow-md shadow-sky-500/15 group-hover:scale-105 transition-transform bg-white flex items-center justify-center">
            <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="text-left">
            <div className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">AAIP PLATFORM</div>
            <div className="text-xs text-sky-600 font-mono font-semibold">Autonomous Academic Intelligence</div>
          </div>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {mode === 'signin' ? 'Institutional Sign In' : 'Register New Member'}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          {mode === 'signin'
            ? 'Access your institutional dashboard with authorized credentials.'
            : 'Add a new member and assign their institutional operational role.'}
        </p>
      </div>

      {/* Central Auth Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/60 space-y-6">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); setSuccessMsg(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Institutional Email / Identifier
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@aaip.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Access Passphrase
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModal(true)}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Security Status */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span>Keep session active</span>
                </label>
                <span className="text-[11px] text-emerald-600 font-semibold font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  RBAC Active
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-sky-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
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
                  className="text-xs text-slate-500 hover:text-sky-700 transition-colors cursor-pointer"
                >
                  Need to add a new member? <span className="text-sky-600 font-semibold underline underline-offset-2">Sign up here</span>
                </button>
              </div>

            </form>
          )}

          {/* SIGN UP FORM (REGISTER NEW MEMBER WITH ROLE) */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={signUpFullName}
                    onChange={(e) => setSignUpFullName(e.target.value)}
                    placeholder="e.g. Ram / Rithika / Sham"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="member@aaip.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Institutional Role Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Institutional Role</span>
                  <span className="text-[10px] text-sky-600 font-mono font-semibold">RBAC Governed</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <select
                    value={signUpRole}
                    onChange={(e) => setSignUpRole(e.target.value as UserRole)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value} className="bg-white text-slate-900">
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Approval Notice for Faculty & HOD */}
              {signUpRole === 'faculty' && (
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>HOD Authorization Required:</strong> Faculty account registrations require review & approval from your Department Head of Department (HOD) before portal login is enabled.
                  </div>
                </div>
              )}

              {signUpRole === 'hod' && (
                <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-200 text-xs text-sky-900 flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>Admin Authorization Required:</strong> Head of Department (HOD) account registrations require institutional clearance from System Administrator (Ram) before portal login is enabled.
                  </div>
                </div>
              )}

              {/* Department & Academic Program Selection (Excluded for Overall Administrator) */}
              {signUpRole !== 'admin' ? (
                <div className="space-y-3 pt-1">
                  
                  {/* Academic Division Tabs */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>Academic Degree & Program Track</span>
                      <span className="text-[10px] text-sky-600 font-mono font-semibold">Separate Duration & Sems</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => { setAcademicTrack('engineering'); setSignUpSemester(1); }}
                        className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                          academicTrack === 'engineering'
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold">Engineering</div>
                        <div className="text-[10px] opacity-80">4 Years • 8 Semesters</div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => { setAcademicTrack('bsc_ct'); setSignUpSemester(1); }}
                        className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                          academicTrack === 'bsc_ct'
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold">B.Sc (CT_UG)</div>
                        <div className="text-[10px] opacity-80">3 Years • 6 Semesters</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setAcademicTrack('msc_ct'); setSignUpSemester(1); }}
                        className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                          academicTrack === 'msc_ct'
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold">Integrated M.Sc (CT_PG)</div>
                        <div className="text-[10px] opacity-80">5 Years • 10 Semesters</div>
                      </button>
                    </div>
                  </div>

                  {/* Department Picker for Engineering, or Confirmation for CT */}
                  {academicTrack === 'engineering' ? (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Assigned Engineering Department
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <select
                          value={signUpDeptId}
                          onChange={(e) => setSignUpDeptId(Number(e.target.value))}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer"
                        >
                          {departments
                            .filter(d => d.code !== 'CT')
                            .map((d) => (
                              <option key={d.id} value={d.id} className="bg-white text-slate-900">
                                {d.name} ({d.code})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900 flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="leading-relaxed">
                        <strong>Department:</strong> Computing Technologies (CT) &bull;{' '}
                        {academicTrack === 'bsc_ct' ? 'B.Sc (CT_UG - 3 Years)' : 'Integrated M.Sc (CT_PG - 5 Years)'}
                      </span>
                    </div>
                  )}

                  {/* Academic Semester Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>Current Academic Semester</span>
                      <span className="text-[10px] text-sky-700 font-mono font-semibold">
                        {academicTrack === 'bsc_ct' ? 'Semesters 1 - 6' : academicTrack === 'msc_ct' ? 'Semesters 1 - 10' : 'Semesters 1 - 8'}
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <select
                        value={signUpSemester}
                        onChange={(e) => setSignUpSemester(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all cursor-pointer font-medium"
                      >
                        {(academicTrack === 'bsc_ct'
                          ? [1, 2, 3, 4, 5, 6]
                          : academicTrack === 'msc_ct'
                          ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                          : [1, 2, 3, 4, 5, 6, 7, 8]
                        ).map((s) => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200 text-xs text-sky-800 flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="leading-relaxed">
                    <strong>Overall Administrator:</strong> Governs all departments and institutional divisions.
                  </span>
                </div>
              )}

              {/* Password Fields in 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Min. 6 chars"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-sky-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
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
                  className="text-xs text-slate-500 hover:text-sky-700 transition-colors cursor-pointer"
                >
                  Already have an account? <span className="text-sky-600 font-semibold underline underline-offset-2">Sign in to portal</span>
                </button>
              </div>

            </form>
          )}

          {/* Return to Public Landing Page */}
          <div className="pt-3 border-t border-slate-200 text-center text-xs text-slate-500">
            <Link to="/" className="text-sky-600 hover:text-sky-700 font-semibold transition-colors">
              &larr; Return to Public Landing Page
            </Link>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Reset Institutional Credentials</h3>
            {forgotSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Password reset token dispatched to {email}. Check your institutional mailbox.</span>
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your registered institutional email to receive an automated cryptographic password recovery link.
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setForgotModal(false); setForgotSent(false); }}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
              {!forgotSent && (
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors cursor-pointer"
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
