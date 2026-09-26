import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { CopilotMessage } from '@/types';
import {
  Bot, Send, Sparkles, User, ArrowRight, CornerDownLeft,
  RefreshCw, MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AcademicCopilot: React.FC = () => {
  const isStudent = user?.role === 'student';

  const defaultSuggestions = isStudent ? [
    "When are my upcoming examinations?",
    "What is my class timetable for Monday?",
    "Show my internal assessment marks & attendance",
    "What subjects am I currently enrolled in?",
    "Who are my allocated instructors?",
    "How do I choose or add a course elective?"
  ] : [
    "Which department has the highest classroom utilization?",
    "What happens if two faculty members are unavailable tomorrow?",
    "Which classes are affected by the upcoming placement drive?",
    "Compare the current timetable with the simulated timetable.",
    "Which faculty members have workload imbalances?",
    "Summarize unresolved academic conflicts"
  ];

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'copilot',
      text: isStudent
        ? `Hello ${user?.full_name || 'Student'}! 👋 I am your **AAIP Academic Operations Copilot**.\n\nI have direct access to your live **Semester 6** timetable, upcoming examinations, enrolled courses, attendance, and internal marks. How can I assist your studies today?`
        : `Hello ${user?.full_name || 'Academic Leader'}! I am your **AAIP Academic Operations Copilot**.\n\nI am connected directly to your university's live database. How can I assist with your schedules, faculty workloads, or classroom allocations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(defaultSuggestions);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const res = await aiApi.copilotChat(textToSend);
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
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'copilot',
        text: 'Sorry, I encountered an issue connecting to the academic database. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
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
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live DB Connected
              </span>
            </div>
            <p className="text-xs text-slate-400">Context-Aware AI Pair Assistant for Academic Operations</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([{
            id: 'welcome-reset',
            sender: 'copilot',
            text: `Conversation restarted. How can I assist you with academic planning, ${user?.full_name}?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }])}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Clear Chat
        </button>
      </div>

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
                    onClick={() => navigate(msg.action_payload.path)}
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
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
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
          placeholder={
            isStudent
              ? "Ask Copilot about your exams, timetable, marks, attendance, teachers, or courses..."
              : "Ask Copilot about faculty workloads, room availability, conflicts, or schedules..."
          }
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
