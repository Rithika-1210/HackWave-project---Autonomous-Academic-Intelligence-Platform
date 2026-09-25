import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  CalendarDays, Users, Building2, DoorOpen, FileCheck2,
  ShieldCheck, ArrowRight, CheckCircle2, Sparkles, Cpu,
  Database, Activity, Send
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-white via-sky-50/40 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Transform Academic Operations with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">
                Intelligent Automation
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
              Manage academic schedules, faculty workloads, classrooms, laboratories, and institutional activities through one intelligent and secure academic operations platform.
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base shadow-lg shadow-sky-600/30 hover:shadow-xl transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-base border border-slate-300 shadow-xs hover:border-slate-400 transition-all"
              >
                <span>Explore Platform</span>
              </a>
            </div>

          </div>
        </div>

        {/* Subtle Background Glow Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-sky-400/15 to-indigo-400/15 rounded-full blur-3xl pointer-events-none -z-0" />
      </section>

      {/* PLATFORM OVERVIEW & METRICS COUNTER */}
      <section id="overview" className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-sky-600 font-mono">100%</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Conflict-Free Validation</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 font-mono">5 Roles</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Role-Based Access Control</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono">15+ Tables</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Normalized DB Architecture</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-mono">AI-Driven</div>
              <div className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Autonomous Operations Engine</div>
            </div>
          </div>
        </div>
      </section>

      {/* KEY FEATURES SECTION */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider font-mono">Core Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Enterprise Academic Management Modules
            </h2>
            <p className="text-base text-slate-600">
              Six synchronized operational pillars that power the virtual Academic Operations Manager.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs hover:shadow-lg transition-all card-hover">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Academic & Department Management</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Centralized governance of academic departments, courses, curricula, semesters, and degree programs with strict organizational boundaries.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs hover:shadow-lg transition-all card-hover">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Faculty & Workload Distribution</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track instructor profiles, subject specializations, and real-time weekly teaching workloads to prevent burnout and ensure fair distribution.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs hover:shadow-lg transition-all card-hover">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Timetable Management</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                View and manage class-wise, faculty-wise, and room-wise timetables with automated validation against faculty and room collisions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs hover:shadow-lg transition-all card-hover">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-5">
                <DoorOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Classroom & Lab Allocation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Manage lecture halls, specialized computer labs, workshops, and seminar halls with real-time capacity and equipment tracking.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs hover:shadow-lg transition-all card-hover">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-5">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Examination Cell Coordination</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Schedule mid-term and semester examinations, allocate secure examination halls, and prevent space double-booking.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs hover:shadow-lg transition-all card-hover">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Secure Role-Based Access (RBAC)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Cryptographic JWT authentication and granular role authorization for Administrator, HOD, Faculty, Student, and Examination Cell.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider font-mono">Architecture Flow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How AAIP Operates
            </h2>
            <p className="text-base text-slate-600">
              A 4-step structural workflow establishing complete institutional clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold font-mono text-sm flex items-center justify-center mx-auto shadow-md shadow-sky-600/20">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base">Institutional Modeling</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Define departments, degrees, semester curricula, faculty specializations, and room constraints.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold font-mono text-sm flex items-center justify-center mx-auto shadow-md shadow-sky-600/20">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base">Constraint Validation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enforce workload limits, room capacity rules, and prevent faculty or room double-bookings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold font-mono text-sm flex items-center justify-center mx-auto shadow-md shadow-sky-600/20">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base">Role-Based Delivery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deliver tailored, filtered operational schedules directly to administrators, HODs, teachers, and students.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold font-mono text-sm flex items-center justify-center mx-auto shadow-md shadow-sky-600/20">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-base">Audit & AI Readiness</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every modification is cryptographically audited, ready for Stage 2 Multi-Agent AI optimization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* USER ROLES SECTION */}
      <section id="roles" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider font-mono">RBAC Security Matrix</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tailored Portals for Every Institutional Role
            </h2>
            <p className="text-base text-slate-600">
              Each user only accesses data and actions strictly permitted by their institutional role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Administrator</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Global governance over all departments, users, courses, classrooms, and system-wide audits.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Head of Department</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Departmental timetable approvals, faculty workload monitoring, and subject allocations.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Faculty Member</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Personalized weekly timetable, assigned subjects, and teaching workload tracking.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Student</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Semester class schedule, classroom locations, enrolled subjects, and exam dates.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Examination Cell</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Exam scheduling, hall capacity management, and conflict-free seating coordination.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ACADEMIC MANAGEMENT BENEFITS */}
      <section id="benefits" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider font-mono">Measurable Impact</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Why Institutions Choose AAIP
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                Manual academic scheduling wastes hundreds of administrative hours each semester and leads to room disputes, faculty overtime, and exam chaos. AAIP eliminates friction from day one.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Zero Scheduling Collisions</h4>
                    <p className="text-xs text-slate-600">Double-bookings of instructors and venues are mathematically intercepted at the API level.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Equitable Faculty Workloads</h4>
                    <p className="text-xs text-slate-600">Automated teaching hours calculation guarantees transparency and compliance with institutional norms.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Maximized Laboratory & Hall Utilization</h4>
                    <p className="text-xs text-slate-600">Track equipment readiness and eliminate idle rooms through central resource visibility.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Scalable for AI Digital Twins</h4>
                    <p className="text-xs text-slate-600">Database and APIs are built specifically to interface with Stage 2 autonomous genetic algorithms.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Card Snapshot */}
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl text-slate-300 relative overflow-hidden">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-slate-400 ml-2">AAIP Autonomous Engine</span>
                </div>
                <span className="text-xs font-mono text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">Live</span>
              </div>

              <div className="py-6 space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400">Classrooms Synced:</span>
                  <span className="text-sky-400 font-bold">10 / 10 Monitored</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400">Scheduled Lectures:</span>
                  <span className="text-emerald-400 font-bold">14 Zero Clashes</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400">Mid-Term Exams:</span>
                  <span className="text-indigo-400 font-bold">5 Halls Verified</span>
                </div>
                <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400">Database Engine:</span>
                  <span className="text-amber-400 font-bold">PostgreSQL / SQLite</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Cryptographic RBAC Active</span>
                <span className="text-emerald-400">● 100% Operational</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider font-mono">Institutional Inquiry</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Ready to Modernize Your Academic Operations?
          </h2>
          <p className="text-base text-slate-600">
            Sign in with demo credentials or request institutional deployment for your university.
          </p>

          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base shadow-lg shadow-sky-600/25 transition-all"
            >
              <span>Launch Demo Evaluation Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
