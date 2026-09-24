import React, { useState, useEffect } from 'react';
import {
  TrendingUp, BarChart3, PieChart as PieIcon, Calendar, Download,
  Filter, Building2, Users, DoorOpen, ShieldCheck, RefreshCw,
  Layers, Clock, FileSpreadsheet, Printer
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { aiApi, departmentsApi } from '@/services/api';
import { AdvancedAnalyticsResponse, Department } from '@/types';

export const AdvancedAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AdvancedAnalyticsResponse | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAnalytics();
  }, [selectedDeptId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const deptIdParam = selectedDeptId === 'all' ? undefined : Number(selectedDeptId);
      const [res, deptList] = await Promise.all([
        aiApi.getAdvancedAnalytics(deptIdParam),
        departmentsApi.getAll()
      ]);
      setData(res);
      setDepartments(deptList);
    } catch (err) {
      console.error('Failed to load advanced analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AAIP-Executive-Academic-Intelligence-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!data) return;
    let csv = 'Faculty Name,Department,Teaching Hours,Min Target,Max Limit,Status\n';
    data.faculty_workload_distribution.forEach(f => {
      csv += `"${f.faculty_name}","${f.department}",${f.teaching_hours},${f.min_target},${f.max_limit},"${f.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AAIP-Faculty-Workload-Analysis-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5" /> Stage 3 Academic Intelligence
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Institutional Operational Intelligence Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Executive-level analytics across faculty workload parity, department timetable density, spatial utilization heatmaps, and simulation performance.
          </p>
        </div>

        {/* Filter & Export Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="bg-transparent focus:outline-none text-white font-medium"
            >
              <option value="all">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            title="Download CSV Workload Data"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            CSV
          </button>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            title="Download JSON Report"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            JSON
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            title="Print Ready Executive Report"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-400" />
            Print
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
          Aggregating institutional operational metrics from live database...
        </div>
      ) : !data ? (
        <div className="p-8 text-center text-slate-500">Failed to load analytics data.</div>
      ) : (
        <div className="space-y-8">
          {/* Institutional KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Schedule Compliance</div>
              <div className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">{data.institutional_kpis.schedule_compliance_rate}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Statutory syllabus alignment</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">Classroom Fill Factor</div>
              <div className="text-2xl md:text-3xl font-black text-cyan-400 mt-1">{data.institutional_kpis.classroom_fill_factor}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Space optimization index</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Zero-Conflict Guarantee</div>
              <div className="text-2xl md:text-3xl font-black text-indigo-400 mt-1">{data.institutional_kpis.zero_conflict_guarantee}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Automated collision prevention</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Energy & HVAC Savings</div>
              <div className="text-2xl md:text-3xl font-black text-amber-400 mt-1">{data.institutional_kpis.carbon_energy_savings_hours}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Consolidated room usage</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
              <div className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">Faculty Retention Index</div>
              <div className="text-2xl md:text-3xl font-black text-rose-400 mt-1">{data.institutional_kpis.faculty_retention_index}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Balanced teaching loads</div>
            </div>
          </div>

          {/* Chart Grid 1: Faculty Workload & Department Utilization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Faculty Workload Distribution Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    Faculty Teaching Hours Distribution
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live weekly teaching hours vs statutory thresholds (Target: 14 hrs, Max: 18 hrs).
                  </p>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.faculty_workload_distribution.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="faculty_name"
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis stroke="#94a3b8" domain={[0, 20]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Bar dataKey="teaching_hours" name="Teaching Hours / Week" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="max_limit" name="Statutory Cap (18 hrs)" fill="#f43f5e" opacity={0.3} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department-Wise Utilization */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    Department Timetable Utilization Density
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Weekly scheduled lectures as percentage of available room hours.
                  </p>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.department_utilization} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="department_code" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Bar dataKey="utilization_pct" name="Utilization %" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Spatial Utilization Heatmap Matrix (Rooms vs Days) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-cyan-400" />
                  Classroom & Laboratory Spatial Utilization Heatmap
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Percentage of daily periods occupied per physical academic room.
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500 inline-block"></span> Light (&lt;50%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-cyan-500/30 border border-cyan-500 inline-block"></span> Optimal (50-80%)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500/30 border border-rose-500 inline-block"></span> Congested (&gt;80%)</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="text-left pb-3 font-semibold uppercase tracking-wider">Facility / Hall</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Type</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Monday</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Tuesday</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Wednesday</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Thursday</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider">Friday</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.spatial_utilization_heatmap.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="text-left py-3 font-bold text-white flex items-center gap-2">
                        <span className="font-mono text-cyan-400">{row.room_number}</span>
                        <span className="text-[10px] text-slate-500">(Cap: {row.capacity})</span>
                      </td>
                      <td className="py-3 text-slate-400 text-[11px]">{row.type}</td>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                        const val = Number(row[day] || 0);
                        const bgStyle =
                          val > 80
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : val >= 50
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                        return (
                          <td key={day} className="py-3">
                            <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold border ${bgStyle}`}>
                              {val}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chart Grid 2: Conflict Trends & Rescheduling Frequencies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conflict Detection Trends (6-Month Area Chart) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Conflict Resolution & Autonomous Interception Trends
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Monthly reduction in timetable collisions since AAIP deployment.
                  </p>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.conflict_trends_historical} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <defs>
                      <linearGradient id="colorDetected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Legend />
                    <Area type="monotone" dataKey="detected" name="Conflicts Detected" stroke="#f43f5e" fillOpacity={1} fill="url(#colorDetected)" />
                    <Area type="monotone" dataKey="resolved" name="Conflicts Autonomously Resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rescheduling Frequency by Month & Cause */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    Dynamic Rescheduling Frequency by Cause
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Breakdown of academic modifications handled across recent months.
                  </p>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.rescheduling_frequency_by_month} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="faculty_leave" name="Faculty Leave" fill="#38bdf8" stackId="a" />
                    <Bar dataKey="room_maintenance" name="Room Maintenance" fill="#818cf8" stackId="a" />
                    <Bar dataKey="institutional_events" name="Campus Placement/Events" fill="#f59e0b" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Simulation Operations & Success Rate Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">AAIP Autonomous Operations Telemetry</span>
                <h3 className="text-lg font-bold text-white mt-1">Digital Twin Simulation Performance Summary</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Across <strong>{data.simulation_success_rate.total_simulations_run} virtual scenarios</strong> evaluated, the platform has achieved an average of <strong>{data.simulation_success_rate.average_conflict_reduction_pct}% collision reduction</strong> and saved university administrators an estimated <strong>{data.simulation_success_rate.average_time_saved_hours} hours</strong> of manual schedule re-crafting per month.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-400 font-mono">{data.simulation_success_rate.committed_to_live}</div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Committed to Live</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-cyan-400 font-mono">{data.simulation_success_rate.under_hod_review}</div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">In Sandbox Review</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
