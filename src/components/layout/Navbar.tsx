import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldCheck, LogIn, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/dashboard/admin';
    switch (user.role) {
      case 'admin': return '/dashboard/admin';
      case 'hod': return '/dashboard/hod';
      case 'faculty': return '/dashboard/faculty';
      case 'student': return '/dashboard/student';
      case 'exam_cell': return '/dashboard/exam_cell';
      default: return '/dashboard/admin';
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform border border-sky-400/30">
              <img src="/assets/logo.jpg" alt="AAIP Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-tight">
                AAIP
              </span>
              <span className="text-xs text-slate-500 font-medium">Autonomous Academic Intelligence</span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#overview" className="hover:text-sky-600 transition-colors">Home</a>
            <a href="#features" className="hover:text-sky-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-sky-600 transition-colors">How It Works</a>
            <a href="#roles" className="hover:text-sky-600 transition-colors">User Roles</a>
            <a href="#benefits" className="hover:text-sky-600 transition-colors">Benefits</a>
            <a href="#contact" className="hover:text-sky-600 transition-colors">Contact</a>
          </div>

          {/* Right Action CTA */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(getDashboardPath())}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/25 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold text-sm transition-all"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/25 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};
