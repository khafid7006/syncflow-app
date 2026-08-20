import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, Plus, Activity, CheckCircle2, 
  AlertTriangle, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { Metric } from '../../types';

export const MetricsView: React.FC = () => {
  const { 
    currentUser, 
    metrics, 
    teams, 
    updateMetricValue 
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredMetrics = metrics.filter(m => {
    if (categoryFilter !== 'ALL' && m.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Project Engineering & Growth Metrics Scoreboard
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking baseline metrics vs target milestones across Engineering, Growth, Quality, and Operations.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border rounded-lg px-3 py-1.5 text-xs font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="ENGINEERING">Engineering</option>
            <option value="GROWTH">Growth & Marketing</option>
            <option value="QUALITY">Quality & QA</option>
            <option value="OPERATIONS">Operations & SLA</option>
          </select>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMetrics.map(m => {
          const team = teams.find(t => t.id === m.teamId);
          const isHigherBetter = m.target > m.baseline;
          const progressPct = isHigherBetter
            ? Math.min(100, Math.max(0, Math.round(((m.currentValue - m.baseline) / (m.target - m.baseline)) * 100)))
            : Math.min(100, Math.max(0, Math.round(((m.baseline - m.currentValue) / (m.baseline - m.target)) * 100)));

          const isAchieved = isHigherBetter ? m.currentValue >= m.target : m.currentValue <= m.target;
          const isLagging = progressPct < 40;

          return (
            <div 
              key={m.id}
              className={`bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-xs space-y-4 flex flex-col justify-between ${
                isLagging ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50/20' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                    {m.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {team?.code}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {m.name}
                </h3>

                {/* Score Big Display */}
                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
                      {m.currentValue}{m.unit}
                    </span>
                    <span className="text-xs text-slate-400 ml-1.5 font-medium">Current</span>
                  </div>
                  <span className={`text-xs font-bold font-mono ${isAchieved ? 'text-emerald-600' : isLagging ? 'text-amber-600' : 'text-sky-600'}`}>
                    {progressPct}% to goal
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${isAchieved ? 'bg-emerald-500' : isLagging ? 'bg-amber-500' : 'bg-sky-500'}`}
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>

                {/* Baseline vs Target */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Baseline: <strong>{m.baseline}{m.unit}</strong></span>
                  <span className="text-emerald-600 font-medium">Target: <strong>{m.target}{m.unit}</strong></span>
                </div>
              </div>

              {/* Update value input */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-400 text-[11px]">Simulate Update:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    defaultValue={m.currentValue}
                    onBlur={e => {
                      const val = Number(e.target.value);
                      if (!isNaN(val)) updateMetricValue(m.id, val);
                    }}
                    className="w-16 p-1 text-center bg-slate-50 dark:bg-slate-800 border rounded font-mono text-xs font-bold"
                  />
                  <span className="text-slate-400">{m.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
