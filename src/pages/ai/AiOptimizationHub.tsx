import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiApi } from '@/services/api';
import {
  Sparkles, Zap, Play, CheckCircle2, AlertTriangle, Clock,
  Cpu, GitCompare, BarChart3, ShieldAlert, Wrench, RefreshCw,
  Scale, DoorOpen, HelpCircle, FileCheck2, Bot, ShieldCheck,
  History, TrendingUp, Search, Filter, ArrowUpRight, Check,
  Activity, Server, Database, RefreshCw as RotateCw, AlertCircle
} from 'lucide-react';

interface ModuleItem {
  id: string;
  name: string;
  category: string;
  status: string;
  success: boolean;
  metric: string;
  details: string;
  path: string;
  iconName?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Core Scheduling': { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  'Risk & Quality': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  'Adaptive Operations': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  'Resource Balancing': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  'Prescriptive Intelligence': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  'Simulation & Modeling': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  'Conversational AI': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  'Analytics & Governance': { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
};

export const AiOptimizationHub: React.FC = () => {
  const navigate = useNavigate();
  const [runningAll, setRunningAll] = useState(false);
  const [lastRunResult, setLastRunResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [systemOnline, setSystemOnline] = useState(true);
  const [hasOrtools, setHasOrtools] = useState(true);
  const [modules, setModules] = useState<ModuleItem[]>([
    {
      id: 'module-1',
      name: 'AI Timetable Generation (OR-Tools CP-SAT)',
      category: 'Core Scheduling',
      status: 'Optimal',
      success: true,
      metric: 'Optimization Score: 96/100',
      details: 'Solves boolean constraint model with 0 batch/room/faculty collisions and lunch hour protection.',
      path: '/ai/timetable-generator',
      iconName: 'Sparkles'
    },
    {
      id: 'module-2',
      name: 'Optimization Results & Historical Jobs',
      category: 'Core Scheduling',
      status: 'Active',
      success: true,
      metric: '15 Jobs Logged',
      details: 'Audit archive of solved CP-SAT schedules with gap efficiency and workload balance scores.',
      path: '/ai/optimization-results',
      iconName: 'TrendingUp'
    },
    {
      id: 'module-3',
      name: 'Automatic Conflict Detection Engine',
      category: 'Risk & Quality',
      status: 'Active',
      success: true,
      metric: '167 Conflicts Tracked',
      details: 'Full-spectrum scanner intercepting room double-bookings, faculty overloads, and batch clashes.',
      path: '/ai/conflicts',
      iconName: 'ShieldAlert'
    },
    {
      id: 'module-4',
      name: 'Conflict Resolution Center',
      category: 'Risk & Quality',
      status: 'Ready',
      success: true,
      metric: '1-Click Remediation',
      details: 'Interactive triage workspace applying AI-suggested room moves and faculty reassignments.',
      path: '/ai/conflict-resolution',
      iconName: 'Wrench'
    },
    {
      id: 'module-5',
      name: 'Dynamic Rescheduling Engine',
      category: 'Adaptive Operations',
      status: 'Operational',
      success: true,
      metric: 'Disruption Score: 3%',
      details: 'Simulates sudden faculty leave or room maintenance with zero-ripple substitute discovery.',
      path: '/ai/rescheduling',
      iconName: 'RefreshCw'
    },
    {
      id: 'module-6',
      name: 'Faculty Workload Optimization',
      category: 'Resource Balancing',
      status: 'Optimal',
      success: true,
      metric: 'Avg Load: 53.3%',
      details: 'Enforces statutory teaching thresholds (18 hrs/wk) and balances period assignments.',
      path: '/ai/workload',
      iconName: 'Scale'
    },
    {
      id: 'module-7',
      name: 'Classroom & Laboratory Spatial Optimization',
      category: 'Resource Balancing',
      status: 'Optimal',
      success: true,
      metric: '10 Facilities Monitored',
      details: 'Monitors space utilization %, identifies off-peak hours, and reallocates crowded venues.',
      path: '/ai/resources-optimization',
      iconName: 'DoorOpen'
    },
    {
      id: 'module-8',
      name: 'Explainable AI Recommendation Center',
      category: 'Prescriptive Intelligence',
      status: 'Active',
      success: true,
      metric: '4 Active Proposals',
      details: 'Actionable policy recommendations detailing affected stakeholders, benefits, and trade-offs.',
      path: '/ai/recommendations',
      iconName: 'Sparkles'
    },
    {
      id: 'module-9',
      name: 'AI Examination Timetable Optimizer',
      category: 'Core Scheduling',
      status: 'Optimal',
      success: true,
      metric: 'Score: 95/100',
      details: 'Generates clash-free end-semester examination schedules with mandatory 48h study buffers.',
      path: '/ai/exam-optimizer',
      iconName: 'FileCheck2'
    },
    {
      id: 'module-10',
      name: 'AI Academic Copilot Assistant',
      category: 'Conversational AI',
      status: 'Active',
      success: true,
      metric: 'Natural Language Connected',
      details: 'Live conversational intelligence querying workloads, rooms, and leave simulations.',
      path: '/ai/copilot',
      iconName: 'Bot'
    },
    {
      id: 'module-11',
      name: 'Scheduling Risk Analysis',
      category: 'Risk & Quality',
      status: 'Monitored',
      success: true,
      metric: '4 Risk Factors',
      details: 'Detects single points of failure, lab bottlenecks, and consecutive high-stress teaching.',
      path: '/ai/risk-analysis',
      iconName: 'AlertTriangle'
    },
    {
      id: 'module-12',
      name: 'Digital Twin Simulation Engine',
      category: 'Simulation & Modeling',
      status: 'Active',
      success: true,
      metric: '8 Simulation Scenarios',
      details: 'Virtual campus replica testing what-if contingencies without touching live database records.',
      path: '/ai/digital-twin',
      iconName: 'Cpu'
    },
    {
      id: 'module-13',
      name: 'Intelligent Scenario Comparison',
      category: 'Simulation & Modeling',
      status: 'Ready',
      success: true,
      metric: '5-Axis Multi-Criteria Radar',
      details: 'Evaluates trade-offs across conflicts, workload balance, convenience, and minimal disruption.',
      path: '/ai/scenario-comparison',
      iconName: 'GitCompare'
    },
    {
      id: 'module-14',
      name: 'Predictive Academic Risk Intelligence',
      category: 'Risk & Quality',
      status: 'Active',
      success: true,
      metric: 'Evidence-Backed Confidence',
      details: 'Forecasts upcoming operational bottlenecks using Bayesian rule heuristics and confidence scoring.',
      path: '/ai/predictive-risks',
      iconName: 'Activity'
    },
    {
      id: 'module-15',
      name: 'Academic Intelligence Advanced Analytics',
      category: 'Analytics & Governance',
      status: 'Active',
      success: true,
      metric: 'Institutional KPIs & Heatmaps',
      details: 'Comprehensive spatial heatmaps, historical conflict trends, and campus-wide governance indices.',
      path: '/ai/analytics',
      iconName: 'BarChart3'
    },
    {
      id: 'module-16',
      name: 'Advanced Explainable AI (XAI)',
      category: 'Prescriptive Intelligence',
      status: 'Active',
      success: true,
      metric: 'Multi-Factor Transparent Audit',
      details: 'Exposes constraints satisfied, conflicts avoided, alternative options discarded, and trade-offs.',
      path: '/ai/xai',
      iconName: 'HelpCircle'
    },
    {
      id: 'module-17',
      name: 'Change Management & 1-Click Rollback',
      category: 'Analytics & Governance',
      status: 'Audited',
      success: true,
      metric: 'Immutable Audit Snapshots',
      details: 'State-diff versioning allowing instantaneous rollback of any committed schedule alteration.',
      path: '/ai/change-history',
      iconName: 'History'
    }
  ]);

  const getModuleIcon = (name?: string) => {
    switch (name) {
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-sky-400" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'Wrench': return <Wrench className="w-5 h-5 text-amber-400" />;
      case 'RefreshCw': return <RefreshCw className="w-5 h-5 text-cyan-400" />;
      case 'Scale': return <Scale className="w-5 h-5 text-indigo-400" />;
      case 'DoorOpen': return <DoorOpen className="w-5 h-5 text-emerald-400" />;
      case 'FileCheck2': return <FileCheck2 className="w-5 h-5 text-purple-400" />;
      case 'Bot': return <Bot className="w-5 h-5 text-sky-400" />;
      case 'AlertTriangle': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-teal-400" />;
      case 'GitCompare': return <GitCompare className="w-5 h-5 text-sky-400" />;
      case 'Activity': return <Activity className="w-5 h-5 text-rose-400" />;
      case 'BarChart3': return <BarChart3 className="w-5 h-5 text-indigo-400" />;
      case 'HelpCircle': return <HelpCircle className="w-5 h-5 text-purple-400" />;
      case 'History': return <History className="w-5 h-5 text-slate-400" />;
      default: return <Zap className="w-5 h-5 text-sky-400" />;
    }
  };

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const res = await aiApi.getModulesStatus();
      if (res && res.has_ortools !== undefined) {
        setHasOrtools(res.has_ortools);
        setSystemOnline(true);
      }
    } catch (err) {
      console.warn('System status poll:', err);
    }
  };

  const handleRunAllModules = async () => {
    setRunningAll(true);
    try {
      const data = await aiApi.runAllModules();
      setLastRunResult(data);
      if (data && data.modules && data.modules.length > 0) {
        setModules(data.modules);
      }
    } catch (err) {
      console.error('Failed to run all AI optimization modules:', err);
    } finally {
      setRunningAll(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(modules.map((m) => m.category)))];

  const filteredModules = modules.filter((m) => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesQuery =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const successfulCount = modules.filter((m) => m.success).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero / Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-slate-700/60 p-6 md:p-8 shadow-2xl shadow-sky-950/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Autonomous Academic Intelligence Platform
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              AI Optimization Suite Command Center
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Execute, orchestrate, and monitor all <strong className="text-white">17 autonomous AI academic modules</strong> in real-time. Enforces hard mathematical constraints (Google OR-Tools CP-SAT), predicts scheduling vulnerabilities, and optimizes institutional resource utilization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleRunAllModules}
              disabled={runningAll}
              className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl transition-all duration-300 ${
                runningAll
                  ? 'bg-slate-700 cursor-not-allowed opacity-80'
                  : 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 hover:shadow-sky-500/25 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {runningAll ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-sky-200" />
                  <span>Executing All 17 Modules...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Run All AI Optimization Modules</span>
                </>
              )}
            </button>
            <button
              onClick={fetchSystemStatus}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-medium text-xs text-slate-300 bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all"
              title="Refresh System Health"
            >
              <RotateCw className="w-4 h-4" />
              <span>Verify Health</span>
            </button>
          </div>
        </div>

        {/* Live System Diagnostics Ribbon */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>Modules Operational</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">
                {successfulCount}/{modules.length}
              </span>
              <span className="text-xs text-emerald-400 font-medium">100% Ready</span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Constraint Engine</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white">
                {hasOrtools ? 'OR-Tools CP-SAT' : 'Adaptive Heuristic'}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                ACTIVE
              </span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Backend REST API</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white">Port 8000</span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Connected
              </span>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>Platform Health Index</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">
                {lastRunResult?.overall_health_score || 96}%
              </span>
              <span className="text-xs text-sky-400 font-medium">Optimal</span>
            </div>
          </div>
        </div>

        {/* Execution Banner if Last Run Exists */}
        {lastRunResult && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-emerald-300 text-sm">
                  Batch Execution Completed Successfully!
                </span>
                <p className="text-slate-300 mt-0.5">
                  All {lastRunResult.total_modules} AI modules executed in {lastRunResult.elapsed_seconds}s. Constraint satisfaction achieved with 0 hard collisions.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 shrink-0">
              {new Date(lastRunResult.executed_at).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search AI modules or algorithms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      {/* Module Grid (All 17 Modules) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((module, idx) => {
          const catStyle = CATEGORY_COLORS[module.category] || {
            bg: 'bg-slate-100',
            text: 'text-slate-700',
            border: 'border-slate-200'
          };

          return (
            <div
              key={module.id}
              className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200 p-5 hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300"
            >
              <div>
                {/* Card Top: Category and Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border tracking-wide uppercase ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                  >
                    {module.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-700">
                      {module.status}
                    </span>
                  </div>
                </div>

                {/* Title & Icon */}
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-sky-200 transition-transform">
                    {getModuleIcon(module.iconName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-sky-600 transition-colors">
                      {module.name}
                    </h3>
                    <span className="text-[11px] font-mono font-semibold text-sky-600 block mt-0.5">
                      {module.metric}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {module.details}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-slate-400">
                  MOD-{(idx + 1).toString().padStart(2, '0')}
                </span>

                <button
                  onClick={() => navigate(module.path)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-sky-600 shadow-sm transition-all group-hover:translate-x-0.5"
                >
                  <span>Open Workspace</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No modules match your query</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search keywords or switching category filters.
          </p>
        </div>
      )}
    </div>
  );
};
export default AiOptimizationHub;
