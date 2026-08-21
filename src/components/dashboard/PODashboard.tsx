import React from 'react';
import { 
  Activity, Sparkles, Edit3, AlertTriangle, RotateCcw, Clock, ExternalLink, 
  CheckCircle, Plus, Check, Send, UserPlus 
} from 'lucide-react';
import { Workspace, MemberTask, ProjectLink } from '../../types';

interface PODashboardProps {
  currentWorkspace: Workspace | null;
  allTasks: MemberTask[];
  filteredMasterTasks: MemberTask[];
  poTaskFeedFilter: 'active' | 'done';
  setPoTaskFeedFilter: (filter: 'active' | 'done') => void;
  userName: string;
  isPoOrPlRole: boolean;
  onOpenEditTaskModal: (task: MemberTask) => void;
  onOpenResolveBlockerModal: (taskId: string) => void;
  onAcceptReview: (taskId: string) => void;
  onOpenRevisionModal: (taskId: string) => void;

  // Bagi Tugas Baru Form Props
  selectedAssigneeId: string;
  setSelectedAssigneeId: (id: string) => void;
  isLoadingAssignees: boolean;
  assigneeList: any[];
  taskTitleInputRef: React.RefObject<HTMLInputElement | null>;
  newAssignTaskTitle: string;
  setNewAssignTaskTitle: (title: string) => void;
  newAssignDescription: string;
  setNewAssignDescription: (desc: string) => void;
  newAssignDueDate: string;
  setNewAssignDueDate: (date: string) => void;
  newAssignPriority: 'normal' | 'urgent';
  setNewAssignPriority: (priority: 'normal' | 'urgent') => void;
  dodPoints: string[];
  onApplyDeadlinePreset: (daysOffset: number, targetForm: 'create' | 'edit') => void;
  onAddDodPoint: () => void;
  onRemoveDodPoint: (index: number) => void;
  onDodPointChange: (index: number, value: string) => void;
  onCreateNewTask: (e: React.FormEvent) => void;
  isTaskSubmitSuccess: boolean;

  // Right Column Metrics & Links Props
  activeTasksCount: number;
  blockedTasksCount: number;
  doneTasksCount: number;
  projectLinks: ProjectLink[];
  onOpenManageMembersModal: () => void;
  onOpenManageLinksModal: () => void;
  renderLinkIcon: (title: string, iconType?: string) => React.ReactNode;
  formatDeadline: (isoString?: string) => string | null;
  getDeadlineStatus: (isoString?: string) => string | null;
}

