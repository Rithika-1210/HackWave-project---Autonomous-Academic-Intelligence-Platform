import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  GitCompare, Sliders, CheckCircle2, AlertTriangle, ArrowRight,
  TrendingUp, Award, Layers, RefreshCw, BarChart2, ShieldCheck,
  Scale, BookOpen, Clock, Users, DoorOpen
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { aiApi } from '@/services/api';
import { DigitalTwinSimulationOut, ScenarioComparisonOut } from '@/types';

export const ScenarioComparison: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [availableScenarios, setAvailableScenarios] = useState<DigitalTwinSimulationOut[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [comparing, setComparing] = useState<boolean>(false);
  const [comparisonResult, setComparisonResult] = useState<ScenarioComparisonOut | null>(null);

  // Institutional Priority Weights (1-10)
  const [weights, setWeights] = useState({
    conflicts: 10,
    workload_balance: 8,
    student_convenience: 9,
    classroom_utilization: 7,
    minimal_disruption: 8
  });

  useEffect(() => {
    loadScenariosAndRun();
  }, []);

  const loadScenariosAndRun = async () => {
    setLoading(true);
    try {
      const list = await aiApi.listDigitalTwinScenarios();
      setAvailableScenarios(list);

      const urlIds = searchParams.get('ids')?.split(',').filter(Boolean) || [];
      const initialSelected = urlIds.length > 0
        ? urlIds
        : list.slice(0, 3).map(s => s.scenario_id);

      setSelectedIds(initialSelected);

      if (initialSelected.length > 0) {
        await executeComparison(initialSelected, weights);
      }
    } catch (err) {
      console.error('Error initializing comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  const executeComparison = async (ids: string[], currentWeights: typeof weights) => {
    if (ids.length === 0) return;
    setComparing(true);
    try {
      const res = await aiApi.compareScenarios({
        title: 'Multi-Criteria Academic Scenario Analysis',
        department_id: 1,
        scenario_ids: ids,
        priority_weights: currentWeights
      });
      setComparisonResult(res);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setComparing(false);
    }
  };

  const handleToggleScenario = (scenarioId: string) => {
    let nextIds: string[];
    if (selectedIds.includes(scenarioId)) {
      if (selectedIds.length <= 1) return; // Keep at least one
      nextIds = selectedIds.filter(id => id !== scenarioId);
    } else {
      if (selectedIds.length >= 4) {
        alert('You can compare a maximum of 4 scenarios simultaneously.');
        return;
      }
      nextIds = [...selectedIds, scenarioId];
    }
    setSelectedIds(nextIds);
    executeComparison(nextIds, weights);
  };

  const handleWeightChange = (key: keyof typeof weights, value: number) => {
    const updated = { ...weights, [key]: value };
    setWeights(updated);
    executeComparison(selectedIds, updated);
  };

  // Radar Colors Palette
  const RADAR_COLORS = ['#22d3ee', '#818cf8', '#34d399', '#f43f5e'];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <GitCompare className="w-3.5 h-3.5" /> Stage 3 What-If Analytics
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Intelligent What-If Scenario Comparison
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Evaluate alternative academic operational plans using configurable institutional priorities and multi-criteria trade-off analysis.
          </p>
        </div>

        <button
          onClick={() => executeComparison(selectedIds, weights)}
          disabled={comparing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs md:text-sm font-semibold border border-slate-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-400 ${comparing ? 'animate-spin' : ''}`} />
          Recalculate Trade-offs
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
          Loading simulation scenarios for multi-criteria comparison...
        </div>
      ) : availableScenarios.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-4">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Digital Twin Scenarios Available</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You need at least one completed Digital Twin simulation before performing What-If scenario comparisons.
          </p>
          <button
            onClick={() => navigate('/ai/digital-twin')}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs"
          >
            Launch Digital Twin Studio
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Scenario Selectors & Weight Sliders */}
          <div className="space-y-6">
            {/* Scenarios Checkbox List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Select Scenarios (2 - 4)
                </span>
                <span className="text-[11px] text-cyan-400 font-mono">{selectedIds.length} Selected</span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {availableScenarios.map((s) => {
                  const isChecked = selectedIds.includes(s.scenario_id);
                  return (
                    <div
                      key={s.scenario_id}
                      onClick={() => handleToggleScenario(s.scenario_id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 rounded accent-cyan-400"
                      />
                      <div className="flex-1 text-xs">
                        <div className="font-bold flex items-center justify-between">
                          <span className="truncate">{s.name}</span>
                          <span className="text-[10px] font-mono text-cyan-400">{s.scenario_id}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{s.scenario_type}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Configurable Institutional Priorities */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Institutional Priority Weights
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Zero Timetable Conflicts</span>
                    <strong className="text-cyan-400 font-mono">{weights.conflicts}/10</strong>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={weights.conflicts}
                    onChange={(e) => handleWeightChange('conflicts', Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Faculty Workload Parity</span>
                    <strong className="text-indigo-400 font-mono">{weights.workload_balance}/10</strong>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={weights.workload_balance}
                    onChange={(e) => handleWeightChange('workload_balance', Number(e.target.value))}
                    className="w-full accent-indigo-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Student Cohort Convenience</span>
                    <strong className="text-emerald-400 font-mono">{weights.student_convenience}/10</strong>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={weights.student_convenience}
                    onChange={(e) => handleWeightChange('student_convenience', Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Classroom Utilization Packing</span>
                    <strong className="text-amber-400 font-mono">{weights.classroom_utilization}/10</strong>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={weights.classroom_utilization}
                    onChange={(e) => handleWeightChange('classroom_utilization', Number(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Minimal Schedule Disruption</span>
                    <strong className="text-rose-400 font-mono">{weights.minimal_disruption}/10</strong>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={weights.minimal_disruption}
                    onChange={(e) => handleWeightChange('minimal_disruption', Number(e.target.value))}
                    className="w-full accent-rose-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Span 2): Radar Chart, Bar Chart & Trade-off Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recommended Scenario Winner Card */}
            {comparisonResult && (
              <div className="bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-400/30">
                      <Award className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Top-Ranked Multi-Criteria Plan</span>
                      <h3 className="text-lg font-bold text-white">
                        {comparisonResult.scenarios.find(s => s.scenario_id === comparisonResult.recommended_scenario_id)?.name || comparisonResult.recommended_scenario_id}
                      </h3>
                    </div>
                  </div>

                  <span className="text-2xl font-black text-cyan-400 font-mono">
                    {comparisonResult.scenarios.find(s => s.scenario_id === comparisonResult.recommended_scenario_id)?.composite_score || 94.5}
                    <span className="text-xs text-slate-400 font-normal"> / 100</span>
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Transparent Rationale:</strong> {comparisonResult.recommendation_reason}
                </p>

                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={() => navigate(`/ai/digital-twin?id=${comparisonResult.recommended_scenario_id}`)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all"
                  >
                    View in Digital Twin Studio
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Radar Comparison Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Multi-Dimensional Trade-off Radar Chart
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Evaluates conflict avoidance, workload balance, convenience, room packing, and disruption index.
                  </p>
                </div>
              </div>

              <div className="h-72">
                {comparisonResult && comparisonResult.radar_data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparisonResult.radar_data}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                      {comparisonResult.scenarios.map((sc, idx) => (
                        <Radar
                          key={sc.scenario_id}
                          name={sc.name}
                          dataKey={sc.name}
                          stroke={RADAR_COLORS[idx % RADAR_COLORS.length]}
                          fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
                          fillOpacity={0.25}
                        />
                      ))}
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    Select scenarios to render multi-dimensional radar comparison.
                  </div>
                )}
              </div>
            </div>

            {/* Side-by-Side Metrics Table */}
            {comparisonResult && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  Comparative Scoring Breakdown Table
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-3 font-semibold uppercase tracking-wider">Plan / Scenario</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider">Composite Score</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider">Disruption</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider">Conflicts Solved</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider">Utilization</th>
                        <th className="pb-3 font-semibold uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {comparisonResult.scenarios.map((s, idx) => {
                        const isWinner = s.scenario_id === comparisonResult.recommended_scenario_id;
                        return (
                          <tr key={s.scenario_id} className={isWinner ? 'bg-cyan-500/5 font-semibold' : ''}>
                            <td className="py-3 flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block"
                                style={{ backgroundColor: RADAR_COLORS[idx % RADAR_COLORS.length] }}
                              />
                              <div>
                                <div className="text-white font-bold">{s.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{s.scenario_id}</div>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="text-sm font-black text-cyan-400 font-mono">{s.composite_score}</span>
                            </td>
                            <td className="py-3 text-slate-300">{s.disruption_score}/100</td>
                            <td className="py-3 text-emerald-400">{s.conflicts_resolved}</td>
                            <td className="py-3 text-slate-300">{s.utilization_pct}%</td>
                            <td className="py-3">
                              {isWinner ? (
                                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                                  Recommended
                                </span>
                              ) : (
                                <span className="text-slate-500">{s.status}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Trade-off summary text */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-cyan-400 block mb-1">Institutional Trade-off Diagnosis:</strong>
                  {comparisonResult.tradeoff_analysis}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
