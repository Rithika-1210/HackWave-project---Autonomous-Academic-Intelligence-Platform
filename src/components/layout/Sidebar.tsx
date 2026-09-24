import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Building2, Users, GraduationCap,
  BookOpen, DoorOpen, CalendarDays, FileCheck2,
  Bell, LogOut, ChevronLeft, ChevronRight, UserCog,
  Sparkles, ShieldAlert, Wrench, RefreshCw, Scale, Bot,
  AlertTriangle, ShieldCheck, TrendingUp, Cpu, GitCompare,
  BarChart3, HelpCircle, History
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const role = user?.role || 'admin';

    switch (role) {
      case 'admin':
        return [
          { name: 'Overview Dashboard', path: '/dashboard/admin', icon: LayoutDashboard },
          { name: 'Departments', path: '/departments', icon: Building2 },
          { name: 'Faculty Members', path: '/faculty', icon: Users },
          { name: 'Student Directory', path: '/students', icon: GraduationCap },
          { name: 'Courses & Subjects', path: '/courses', icon: BookOpen },
          { name: 'Classrooms & Labs', path: '/resources', icon: DoorOpen },
          { name: 'Academic Timetable', path: '/timetables', icon: CalendarDays },
          { name: 'Examinations', path: '/examinations', icon: FileCheck2 },
          { name: 'User Management', path: '/users', icon: UserCog },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'hod':
        return [
          { name: 'Department Dashboard', path: '/dashboard/hod', icon: LayoutDashboard },
          { name: 'Department Faculty', path: '/faculty', icon: Users },
          { name: 'Department Timetable', path: '/timetables', icon: CalendarDays },
          { name: 'Subjects & Syllabus', path: '/courses', icon: BookOpen },
          { name: 'Students', path: '/students', icon: GraduationCap },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'faculty':
        return [
          { name: 'Faculty Dashboard', path: '/dashboard/faculty', icon: LayoutDashboard },
          { name: 'Weekly Timetable', path: '/timetables', icon: CalendarDays },
          { name: 'Assigned Subjects', path: '/courses', icon: BookOpen },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'student':
        return [
          { name: 'Student Dashboard', path: '/dashboard/student', icon: LayoutDashboard },
          { name: 'Class Timetable', path: '/timetables', icon: CalendarDays },
          { name: 'Enrolled Subjects', path: '/courses', icon: BookOpen },
          { name: 'Exam Schedule', path: '/examinations', icon: FileCheck2 },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'exam_cell':
        return [
          { name: 'Exam Operations', path: '/dashboard/exam_cell', icon: LayoutDashboard },
          { name: 'Examination Schedules', path: '/examinations', icon: FileCheck2 },
          { name: 'Examination Halls', path: '/resources', icon: DoorOpen },
          { name: 'Academic Timetables', path: '/timetables', icon: CalendarDays },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      default:
        return [];
    }
  };

  const getAiNavItems = () => {
    const role = user?.role || 'admin';

    if (role === 'admin' || role === 'hod') {
      return [
        { name: 'AI Timetable Generator', path: '/ai/timetable-generator', icon: Sparkles },
        { name: 'Optimization Results', path: '/ai/optimization-results', icon: TrendingUp },
        { name: 'Digital Twin Sim.', path: '/ai/digital-twin', icon: Cpu },
        { name: 'Scenario Comparison', path: '/ai/scenario-comparison', icon: GitCompare },
        { name: 'Advanced Analytics', path: '/ai/analytics', icon: BarChart3 },
        { name: 'Predictive Risks', path: '/ai/predictive-risks', icon: AlertTriangle },
        { name: 'Conflict Prediction', path: '/ai/conflicts', icon: ShieldAlert },
        { name: 'Conflict Resolution', path: '/ai/conflict-resolution', icon: Wrench },
        { name: 'Dynamic Rescheduling', path: '/ai/rescheduling', icon: RefreshCw },
        { name: 'Faculty Workload', path: '/ai/workload', icon: Scale },
        { name: 'Room & Lab Opt.', path: '/ai/resources-optimization', icon: DoorOpen },
        { name: 'AI Recommendations', path: '/ai/recommendations', icon: Sparkles },
        { name: 'AI Explanation (XAI)', path: '/ai/xai', icon: HelpCircle },
        { name: 'Exam Optimizer', path: '/ai/exam-optimizer', icon: FileCheck2 },
        { name: 'Academic Copilot', path: '/ai/copilot', icon: Bot },
        { name: 'Approval Center', path: '/ai/approvals', icon: ShieldCheck },
        { name: 'Change & Rollback', path: '/ai/change-history', icon: History },
      ];
    } else if (role === 'faculty') {
      return [
        { name: 'Digital Twin Sim.', path: '/ai/digital-twin', icon: Cpu },
        { name: 'Scenario Comparison', path: '/ai/scenario-comparison', icon: GitCompare },
        { name: 'Academic Copilot', path: '/ai/copilot', icon: Bot },
        { name: 'Dynamic Rescheduling', path: '/ai/rescheduling', icon: RefreshCw },
        { name: 'Faculty Workload', path: '/ai/workload', icon: Scale },
      ];
    } else if (role === 'exam_cell') {
      return [
        { name: 'Exam Optimizer', path: '/ai/exam-optimizer', icon: FileCheck2 },
        { name: 'Conflict Prediction', path: '/ai/conflicts', icon: ShieldAlert },
        { name: 'Academic Copilot', path: '/ai/copilot', icon: Bot },
        { name: 'Approval Center', path: '/ai/approvals', icon: ShieldCheck },
      ];
    } else {
      return [
        { name: 'Academic Copilot', path: '/ai/copilot', icon: Bot },
      ];
    }
  };

  const navItems = getNavItems();
  const aiNavItems = getAiNavItems();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin': return { label: 'Admin (L5)', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'hod': return { label: 'HOD (L4)', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'faculty': return { label: 'Faculty (L3)', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' };
      case 'student': return { label: 'Student (L1)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'exam_cell': return { label: 'Exam Cell (L4)', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      default: return { label: 'User', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    }
  };

  const badge = getRoleBadge(user?.role);

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-sky-500/30 shadow-sm shadow-sky-500/20">
              <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-white text-base leading-tight tracking-tight">AAIP PLATFORM</span>
                <span className="text-[10px] text-sky-400 font-mono tracking-wider">ACADEMIC OPS</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {!collapsed && (
            <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Academic Operations
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs md:text-sm transition-all group ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? item.name : undefined}
              >
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}

          {/* Stage 2 AI Suite */}
          {aiNavItems.length > 0 && (
            <div className="pt-3 mt-2 border-t border-slate-800/80">
              {!collapsed && (
                <div className="px-3 py-1 text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  AI & Optimization Suite
                </div>
              )}
              <div className="space-y-1 mt-1">
                {aiNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs md:text-sm transition-all group ${
                          isActive
                            ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/30 font-semibold'
                            : 'text-slate-400 hover:text-sky-300 hover:bg-slate-800/80'
                        } ${collapsed ? 'justify-center' : ''}`
                      }
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 text-sky-400" />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        {!collapsed ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 font-bold text-xs shrink-0">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-slate-200 truncate">{user?.full_name}</span>
                <span className="text-[10px] text-slate-500 font-mono truncate">{user?.email}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border font-semibold ${badge.color}`}>
                {badge.label}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded-md transition-colors font-medium"
                title="Sign out of current session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 font-bold text-xs">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