export const PODashboard: React.FC<PODashboardProps> = ({
  currentWorkspace,
  allTasks,
  filteredMasterTasks,
  poTaskFeedFilter,
  setPoTaskFeedFilter,
  userName,
  isPoOrPlRole,
  onOpenEditTaskModal,
  onOpenResolveBlockerModal,
  onAcceptReview,
  onOpenRevisionModal,
  selectedAssigneeId,
  setSelectedAssigneeId,
  isLoadingAssignees,
  assigneeList,
  taskTitleInputRef,
  newAssignTaskTitle,
  setNewAssignTaskTitle,
  newAssignDescription,
  setNewAssignDescription,
  newAssignDueDate,
  setNewAssignDueDate,
  newAssignPriority,
  setNewAssignPriority,
  dodPoints,
  onApplyDeadlinePreset,
  onAddDodPoint,
  onRemoveDodPoint,
  onDodPointChange,
  onCreateNewTask,
  isTaskSubmitSuccess,
  activeTasksCount,
  blockedTasksCount,
  doneTasksCount,
  projectLinks,
  onOpenManageMembersModal,
  onOpenManageLinksModal,
  renderLinkIcon,
  formatDeadline,
  getDeadlineStatus,
}) => {
  // Set ID tugas yang sedang dibuka detailnya (default: hanya tugas dengan Blocker atau Review yang otomatis terbuka)
  const [expandedTaskIds, setExpandedTaskIds] = React.useState<Set<string>>(new Set());

  // Auto-expand Blocker atau Review task saat list berubah
  React.useEffect(() => {
    if (filteredMasterTasks.length > 0) {
      const autoExpanded = new Set<string>();
      filteredMasterTasks.forEach(t => {
        const isBlocked = t.status === 'blocked' || t.is_blocked;
        const isReview = ['review', 'in_review', 'UNDER_REVIEW'].includes(t.status);
        if ((isBlocked || isReview) && t.id) {
          autoExpanded.add(t.id);
        }
      });
      setExpandedTaskIds(autoExpanded);
    }
  }, [filteredMasterTasks]);

  // Helper toggle buka/tutup satu kartu
  const toggleTaskExpand = (taskId: string) => {
    setExpandedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  // Helper buka semua / tutup semua kartu
  const toggleExpandAll = () => {
    if (expandedTaskIds.size === filteredMasterTasks.length) {
      setExpandedTaskIds(new Set()); // Tutup semua (minimize all)
    } else {
      setExpandedTaskIds(new Set(filteredMasterTasks.map(t => t.id || '').filter(Boolean))); // Buka semua
    }
  };

  return (
    <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 my-auto font-sans transition-all duration-300 ease-in-out">
      
      {/* ========================================================================= */}
      {/* KOLOM 1 (KIRI - LEBAR - 5 KOLOM): RADAR & STATUS TIM (MASTER TASK FEED) */}
      {/* ========================================================================= */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-6 transition-all duration-300 ease-in-out">
        
        <div className="rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between flex-1 min-h-[460px] hover:border-white/20 transition-all duration-300 ease-in-out font-sans">
          <div className="space-y-4">
            {/* Header & Tab Feed Switcher */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Activity className="w-4 h-4 text-zinc-300" />
                  <span>Radar Tim ({currentWorkspace?.name})</span>
                </div>

                <div className="flex items-center gap-2">
                  {filteredMasterTasks.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleExpandAll}
                      className="text-[10px] text-white/50 hover:text-white px-2 py-0.5 rounded-lg border border-white/10 bg-white/5 transition-all cursor-pointer font-sans font-medium"
                    >
                      {expandedTaskIds.size === filteredMasterTasks.length ? 'Minimize Semua' : 'Buka Semua'}
                    </button>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] text-zinc-300 font-medium font-sans">
                    {allTasks.length} Total
                  </span>
                </div>
              </div>

              {/* MONOCHROME TAB TOGGLE: Aktif & Review vs Selesai */}
              <div className="flex items-center p-1 bg-neutral-950 border border-white/10 rounded-2xl text-xs font-sans">
                <button
                  onClick={() => setPoTaskFeedFilter('active')}
                  className={`flex-1 py-1.5 rounded-xl font-medium text-[11px] transition-all duration-300 ease-in-out cursor-pointer ${
                    poTaskFeedFilter === 'active'
                      ? 'bg-white text-zinc-950 font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Aktif & Review ({allTasks.filter(t => t.status !== 'done').length})
                </button>
                <button
                  onClick={() => setPoTaskFeedFilter('done')}
                  className={`flex-1 py-1.5 rounded-xl font-medium text-[11px] transition-all duration-300 ease-in-out cursor-pointer ${
                    poTaskFeedFilter === 'done'
                      ? 'bg-white text-zinc-950 font-bold shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Selesai ({allTasks.filter(t => t.status === 'done').length})
                </button>
              </div>
            </div>

            {/* EMPTY STATE PADA FEED PO (TAB AKTIF & REVIEW KOSONG) */}
            {filteredMasterTasks.length === 0 ? (
              <div className="p-8 text-center bg-neutral-900/60 border border-white/10 rounded-2xl text-xs text-zinc-400 space-y-2 my-auto font-sans transition-all duration-300 ease-in-out">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white mx-auto shadow-xs">
                  <Sparkles className="w-5 h-5 text-zinc-300" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-white text-xs">
                    {poTaskFeedFilter === 'active' ? 'Semua tugas aktif beres.' : 'Belum ada tugas selesai.'}
                  </p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xs mx-auto">
                    {poTaskFeedFilter === 'active'
                      ? 'Tidak ada kendala aktif maupun antrean deliverable yang menunggu review.'
                      : 'Tugas yang di-ACC akan tercatat di tab ini.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {filteredMasterTasks.map(t => {
                  const isExpanded = expandedTaskIds.has(t.id || '');
                  const completedDod = t.checklist?.filter((c: any) => c.checked || c.is_checked).length || 0;
                  const totalDod = t.checklist?.length || 0;
                  const isBlocked = t.status === 'blocked' || t.is_blocked;
                  const isReview = ['review', 'in_review', 'UNDER_REVIEW'].includes(t.status);
                  const isDone = t.status === 'done';
                  const deliverableContent = t.deliverable_link || t.deliverable_url || '';

                  return (
                    <div
                      key={t.id}
                      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isBlocked 
                          ? 'border-rose-500/40 bg-gradient-to-b from-rose-950/20 to-neutral-900/90 shadow-[0_0_20px_rgba(244,63,94,0.1)]' 
                          : isReview 
                            ? 'border-amber-500/30 bg-neutral-900/90 shadow-md'
                            : 'border-white/10 bg-neutral-900/70 hover:border-white/20'
                      }`}
                    >
                      {/* BARIS HEADER KARTU (SELALU MUNCUL & BISA DIKLIK UNTUK MINIMIZE / EXPAND) */}
                      <div
                        onClick={() => t.id && toggleTaskExpand(t.id)}
                        className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate max-w-[65%]">
                          <span className={`text-[10px] text-zinc-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-xs">{t.profiles?.full_name || 'Member Tim'}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-white/50">{t.profiles?.pod || 'Umum'}</span>
                              {(t.priority === 'urgent' || t.priority === 'URGENT' || t.priority === 'HIGH' || t.priority === 'CRITICAL') && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">🔥 URGENT</span>
                              )}
                            </div>
                            <span className="text-[11px] text-zinc-300 truncate block font-medium mt-0.5">{t.title}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Status Mini Pill */}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isBlocked ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            isReview ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                            isDone ? 'bg-white/10 text-white' : 'bg-white/5 text-zinc-400'
                          }`}>
                            {isBlocked ? '🚨 Blocker' : isReview ? '⏳ Butuh Review' : isDone ? '✓ Selesai' : `${completedDod}/${totalDod} DoD`}
                          </span>

                          {/* Tombol Edit Task */}
                          {isPoOrPlRole && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenEditTaskModal(t);
                              }}
                              className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                              title="Edit Detail"
                            >
                              <Edit3 className="w-3 h-3"/>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* KONTEN DETAIL KARTU (HANYA MUNCUL KETIKA EXPANDED) */}
                      {isExpanded && (
                        <div className="p-4 pt-1 border-t border-white/5 space-y-3 text-xs">
                          {/* Brief Deskripsi */}
                          {t.description && (
                            <div className="text-[11px] text-zinc-300 bg-white/5 p-2.5 rounded-xl border border-white/5 font-sans leading-relaxed whitespace-pre-line">
                              <span className="text-[9px] text-zinc-500 uppercase font-bold block mb-0.5">Brief:</span>
                              {t.description}
                            </div>
                          )}

                          {/* Checklist DoD Detail */}
                          {t.checklist && Array.isArray(t.checklist) && t.checklist.length > 0 && (
                            <div className="space-y-1.5 rounded-xl bg-neutral-950 p-2.5 text-[11px] border border-white/10 font-sans">
                              <div className="flex items-center justify-between text-zinc-400 text-[10px] pb-1 border-b border-white/5 font-medium">
                                <span>Checklist DoD ({completedDod}/{totalDod})</span>
                                {completedDod < totalDod ? (
                                  <span className="text-zinc-300 font-semibold flex items-center gap-1">
                                    ⚠️ DoD Belum Lengkap
                                  </span>
                                ) : (
                                  <span className="text-white font-medium flex items-center gap-1">
                                    ✓ DoD Lengkap
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1 pt-0.5">
                                {t.checklist.map((item: any, idx: number) => {
                                  const isChecked = item.checked ?? item.is_checked ?? false;
                                  return (
                                    <div key={idx} className="flex items-center gap-2 text-zinc-300">
                                      <span className={isChecked ? 'text-white font-bold' : 'text-zinc-500'}>
                                        {isChecked ? '✓' : '○'}
                                      </span>
                                      <span className={isChecked ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                                        {item.text || item.label || `Poin ${idx + 1}`}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* TIMESTAMP PENGUMPULAN & PERBANDINGAN DI PO REVIEW */}
                          {t.submitted_at ? (
                            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-white/5 pt-2 font-sans">
                              <span>Diserahkan: {formatDeadline(t.submitted_at)}</span>
                              {t.due_date && new Date(t.submitted_at) > new Date(t.due_date) ? (
                                <span className="text-rose-400 font-medium">Terlambat</span>
                              ) : (
                                <span className="text-emerald-400 font-medium">✓ Tepat Waktu</span>
                              )}
                            </div>
                          ) : t.due_date ? (
                            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-white/5 pt-2 font-sans">
                              <span>Tenggat Waktu:</span>
                              <span className={getDeadlineStatus(t.due_date) === 'overdue' ? 'text-rose-400 font-medium' : 'text-zinc-300 font-medium'}>
                                {formatDeadline(t.due_date)}
                              </span>
                            </div>
                          ) : null}

                          {/* Action Buttons (Solusi Blocker / ACC / Minta Revisi) */}
                          {isBlocked ? (
                            <div className="space-y-2 pt-1 border-t border-white/5">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded-md bg-neutral-800 border border-white/15 text-[10px] text-zinc-300 font-semibold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-zinc-400" />
                                  <span>🚨 Blocker</span>
                                </span>
                                <button
                                  onClick={() => t.id && onOpenResolveBlockerModal(t.id)}
                                  className="px-3 py-1 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-[11px] rounded-full transition-all duration-300 cursor-pointer flex items-center gap-1"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Selesaikan</span>
                                </button>
                              </div>
                              <p className="text-[11px] text-zinc-300 bg-white/5 p-2 rounded-xl border border-white/5">
                                {t.blocker_reason || 'Terjadi kendala teknis'}
                              </p>
                            </div>
                          ) : isReview ? (
                            <div className="space-y-2 pt-1 border-t border-white/5">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-[10px] text-white font-semibold flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-zinc-300" />
                                  <span>⏳ Butuh Review</span>
                                </span>
                              </div>

                              {deliverableContent && (
                                <div className="p-2.5 bg-neutral-950 border border-white/10 rounded-xl space-y-1.5 font-sans">
                                  <span className="text-[10px] text-zinc-400 font-medium block uppercase tracking-wider">Hasil Kiriman Member:</span>
                                  {deliverableContent.startsWith('http://') || deliverableContent.startsWith('https://') ? (
                                    <a
                                      href={deliverableContent}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors border border-white/10"
                                    >
                                      <span>Buka Link Hasil Kerja</span>
                                      <ExternalLink className="w-3 h-3 text-white shrink-0" />
                                    </a>
                                  ) : (
                                    <blockquote className="p-2.5 bg-neutral-900 border-l-2 border-white/30 text-xs text-zinc-300 rounded-r-xl italic leading-relaxed whitespace-pre-line font-sans">
                                      {deliverableContent}
                                    </blockquote>
                                  )}
                                </div>
                              )}

                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => t.id && onAcceptReview(t.id)}
                                  className="flex-1 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-full transition-all duration-300 cursor-pointer text-center text-[11px]"
                                >
                                  Terima (ACC)
                                </button>
                                <button
                                  onClick={() => t.id && onOpenRevisionModal(t.id)}
                                  className="flex-1 py-1.5 border border-white/20 hover:bg-white/10 text-white font-medium rounded-full transition-all duration-300 cursor-pointer text-center text-[11px]"
                                >
                                  Minta Revisi
                                </button>
                              </div>
                            </div>
                          ) : isDone ? (
                            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                              <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-[10px] text-white font-semibold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-white" />
                                <span>✅ Selesai</span>
                              </span>
                              <span className="text-zinc-500 text-[10px]">Telah di-ACC PO</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                                <Activity className="w-3 h-3 text-zinc-400" />
                                <span>⚡ Sedang Mengerjakan</span>
                              </span>
                              <span className="text-zinc-400 font-medium text-[10px]">
                                {completedDod}/{totalDod} DoD Selesai
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-xs text-zinc-500 text-center pt-2 border-t border-white/5 font-sans">
            SyncFlow Master Task Feed
          </div>
        </div>

        {/* AREA BAWAH KIRI (Header Teks Sapaan Personal Dinamis PO) */}
        <div className="space-y-2 pt-2 font-sans transition-all duration-300 ease-in-out">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Halo, {userName}
          </h1>
          <p className="text-base text-zinc-400 font-sans">
            Papan kontrol & radar tim untuk {currentWorkspace?.name || 'Workspace Utama'}.
          </p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* KOLOM 2 (TENGAH - PUTIH SOLID - 4 KOLOM): BAGI TUGAS BARU */}
      {/* ========================================================================= */}
      <div className="lg:col-span-4 flex flex-col justify-between transition-all duration-300 ease-in-out">
        
        <div className="rounded-[32px] bg-white text-zinc-950 p-6 shadow-xl flex flex-col justify-between flex-1 min-h-[460px] hover:scale-[1.01] transition-all duration-300 ease-in-out font-sans">
          <div className="space-y-1">
            <span className="text-xs font-medium text-zinc-500">
              Penugasan Workspace: {currentWorkspace?.name}
            </span>
            <h3 className="text-base font-bold text-zinc-950 tracking-tight">
              Bagi Tugas Baru
            </h3>
          </div>

          <form onSubmit={onCreateNewTask} className="space-y-3.5 my-auto py-2 font-sans">
            {/* Dropdown Select Member */}
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Pilih Anggota Tim</label>
              <select
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                disabled={isLoadingAssignees || assigneeList.length === 0}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-900 outline-hidden transition-all focus:border-zinc-400 focus:bg-white disabled:opacity-50 font-sans cursor-pointer"
              >
                {isLoadingAssignees ? (
                  <option value="">Memuat daftar tim...</option>
                ) : assigneeList.length === 0 ? (
                  <option value="">Belum ada anggota tim terdaftar...</option>
                ) : (
                  assigneeList.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name} — {member.pod} ({member.role.toUpperCase()})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Task Title Input with Ref for Auto-Focus */}
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Judul Tugas</label>
              <input
                ref={taskTitleInputRef}
                type="text"
                required
                placeholder="Nama tugas..."
                value={newAssignTaskTitle}
                onChange={e => setNewAssignTaskTitle(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-800 transition-colors duration-300 font-sans"
              />
            </div>

            {/* FORM INPUT DESKRIPSI TUGAS (PO VIEW - TENGAH) */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                Deskripsi / Brief Singkat
              </label>
              <textarea
                placeholder="Jelaskan detail brief atau konteks pengerjaan..."
                value={newAssignDescription}
                onChange={e => setNewAssignDescription(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 outline-hidden focus:border-zinc-400 min-h-[70px] resize-none font-sans"
              />
            </div>

            {/* INPUT DEADLINE DI FORM PO DENGAN PRESET TENGGAT WAKTU CEPAT */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                  Tenggat Waktu (Deadline)
                </label>
                <div className="flex items-center gap-1 font-sans">
                  <button
                    type="button"
                    onClick={() => onApplyDeadlinePreset(0, 'create')}
                    className="text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200 transition-colors duration-300 cursor-pointer"
                  >
                    Hari Ini (17:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyDeadlinePreset(1, 'create')}
                    className="text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200 transition-colors duration-300 cursor-pointer"
                  >
                    Besok (17:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyDeadlinePreset(3, 'create')}
                    className="text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200 transition-colors duration-300 cursor-pointer"
                  >
                    3 Hari
                  </button>
                </div>
              </div>
              <input
                type="datetime-local"
                value={newAssignDueDate}
                onChange={e => setNewAssignDueDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-400 transition-colors duration-300 font-sans [color-scheme:light]"
              />
            </div>

            {/* TOGGLE PILIHAN PRIORITAS TUGAS */}
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                Prioritas Tugas
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewAssignPriority('normal')}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    newAssignPriority === 'normal'
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                      : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                  }`}
                >
                  📌 Normal
                </button>
                <button
                  type="button"
                  onClick={() => setNewAssignPriority('urgent')}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    newAssignPriority === 'urgent'
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                      : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                  }`}
                >
                  🔥 Urgent
                </button>
              </div>
            </div>

            {/* DYNAMIC DOD CHECKLIST LIST (MAX 10 POINTS) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                  Checklist DoD ({dodPoints.length}/10 Poin)
                </label>
                {dodPoints.length < 10 && (
                  <button
                    type="button"
                    onClick={onAddDodPoint}
                    className="text-[10px] font-bold text-zinc-900 hover:text-zinc-600 flex items-center gap-0.5 cursor-pointer transition-colors duration-300"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Tambah Poin</span>
                  </button>
                )}
              </div>

              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {dodPoints.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder={`DoD ${idx + 1}...`}
                      value={point}
                      onChange={e => onDodPointChange(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] text-zinc-900 font-sans focus:outline-hidden focus:border-zinc-800"
                    />
                    {dodPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveDodPoint(idx)}
                        className="w-6 h-6 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center cursor-pointer transition-colors duration-300 text-xs font-bold shrink-0"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedAssigneeId || !newAssignTaskTitle.trim()}
              className={`w-full py-3 font-bold text-xs rounded-full shadow-md flex items-center justify-center gap-2 transition-all duration-300 ease-in-out ${
                isTaskSubmitSuccess
                  ? 'bg-emerald-600 text-white cursor-default'
                  : selectedAssigneeId && newAssignTaskTitle.trim()
                    ? 'bg-zinc-950 hover:bg-zinc-800 text-white cursor-pointer'
                    : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {isTaskSubmitSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white animate-bounce" />
                  <span>✓ Tugas Terkirim</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Tugas ke Member</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* KOLOM 3 (KANAN - 3 KOLOM): DYNAMIC PROJECT LINKS (FULL CRUD) + MEMBER MANAGER */}
      {/* ========================================================================= */}
      <div className="lg:col-span-3 flex flex-col justify-between gap-6 font-sans transition-all duration-300 ease-in-out">
        
        <div className="rounded-[36px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between flex-1 min-h-[460px] hover:border-white/20 transition-all duration-300 ease-in-out font-sans">
          
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-zinc-400">
                Pusat Operasional
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">
                Aset & Referensi Tim
              </h3>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/10 text-center">
              <div className="space-y-0.5">
                <div className="text-lg font-bold text-white">{activeTasksCount}</div>
                <div className="text-[9px] text-zinc-400 uppercase font-medium tracking-wider">Aktif</div>
              </div>
              <div className="space-y-0.5 border-x border-white/10">
                <div className="text-lg font-bold text-white">{blockedTasksCount}</div>
                <div className="text-[9px] text-zinc-400 uppercase font-medium tracking-wider">Kendala</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-lg font-bold text-white">{doneTasksCount}</div>
                <div className="text-[9px] text-zinc-400 uppercase font-medium tracking-wider">Done</div>
              </div>
            </div>

            {/* Dynamic Master Quick Links & Edit Button */}
            <div className="space-y-2.5 pt-2 font-sans">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-medium text-zinc-400 tracking-wider">
                  Tautan Workspace ({projectLinks.length})
                </span>
                {isPoOrPlRole && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenManageMembersModal}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>+ Anggota</span>
                    </button>
                    <button
                      onClick={onOpenManageLinksModal}
                      className="text-[10px] text-zinc-300 hover:text-white underline cursor-pointer font-medium"
                    >
                      Tautan
                    </button>
                  </div>
                )}
              </div>

              {projectLinks.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">Belum ada tautan di workspace ini.</p>
              ) : (
                projectLinks.map(link => (
                  <a
                    key={link.id || link.title}
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center justify-between transition-all duration-300 ease-in-out group/link"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-zinc-300">
                        {renderLinkIcon(link.title, link.icon_type)}
                      </div>
                      <span className="font-semibold text-white text-xs truncate max-w-[140px] sm:max-w-[180px]">
                        {link.title}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover/link:text-white transition-colors duration-300 shrink-0" />
                  </a>
                ))
              )}
            </div>
          </div>

          <div className="text-xs text-zinc-500 text-center pt-2 border-t border-white/5 font-sans">
            SyncFlow PO Control Center
          </div>

        </div>

      </div>

    </main>
  );
};
