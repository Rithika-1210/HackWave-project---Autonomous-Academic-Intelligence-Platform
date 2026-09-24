import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsApi } from '@/services/api';
import { Bell, ShieldCheck, ChevronDown, CheckCircle2, User } from 'lucide-react';
import { UserRole } from '@/types';

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState<boolean>(false);
  const { user, quickSwitchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationsApi.getUnreadCount();
        setUnreadCount(res.unread_count);
      } catch (e) {
        // Ignore
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleSwitch = async (role: UserRole) => {
    setRoleSwitcherOpen(false);
    try {
      const switchedUser = await quickSwitchRole(role);
      switch (switchedUser.role) {
        case 'admin': navigate('/dashboard/admin'); break;
        case 'hod': navigate('/dashboard/hod'); break;
        case 'faculty': navigate('/dashboard/faculty'); break;
        case 'student': navigate('/dashboard/student'); break;
        case 'exam_cell': navigate('/dashboard/exam_cell'); break;
      }
    } catch (e) {
      console.error("Role switch failed", e);
    }
  };

  const rolesList: { role: UserRole; label: string; desc: string; icon: string }[] = [
    { role: 'admin', label: 'Administrator', desc: 'Full system oversight & governance', icon: '🛡️' },
    { role: 'hod', label: 'HOD (CSE)', desc: 'Department scheduling & workload', icon: '🏛️' },
    { role: 'faculty', label: 'Faculty Member', desc: 'Smart timetable & teaching load', icon: '👨‍🏫' },
    { role: 'student', label: 'Student', desc: 'Classes, halls & exam tickets', icon: '🎓' },
    { role: 'exam_cell', label: 'Examination Cell', desc: 'Exam schedules & seating twins', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Topbar Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between shadow-xs">
          
          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              AAIP STAGE 1
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-800 capitalize">
              {location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}
            </span>
          </div>

          {/* Right Toolbar */}
          <div className="flex items-center gap-4">
            
            {/* Quick Demo Role Switcher for SIH Hackathon Evaluation */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300/80 transition-all shadow-2xs"
                title="Quickly switch between pre-seeded demo accounts"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Switch Role: <strong className="capitalize text-sky-700 font-mono">{user?.role}</strong></span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    SIH Demo Role Switcher
                  </div>
                  <div className="space-y-1 mt-1">
                    {rolesList.map((r) => {
                      const isActive = user?.role === r.role;
                      return (
                        <button
                          key={r.role}
                          onClick={() => handleRoleSwitch(r.role)}
                          className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                            isActive
                              ? 'bg-sky-50 text-sky-900 font-bold border border-sky-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="text-base leading-none">{r.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span>{r.label}</span>
                              {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                            </div>
                            <p className="text-[10px] text-slate-400 font-normal">{r.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight">{user?.full_name}</span>
                <span className="text-[10px] text-slate-400 capitalize font-mono">{user?.role}</span>
              </div>
            </div>

          </div>

        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
