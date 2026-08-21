import React from 'react';
import { CheckCircle2, Send, AlertTriangle, ExternalLink, Check } from 'lucide-react';
import { Workspace, MemberTask, ProjectLink } from '../../types';

interface MemberDashboardProps {
  currentWorkspace: Workspace | null;
  activeTask: MemberTask | null;
  memberTasksList: MemberTask[];
  selectedTaskId: string | null;
  onSelectTask: (task: MemberTask) => void;
  taskStatus: 'Dalam Pengerjaan' | 'Sedang Ditinjau PO' | 'Terkendala (Blocker)' | 'Perlu Revisi';
  taskTitle: string;
  userName: string;
  getRelativeDeadlineString: (isoString?: string) => { text: string; status: string } | null;
  completedDodCount: number;
  totalDodCount: number;
  dodItems: { id: number; text: string; checked: boolean; is_checked?: boolean }[];
  onToggleDod: (id: number) => void;
  deliverableUrl: string;
  setDeliverableUrl: (url: string) => void;
  submittedUrl: string | null;
  onSubmitDeliverable: (e: React.FormEvent) => void;
  isAllDoDCompleted: boolean;
  onOpenReportBlockerModal: () => void;
  projectLinks: ProjectLink[];
  renderLinkIcon: (title: string, iconType?: string) => React.ReactNode;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  currentWorkspace,
  activeTask,
  memberTasksList,
  selectedTaskId,
  onSelectTask,
  taskStatus,
  taskTitle,
  userName,
  getRelativeDeadlineString,
  completedDodCount,
  totalDodCount,
  dodItems,
  onToggleDod,
  deliverableUrl,
  setDeliverableUrl,
  submittedUrl,
  onSubmitDeliverable,
  isAllDoDCompleted,
  onOpenReportBlockerModal,
  projectLinks,
  renderLinkIcon,
}) => {
  // Calculated status flags for active task
  const isCurrentBlocked = activeTask?.status === 'blocked' || activeTask?.is_blocked;
  const isCurrentRevision = activeTask?.status === 'in_progress' && Boolean(activeTask?.revision_note);
  const isCurrentReview = ['review', 'in_review', 'UNDER_REVIEW'].includes(activeTask?.status || '');

  // Dynamic ambient glow & gradient for main active task card
  const cardBgClass = isCurrentBlocked
    ? 'border-rose-500/30 bg-gradient-to-b from-rose-950/25 via-zinc-950/80 to-zinc-950/90 shadow-[0_0_35px_rgba(244,63,94,0.15)]'
    : isCurrentRevision
      ? 'border-amber-500/30 bg-gradient-to-b from-amber-950/25 via-zinc-950/80 to-zinc-950/90 shadow-[0_0_35px_rgba(245,158,11,0.15)]'
      : isCurrentReview
        ? 'border-white/15 bg-zinc-950/80'
        : 'border-white/10 bg-white/5';

  return (
    <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 my-auto font-sans transition-all duration-300 ease-in-out">
      
      {/* GRID KIRI (7 Kolom di Desktop / 1 Kolom di Mobile & Tablet) */}
      <div className="lg:col-span-7 flex flex-col justify-between gap-6 transition-all duration-300 ease-in-out">
        
        {/* TOP ROW KIRI: 2 Kartu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* KARTU KIRI ATAS: TASK STACK SELECTOR & DETAIL BRIEF MEMBER */}
          {memberTasksList.length === 0 ? (
            /* EMPTY STATE: TIDAK ADA TUGAS AKTIF */
            <div className="rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between min-h-[280px] hover:border-white/20 transition-all duration-300 ease-in-out font-sans">
              <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                <span>Tugas Aktif</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-400 font-medium">
                  Standby
                </span>
              </div>

              <div className="text-center my-auto py-4 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6 text-zinc-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-white tracking-tight leading-snug">
                    Semua tugas selesai di workspace {currentWorkspace?.name || 'ini'}.
                  </h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xs mx-auto">
                    Tunggu instruksi tugas berikutnya dari Project Owner / Lead.
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 text-center pt-2 border-t border-white/5 font-sans">
                SyncFlow Status: Standby ({currentWorkspace?.name})
              </div>
            </div>
          ) : (
            /* KARTU TASK STACK SELECTOR & DETAIL BRIEF DENGAN DYNAMIC AMBIENT GLOW */
            <div className={`rounded-[32px] backdrop-blur-2xl border p-6 shadow-xl flex flex-col justify-between min-h-[280px] hover:border-white/20 transition-all duration-300 ease-in-out space-y-3 font-sans ${cardBgClass}`}>
              <div>
                {/* 1. TASK STACK SELECTOR */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                    <span>Daftar Tugas Aktif</span>
                    <span className="font-mono text-white/80">{memberTasksList.length} Tugas</span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
                    {memberTasksList.map((task) => {
                      const isSelected = task.id === activeTask?.id;
                      const isRevision = task.status === 'in_progress' && Boolean(task.revision_note);
                      const isReview = ['review', 'in_review', 'UNDER_REVIEW'].includes(task.status);
                      const isBlocked = task.status === 'blocked' || task.is_blocked;

                      const stackItemBgClass = isSelected
                        ? isBlocked
                          ? 'bg-rose-900/40 border-rose-500/50 text-white shadow-md'
                          : isRevision
                            ? 'bg-amber-900/40 border-amber-500/50 text-white shadow-md'
                            : 'bg-white/15 border-white/40 text-white shadow-md'
                        : isBlocked
                          ? 'bg-rose-950/20 border-rose-500/30 text-rose-200 hover:bg-rose-950/30'
                          : isRevision
                            ? 'bg-amber-950/20 border-amber-500/30 text-amber-200 hover:bg-amber-950/30'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white';

                      const badgeClass = isRevision
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isReview
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : isBlocked
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-white/10 text-white/80';

                      return (
                        <div
                          key={task.id}
                          onClick={() => onSelectTask(task)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs font-sans ${stackItemBgClass}`}
                        >
                          <div className="truncate max-w-[170px] sm:max-w-[210px]">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="font-semibold block truncate text-xs">{task.title}</span>
                              {(task.priority === 'urgent' || task.priority === 'URGENT' || task.priority === 'HIGH' || task.priority === 'CRITICAL') && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold tracking-wider uppercase shrink-0">
                                  🔥 Urgent
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-white/40 block mt-0.5">
                              {task.checklist?.length || 0} Poin Checklist DoD
                            </span>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${badgeClass}`}>
                            {isRevision ? 'Revisi' : isReview ? 'Review' : isBlocked ? 'Kendala' : 'Aktif'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. DETAIL BRIEF TUGAS TERPILIH */}
                {activeTask && (
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                      <span className="text-[11px] font-semibold tracking-wider text-white/60 uppercase">Detail Tugas</span>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold uppercase transition-colors duration-300 ${
                        isCurrentRevision
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : isCurrentBlocked
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : isCurrentReview
                              ? 'bg-white/10 text-white border-white/20'
                              : 'bg-white/5 text-zinc-400 border-white/10'
                      }`}>
                        {taskStatus}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-white tracking-tight leading-snug">
                      {taskTitle}
                    </h2>

                    {/* BADGE DEADLINE RELATIF WAKTU */}
                    {activeTask?.due_date && (() => {
                      const rel = getRelativeDeadlineString(activeTask.due_date);
                      if (!rel) return null;

                      return (
                        <div className="pt-0.5">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium tracking-tight font-sans transition-colors duration-300 ${
                            rel.status === 'overdue'
                              ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                              : rel.status === 'urgent'
                                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                                : 'bg-white/5 border border-white/10 text-white/70'
                          }`}>
                            <span>{rel.text}</span>
                          </span>
                        </div>
                      );
                    })()}

                    {/* TAMPILKAN DESKRIPSI BRIEF DI DASHBOARD MEMBER */}
                    {activeTask?.description && (
                      <div className="my-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80 leading-relaxed whitespace-pre-line font-sans">
                        <span className="text-white/40 block font-medium mb-1 uppercase tracking-wider text-[10px]">Brief Tugas:</span>
                        {activeTask.description}
                      </div>
                    )}

                    {/* PO Feedback Action Cards in Member Dashboard */}
                    {activeTask?.revision_note && (
                      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-xs text-amber-200 font-sans space-y-1">
                        <div className="font-semibold text-amber-300 text-[11px] flex items-center gap-1">
                          <span>⚠️ Catatan Revisi PO:</span>
                        </div>
                        <p className="text-amber-100 text-[11px] leading-relaxed">
                          {activeTask.revision_note}
                        </p>
                      </div>
                    )}

                    {/* KARTU SOLUSI PO */}
                    {activeTask?.resolution_note && (
                      <div className="my-3 rounded-2xl border border-white/10 bg-neutral-900/90 p-3.5 space-y-2 text-xs font-sans">
                        {activeTask.blocker_reason && (
                          <div>
                            <span className="text-zinc-400 block font-medium text-[10px] uppercase tracking-wider">
                              Kendala yang Kamu Laporkan:
                            </span>
                            <p className="text-zinc-300 mt-0.5 line-through decoration-zinc-500 text-[11px]">
                              {activeTask.blocker_reason}
                            </p>
                          </div>
                        )}

                        {activeTask.blocker_reason && <div className="border-t border-white/10" />}

                        <div>
                          <span className="text-white block font-semibold text-[11px] flex items-center gap-1.5">
                            💡 Solusi / Arahan PO:
                          </span>
                          <p className="text-zinc-200 font-normal mt-0.5 text-xs leading-relaxed">
                            {activeTask.resolution_note}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* HEADER & LABEL DOD (DEFINITION OF DONE) */}
                    <div className="mt-4 mb-2 flex items-center justify-between border-t border-white/5 pt-3 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold tracking-wider text-white/60 uppercase">Checklist DoD</span>
                        <span className="text-[10px] text-white/30">(Definition of Done)</span>
                      </div>
                      <span className="text-[11px] font-medium text-white/40">
                        {completedDodCount}/{totalDodCount} Selesai
                      </span>
                    </div>

                    {/* Render Array Checklist (DoD) dengan Realtime State */}
                    <div className="space-y-1.5 text-xs font-sans">
                      {dodItems.length === 0 ? (
                        <p className="text-[11px] text-white/40 italic py-1">Tidak ada poin checklist DoD untuk tugas ini.</p>
                      ) : (
                        dodItems.map(item => (
                          <div
                            key={item.id}
                            onClick={() => onToggleDod(item.id)}
                            className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 rounded-xl hover:bg-white/5 transition-colors duration-300"
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0 ${
                              item.checked 
                                ? 'bg-white border-white text-zinc-950' 
                                : 'border-zinc-500 bg-transparent'
                            }`}>
                              {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className={`text-xs transition-colors duration-300 ${item.checked ? 'line-through text-white/40' : 'text-zinc-200'}`}>
                              {item.text}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KARTU TENGAH ATAS (FORM PENYERAHAN TUGAS TERPILIH) */}
          <div className="rounded-[32px] bg-white text-zinc-950 p-6 shadow-xl flex flex-col justify-between min-h-[280px] hover:scale-[1.01] transition-all duration-300 ease-in-out font-sans">
            <div className="space-y-1">
              <span className="text-xs font-medium text-zinc-500">
                Penyerahan Tugas
              </span>
              <h3 className="text-base font-bold text-zinc-950 tracking-tight">
                {!activeTask
                  ? 'Kirim Hasil Tugas'
                  : isCurrentRevision
                    ? 'Kirim Hasil Revisi'
                    : isCurrentBlocked
                      ? 'Kendala Aktif'
                      : 'Kirim Hasil Tugas'}
              </h3>
            </div>

            {/* Form Input Clean & Lock / Validation Logic */}
            <form onSubmit={onSubmitDeliverable} className="space-y-3 my-auto py-2 font-sans">
              {!activeTask ? (
                /* EMPTY STATE INPUT FORM TERKUNCI */
                <input
                  type="text"
                  disabled
                  placeholder="Menunggu tugas aktif..."
                  className="w-full px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-2xl text-xs text-zinc-400 placeholder-zinc-400 cursor-not-allowed font-sans"
                />
              ) : isCurrentReview ? (
                <div className="space-y-2">
                  <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-2xl text-xs space-y-1 font-sans">
                    <div className="font-semibold text-zinc-700 text-[11px]">Deliverable Terkirim:</div>
                    <a href={submittedUrl || deliverableUrl || '#'} target="_blank" rel="noreferrer" className="text-zinc-900 underline truncate block font-medium">
                      {submittedUrl || deliverableUrl || 'Link Tugas'}
                    </a>
                  </div>
                  <p className="text-[11px] text-zinc-600 font-sans leading-relaxed bg-zinc-100/70 p-2.5 rounded-xl border border-zinc-200">
                    Tugas ini sedang ditinjau PO. Anda bisa memilih tugas lain di daftar sebelah kiri untuk mulai mengerjakannya.
                  </p>
                </div>
              ) : isCurrentBlocked ? (
                <div className="space-y-2">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1 font-sans text-rose-950">
                    <div className="font-semibold text-rose-800 text-[11px] flex items-center gap-1">
                      <span>🚨 Status Task: Terkendala (Blocker)</span>
                    </div>
                    <p className="text-rose-700 text-[11px] leading-relaxed">
                      {activeTask.blocker_reason || 'Kendala telah dilaporkan ke PO. Menunggu solusi arahan.'}
                    </p>
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="Link tugas..."
                  value={deliverableUrl}
                  onChange={e => setDeliverableUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-800 transition-colors duration-300 disabled:opacity-50 font-sans"
                />
              )}

              <button
                type="submit"
                disabled={!activeTask || isCurrentReview || isCurrentBlocked || !isAllDoDCompleted}
                className={`w-full py-2.5 text-xs rounded-full shadow-md flex items-center justify-center gap-2 transition-all duration-300 ease-in-out ${
                  !activeTask || isCurrentReview || !isAllDoDCompleted
                    ? isCurrentBlocked
                      ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white font-bold shadow-[0_0_20px_rgba(244,63,94,0.3)] cursor-not-allowed opacity-90'
                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    : isCurrentRevision
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 hover:from-amber-300 hover:to-amber-400 font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer'
                      : 'bg-zinc-950 hover:bg-zinc-800 text-white font-medium cursor-pointer shadow-md'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {!activeTask
                    ? 'Belum Ada Tugas'
                    : isCurrentReview
                      ? 'Sedang Ditinjau PO'
                      : isCurrentBlocked
                        ? '🚨 Kendala Aktif (Menunggu Arahan PO)'
                        : isCurrentRevision
                          ? '🚀 Kirim Hasil Revisi'
                          : 'Kirim Hasil Tugas'}
                </span>
              </button>

              {/* Helper text jika DoD belum lengkap */}
              {activeTask && !isCurrentReview && !isCurrentBlocked && !isAllDoDCompleted && (
                <p className="text-[10px] text-zinc-500 text-center font-sans font-medium pt-0.5">
                  Selesaikan semua checklist ({completedDodCount}/{totalDodCount}) untuk menyerahkan tugas.
                </p>
              )}
            </form>

            {/* Tombol Laporkan Kendala */}
            <div className="pt-2 border-t border-zinc-100 font-sans">
              <button
                type="button"
                onClick={onOpenReportBlockerModal}
                disabled={!activeTask}
                className={`w-full py-2 border text-xs rounded-full transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  !activeTask
                    ? 'border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed'
                    : isCurrentBlocked
                      ? 'border-rose-500/40 bg-rose-950/40 text-rose-300 font-bold shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:bg-rose-900/50 cursor-pointer'
                      : 'border-zinc-300 hover:bg-zinc-100 text-zinc-800 font-medium cursor-pointer'
                }`}
              >
                <AlertTriangle className={`w-3.5 h-3.5 ${!activeTask ? 'text-zinc-400' : isCurrentBlocked ? 'text-rose-400' : 'text-zinc-600'}`} />
                <span>{isCurrentBlocked ? '🚨 Kendala Aktif (Update Detail)' : '🚨 Laporkan Kendala'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* AREA BAWAH KIRI (Header Teks Sapaan Otomatis & Subtitle Dinamis Target) */}
        <div className="space-y-2 pt-2 font-sans transition-all duration-300 ease-in-out">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Halo, {userName}
          </h1>
          <p className="text-base text-zinc-400 font-sans">
            {activeTask
              ? `Target (${currentWorkspace?.name}): ${taskTitle}`
              : `Workspace: ${currentWorkspace?.name || 'Utama'} • Standby`}
          </p>
        </div>

      </div>

      {/* GRID KANAN (5 Kolom di Desktop / 1 Kolom di Mobile & Tablet - DYNAMIC PROJECT LINKS MEMBER READ-ONLY) */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-6 font-sans transition-all duration-300 ease-in-out">
        
        {/* KARTU KANAN (Aset Tim Workspace) */}
        <div className="rounded-[36px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between flex-1 min-h-[280px] hover:border-white/20 transition-all duration-300 ease-in-out font-sans">
          
          <div className="space-y-1">
            <span className="text-xs font-medium text-zinc-400">
              Aset Tim ({currentWorkspace?.name})
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">
              Tautan Utama ({projectLinks.length})
            </h3>
          </div>

          {/* Dynamic Links List (Read-Only for Member) */}
          <div className="space-y-3 pt-4 flex-1">
            {projectLinks.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">Belum ada tautan tim di workspace ini.</p>
            ) : (
              projectLinks.map(link => (
                <a
                  key={link.id || link.title}
                  href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center justify-between transition-all duration-300 ease-in-out group/link"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-zinc-300">
                      {renderLinkIcon(link.title, link.icon_type)}
                    </div>
                    <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-[260px]">
                      {link.title}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500 group-hover/link:text-white transition-colors duration-300 shrink-0" />
                </a>
              ))
            )}
          </div>

          <div className="text-xs text-zinc-500 text-center pt-2 border-t border-white/5 font-sans">
            SyncFlow Dashboard ({currentWorkspace?.name})
          </div>

        </div>

      </div>

    </main>
  );
};
