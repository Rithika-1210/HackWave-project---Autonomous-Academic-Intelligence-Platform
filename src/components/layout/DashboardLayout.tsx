import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsApi } from '@/services/api';
import { Bell, LogOut, User } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { user, logout } = useAuth();
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

  useEffect(() => {
    if (user?.id) {
      const storedAvatar = localStorage.getItem(`aaip_avatar_${user.id}`);
      setAvatarUrl(storedAvatar || user.avatar_url || null);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getCleanRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'hod': return 'Head of Department';
      case 'faculty': return 'Faculty Member';
      case 'student': return 'Student';
      case 'exam_cell': return 'Examination Cell';
      default: return role || 'User';
    }
  };

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
              AAIP
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-800 capitalize">
              {location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}
            </span>
          </div>

          {/* Right Toolbar */}
          <div className="flex items-center gap-3.5">
            
            {/* Notification Bell */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Pill - Clicking opens Profile Page */}
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 pl-3 pr-2 py-1 rounded-xl hover:bg-slate-100/80 border-l border-slate-200 transition-all cursor-pointer group text-left"
              title="View & Edit Profile"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs group-hover:ring-2 group-hover:ring-sky-500 transition-all overflow-hidden shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.full_name?.charAt(0) || 'U'
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight group-hover:text-sky-600 transition-colors truncate max-w-[150px]">
                  {user?.full_name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {getCleanRoleLabel(user?.role)}
                </span>
              </div>
            </button>

            {/* Logout Button in Top Navbar */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200/80 transition-all cursor-pointer shadow-2xs group"
              title="Sign out of institutional portal"
            >
              <LogOut className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline font-semibold">Logout</span>
            </button>

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
