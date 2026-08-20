import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertTriangle, ShieldCheck, Briefcase, MessageSquare, Activity, CheckCircle2, FileText
} from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { PodBadge, StatusBadge } from '../common/Badge';

export const BusinessOwnerDashboard: React.FC = () => {
  const { 
    currentUser, 
    teams, 
    tasks, 
    users, 
    sendNotification 
  } = useApp();

  const [targetTeamId, setTargetTeamId] = useState(teams[0]?.id || 'team-1');
  const [strategicNote, setStrategicNote] = useState('');
  const [boSuccessMessage, setBoSuccessMessage] = useState<string | null>(null);

  // Global calculations across pods
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'DONE' || t.status === 'SELESAI');
  const blockedTasks = tasks.filter(t => t.status === 'BLOCKED' || t.is_blocked);
  const overallProgress = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  // Pod calculations
  const calculatePodProgress = (podKey: string) => {
    const podTasks = tasks.filter(t => t.pod_label === podKey || t.pod === podKey);
    if (podTasks.length === 0) return 0;
    const finished = podTasks.filter(t => t.status === 'DONE' || t.status === 'SELESAI').length;
    return Math.round((finished / podTasks.length) * 100);
  };

  const podBa = calculatePodProgress('BUSINESS_ANALYST') || calculatePodProgress('BA');
  const podPb = calculatePodProgress('PRODUCT_BUILDER') || calculatePodProgress('PB');
  const podQa = calculatePodProgress('QA_DOCUMENTATION') || calculatePodProgress('QA');
  const podMg = calculatePodProgress('GROWTH_MARKETING') || calculatePodProgress('MG');

  const handleSendStrategicGuidance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!strategicNote.trim()) return;

    const targetTeam = teams.find(t => t.id === targetTeamId) || teams[0];

    // Save to Supabase community_messages table (channel_type: EXECUTIVE)
    supabaseService.sendCommunityMessage({
      id: `msg-bo-${Date.now()}`,
      team_id: targetTeam.id,
      channel_type: 'EXECUTIVE',
      sender_id: currentUser.id,
      message_text: `[Arahan Strategis Business Owner untuk ${targetTeam.name}]: ${strategicNote.trim()}`,
    });

    if (targetTeam.project_leader_id) {
      sendNotification({
        user_id: targetTeam.project_leader_id,
        type: 'IMPORTANT',
        title: `Arahan Strategis Business Owner`,
        message: `${currentUser.name} (Business Owner): "${strategicNote.trim()}"`
      });
    }

    setBoSuccessMessage(`Arahan strategis berhasil dikirimkan privat ke Project Lead ${targetTeam.name}!`);
    setStrategicNote('');
    setTimeout(() => setBoSuccessMessage(null), 5000);
  };

  return (
    <div className="w-full flex-1 flex flex-col font-sans text-xs space-y-4">
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-amber-500/20 via-[#18181B] to-zinc-900 border border-white/10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-[#F59E0B] text-slate-950 font-mono font-bold text-[10px] uppercase">
              Business Owner Executive Hub
            </span>
            <span className="text-zinc-400 font-mono text-[11px]">• Mode Monitoring Makro & Read-Only</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
            Selamat Datang, {currentUser.name}
          </h1>
          <p className="text-xs text-zinc-300 font-sans">
            Pengawasan makro kesehatan delivery 4 pod PKL INDITO & pengiriman arahan strategis langsung ke Project Lead.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center shrink-0 font-mono">
          <div className="text-[10px] text-zinc-400 uppercase font-bold">Progres Portofolio Global</div>
          <div className="text-3xl font-bold text-[#F59E0B]">+{overallProgress}%</div>
        </div>
      </div>

      {/* SUCCESS TOAST ALERT */}
      {boSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-900 font-mono text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{boSuccessMessage}</span>
        </div>
      )}

      {/* 3-COLUMN BENTO GRID */}
      <div className="grid grid-cols-12 gap-4 items-stretch flex-1">
        
        {/* ========================================================================= */}
        {/* WIDGET 1: KESEHATAN SPRINT PER POD (col-span-12 lg:col-span-4) */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Activity className="w-5 h-5 text-[#F59E0B]" />
              <span className="uppercase tracking-wider text-xs">Kesehatan Deliverable 4 Pod</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-bold">{doneTasks.length}/{totalTasks} Tuntas</span>
          </div>

          <div className="space-y-3">
            {/* Pod BA */}
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-1.5">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-blue-950">Pod BA (Business Analyst)</span>
                <span className="text-blue-700 font-bold font-mono">{podBa}%</span>
              </div>
              <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${podBa}%` }} />
              </div>
            </div>

            {/* Pod PB */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1.5">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-amber-950">Pod PB (Product Builder)</span>
                <span className="text-amber-700 font-bold font-mono">{podPb}%</span>
              </div>
              <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full transition-all duration-500" style={{ width: `${podPb}%` }} />
              </div>
            </div>

            {/* Pod QA */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1.5">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-emerald-950">Pod QA & Documentation</span>
                <span className="text-emerald-700 font-bold font-mono">{podQa}%</span>
              </div>
              <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${podQa}%` }} />
              </div>
            </div>

            {/* Pod MG */}
            <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/80 space-y-1.5">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-purple-950">Pod MG (Growth Marketing)</span>
                <span className="text-purple-700 font-bold font-mono">{podMg}%</span>
              </div>
              <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full transition-all duration-500" style={{ width: `${podMg}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WIDGET 2: BOTTLENECK MAKRO (col-span-12 lg:col-span-4) */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-4 rounded-3xl bg-rose-950/85 backdrop-blur-xl border border-rose-800/80 text-rose-100 p-6 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
              <span className="uppercase tracking-wider text-xs">Radar Bottleneck Makro ({blockedTasks.length})</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-900 text-rose-200 text-[10px] font-mono border border-rose-700">
              Perlu Mitigasi
            </span>
          </div>

          {blockedTasks.length === 0 ? (
            <div className="p-6 rounded-2xl bg-rose-900/30 border border-rose-800/50 text-center space-y-2 my-auto">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="font-mono font-bold text-rose-200 text-sm">Operasional 0 Bottleneck</div>
              <p className="text-xs text-rose-300/80 font-sans max-w-md mx-auto">
                Seluruh pod PKL berjalan tanpa hambatan kritis yang dilaporkan saat ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[340px] pr-1">
              {blockedTasks.map(task => {
                const assignee = users.find(u => u.id === task.assignee_id);
                return (
                  <div key={task.id} className="p-3.5 rounded-2xl bg-rose-900/60 border border-rose-700/80 space-y-1.5 text-xs">
                    <div className="flex items-start justify-between gap-1 font-mono">
                      <div className="font-bold text-white text-xs truncate">[{task.code}] {task.title}</div>
                      <PodBadge pod={task.pod_label || task.pod || 'PB'} />
                    </div>
                    <div className="text-[10px] text-rose-300 font-sans">
                      Anak PKL: <strong>{assignee?.name || 'Pelaksana'}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-[11px] font-sans italic">
                      "{task.blocker_reason || 'Terjadi kendala teknis yang membutuhkan intervensi.'}"
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* WIDGET 3: FORM ARAHAN STRATEGIS PRIVAT KE PROJECT LEAD (col-span-12 lg:col-span-4) */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <MessageSquare className="w-5 h-5 text-[#EA580C]" />
              <span className="uppercase tracking-wider text-xs">Arahan Strategis (Privat ke Project Lead)</span>
            </div>
          </div>

          <form onSubmit={handleSendStrategicGuidance} className="space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
                  Pilih Tim Tujuan *
                </label>
                <select
                  value={targetTeamId}
                  onChange={e => setTargetTeamId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 focus:border-amber-500 bg-white rounded-xl text-xs font-mono focus:outline-hidden text-slate-900"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
                  Isi Catatan / Arahan Strategis *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan arahan mitigasi risiko, alokasi resource pod, atau masukan eksekutif untuk Project Lead..."
                  value={strategicNote}
                  onChange={e => setStrategicNote(e.target.value)}
                  className="w-full p-3 border border-slate-200 focus:border-amber-500 bg-white rounded-xl text-xs font-sans focus:outline-hidden text-slate-900 leading-relaxed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!strategicNote.trim()}
              className={`w-full py-3 px-4 font-mono font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all ${
                strategicNote.trim()
                  ? 'bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Kirim Pesan ke Project Lead</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
