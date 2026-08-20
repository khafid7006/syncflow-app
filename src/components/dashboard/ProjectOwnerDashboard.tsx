import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertTriangle, ShieldCheck, FileText, ExternalLink, Plus, CheckCircle2, RotateCcw, Check, Briefcase
} from 'lucide-react';
import { StatusBadge, PodBadge } from '../common/Badge';

export const ProjectOwnerDashboard: React.FC<{ onCreateTask?: () => void }> = ({ onCreateTask }) => {
  const { 
    currentUser, 
    teams, 
    tasks, 
    users, 
    approveTaskReview,
    rejectTaskReview,
    resolveBlocker,
    createTask
  } = useApp();

  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({});
  const [activeRejectId, setActiveRejectId] = useState<string | null>(null);

  // Quick inline task creation state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPod, setNewPod] = useState<import('../../types').PodType>('PRODUCT_BUILDER');
  const [newAssigneeId, setNewAssigneeId] = useState('');

  const currentTeam = teams.find(t => t.id === currentUser.team_id) || teams[0];
  const teamTasks = tasks.filter(t => t.team_id === currentTeam?.id || true);

  const blockedTasks = teamTasks.filter(t => t.status === 'BLOCKED' || t.is_blocked);
  const reviewTasks = teamTasks.filter(t => t.status === 'UNDER_REVIEW' || t.status === 'REVIEW' || t.status === 'POD_REVIEW');
  const doneTasks = teamTasks.filter(t => t.status === 'DONE' || t.status === 'SELESAI');

  const teamMembers = users.filter(u => u.role === 'MEMBER');

  const handleConfirmReject = (taskId: string) => {
    const reason = revisionNotes[taskId] || 'Tugas perlu diperbaiki sesuai arahan.';
    rejectTaskReview(taskId, reason);
    setActiveRejectId(null);
  };

  const handleQuickCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createTask({
      title: newTitle.trim(),
      description: newDescription.trim(),
      team_id: currentTeam.id,
      pod_label: newPod,
      assignee_id: newAssigneeId || teamMembers[0]?.id || currentUser.id,
      priority: 'HIGH',
      deadline: '2026-08-25',
      sprint_id: 'sprint-active-1'
    });

    setNewTitle('');
    setNewDescription('');
    alert(`Tugas [${newTitle}] berhasil dibuat & ditugaskan ke Pod ${newPod}!`);
  };

  return (
    <div className="w-full flex-1 flex flex-col font-sans text-xs space-y-4">
      {/* Top Header Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-amber-500/20 via-[#18181B] to-slate-900 border border-white/10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-[#F59E0B] text-slate-950 font-mono font-bold text-[10px] uppercase">
              Project Owner Control Center
            </span>
            <span className="text-zinc-400 font-mono text-[11px]">• Mahasiswa Magang (Pengatur Sprint & Approval Final)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-mono font-bold text-white tracking-tight">
            Selamat Datang, {currentUser.name}
          </h1>
          <p className="text-xs text-zinc-300 font-sans">
            Kelola sprint, tugaskan ke pod anak SMK, unblock hambatan, dan berikan persetujuan final (DONE).
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
            <div className="text-[10px] text-zinc-400 uppercase font-bold">Tugas Selesai (DONE)</div>
            <div className="text-2xl font-bold text-emerald-400">{doneTasks.length}/{teamTasks.length}</div>
          </div>
        </div>
      </div>

      {/* 3 CORE WIDGETS GRID */}
      <div className="grid grid-cols-12 gap-4 items-stretch flex-1">
        
        {/* ========================================================================= */}
        {/* WIDGET 1: RADAR BLOCKER MERAH (col-span-12 lg:col-span-4) */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-4 rounded-3xl bg-rose-950/85 backdrop-blur-xl border border-rose-800/80 text-rose-100 p-6 shadow-md flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
              <span className="uppercase tracking-wider text-xs">1. Radar Blocker Merah ({blockedTasks.length})</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-rose-900 text-rose-200 text-[10px] font-mono border border-rose-700">
              Perlu Pembongkaran PO
            </span>
          </div>

          {blockedTasks.length === 0 ? (
            <div className="p-6 rounded-2xl bg-rose-900/30 border border-rose-800/50 text-center space-y-2 my-auto">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="font-mono font-bold text-rose-200 text-sm">Tidak Ada Blocker Aktif</div>
              <p className="text-xs text-rose-300/80 font-sans max-w-xs mx-auto">
                Seluruh anak SMK berjalan tanpa hambatan teknis saat ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[340px] pr-1">
              {blockedTasks.map(task => {
                const assignee = users.find(u => u.id === task.assignee_id);
                return (
                  <div key={task.id} className="p-4 rounded-2xl bg-rose-900/60 border border-rose-700/80 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-1 font-mono">
                      <div className="font-bold text-white text-xs truncate">[{task.code}] {task.title}</div>
                      <PodBadge pod={task.pod_label || task.pod || 'PB'} />
                    </div>
                    <div className="text-[10px] text-rose-300 font-sans">
                      Anak SMK: <strong>{assignee?.name || 'Pelaksana'}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs font-sans italic">
                      "{task.blocker_reason || 'Terjadi kendala teknis yang membutuhkan bantuan PO.'}"
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
        {/* WIDGET 2: QUEUE REVIEW DELIVERABLE (col-span-12 lg:col-span-4) */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <FileText className="w-5 h-5 text-[#F59E0B]" />
              <span className="uppercase tracking-wider text-xs">2. Queue Review ({reviewTasks.length})</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
              Hak Approval PO
            </span>
          </div>

          {reviewTasks.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/50 border border-white/70 text-center space-y-2 my-auto">
              <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-mono font-bold text-slate-700 text-sm">Antrean Review Bersih</div>
              <p className="text-xs text-slate-500 font-sans max-w-xs mx-auto">
                Belum ada penyerahan deliverable baru yang memerlukan persetujuan Project Owner.
              </p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[340px] pr-1">
              {reviewTasks.map(task => {
                const assignee = users.find(u => u.id === task.assignee_id);
                const deliverableUrl = task.deliverable_url || task.attachments[0]?.url;

                return (
                  <div key={task.id} className="p-4 rounded-2xl bg-white/80 border border-white shadow-xs space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-1 font-mono">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 text-xs truncate">[{task.code}] {task.title}</div>
                        <div className="text-[10px] text-slate-500 font-sans">
                          Diserahkan oleh: <strong>{assignee?.name}</strong> • <PodBadge pod={task.pod_label || task.pod || 'PB'} />
                        </div>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>

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

                    {activeRejectId === task.id ? (
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <textarea
                          rows={2}
                          placeholder="Tuliskan catatan revisi untuk anak SMK..."
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
                          <span>Approve Selesai (DONE)</span>
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
        {/* WIDGET 3: FORM BIKIN TUGAS BARU & ASSIGN KE POD (col-span-12 lg:col-span-4) */}
        {/* ========================================================================= */}
        <div className="col-span-12 lg:col-span-4 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between font-mono">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Plus className="w-5 h-5 text-[#EA580C]" />
              <span className="uppercase tracking-wider text-xs">3. Buat Tugas & Assign ke Pod</span>
            </div>
          </div>

          <form onSubmit={handleQuickCreateTask} className="space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
                  Judul Tugas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Membuat BPMN Fitur Checkout..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 focus:border-amber-500 bg-white rounded-xl text-xs font-mono focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
                  Pilih Pod Fungsional *
                </label>
                <select
                  value={newPod}
                  onChange={e => setNewPod(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 focus:border-amber-500 bg-white rounded-xl text-xs font-mono focus:outline-hidden"
                >
                  <option value="BUSINESS_ANALYST">Pod BA (Business Analyst)</option>
                  <option value="PRODUCT_BUILDER">Pod PB (Product Builder)</option>
                  <option value="QA_DOCUMENTATION">Pod QA (QA & Documentation)</option>
                  <option value="GROWTH_MARKETING">Pod MG (Growth Marketing)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
                  Assignee (Anak SMK PKL)
                </label>
                <select
                  value={newAssigneeId}
                  onChange={e => setNewAssigneeId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 focus:border-amber-500 bg-white rounded-xl text-xs font-mono focus:outline-hidden"
                >
                  <option value="">-- Pilih Anak SMK --</option>
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.pod_label || 'Pod'})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
                  Deskripsi / Kriteria Output (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Tuliskan kriteria output spesifik..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 focus:border-amber-500 bg-white rounded-xl text-xs font-sans focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className={`w-full py-3 px-4 font-mono font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all ${
                newTitle.trim()
                  ? 'bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Simpan & Tugaskan Ke Pod</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
