import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, Copy, Check, Download, Sparkles, 
  Layers, ShieldAlert, Activity, CheckCircle2, Flame 
} from 'lucide-react';
import { HealthPill } from '../common/Badge';

export const WeeklyReportsView: React.FC = () => {
  const { 
    currentUser, 
    teams, 
    tasks, 
    blockers, 
    metrics, 
    sprints,
    calculateOverallHealth,
    calculateTeamHealth 
  } = useApp();

  const [selectedReportType, setSelectedReportType] = useState<string>('EXECUTIVE');
  const [copied, setCopied] = useState(false);

  const { health: overallHealth, reasons: overallReasons, criticalBlockers } = calculateOverallHealth();

  // Generate Report Content dynamically from live state
  const generateMarkdownReport = (): string => {
    const today = '2026-08-19';

    if (selectedReportType === 'EXECUTIVE') {
      const completedTasks = tasks.filter(t => t.status === 'DONE');
      const activeBlockers = blockers.filter(b => b.status !== 'RESOLVED');

      let md = `# WEEKLY EXECUTIVE DEVELOPMENT STATUS REPORT\n`;
      md += `**Date:** ${today} | **Prepared For:** Project Owner | **Cadence:** Weekly Cycle\n`;
      md += `**Overall Project Health:** [ ${overallHealth} ]\n`;
      md += `**Key Health Factor:** ${overallReasons[0] || 'Nominal multi-team execution'}\n\n`;

      md += `## 1. Executive Summary & KPIs\n`;
      md += `- **Active Teams:** 3 Teams (24 Cross-Functional Engineers & Marketers)\n`;
      md += `- **Overall Task Progress:** ${Math.round((completedTasks.length / tasks.length) * 100)}% (${completedTasks.length}/${tasks.length} tasks completed)\n`;
      md += `- **Active Sprints:** Sprint 24 (Ends in 4 days)\n`;
      md += `- **Critical Blockers:** ${criticalBlockers.length} requiring executive override\n\n`;

      md += `## 2. Needs Attention & Exceptions (Blockers & Overdue)\n`;
      if (activeBlockers.length > 0) {
        activeBlockers.forEach(b => {
          md += `- **[${b.severity}] ${b.code}:** ${b.taskTitle} (Escalated: ${b.escalatedTo}) — ${b.reason}\n`;
        });
      } else {
        md += `*Zero open blockers currently impacting delivery.*\n`;
      }
      md += `\n`;

      md += `## 3. Team Status & Pod Highlights\n`;
      teams.forEach(t => {
        const { health, reasons } = calculateTeamHealth(t.id);
        const tTasks = tasks.filter(task => task.teamId === t.id);
        const tDone = tTasks.filter(task => task.status === 'DONE').length;
        md += `### ${t.name} [Health: ${health}]\n`;
        md += `- **Sprint Progress:** ${Math.round((tDone / tTasks.length) * 100)}% (${tDone}/${tTasks.length} tasks)\n`;
        md += `- **Status Summary:** ${reasons[0] || 'On track with sprint milestones'}\n\n`;
      });

      md += `## 4. Core Metrics Scorecard\n`;
      metrics.forEach(m => {
        md += `- **${m.name}:** Current: ${m.currentValue}${m.unit} | Target: ${m.target}${m.unit} (Baseline: ${m.baseline}${m.unit})\n`;
      });

      return md;
    } else {
      // Team specific report
      const team = teams.find(t => t.id === selectedReportType) || teams[0];
      const { health, reasons } = calculateTeamHealth(team.id);
      const teamTasks = tasks.filter(t => t.teamId === team.id);
      const doneTasks = teamTasks.filter(t => t.status === 'DONE');
      const inProgressTasks = teamTasks.filter(t => t.status === 'IN_PROGRESS');
      const teamBlockers = blockers.filter(b => b.teamId === team.id && b.status !== 'RESOLVED');

      let md = `# TEAM WEEKLY REPORT: ${team.name.toUpperCase()}\n`;
      md += `**Date:** ${today} | **Team Health:** [ ${health} ]\n`;
      md += `**Leader Status:** ${reasons[0] || 'Nominal velocity'}\n\n`;

      md += `## Completed Milestones this Week\n`;
      if (doneTasks.length > 0) {
        doneTasks.forEach(t => {
          md += `- **${t.code}:** ${t.title} (DoD Verified, QA Passed)\n`;
        });
      } else {
        md += `*No tasks transitioned to Done yet in this cycle.*\n`;
      }
      md += `\n`;

      md += `## Current Work in Progress\n`;
      inProgressTasks.forEach(t => {
        md += `- **${t.code}:** ${t.title} [Progress: ${t.progress}%]\n`;
      });
      md += `\n`;

      md += `## Active Blockers & Risks\n`;
      if (teamBlockers.length > 0) {
        teamBlockers.forEach(b => {
          md += `- **[${b.severity}] ${b.code}:** ${b.taskTitle} — ${b.reason}\n`;
        });
      } else {
        md += `*No active blockers in team backlog.*\n`;
      }

      return md;
    }
  };

  const reportText = generateMarkdownReport();

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Weekly_Report_${selectedReportType}_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Automated Weekly Development Reports
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time compiled status summaries for Project Owner stakeholder distribution & team syncs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Markdown'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download .MD</span>
          </button>
        </div>
      </div>

      {/* Select Scope Bar */}
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border text-xs">
        <span className="font-semibold text-slate-600">Select Report Target:</span>
        <select
          value={selectedReportType}
          onChange={e => setSelectedReportType(e.target.value)}
          className="bg-white dark:bg-slate-900 border rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200"
        >
          <option value="EXECUTIVE">Executive Project Owner Report (All 3 Teams)</option>
          {teams.map(t => (
            <option key={t.id} value={t.id}>{t.name} Report</option>
          ))}
        </select>
      </div>

      {/* Live Preview Box */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Live Compiled Preview</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">Auto-Synced</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Format: Markdown</span>
        </div>

        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-wrap overflow-x-auto leading-relaxed">
          {reportText}
        </pre>
      </div>
    </div>
  );
};
