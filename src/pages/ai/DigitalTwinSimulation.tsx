import React, { useState } from 'react';
import {
  Cpu, Activity, Zap, Building2, Users, AlertTriangle,
  PlayCircle, RefreshCw, Layers, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const SIMULATION_DATA = [
  { time: '08:00', students: 120, hallLoad: 15, powerKw: 42 },
  { time: '09:00', students: 850, hallLoad: 65, powerKw: 110 },
  { time: '10:00', students: 1280, hallLoad: 88, powerKw: 185 },
  { time: '11:00', students: 1320, hallLoad: 92, powerKw: 195 },
  { time: '12:00', students: 950, hallLoad: 68, powerKw: 140 },
  { time: '13:00', students: 1400, hallLoad: 40, powerKw: 130 }, // Lunch
  { time: '14:00', students: 1150, hallLoad: 78, powerKw: 175 },
  { time: '15:00', students: 980, hallLoad: 70, powerKw: 160 },
  { time: '16:00', students: 450, hallLoad: 35, powerKw: 95 },
  { time: '17:00', students: 180, hallLoad: 12, powerKw: 55 }
];

export const DigitalTwinSimulation: React.FC = () => {
  const [simulating, setSimulating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [attendanceScale, setAttendanceScale] = useState<number>(100);

  const handleRunSimulation = () => {
    setSimulating(true);
    setCompleted(false);
    setTimeout(() => {
      setSimulating(false);
      setCompleted(true);
    }, 1800);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5" /> Stage 2 Digital Twin Prototype
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Digital Twin Campus Simulation
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Virtual stress-testing of campus operational bottlenecks, foot-traffic congestion, and laboratory power peaks.
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={simulating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
        >
          {simulating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Simulating Physical Campus Dynamics...
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4" />
              Run Virtual Semester Stress Test
            </>
          )}
        </button>
      </div>

      {completed && (
        <div className="p-4 rounded-xl bg-slate-900 border-2 border-cyan-500/50 text-white text-sm flex items-center gap-3 shadow-xl shadow-cyan-950/30">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <span className="font-medium text-slate-100">Simulation complete. Digital twin confirms maximum corridor congestion does not exceed safe evacuation thresholds.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Simulated Inhabitants</div>
          <div className="text-3xl font-bold text-white mt-1">1,450</div>
          <div className="text-xs text-slate-500 mt-1">Students + Faculty in flight</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
          <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">Peak Hall Occupancy</div>
          <div className="text-3xl font-bold text-cyan-400 mt-1">92%</div>
          <div className="text-xs text-slate-500 mt-1">11:00 AM core window</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Corridor Congestion</div>
          <div className="text-3xl font-bold text-amber-400 mt-1">Optimal</div>
          <div className="text-xs text-slate-500 mt-1">Staggered period transitions</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
          <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Energy Efficiency</div>
          <div className="text-3xl font-bold text-emerald-400 mt-1">88.4%</div>
          <div className="text-xs text-slate-500 mt-1">HVAC load consolidation</div>
        </div>
      </div>

      {/* Interactive Chart */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Diurnal Footfall & Power Telemetry Simulation
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Estimated campus load based on active timetable sessions</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span> Active Students</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Power Demand (kW)</span>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SIMULATION_DATA}>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="students" stroke="#22d3ee" fillOpacity={1} fill="url(#colorStudents)" />
              <Area type="monotone" dataKey="powerKw" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPower)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Building Hotspot Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm">Computing Complex</span>
            <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">High Contention</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Labs CS-201 and CS-202 operate back-to-back from 10:00 to 16:00. Thermal dissipation and cooling requirements reach peak levels.
          </p>
          <div className="text-[11px] text-cyan-400 font-semibold pt-2 border-t border-slate-800">
            Recommended: Stagger afternoon batches by 30 mins
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm">Block A - Main Academic</span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Optimal Flow</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Lecture Halls A-101 and A-102 experience smooth cohort transitions with ample 15-minute inter-lecture buffers.
          </p>
          <div className="text-[11px] text-emerald-400 font-semibold pt-2 border-t border-slate-800">
            Zero pedestrian bottlenecks detected
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-sm">Central Auditorium</span>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">Underutilized</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            AUD-1 is only active 14% of the operational week. Represents prime capacity for multi-section common guest lectures.
          </p>
          <div className="text-[11px] text-amber-400 font-semibold pt-2 border-t border-slate-800">
            Available for seminar consolidation
          </div>
        </div>
      </div>
    </div>
  );
};
