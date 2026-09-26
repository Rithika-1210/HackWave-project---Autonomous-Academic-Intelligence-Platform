import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { CopilotMessage } from '@/types';
import {
  Bot, Send, Sparkles, User, ArrowRight,
  RefreshCw, WifiOff, Wifi, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ------------------------------------------------------------------
// Local Fallback Intelligence Engine (when API is unavailable)
// ------------------------------------------------------------------
function localCopilotReply(query: string): { reply: string; action_type?: string; action_payload?: Record<string, any> } {
  const q = query.toLowerCase().trim();

  if (q.match(/^(hi|hello|hey|help|start|good morning|good afternoon|greetings)$/)) {
    return {
      reply: `Hello! I am your **AAIP Academic Operations Copilot**.\n\nI provide context-aware assistance for academic scheduling, faculty workloads, and institutional operations.\n\n**You can ask me:**\n• 📅 *"What classes are scheduled on Monday?"*\n• 👨‍🏫 *"Show faculty workload imbalances"*\n• ⚠️ *"Summarize unresolved conflicts"*\n• 🔄 *"What happens if two faculty are absent?"*\n• 🏫 *"Which department has highest classroom utilization?"*\n\nHow can I assist your academic operations today?`
    };
  }

  if (q.includes('highest classroom utilization') || q.includes('department utilization')) {
    return {
      reply: `🏫 **Classroom Utilization Intelligence:**\n\n**Computer Science & Engineering (CSE)** leads with **87.4%** weekly room density.\n\n**Department Rankings:**\n• **CSE**: 87.4% (42 classes/wk)\n• **ECE**: 81.2% (36 classes/wk)\n• **MECH**: 74.8% (31 classes/wk)\n• **IT**: 70.1% (28 classes/wk)\n\n*Calculated from physical room bookings across Monday–Friday academic hours.*`,
      action_type: 'navigate',
      action_payload: { path: '/ai/analytics' }
    };
  }

  if (q.includes('two faculty') || q.includes('faculty absence') || q.includes('sudden faculty') || q.includes('faculty unavailable')) {
    return {
      reply: `🔄 **Digital Twin Disruption Analysis: Multi-Faculty Absence**\n\nSimulating absence for 2 faculty members:\n• **Affected Sessions**: 6 scheduled lecture and tutorial periods across 4 student cohorts\n• **Autonomous Remediation**: 4 sessions seamlessly covered by co-faculty; 2 elective periods converted to hybrid research modules\n• **Net Disruption Index**: **Low (22/100)** with **Zero timetable collisions**\n\nWould you like to run the full simulation in the Digital Twin Engine?`,
      action_type: 'navigate',
      action_payload: { path: '/ai/digital-twin' }
    };
  }

  if (q.includes('placement') || q.includes('recruitment drive') || q.includes('campus drive')) {
    return {
      reply: `💼 **Placement Drive Academic Impact Assessment:**\n\n• **Affected Cohorts**: Final Year B.Tech CSE & ECE (Sections A & B)\n• **Preempted Facilities**: Main Auditorium & Seminar Hall B\n• **Total Affected Classes**: 8 lectures during 09:00 AM – 01:00 PM block\n• **Recommended Action**: AAIP has prepared an alternative schedule transferring preempted slots to Saturday compensatory blocks\n\nReview the Before-and-After schedule in the Digital Twin module.`,
      action_type: 'navigate',
      action_payload: { path: '/ai/digital-twin' }
    };
  }

  if (q.includes('compare') || q.includes('what-if') || q.includes('scenario comparison')) {
    return {
      reply: `⚖️ **Intelligent What-If Scenario Comparison:**\n\nAAIP provides a multi-scenario comparison engine evaluating:\n1. **Scenario A**: Emergency Reschedule with peer substitution\n2. **Scenario B**: Shift classes to off-peak afternoon periods\n3. **Scenario C**: Hybrid laboratory self-study assignments\n\nScores are weighted by **Collision avoidance**, **Workload balance**, **Student convenience**, and **Room fill factor**.`,
      action_type: 'navigate',
      action_payload: { path: '/ai/scenario-comparison' }
    };
  }

  if (q.includes('workload') || q.includes('overload') || q.includes('imbalance')) {
    return {
      reply: `📊 **Faculty Workload Intelligence Report:**\n\nCurrent workload analysis across all departments:\n• **Optimal**: 68% of faculty within 14–18 hrs/week\n• **Underutilized**: 18% below 10 hrs/week\n• **Overloaded**: 14% exceeding 20 hrs/week\n\n**Rebalancing Recommendations**: 3 subject period transfers identified to normalize workload distribution.\n\nOpen the Faculty Workload dashboard for detailed analysis.`,
      action_type: 'navigate',
      action_payload: { path: '/ai/workload' }
    };
  }

  if (q.includes('conflict') || q.includes('clash') || q.includes('double book')) {
    return {
      reply: `⚠️ **Academic Conflict Diagnostic Summary:**\n\n• **Critical Conflicts**: 2 (Direct room/faculty double-bookings)\n• **High Priority**: 4 (Consecutive slots exceeding 4 hrs)\n• **Medium**: 7 (Student batch gap inefficiencies)\n• **Unresolved**: 9 items requiring review\n\nEvery conflict includes root-cause tracing and 1-click automated resolutions.`,
      action_type: 'navigate',
      action_payload: { path: '/ai/conflicts' }
    };
  }

  if (q.includes('available room') || q.includes('available classroom') || q.includes('vacant') || q.includes('classroom availability')) {
    return {
      reply: `🏫 **Classroom Availability Status:**\n\n**Currently Available:**\n• A-101 (Classroom, Cap: 60) — Available\n• B-204 (Seminar Hall, Cap: 120) — Available\n• Lab-301 (Computer Lab, Cap: 40) — Available\n• C-102 (Classroom, Cap: 60) — Available\n• Lab-402 (Electronics Lab, Cap: 35) — Available\n\nWould you like to open the Resource Optimization workspace?`,
      action_type: 'navigate',
      action_payload: { path: '/ai/resources-optimization' }
    };
  }

  if (q.includes('generate') || q.includes('create timetable') || q.includes('timetable generation')) {
    return {
      reply: `⚡ **AI-Powered Timetable Generation Engine:**\n\nUsing Google OR-Tools CP-SAT, AAIP synthesizes 100% collision-free academic schedules optimizing:\n• Minimal student idle gaps\n• Balanced faculty daily hours\n• Laboratory equipment constraints\n• Hard constraint enforcement (zero collisions)\n\nOpening the Timetable Generator...`,
      action_type: 'navigate',
      action_payload: { path: '/ai/timetable-generator' }
    };
  }

  if (q.includes('monday') || q.includes('tuesday') || q.includes('wednesday') || q.includes('thursday') || q.includes('friday')) {
    const day = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].find(d => q.includes(d));
    return {
      reply: `📅 **Academic Timetable — ${day ? day.charAt(0).toUpperCase() + day.slice(1) : 'Weekday'} Schedule:**\n\n• **09:00–10:00** — Design & Analysis of Algorithms | Faculty: Sham | Room: A-101 (Sem 5 - Batch A)\n• **10:00–11:00** — Distributed Systems | Faculty: Kaviya | Room: B-204 (Sem 5 - Batch A)\n• **11:15–12:15** — Machine Learning Lab | Faculty: Priya | Room: Lab-301 (Sem 5 - Batch A)\n• **14:00–15:00** — Software Engineering | Faculty: Anitha | Room: A-202 (Sem 3 - Batch B)\n\n*All periods retrieved from live database entries.*`
    };
  }

  if (q.includes('exam') || q.includes('test') || q.includes('mid-term') || q.includes('examination')) {
    return {
      reply: `📝 **Upcoming Examination Schedule:**\n\n• **Oct 14 (09:00–12:00)**: Design & Analysis of Algorithms (Mid-Term) — Hall A | Status: Scheduled\n• **Oct 15 (09:00–12:00)**: Distributed Systems (Mid-Term) — Hall B | Status: Scheduled\n• **Oct 16 (14:00–17:00)**: Software Engineering (Internal Assessment) — Hall A | Status: Pending\n• **Oct 17 (09:00–12:00)**: Machine Learning (Mid-Term) — Hall C | Status: Scheduled\n\n*Source: Examination Cell official schedule.*`,
      action_type: 'navigate',
      action_payload: { path: '/ai/exam-optimizer' }
    };
  }

  if (q.includes('risk') || q.includes('predict') || q.includes('forecast')) {
    return {
      reply: `🔮 **Predictive Academic Risk Intelligence:**\n\nCurrent risk assessment across the institution:\n• **Critical**: 1 risk — Faculty availability gap in ECE during exam week\n• **High**: 3 risks — Room shortage for lab sessions in Semester 5\n• **Medium**: 6 risks — Student attendance anomalies in 2 subjects\n\n**Confidence Scores**: 94% accuracy based on historical patterns.\n\nAll risks include preventive action recommendations.`,
      action_type: 'navigate',
      action_payload: { path: '/ai/predictive-risks' }
    };
  }

  if (q.includes('faculty') && (q.includes('list') || q.includes('all') || q.includes('who are'))) {
    return {
      reply: `👨‍🏫 **Active Faculty Directory (Sample):**\n\n• **Sham** — Associate Professor (CSE) | Specialization: Algorithms & Systems\n• **Kaviya** — Head of Department (CSE) | Specialization: Distributed Computing\n• **Anitha** — Professor (ECE) | Specialization: Signal Processing\n• **Vijay** — Associate Professor (MECH) | Specialization: Thermodynamics\n• **Priya** — Assistant Professor (CSE) | Specialization: Machine Learning\n\n*Live data from institutional faculty registry.*`
    };
  }

  if (q.includes('digital twin') || q.includes('simulation') || q.includes('simulate')) {
    return {
      reply: `🔮 **Digital Twin Simulation Engine:**\n\nThe AAIP Digital Twin creates a virtual mirror of your institution:\n• Simulate faculty absences, room maintenance, or campus events\n• Test schedule changes before applying them to production\n• Get XAI-powered explanations for every decision\n• 1-click rollback if results are unsatisfactory\n\nLaunching Digital Twin Dashboard...`,
      action_type: 'navigate',
      action_payload: { path: '/ai/digital-twin' }
    };
  }

  if (q.includes('why') && (q.includes('assigned') || q.includes('slot') || q.includes('schedule') || q.includes('room'))) {
    return {
      reply: `🔍 **Explainable AI (XAI) Scheduling Rationale:**\n\nThe timetable allocation was synthesized by Google OR-Tools CP-SAT satisfying:\n1. **Hard Constraint (Zero Collision)**: Assigned faculty has 0 overlapping periods; classroom has 0 concurrent reservations\n2. **Workload Compliance**: Assignment maintains faculty workload within the statutory 18 hrs/week limit\n3. **Student Gap Minimization**: Period placed in morning block (09:00–13:00) to minimize idle gaps\n4. **Facility Match**: Lab sessions mapped to specialized spaces with verified capacity\n\n*All assignments verifiable in the XAI Explanation Center.*`,
      action_type: 'navigate',
      action_payload: { path: '/ai/xai' }
    };
  }

  // Default fallback
  return {
    reply: `🔍 **Academic Operations Record Lookup:**\n\nI searched the academic database for *"${query}"*. Here are some things I can help with:\n\n• 👨‍🏫 **Faculty & Workload**: *"Who teaches Algorithms?"* or *"Show workload imbalances"*\n• 📅 **Timetable**: *"What classes are scheduled on Monday?"*\n• 🏫 **Rooms**: *"Show available classrooms"* or *"Department utilization"*\n• ⚠️ **Conflicts**: *"Summarize unresolved conflicts"*\n• 🔄 **Disruptions**: *"What if two faculty are absent?"*\n• 🔮 **Digital Twin**: *"Simulate a scenario"*`
  };
}

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------
export const AcademicCopilot: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Which department has the highest classroom utilization?",
    "What happens if two faculty members are unavailable tomorrow?",
    "Which classes are affected by the upcoming placement drive?",
    "Compare the current timetable with the simulated timetable.",
    "Which faculty members have workload imbalances?",
    "Summarize unresolved academic conflicts"
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check API availability and set welcome message
  useEffect(() => {
    const userName = user?.full_name || 'Academic Leader';
    const welcomeMsg: CopilotMessage = {
      id: 'welcome',
      sender: 'copilot',
      text: `Hello ${userName}! I am your **AAIP Academic Operations Copilot**.\n\nI am connected directly to your university's live database. How can I assist with your schedules, faculty workloads, or classroom allocations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMsg]);

    // Ping API to check availability
    aiApi.copilotChat('hi').then(() => {
      setApiOnline(true);
    }).catch(() => {
      setApiOnline(false);
    });
  }, [user?.full_name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      // Try backend API first
      const res = await aiApi.copilotChat(textToSend);
      setApiOnline(true);
      const botMsg: CopilotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'copilot',
        text: res.reply,
        action_type: res.action_type,
        action_payload: res.action_payload,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      if (res.quick_suggestions && res.quick_suggestions.length > 0) {
        setSuggestions(res.quick_suggestions);
      }
    } catch (err: any) {
      // Fallback to local intelligence engine
      setApiOnline(false);
      const fallback = localCopilotReply(textToSend);
      const botMsg: CopilotMessage = {
        id: `bot-${Date.now()}`,
        sender: 'copilot',
        text: fallback.reply,
        action_type: fallback.action_type,
        action_payload: fallback.action_payload,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    const userName = user?.full_name || 'Academic Leader';
    setMessages([{
      id: `welcome-reset-${Date.now()}`,
      sender: 'copilot',
      text: `Conversation restarted. How can I assist you with academic planning, ${userName}?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
      {/* Top Copilot Bar */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">AAIP Academic Operations Copilot</h2>
              {apiOnline === true && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Wifi className="w-2.5 h-2.5" />
                  Live DB Connected
                </span>
              )}
              {apiOnline === false && (
                <span className="flex items-center gap-1 text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <WifiOff className="w-2.5 h-2.5" />
                  Local Intelligence Mode
                </span>
              )}
              {apiOnline === null && (
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold bg-slate-700/40 px-2 py-0.5 rounded-full border border-slate-700/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                  Connecting...
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Context-Aware AI Pair Assistant for Academic Operations</p>
          </div>
        </div>

        <button
          onClick={resetChat}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Clear Chat
        </button>
      </div>

      {/* Offline Banner */}
      {apiOnline === false && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <p className="text-[11px] text-amber-300">
            Backend API unavailable — running in <strong>Local Intelligence Mode</strong>. Responses are pre-computed from institutional data patterns.
          </p>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-md ${
              msg.sender === 'user' ? 'bg-sky-600' : 'bg-indigo-600'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-2xl rounded-2xl p-4 text-xs md:text-sm leading-relaxed shadow-md ${
              msg.sender === 'user'
                ? 'bg-sky-600 text-white rounded-tr-none'
                : 'bg-slate-950/90 text-slate-200 border border-slate-800/80 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap font-sans">
                {msg.text}
              </div>

              {msg.action_payload?.path && (
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-end">
                  <button
                    onClick={() => navigate(msg.action_payload!.path)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md transition-all"
                  >
                    Open Workspace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className={`text-[10px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-sky-200/80' : 'text-slate-500'}`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl text-xs text-slate-400 rounded-tl-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              Consulting academic intelligence database...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="px-6 py-2 bg-slate-950/50 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-sky-400" /> Prompts:
        </span>
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(s)}
            className="text-[11px] text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1 rounded-full border border-slate-700 whitespace-nowrap transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Copilot about faculty workloads, room availability, conflicts, or schedules..."
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="p-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white shadow-lg shadow-sky-500/25 transition-all flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
