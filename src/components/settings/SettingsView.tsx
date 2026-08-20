import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sliders, RotateCcw, ShieldCheck, CheckSquare, 
  AlertOctagon, Users, Sparkles, Layers, CheckCircle2 
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { resetToDefaultData } = useApp();

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data back to the original demo state? This will restore initial tasks, blockers, and QA history.')) {
      resetToDefaultData();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-sky-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              System Architecture & RBAC Guide
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Structural documentation, governance rules, and simulation management.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Demo Data to Initial State
        </button>
      </div>

      {/* RBAC Rules Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* PO Role */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            1. Project Owner (Executive)
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Executive authority over the entire project. Does not micromanage daily tasks.
          </p>
          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 font-medium">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Management by Exception:</strong> focuses only on critical blockers, overdue sprints, and at-risk teams.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Strategic Blocker Override resolution.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Consolidated Executive KPI Scorecard.</span>
            </li>
          </ul>
        </div>

        {/* PL Role */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-sky-600 font-bold text-sm">
            <Users className="w-5 h-5" />
            2. Project Leaders (3 Leaders)
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Operational captains scoped directly to their designated Team (Core, Growth, Mobile).
          </p>
          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 font-medium">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Sprint Planning & Goal creation.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Task assignment & capacity load management (max 4 tasks/member).</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Leader Code Review authorization gate.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Escalate unresolved team blockers to Project Owner.</span>
            </li>
          </ul>
        </div>

        {/* Member Role */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <CheckSquare className="w-5 h-5" />
            3. Team Members (24 Members)
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Cross-functional pod specialists executing focused sprint backlog tickets.
          </p>
          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 font-medium">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Personal Focus Cockpit (today's tasks, deadlines).</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Interactive Definition of Done (DoD) verification.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Submit tasks for Leader Review.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Report Blockers with automated SLA tracking.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Pod Structure Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          Cross-Functional Pod Architecture (4 Pods per Team)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg space-y-1">
            <div className="font-bold text-blue-900 dark:text-blue-300">1. Business Analyst (BA)</div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Translates business goals into PRDs, User Stories, and Acceptance Criteria.
            </p>
          </div>

          <div className="p-3 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900 rounded-lg space-y-1">
            <div className="font-bold text-sky-900 dark:text-sky-300">2. Product Builder (Dev)</div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Fullstack, backend, frontend, and mobile engineers implementing code & unit tests.
            </p>
          </div>

          <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg space-y-1">
            <div className="font-bold text-purple-900 dark:text-purple-300">3. Quality Assurance (QA)</div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Enforces hard verification gates. Tasks cannot be marked Done if QA finds defects.
            </p>
          </div>

          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg space-y-1">
            <div className="font-bold text-emerald-900 dark:text-emerald-300">4. Marketing & Growth</div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              Executes growth experiments, conversion telemetry, and UTM analytics tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
