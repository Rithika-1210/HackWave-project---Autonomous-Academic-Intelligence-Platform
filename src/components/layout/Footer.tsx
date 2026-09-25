import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-1 md:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-sky-400/30">
              <img src="/assets/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">AAIP PLATFORM</span>
          </div>
          <p className="text-sm text-slate-400 max-w-md leading-relaxed">
            Autonomous Academic Intelligence Platform — Virtual Academic Operations Manager built for colleges, universities, and polytechnics.
          </p>
          <div className="text-xs font-mono text-sky-400">
            Autonomous Academic Operations & Intelligent Scheduling
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Core Modules</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="hover:text-slate-200">Department Governance</span></li>
            <li><span className="hover:text-slate-200">Faculty & Workload</span></li>
            <li><span className="hover:text-slate-200">Smart Academic Timetables</span></li>
            <li><span className="hover:text-slate-200">Classroom & Lab Allocation</span></li>
            <li><span className="hover:text-slate-200">Central Examination Cell</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Institutional Roles</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="hover:text-slate-200">Administrator</span></li>
            <li><span className="hover:text-slate-200">Head of Department</span></li>
            <li><span className="hover:text-slate-200">Faculty Member</span></li>
            <li><span className="hover:text-slate-200">Student Portal</span></li>
            <li><span className="hover:text-slate-200">Examination Cell</span></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>&copy; {new Date().getFullYear()} AAIP Autonomous Academic Intelligence Platform. All rights reserved.</span>
        <span className="font-mono text-[11px] text-slate-400">Autonomous Academic Operations Platform</span>
      </div>
    </footer>
  );
};
