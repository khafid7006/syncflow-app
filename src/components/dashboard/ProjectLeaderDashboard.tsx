import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckCircle2, Clock, Plus, CheckSquare, ArrowRight, RotateCcw, Check, Zap,
  ExternalLink, BookOpen, ShieldCheck, Briefcase, FileText
} from 'lucide-react';
import { StatusBadge, PriorityBadge, PodBadge, RoleBadge } from '../common/Badge';
import { DEFAULT_DOD_CHECKLIST } from '../../data/initialData';

export const ProjectLeaderDashboard: React.FC<{ onCreateTask?: () => void }> = ({ onCreateTask }) => {
  const { 
    currentUser, 
    teams, 
    tasks, 
    sprints, 
    users, 
    setSelectedTaskId, 
    setActiveTab, 
    moveTaskStatus,
    approveTaskReview,
    rejectTaskReview,
    addAttachment,
    setIsSopModalOpen
  } = useApp();

  const [linkInput, setLinkInput] = useState('');
  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({});
  const [activeRejectId, setActiveRejectId] = useState<string | null>(null);

  const currentTeam = teams.find(t => t.id === currentUser.team_id) || teams[0];
  const teamTasks = tasks.filter(t => t.team_id === currentTeam?.id);

  const doneTasks = teamTasks.filter(t => t.status === 'SELESAI');
  const inProgressTasks = teamTasks.filter(t => t.status === 'DIKERJAKAN');
  const reviewTasks = teamTasks.filter(t => t.status === 'REVIEW' || t.status === 'POD_REVIEW');

  const teamProgress = teamTasks.length > 0 ? Math.round((doneTasks.length / teamTasks.length) * 100) : 0;
  const activeSprint = sprints.find(s => s.team_id === currentTeam?.id && s.status === 'ACTIVE') || sprints[0];
  const teamMembers = users.filter(u => u.team_id === currentTeam?.id);

  // Active review focal task or top team task
  const activeTask = reviewTasks[0] || teamTasks.find(t => t.status === 'DIKERJAKAN') || teamTasks[0] || tasks[0];

  const dodList = activeTask?.dod_checklist && activeTask.dod_checklist.length > 0 
    ? activeTask.dod_checklist 
    : DEFAULT_DOD_CHECKLIST;
  const completedDoDCount = dodList.filter(d => d.completed).length;

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim() || !activeTask) return;

    const url = linkInput.trim();
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

    addAttachment(activeTask.id, {
      name: url.length > 30 ? url.substring(0, 28) + '...' : url,
      url: formattedUrl,
      size: 'Tautan Web'
    });

    setLinkInput('');
  };

  const handleConfirmReject = (taskId: string) => {
    const reason = revisionNotes[taskId] || 'Tugas perlu diperbaiki sebelum disetujui.';
    rejectTaskReview(taskId, reason);
    setActiveRejectId(null);
  };

  return (
    <div className="w-full flex-1 flex flex-col font-sans text-xs">
      {/* ========================================================================= */}
      {/* 3-KOLOM BENTO GRID FULL HEIGHT (w-full flex-1 grid grid-cols-12 gap-4) */}
      {/* ========================================================================= */}
      <div className="w-full flex-1 grid grid-cols-12 gap-4 items-stretch">
        
        {/* ========================================================================= */}
        {/* A. KOLOM KIRI (col-span-12 lg:col-span-3 flex flex-col gap-4) */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          {/* Card 1 (Dark Top): Status Role & Target Sprint */}
          <div className="rounded-3xl bg-[#1E1B18]/85 backdrop-blur-xl border border-white/10 text-white p-6 shadow-md flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-amber-400 font-bold">Project Leader</span>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 font-mono text-[10px]">
                {currentTeam?.code || 'PL'}
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-mono font-bold text-white">
                {currentUser.name}
              </h2>
              <div className="text-[11px] text-zinc-400 font-mono">
                Leader {currentTeam?.name} ({teamMembers.length} Anggota)
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Sprint Target:</span>
                <span className="text-amber-400 font-bold">{activeSprint?.end_date}</span>
              </div>
              <p className="text-zinc-300 text-xs italic line-clamp-2 font-sans">
                "{activeSprint?.goal}"
              </p>
            </div>
          </div>

          {/* Card 2 (White Middle): Metrik Angka Besar */}
          <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm p-6 flex flex-col justify-between gap-3 text-center">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Progres Delivery Tim
            </div>

            <div className="text-4xl font-mono font-bold text-[#EA580C] tracking-tight">
              +{teamProgress}%
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/60 font-mono text-xs">
              <div className="p-2 bg-white/50 rounded-2xl border border-white/60">
                <div className="text-[10px] text-slate-400">Tugas Selesai</div>
                <div className="font-bold text-emerald-600 text-base">{doneTasks.length}</div>
              </div>
              <div className="p-2 bg-white/50 rounded-2xl border border-white/60">
                <div className="text-[10px] text-slate-400">Antrean Review</div>
                <div className="font-bold text-[#F59E0B] text-base">{reviewTasks.length}</div>
              </div>
            </div>
          </div>

          {/* Card 3 (Bottom CTA): Tombol Aksi Ganda */}
          <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm p-6 flex flex-col justify-between gap-3 flex-1">
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Menu Utama Leader
              </div>
              <h3 className="text-sm font-mono font-bold text-slate-900">
                Aksi Tata Kelola
              </h3>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {onCreateTask && (
                <button
                  onClick={onCreateTask}
                  className="w-full py-3 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 font-bold rounded-2xl cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Tugas Baru</span>
                </button>
              )}

              <button
                onClick={() => setIsSopModalOpen(true)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-[#EA580C]" />
                <span>SOP Panduan</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* B. KOLOM TENGAH / HERO NOTIFICATION & SPRINT STATUS HUB (col-span-12 lg:col-span-6 flex flex-col) */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-6 flex flex-col">
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 p-8 shadow-sm h-full flex flex-col justify-between space-y-6">
            {/* A. Header Notifikasi (Status Banner) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="px-3.5 py-1 rounded-full bg-[#F59E0B] text-slate-950 font-bold uppercase tracking-wider text-[11px] shadow-2xs">
                  [ SPRINT AKTIF ]
                </span>
                <span className="text-slate-500 font-bold">
                  Target Selesai: {activeSprint?.end_date || 'Akhir Minggu'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold font-mono text-[#18181B] tracking-tight leading-snug">
                Project Leader Hub: Pengesahan & Pengawasan Delivery Tim
              </h1>
            </div>

            {/* B. Feed Notifikasi & Aktivitas Penting (Tengah) */}
            <div className="space-y-3 font-mono text-xs">
              {/* Card 1: Review Notification */}
              <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/70 flex items-start gap-3 text-slate-800 shadow-2xs">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C] mt-1.5 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-slate-900">Antrean Review Leader</div>
                  <p className="text-slate-600 font-sans text-xs">
                    {reviewTasks.length} tugas sedang menunggu pengesahan & review kualitas oleh Anda sebagai Project Leader.
                  </p>
                </div>
              </div>

              {/* Card 2: Progress Notification */}
              <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/70 flex items-start gap-3 text-slate-800 shadow-2xs">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-slate-900">Pencapaian Sprint Tim</div>
                  <p className="text-slate-600 font-sans text-xs">
                    Tim telah menyelesaikan {doneTasks.length} dari {teamTasks.length > 0 ? teamTasks.length : 5} target sprint minggu ini ({teamProgress}% selesai).
                  </p>
                </div>
              </div>

              {/* Card 3: Important Note */}
              <div className="p-4 bg-amber-50/60 backdrop-blur-md rounded-2xl border border-amber-200/80 flex items-start gap-3 text-amber-950 shadow-2xs">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] mt-1.5 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-amber-950">Catatan Penting Leader</div>
                  <p className="text-amber-900/90 font-sans text-xs">
                    Pastikan seluruh kriteria Definition of Done (DoD) telah tercentang sebelum menyetujui pengesahan selesai.
                  </p>
                </div>
              </div>
            </div>

            {/* C. Bottom Quick Action (Bawah) */}
            <div className="pt-4 border-t border-white/60 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
              <button
                onClick={() => setActiveTab('do')}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 font-bold rounded-2xl cursor-pointer transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Periksa Antrean Review (/do)</span>
              </button>

              <button
                onClick={() => setIsSopModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3.5 bg-white/80 hover:bg-white text-slate-800 font-bold rounded-2xl cursor-pointer transition-all border border-white/80 shadow-2xs flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-[#EA580C]" />
                <span>Lihat SOP & Target Lengkap</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* C. KOLOM KANAN (col-span-12 lg:col-span-3 flex flex-col gap-4) */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          {/* Card 1 (Top Queue): Antrean Review Anggota */}
          <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm p-6 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between font-mono">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Antrean Review ({reviewTasks.length})
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 border border-amber-500/30">
                SOP 1x24 Jam
              </span>
            </div>

            {reviewTasks.length === 0 ? (
              <div className="text-slate-500 text-xs italic font-sans text-center py-4">
                Tidak ada tugas yang menunggu review saat ini.
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {reviewTasks.map(task => {
                  const assignee = users.find(u => u.id === task.assignee_id);
                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="p-3 bg-white/50 hover:bg-white/80 rounded-2xl border border-white/60 cursor-pointer space-y-1 transition-colors"
                    >
                      <div className="font-mono font-bold text-slate-900 text-xs truncate">[{task.code}] {task.title}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>{assignee?.name}</span>
                        <PodBadge pod={task.pod_label} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 2 (Dark Bottom Action): Checklist DoD + Tombol Approval */}
          <div className="rounded-3xl bg-[#1E1B18]/85 backdrop-blur-xl border border-white/10 text-white p-6 shadow-md flex flex-col justify-between h-full gap-4 flex-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs border-b border-zinc-800/80 pb-2">
                <span className="font-bold text-zinc-200 uppercase tracking-wider">Syarat Selesai (DoD)</span>
                <span className="text-amber-400 font-bold">{completedDoDCount}/{dodList.length}</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto font-sans text-xs">
                {dodList.map((item, idx) => (
                  <div key={item.id} className="p-2.5 bg-zinc-900/80 rounded-2xl border border-zinc-800/80 flex items-start gap-2 text-zinc-300">
                    <span className="font-mono text-zinc-500 font-bold text-[11px]">{idx + 1}.</span>
                    <span className="leading-snug">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tombol Utama Approval Kontras Amber */}
            <div className="pt-2">
              {activeTask?.status === 'REVIEW' || activeTask?.status === 'POD_REVIEW' ? (
                <button
                  onClick={() => approveTaskReview(activeTask.id)}
                  disabled={completedDoDCount < dodList.length}
                  className={`w-full py-3.5 px-4 font-mono font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                    completedDoDCount === dodList.length
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{completedDoDCount === dodList.length ? 'Sahkan Selesai' : `Lengkapi DoD (${completedDoDCount}/${dodList.length})`}</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="w-full py-3.5 px-4 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 font-mono font-bold rounded-2xl text-xs cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Buka Papan Tugas Tim</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
