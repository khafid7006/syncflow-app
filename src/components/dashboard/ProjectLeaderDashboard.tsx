import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckCircle2, AlertTriangle, Plus, CheckSquare, RotateCcw, Check, Zap,
  ExternalLink, BookOpen, ShieldCheck, Briefcase, FileText, Layers, Users, Activity
} from 'lucide-react';
import { StatusBadge, PriorityBadge, PodBadge } from '../common/Badge';

export const ProjectLeaderDashboard: React.FC<{ onCreateTask?: () => void }> = ({ onCreateTask }) => {
  const { 
    currentUser, 
    teams, 
    tasks, 
    sprints, 
    users, 
    setSelectedTaskId, 
    setActiveTab, 
    approveTaskReview,
    rejectTaskReview,
    resolveBlocker
  } = useApp();

  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({});
  const [activeRejectId, setActiveRejectId] = useState<string | null>(null);

  const currentTeam = teams.find(t => t.id === currentUser.team_id) || teams[0];
  const teamTasks = tasks.filter(t => t.team_id === currentTeam?.id || true);

  // Status groupings
  const blockedTasks = teamTasks.filter(t => t.status === 'BLOCKED' || t.is_blocked);
  const reviewTasks = teamTasks.filter(t => t.status === 'UNDER_REVIEW' || t.status === 'REVIEW' || t.status === 'POD_REVIEW');
  const doneTasks = teamTasks.filter(t => t.status === 'DONE' || t.status === 'SELESAI');

  // Pod Progress Calculation (4 Pods)
  const calculatePodProgress = (podKey: string) => {
    const podTasks = teamTasks.filter(t => t.pod_label === podKey || t.pod === podKey);
    if (podTasks.length === 0) return 0;
    const finished = podTasks.filter(t => t.status === 'DONE' || t.status === 'SELESAI').length;
    return Math.round((finished / podTasks.length) * 100);
  };

  const podBaProgress = calculatePodProgress('BUSINESS_ANALYST') || calculatePodProgress('BA');
  const podPbProgress = calculatePodProgress('PRODUCT_BUILDER') || calculatePodProgress('PB');
  const podQaProgress = calculatePodProgress('QA_DOCUMENTATION') || calculatePodProgress('QA');
  const podMgProgress = calculatePodProgress('GROWTH_MARKETING') || calculatePodProgress('MG');

  const handleConfirmReject = (taskId: string) => {
    const reason = revisionNotes[taskId] || 'Tugas perlu diperbaiki sesuai arahan.';
    rejectTaskReview(taskId, reason);
    setActiveRejectId(null);
  };

  return (
    <div className="w-full flex-1 flex flex-col font-sans text-xs space-y-4">
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-amber-500/10 via-[#18181B] to-slate-900 border border-white/10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-[#F59E0B] text-slate-950 font-mono font-bold text-[10px] uppercase">
              Project Lead Control Center
            </span>
            <span className="text-zinc-400 font-mono text-[11px]">• 3 Mahasiswa Manajemen PKL</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
            Selamat Datang, {currentUser.name}
          </h1>
          <p className="text-xs text-zinc-300 font-sans">
            Kelola sprint, pembagian tugas ke 4 pod, unblock blocker, dan pengesahan deliverable PKL INDITO.
          </p>
        </div>

        {onCreateTask && (
          <button
            onClick={onCreateTask}
            className="px-5 py-3 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 font-mono font-bold rounded-2xl text-xs cursor-pointer transition-all shadow-md flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Tugas Baru</span>
          </button>
        )}
      </div>

      {/* 4 BENTO WIDGET GRID */}
      <div className="grid grid-cols-12 gap-4 items-stretch flex-1">
        
        {/* ========================================================================= */}
        {/* WIDGET 1: RADAR BLOCKER MERAH (col-span-12 lg:col-span-6) */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-6 rounded-3xl bg-rose-950/80 backdrop-blur-xl border border-rose-800/80 text-rose-100 p-6 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
              <span className="uppercase tracking-wider text-xs">Radar Blocker Merah ({blockedTasks.length})</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-900/90 text-rose-200 text-[10px] font-mono border border-rose-700">
              Sinyal Darurat PKL
            </span>
          </div>

          {blockedTasks.length === 0 ? (
            <div className="p-6 rounded-2xl bg-rose-900/30 border border-rose-800/50 text-center space-y-2 my-auto">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="font-mono font-bold text-rose-200 text-sm">Tidak Ada Blocker Aktif</div>
              <p className="text-xs text-rose-300/80 font-sans max-w-md mx-auto">
                Seluruh anak PKL berjalan lancar tanpa hambatan teknis. Status operasional 4 pod sehat.
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] pr-1">
              {blockedTasks.map(task => {
                const assignee = users.find(u => u.id === task.assignee_id);
                return (
                  <div key={task.id} className="p-4 rounded-2xl bg-rose-900/60 border border-rose-700/80 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2 font-mono">
                      <div className="space-y-0.5">
                        <div className="font-bold text-white text-xs">[{task.code}] {task.title}</div>
                        <div className="text-[10px] text-rose-300 font-sans">
                          Anak PKL: <strong>{assignee?.name || 'Anggota PKL'}</strong> • <PodBadge pod={task.pod_label || task.pod || 'PB'} />
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 text-[9px] font-bold border border-rose-700 font-mono shrink-0">
                        {task.blocker_category || 'KENDALA_TEKNIS'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs font-sans italic">
                      "{task.blocker_reason || 'Terjadi hambatan yang memerlukan bantuan Project Lead.'}"
                    </div>

                    <button
                      onClick={() => resolveBlocker(task.id)}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-bold rounded-xl text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Resolve Blocker (Buka Kunci Tugas)</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* WIDGET 2: QUEUE REVIEW DELIVERABLE (col-span-12 lg:col-span-6) */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <FileText className="w-5 h-5 text-[#F59E0B]" />
              <span className="uppercase tracking-wider text-xs">Antrean Review Deliverable ({reviewTasks.length})</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
              Verifikasi Hasil PKL
            </span>
          </div>

          {reviewTasks.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/50 border border-white/70 text-center space-y-2 my-auto">
              <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-mono font-bold text-slate-700 text-sm">Antrean Review Bersih</div>
              <p className="text-xs text-slate-500 font-sans max-w-md mx-auto">
                Belum ada penyerahan deliverable baru yang memerlukan persetujuan Project Lead.
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] pr-1">
              {reviewTasks.map(task => {
                const assignee = users.find(u => u.id === task.assignee_id);
                const deliverableUrl = task.deliverable_url || task.attachments[0]?.url;

                return (
                  <div key={task.id} className="p-4 rounded-2xl bg-white/80 border border-white shadow-xs space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-2 font-mono">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 text-xs">[{task.code}] {task.title}</div>
                        <div className="text-[10px] text-slate-500 font-sans">
                          Diserahkan oleh: <strong>{assignee?.name}</strong> • <PodBadge pod={task.pod_label || task.pod || 'PB'} />
                        </div>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>

                    {/* Deliverable Link */}
                    {deliverableUrl && (
                      <a
                        href={deliverableUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-mono font-bold flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="truncate">🔗 Buka Deliverable: {deliverableUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1" />
                      </a>
                    )}

                    {/* Action Buttons: Approve / Reject */}
                    {activeRejectId === task.id ? (
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <textarea
                          rows={2}
                          placeholder="Tuliskan catatan revisi untuk anak PKL..."
                          value={revisionNotes[task.id] || ''}
                          onChange={e => setRevisionNotes({ ...revisionNotes, [task.id]: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-sans focus:outline-hidden"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleConfirmReject(task.id)}
                            className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold rounded-xl text-xs cursor-pointer"
                          >
                            Kirim Revisi
                          </button>
                          <button
                            onClick={() => setActiveRejectId(null)}
                            className="px-4 py-2 bg-slate-200 text-slate-700 font-mono font-bold rounded-xl text-xs cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-1 font-mono">
                        <button
                          onClick={() => approveTaskReview(task.id)}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve (Selesai)</span>
                        </button>
                        <button
                          onClick={() => setActiveRejectId(task.id)}
                          className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Minta Revisi</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* WIDGET 3: STATUS 4 POD FUNGSIONAL (col-span-12 lg:col-span-6) */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Activity className="w-5 h-5 text-[#EA580C]" />
              <span className="uppercase tracking-wider text-xs">Status Deliverable 4 Pod PKL</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-bold">8 Anak SMK</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Pod BA */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-blue-950 text-xs">Pod BA</span>
                <span className="text-blue-700 font-bold font-mono">{podBaProgress}%</span>
              </div>
              <div className="text-[10px] text-blue-800 font-sans">Business Analyst (BPMN & Riset)</div>
              <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${podBaProgress}%` }} />
              </div>
            </div>

            {/* Pod PB */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-amber-950 text-xs">Pod PB</span>
                <span className="text-amber-700 font-bold font-mono">{podPbProgress}%</span>
              </div>
              <div className="text-[10px] text-amber-800 font-sans">Product Builder (Live App & Supabase)</div>
              <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full transition-all duration-500" style={{ width: `${podPbProgress}%` }} />
              </div>
            </div>

            {/* Pod QA */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-emerald-950 text-xs">Pod QA</span>
                <span className="text-emerald-700 font-bold font-mono">{podQaProgress}%</span>
              </div>
              <div className="text-[10px] text-emerald-800 font-sans">QA & Documentation (Bug Report & Log PKL)</div>
              <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full transition-all duration-500" style={{ width: `${podQaProgress}%` }} />
              </div>
            </div>

            {/* Pod MG */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-purple-950 text-xs">Pod MG</span>
                <span className="text-purple-700 font-bold font-mono">{podMgProgress}%</span>
              </div>
              <div className="text-[10px] text-purple-800 font-sans">Growth Marketing (Medsos & Video Demo)</div>
              <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full transition-all duration-500" style={{ width: `${podMgProgress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WIDGET 4: SPRINT & TASK MANAGER (col-span-12 lg:col-span-6) */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-6 rounded-3xl bg-[#1E1B18]/85 backdrop-blur-xl border border-white/10 text-white p-6 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Briefcase className="w-5 h-5" />
              <span className="uppercase tracking-wider text-xs">Sprint & Task Manager PKL</span>
            </div>
            <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full font-mono">
              Tata Kelola
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs text-zinc-300">
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
              <span>Total Target Tugas Sprint:</span>
              <strong className="text-white text-sm">{teamTasks.length} Tugas</strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
              <span>Disetujui Selesai (DONE):</span>
              <strong className="text-emerald-400 text-sm">{doneTasks.length} Tugas</strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
              <span>Hambatan Aktif (BLOCKED):</span>
              <strong className="text-rose-400 text-sm">{blockedTasks.length} Tugas</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            {onCreateTask && (
              <button
                onClick={onCreateTask}
                className="w-full sm:flex-1 py-3.5 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 font-mono font-bold rounded-2xl text-xs cursor-pointer shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Distribusi Tugas Pod Baru</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('tasks')}
              className="w-full sm:w-auto px-5 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-mono font-bold rounded-2xl text-xs cursor-pointer border border-zinc-700 flex items-center justify-center gap-2 transition-colors"
            >
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>Papan Kanban</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
