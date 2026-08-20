import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckCircle2, Send, Target, ArrowRight, RotateCcw, 
  Check, Zap, ExternalLink, Plus, BookOpen, ShieldCheck, 
  Briefcase, FileText, CheckSquare, Square
} from 'lucide-react';
import { StatusBadge, PriorityBadge, PodBadge, RoleBadge, PodOwnerBadge } from '../common/Badge';
import { DEFAULT_DOD_CHECKLIST } from '../../data/initialData';

export const MemberDashboard: React.FC = () => {
  const { 
    currentUser, 
    teams, 
    tasks, 
    sprints, 
    users, 
    setSelectedTaskId, 
    setActiveTab, 
    startFocusTask,
    moveTaskStatus, 
    rejectTaskReview,
    addAttachment,
    setIsSopModalOpen
  } = useApp();

  const [linkInput, setLinkInput] = useState('');
  const [linkNameInput, setLinkNameInput] = useState('');
  const [activeRejectId, setActiveRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const currentTeam = teams.find(t => t.id === currentUser.team_id) || teams[0];
  const myTasks = tasks.filter(t => t.assignee_id === currentUser.id);

  const doneTasks = myTasks.filter(t => t.status === 'SELESAI');
  const inProgressTasks = myTasks.filter(t => t.status === 'DIKERJAKAN');
  const myProgress = myTasks.length > 0 ? Math.round((doneTasks.length / myTasks.length) * 100) : 0;
  const activeSprint = sprints.find(s => s.team_id === currentTeam?.id && s.status === 'ACTIVE') || sprints[0];

  const isPodOwner = Boolean(currentUser.is_pod_owner || currentUser.is_pod_lead);
  const podReviewTasks = isPodOwner
    ? tasks.filter(t => t.team_id === currentUser.team_id && t.pod_label === currentUser.pod_label && t.status === 'POD_REVIEW')
    : [];

  // Active execution task focal point
  const currentTask = myTasks.find(t => t.status === 'DIKERJAKAN') || myTasks[0] || tasks[0];

  const dodList = currentTask?.dod_checklist && currentTask.dod_checklist.length > 0 
    ? currentTask.dod_checklist 
    : DEFAULT_DOD_CHECKLIST;
  const completedDoDCount = dodList.filter(d => d.completed).length;

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim() || !currentTask) return;

    const url = linkInput.trim();
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    const name = linkNameInput.trim() || (url.length > 30 ? url.substring(0, 28) + '...' : url);

    addAttachment(currentTask.id, {
      name,
      url: formattedUrl,
      size: 'Tautan Web'
    });

    setLinkInput('');
    setLinkNameInput('');
  };

  const handleConfirmReject = (taskId: string) => {
    const reason = rejectReason.trim() || 'Tugas perlu diperbaiki sesuai checklist DoD.';
    rejectTaskReview(taskId, reason);
    setActiveRejectId(null);
    setRejectReason('');
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
              <span className="text-amber-400 font-bold">{currentTeam?.name}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 font-mono text-[10px]">
                {currentUser.pod_label || 'Pod'}
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-mono font-bold text-white">
                {currentUser.name}
              </h2>
              <div className="text-[11px] text-zinc-400 font-mono">
                {isPodOwner ? `Pod Owner (${currentUser.pod_label})` : 'Member Team'}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Sprint Goal:</span>
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
              Progres Delivery Saya
            </div>

            <div className="text-4xl font-mono font-bold text-[#EA580C] tracking-tight">
              +{myProgress}%
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/60 font-mono text-xs">
              <div className="p-2 bg-white/50 rounded-2xl border border-white/60">
                <div className="text-[10px] text-slate-400">Selesai</div>
                <div className="font-bold text-emerald-600 text-base">{doneTasks.length}</div>
              </div>
              <div className="p-2 bg-white/50 rounded-2xl border border-white/60">
                <div className="text-[10px] text-slate-400">Dikerjakan</div>
                <div className="font-bold text-[#F59E0B] text-base">{inProgressTasks.length}</div>
              </div>
            </div>
          </div>

          {/* Card 3 (Bottom CTA): Tombol Aksi Ganda */}
          <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm p-6 flex flex-col justify-between gap-3 flex-1">
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Workspace Aksi
              </div>
              <h3 className="text-sm font-mono font-bold text-slate-900">
                Navigasi Pengerjaan
              </h3>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <button
                onClick={() => setActiveTab('do')}
                className="w-full py-3 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 font-bold rounded-2xl cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Mulai Kerjakan</span>
              </button>

              <button
                onClick={() => setIsSopModalOpen(true)}
                className="w-full py-2.5 bg-white/80 hover:bg-white text-slate-800 font-bold rounded-2xl cursor-pointer transition-colors flex items-center justify-center gap-2 border border-white/80"
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
                  Batas Waktu: {activeSprint?.end_date || 'Akhir Minggu'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold font-mono text-[#18181B] tracking-tight leading-snug">
                {isPodOwner 
                  ? `Pod Owner ${currentUser.pod_label}: Verifikasi DoD & Pengesahan Quality Hub`
                  : 'Fokus Tim Minggu Ini: Integrasi QRIS Hub & Dashboard Real-Time'
                }
              </h1>
            </div>

            {/* B. Feed Notifikasi & Aktivitas Penting (Tengah) */}
            <div className="space-y-3 font-mono text-xs">
              {/* Card 1: Review / Task Status */}
              <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/70 flex items-start gap-3 text-slate-800 shadow-2xs">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C] mt-1.5 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-slate-900">
                    {isPodOwner ? 'Status Review Pod' : 'Tugas Aktif Anda'}
                  </div>
                  <p className="text-slate-600 font-sans text-xs">
                    {isPodOwner 
                      ? `${podReviewTasks.length} tugas anggota pod sedang menunggu verifikasi kriteria DoD oleh Anda.`
                      : `Saat ini mengerjakan "${currentTask?.title || 'Pengembangan Komponen'}" (${currentTask?.code || 'TSK-101'}).`
                    }
                  </p>
                </div>
              </div>

              {/* Card 2: Sprint Progress */}
              <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/70 flex items-start gap-3 text-slate-800 shadow-2xs">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-slate-900">Capaian Sprint Tim</div>
                  <p className="text-slate-600 font-sans text-xs">
                    Tim telah menyelesaikan {doneTasks.length} dari {myTasks.length > 0 ? myTasks.length : 5} target tugas sprint minggu ini ({myProgress}% tuntas).
                  </p>
                </div>
              </div>

              {/* Card 3: Important Note */}
              <div className="p-4 bg-amber-50/60 backdrop-blur-md rounded-2xl border border-amber-200/80 flex items-start gap-3 text-amber-950 shadow-2xs">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] mt-1.5 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-amber-950">Catatan Penting SOP</div>
                  <p className="text-amber-900/90 font-sans text-xs">
                    Pastikan seluruh bukti link PR, Figma, atau dokumen BRD terlampir sebelum melakukan penyerahan tugas.
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
                <Zap className="w-4 h-4 fill-current" />
                <span>
                  {isPodOwner ? 'Verifikasi Tugas Pod (/do)' : 'Masuk ke Pengerjaan Tugas (/do)'}
                </span>
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
          {/* Card 1 (Top Queue): Antrean Verifikasi Pod */}
          <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm p-6 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between font-mono">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Antrean Pod {currentUser.pod_label}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 border border-amber-500/30">
                {podReviewTasks.length} Task
              </span>
            </div>

            {podReviewTasks.length === 0 ? (
              <div className="text-slate-500 text-xs italic font-sans text-center py-4">
                Tidak ada antrean review di Pod {currentUser.pod_label}.
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {podReviewTasks.map(task => (
                  <div key={task.id} className="p-3 bg-white/50 rounded-2xl border border-white/60 space-y-1">
                    <div className="font-mono font-bold text-slate-900 text-xs truncate">[{task.code}] {task.title}</div>
                    <button
                      onClick={() => setSelectedTaskId(task.id)}
                      className="text-[11px] text-[#EA580C] font-mono font-bold hover:underline"
                    >
                      Verifikasi Detail →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2 (Dark Bottom Action): Checklist Syarat Selesai (DoD) + Tombol Utama */}
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

            {/* Tombol Utama Kontras Amber */}
            <div className="pt-2">
              {currentTask?.status === 'DIKERJAKAN' ? (
                <button
                  onClick={() => moveTaskStatus(currentTask.id, 'POD_REVIEW')}
                  disabled={!currentTask.attachments || currentTask.attachments.length === 0}
                  className={`w-full py-3.5 px-4 font-mono font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                    currentTask.attachments && currentTask.attachments.length > 0
                      ? 'bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Serahkan ke Pod Owner</span>
                </button>
              ) : currentTask?.status === 'POD_REVIEW' ? (
                <div className="p-3 bg-zinc-800 text-amber-400 font-mono text-center rounded-2xl text-xs font-bold border border-zinc-700">
                  Menunggu Cek Pod Owner
                </div>
              ) : (
                <button
                  onClick={() => startFocusTask(currentTask.id)}
                  className="w-full py-3.5 px-4 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 font-mono font-bold rounded-2xl text-xs cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Mulai Kerjakan Tugas</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
