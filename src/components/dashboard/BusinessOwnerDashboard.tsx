import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, Users, CheckCircle2, Clock, AlertTriangle, 
  ChevronRight, BarChart3, ShieldCheck, Briefcase, BookOpen, ExternalLink
} from 'lucide-react';
import { RoleBadge } from '../common/Badge';

export const BusinessOwnerDashboard: React.FC = () => {
  const { 
    currentUser, 
    teams, 
    tasks, 
    sprints, 
    users, 
    setActiveTab, 
    setSelectedTeamFilter, 
    setSelectedTaskId,
    setIsSopModalOpen
  } = useApp();

  const now = new Date();

  // Global calculations across all 3 teams
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'SELESAI');
  const reviewTasks = tasks.filter(t => t.status === 'REVIEW');
  const overdueTasks = tasks.filter(t => t.status !== 'SELESAI' && new Date(t.deadline) < now);

  const overallProgress = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

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
          {/* Card 1 (Dark Top): Status Role & Executive Summary */}
          <div className="rounded-3xl bg-[#1E1B18]/85 backdrop-blur-xl border border-white/10 text-white p-6 shadow-md flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-amber-400 font-bold">Business Owner</span>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 font-mono text-[10px]">
                Executive
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-mono font-bold text-white">
                {currentUser.name}
              </h2>
              <div className="text-[11px] text-zinc-400 font-mono">
                Portofolio Bisnis (3 Tim Kerja)
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Tim Aktif:</span>
                <span className="text-amber-400 font-bold">{teams.length} Tim</span>
              </div>
              <p className="text-zinc-300 text-xs italic font-sans">
                "Pengawasan performa deliverables & pengarahan strategis."
              </p>
            </div>
          </div>

          {/* Card 2 (White Middle): Metrik Angka Besar */}
          <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm p-6 flex flex-col justify-between gap-3 text-center">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Progres Portofolio Global
            </div>

            <div className="text-4xl font-mono font-bold text-[#EA580C] tracking-tight">
              +{overallProgress}%
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/60 font-mono text-xs">
              <div className="p-2 bg-white/50 rounded-2xl border border-white/60">
                <div className="text-[10px] text-slate-400">Total Tugas</div>
                <div className="font-bold text-slate-900 text-base">{totalTasks}</div>
              </div>
              <div className="p-2 bg-white/50 rounded-2xl border border-white/60">
                <div className="text-[10px] text-slate-400">Selesai</div>
                <div className="font-bold text-emerald-600 text-base">{doneTasks.length}</div>
              </div>
            </div>
          </div>

          {/* Card 3 (Bottom CTA): Tombol Aksi Ganda */}
          <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm p-6 flex flex-col justify-between gap-3 flex-1">
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Aksi Eksekutif
              </div>
              <h3 className="text-sm font-mono font-bold text-slate-900">
                Monitoring Portofolio
              </h3>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <button
                onClick={() => setActiveTab('do')}
                className="w-full py-3 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 font-bold rounded-2xl cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span>Input Arahan Strategis</span>
              </button>

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
                  Status Eksekutif Global
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold font-mono text-[#18181B] tracking-tight leading-snug">
                Fokus Eksekutif: Monitoring Delivery 3 Tim Kerja
              </h1>
            </div>

            {/* B. Feed Notifikasi & Aktivitas Penting (Tengah) */}
            <div className="space-y-3 font-mono text-xs">
              {/* Card 1: Review Notification */}
              <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/70 flex items-start gap-3 text-slate-800 shadow-2xs">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C] mt-1.5 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-slate-900">Antrean Review Lintas Tim</div>
                  <p className="text-slate-600 font-sans text-xs">
                    {reviewTasks.length} tugas dari seluruh tim saat ini sedang ditinjau sebelum disahkan final.
                  </p>
                </div>
              </div>

              {/* Card 2: Progress Notification */}
              <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/70 flex items-start gap-3 text-slate-800 shadow-2xs">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-slate-900">Progres Portofolio Global</div>
                  <p className="text-slate-600 font-sans text-xs">
                    Seluruh 3 tim telah menyelesaikan {doneTasks.length} dari {totalTasks} total target tugas ({overallProgress}% tuntas).
                  </p>
                </div>
              </div>

              {/* Card 3: Overdue Warning */}
              <div className="p-4 bg-amber-50/60 backdrop-blur-md rounded-2xl border border-amber-200/80 flex items-start gap-3 text-amber-950 shadow-2xs">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-amber-950">Mitigasi Bottleneck Deadline</div>
                  <p className="text-amber-900/90 font-sans text-xs">
                    Terdapat {overdueTasks.length} tugas yang perlu tindak lanjut mitigasi batas waktu oleh Project Owner.
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
                <Briefcase className="w-4 h-4" />
                <span>Buka Insight Hub (/do)</span>
              </button>

              <button
                onClick={() => setIsSopModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3.5 bg-white/80 hover:bg-white text-slate-800 font-bold rounded-2xl cursor-pointer transition-all border border-white/80 shadow-2xs flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-[#EA580C]" />
                <span>Lihat SOP Panduan</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* C. KOLOM KANAN (col-span-12 lg:col-span-3 flex flex-col gap-4) */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm p-6 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between font-mono">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Monitoring Tim
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/60 text-slate-700">
                {users.length} User
              </span>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto font-mono text-xs">
              {users.slice(0, 5).map(u => (
                <div key={u.id} className="p-2.5 bg-white/50 rounded-2xl border border-white/60 flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate">{u.name}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{u.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#1E1B18]/85 backdrop-blur-xl border border-white/10 text-white p-6 shadow-md flex flex-col justify-between h-full gap-4 flex-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs border-b border-zinc-800/80 pb-2">
                <span className="font-bold text-zinc-200 uppercase tracking-wider">Akses Eksekutif</span>
                <span className="text-amber-400 font-bold">BO Control</span>
              </div>
              <p className="text-zinc-300 text-xs font-sans leading-relaxed">
                Akses read-only tingkat tinggi untuk pemantauan kesehatan delivery proyek & pengiriman arahan strategis rahasia.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveTab('do')}
                className="w-full py-3.5 px-4 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 font-mono font-bold rounded-2xl text-xs cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span>Buka Insight Hub</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
