import React from 'react';
import { 
  Activity, Sparkles, Edit3, AlertTriangle, RotateCcw, Clock, ExternalLink, 
  CheckCircle, Plus, Check, Send, UserPlus, Maximize2, Minimize2 
} from 'lucide-react';
import { Workspace, MemberTask, ProjectLink, ActivityLog } from '../../types';
import { CustomGlassSelect, GlassSelectOption } from '../ui/CustomGlassSelect';
import { CustomGlassDatePicker } from '../ui/CustomGlassDatePicker';
import { CustomGlassRangeCalendar } from '../ui/CustomGlassRangeCalendar';

interface PODashboardProps {
  currentWorkspace: Workspace | null;
  allTasks: MemberTask[];
  activities?: ActivityLog[];
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
  assignTargetType: 'individual' | 'pod' | 'all';
  setAssignTargetType: (type: 'individual' | 'pod' | 'all') => void;
  selectedTargetPod: string;
  setSelectedTargetPod: (pod: string) => void;
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
  profile?: any;
  onOpenProfileModal?: () => void;
  activeSprint?: any;
  onOpenSprintModal?: () => void;
  totalDoDCount?: number;
  completedDoDCount?: number;
  sprintProgressPct?: number;
  calculateDaysLeft?: (targetDate: string) => number;
  isPlRole?: boolean;
  activeWorkspaceRole?: string;
  sprintStartDate?: string;
  setSprintStartDate?: (val: string) => void;
  sprintEndDate?: string;
  setSprintEndDate?: (val: string) => void;
  sprintGoalInput?: string;
  setSprintGoalInput?: (val: string) => void;
  handleSaveSprintMandate?: (e: React.FormEvent) => void;
  isSavingSprint?: boolean;
  sprintsList?: any[];
  setActiveSprint?: (sprint: any) => void;
  editingSprintId?: string | null;
  setEditingSprintId?: (id: string | null) => void;
  sprintBriefNotes?: string;
  setSprintBriefNotes?: (val: string) => void;
  sprintDocUrl?: string;
  setSprintDocUrl?: (val: string) => void;
  sprintDocName?: string;
  setSprintDocName?: (val: string) => void;
  isUploadingDoc?: boolean;
  handleSprintDocUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveSprint?: (targetStatus: 'draft' | 'active') => void;
}

export const PODashboard: React.FC<PODashboardProps> = ({
  currentWorkspace,
  allTasks,
  activities = [],
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
  assignTargetType,
  setAssignTargetType,
  selectedTargetPod,
  setSelectedTargetPod,
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
  profile,
  onOpenProfileModal,
  activeSprint,
  onOpenSprintModal,
  totalDoDCount = 0,
  completedDoDCount = 0,
  sprintProgressPct = 0,
  calculateDaysLeft = () => 0,
  isPlRole = false,
  activeWorkspaceRole = 'member',
  sprintStartDate = '',
  setSprintStartDate = () => {},
  sprintEndDate = '',
  setSprintEndDate = () => {},
  sprintGoalInput = '',
  setSprintGoalInput = () => {},
  handleSaveSprintMandate = () => {},
  isSavingSprint = false,
  sprintsList = [],
  setActiveSprint = () => {},
  editingSprintId = null,
  setEditingSprintId = () => {},
  sprintBriefNotes = '',
  setSprintBriefNotes = () => {},
  sprintDocUrl = '',
  setSprintDocUrl = () => {},
  sprintDocName = '',
  setSprintDocName = () => {},
  isUploadingDoc = false,
  handleSprintDocUpload = () => {},
  handleSaveSprint = () => {},
}) => {
  const isUserPL = isPlRole || activeWorkspaceRole === 'pl';
  const isUserPO = !isUserPL;

  // 1. Gabungkan data visual Gantt untuk Active vs Draft (Ghost Forecasting vs Live Active)
  const combinedGanttData = React.useMemo(() => {
    const isViewingDraft = activeSprint?.status === 'draft';
    const pods = ['Marketing', 'Product Builder', 'BA', 'UI/UX Designer', 'General'];
    const memberCount = Math.max(1, assigneeList.length);

    // Jika sedang membuka sprint DRAFT: Buat proyeksi visual forecasting
    if (isViewingDraft) {
      const estimatedSprintDays = Math.max(1, calculateDaysLeft(activeSprint.end_date));
      const projectedDoDPerPod = Math.round((estimatedSprintDays * memberCount * 1.5) / pods.length);

      return pods.map((pod) => ({
        pod,
        isDraft: true,
        totalTasks: Math.max(2, Math.round(projectedDoDPerPod / 3)),
        projectedDoD: projectedDoDPerPod,
        doneTasks: 0,
        blockedTasks: 0,
        progress: 0,
        forecastLabel: `Proyeksi ~${projectedDoDPerPod} DoD (${estimatedSprintDays} Hari)`
      }));
    }

    // Jika SPRINT AKTIF: Gunakan data live pengerjaan tim
    return pods.map((pod) => {
      const podTaskList = allTasks.filter((t) => (t.pod || 'General') === pod);
      const doneTasks = podTaskList.filter((t) => t.status === 'done').length;
      const blockedTasks = podTaskList.filter((t) => t.status === 'blocked' || t.is_blocked).length;
      const progress = podTaskList.length > 0 ? Math.round((doneTasks / podTaskList.length) * 100) : 0;

      return {
        pod,
        isDraft: false,
        totalTasks: podTaskList.length,
        doneTasks,
        blockedTasks,
        progress,
        forecastLabel: `${doneTasks}/${podTaskList.length} Tugas Selesai (${progress}%)`
      };
    }).filter((p) => p.totalTasks > 0 || !activeSprint);
  }, [activeSprint, allTasks, assigneeList.length, calculateDaysLeft]);

  // 2. Kalkulasi Smart Velocity Forecasting ETA
  const forecastingResult = React.useMemo(() => {
    if (!activeSprint || allTasks.length === 0) {
      return { status: 'standby', text: 'Menunggu PL membagikan tugas ke anggota tim...', etaDate: '-' };
    }

    const remainingDoD = Math.max(0, totalDoDCount - completedDoDCount);
    const activeMembersCount = Math.max(1, assigneeList.length);
    // Asumsi 1 member menyelesaikan ~1.5 DoD poin per hari kerja
    const estimatedDaysNeeded = Math.max(1, Math.ceil(remainingDoD / (activeMembersCount * 1.5)));

    const sprintDaysLeft = calculateDaysLeft(activeSprint.end_date);
    const isDelayRisk = estimatedDaysNeeded > sprintDaysLeft;

    return {
      status: isDelayRisk ? 'delay_risk' : 'on_track',
      estimatedDays: estimatedDaysNeeded,
      daysLeft: sprintDaysLeft,
      text: isDelayRisk
        ? `⚠️ Potensi Delay: Beban sisa ${remainingDoD} DoD butuh ~${estimatedDaysNeeded} hari, sisa sprint ${sprintDaysLeft} hari.`
        : `🟢 Optimal: Diprediksi selesai dalam ~${estimatedDaysNeeded} hari (Tepat Waktu).`
    };
  }, [activeSprint, allTasks, totalDoDCount, completedDoDCount, assigneeList.length, calculateDaysLeft]);

  // Set ID tugas yang sedang dibuka detailnya (default: hanya tugas dengan Blocker atau Review yang otomatis terbuka)
  const [expandedTaskIds, setExpandedTaskIds] = React.useState<Set<string>>(new Set());

  // Zen Focus Mode State for PO Task Drafting
  const [isPoFocusMode, setIsPoFocusMode] = React.useState<boolean>(false);

  // Tab State for Right Column Live Pulse Widget
  const [rightWidgetTab, setRightWidgetTab] = React.useState<'activity' | 'members'>('activity');

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

  const [isEditingSprint, setIsEditingSprint] = React.useState<boolean>(() => !activeSprint);

  React.useEffect(() => {
    if (!activeSprint) {
      setIsEditingSprint(true);
    }
  }, [activeSprint]);

  if (isUserPO) {
    const calculateSprintDays = () => {
      if (!sprintStartDate || !sprintEndDate) return 0;
      const diff = new Date(sprintEndDate).getTime() - new Date(sprintStartDate).getTime();
      return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
    };

    const sprintDays = calculateSprintDays();
    const memberCount = Math.max(1, assigneeList.length);
    const maxSafeDoDCapacity = sprintDays * memberCount * 2;

    return (
      <main className="w-full max-w-7xl mx-auto space-y-6 font-sans animate-in fade-in duration-300">

        {/* ROADMAP SPRINT CHIPS */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 font-sans">
          {sprintsList.map((s) => {
            const isSelected = activeSprint?.id === s.id;
            const isLiveActive = s.status === 'active';

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveSprint(s);
                  setEditingSprintId(s.id);
                  setSprintGoalInput(s.goal_title || '');
                  setSprintBriefNotes(s.brief_notes || '');
                  setSprintDocUrl(s.document_url || '');
                  setSprintDocName(s.document_name || '');
                  setSprintStartDate(s.start_date || '');
                  setSprintEndDate(s.end_date || '');
                  setIsEditingSprint(false);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border shrink-0 font-sans ${
                  isSelected
                    ? 'bg-white text-zinc-950 border-white shadow-lg'
                    : 'bg-neutral-950/60 text-zinc-400 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isLiveActive ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                <span className="truncate max-w-[160px] font-sans">{s.goal_title}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ${isLiveActive ? 'bg-emerald-500/20 text-emerald-700' : 'bg-amber-400/20 text-amber-700'}`}>
                  {s.status}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setEditingSprintId(null);
              setSprintGoalInput('');
              setSprintBriefNotes('');
              setSprintDocUrl('');
              setSprintDocName('');
              setSprintStartDate(new Date().toISOString().split('T')[0]);
              setSprintEndDate('');
              setIsEditingSprint(true);
            }}
            className="px-3.5 py-2 rounded-2xl border border-dashed border-white/20 hover:border-white/40 text-xs font-bold text-zinc-400 hover:text-white transition-colors shrink-0 cursor-pointer font-sans"
          >
            + Rancang Sprint Berikutnya
          </button>
        </div>

        {/* JIKA MODE EDIT SPRINT */}
        {isEditingSprint ? (
          <div className="p-6 rounded-[32px] border border-white/10 bg-neutral-950/80 backdrop-blur-2xl shadow-2xl space-y-5 font-sans">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 font-sans">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5 font-sans">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Sprint Planner & Briefing Architecture
                </span>
                <h3 className="text-lg font-extrabold text-white tracking-tight mt-0.5 font-sans">
                  {editingSprintId ? 'Edit Rencana Sprint' : 'Rancang Sprint Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingSprint(false)}
                className="px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 transition-all cursor-pointer font-sans"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
              {/* Kolom Kiri */}
              <div className="lg:col-span-6 space-y-4 font-sans">
                <div className="space-y-1.5 font-sans">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">
                    Nama / Goal Utama Sprint
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sprint 2 - Scale Konten & Finalize UI Kit"
                    value={sprintGoalInput}
                    onChange={(e) => setSprintGoalInput(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-neutral-900 px-4 py-2.5 text-xs text-white outline-hidden focus:border-white/30 font-sans"
                  />
                </div>

                <div className="space-y-1.5 font-sans">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">
                    Catatan Briefing & Kriteria Output
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan arahan strategis, ekspektasi kualitas, atau batasan scope kerja untuk PL..."
                    value={sprintBriefNotes}
                    onChange={(e) => setSprintBriefNotes(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-neutral-900 p-3.5 text-xs text-white outline-hidden focus:border-white/30 resize-none font-sans"
                  />
                </div>

                {/* Upload Lampiran */}
                <div className="space-y-1.5 font-sans">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">
                    Lampiran Dokumen Panduan (PDF/DOCX/Gambar Maks. 5MB)
                  </label>
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-neutral-900/60 font-sans">
                    <input
                      type="file"
                      id="sprint-doc-file"
                      onChange={handleSprintDocUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="sprint-doc-file"
                      className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all cursor-pointer font-sans"
                    >
                      {isUploadingDoc ? 'Mengunggah...' : '📎 Pilih File'}
                    </label>
                    <span className="text-xs text-zinc-400 truncate flex-1 font-mono">
                      {sprintDocName || 'Belum ada dokumen dilampirkan'}
                    </span>
                    {sprintDocUrl && (
                      <button
                        type="button"
                        onClick={() => { setSprintDocUrl(''); setSprintDocName(''); }}
                        className="text-rose-400 text-xs hover:underline cursor-pointer font-sans"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Kolom Kanan */}
              <div className="lg:col-span-6 space-y-4 font-sans">
                <CustomGlassRangeCalendar
                  startDate={sprintStartDate}
                  endDate={sprintEndDate}
                  onChange={(start, end) => {
                    setSprintStartDate(start);
                    setSprintEndDate(end);
                  }}
                />

                <div className="flex items-center justify-end gap-3 pt-2 font-sans">
                  <button
                    type="button"
                    disabled={isSavingSprint || !sprintEndDate}
                    onClick={() => { handleSaveSprint('draft'); setIsEditingSprint(false); }}
                    className="px-5 py-2.5 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-200 transition-all cursor-pointer disabled:opacity-40 font-sans"
                  >
                    💾 Simpan sebagai Draft
                  </button>
                  <button
                    type="button"
                    disabled={isSavingSprint || !sprintEndDate}
                    onClick={() => { handleSaveSprint('active'); setIsEditingSprint(false); }}
                    className="px-6 py-2.5 rounded-2xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition-all shadow-xl cursor-pointer disabled:opacity-40 font-sans"
                  >
                    🚀 Rilis & Aktifkan Sprint ke Tim
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* JIKA SPRINT SEDANG BERJALAN (EXECUTIVE MONITORING VIEW) */
          <>
            {/* BARIS 1 (ATAS): 3 KARTU METRIK RINGKAS (GRID 3 KOLOM) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full font-sans">
              {/* Kartu 1: Mandat Goal */}
              <div className="p-5 rounded-3xl border border-white/10 bg-neutral-950/70 backdrop-blur-2xl shadow-xl flex flex-col justify-between min-h-[140px] font-sans">
                <div className="flex items-center justify-between font-sans">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5 font-sans">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Sprint Mandate
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSprintId(activeSprint?.id || null);
                      setSprintGoalInput(activeSprint?.goal_title || '');
                      setSprintBriefNotes(activeSprint?.brief_notes || '');
                      setSprintDocUrl(activeSprint?.document_url || '');
                      setSprintDocName(activeSprint?.document_name || '');
                      setSprintStartDate(activeSprint?.start_date || '');
                      setSprintEndDate(activeSprint?.end_date || '');
                      setIsEditingSprint(true);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-zinc-300 transition-colors cursor-pointer font-sans"
                  >
                    ⚙️ Ubah
                  </button>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight line-clamp-2 my-2 font-sans">
                  {activeSprint?.goal_title || 'Belum Ada Sprint Goal'}
                </h2>

                {activeSprint?.document_url && (
                  <a
                    href={activeSprint.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-mono truncate font-sans"
                  >
                    <span>📄 Unduh Brief PO:</span>
                    <span className="underline font-bold font-sans">{activeSprint.document_name || 'Dokumen Sprint'}</span>
                  </a>
                )}

                <div className="flex items-center justify-between text-xs text-zinc-400 font-mono border-t border-white/5 pt-2 font-sans">
                  <span>{activeSprint?.start_date} → {activeSprint?.end_date}</span>
                  <span className="text-white font-bold font-sans">{calculateDaysLeft(activeSprint?.end_date)} Hari Sisa</span>
                </div>
              </div>

              {/* Kartu 2: Velocity */}
              <div className="p-5 rounded-3xl border border-white/10 bg-neutral-950/70 backdrop-blur-2xl shadow-xl flex flex-col justify-between min-h-[140px] font-sans">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Sprint Velocity</span>
                <div className="font-sans">
                  <div className="text-3xl font-extrabold text-white tracking-tight font-sans">{sprintProgressPct}%</div>
                  <p className="text-xs text-zinc-400 mt-0.5 font-sans">{completedDoDCount} dari {totalDoDCount} DoD Selesai</p>
                </div>
                <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 rounded-full transition-all duration-500" style={{ width: `${sprintProgressPct}%` }} />
                </div>
              </div>

              {/* Kartu 3: Health Forecasting */}
              <div className="p-5 rounded-3xl border border-white/10 bg-neutral-950/70 backdrop-blur-2xl shadow-xl flex flex-col justify-between min-h-[140px] font-sans">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Status Prediksi ETA</span>
                <div className="font-sans">
                  <div className={`text-lg font-extrabold tracking-tight font-sans ${forecastingResult.status === 'delay_risk' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {forecastingResult.status === 'delay_risk' ? '⚠️ Delay Risk' : '⚡ On Track'}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5 leading-snug line-clamp-2 font-sans">{forecastingResult.text}</p>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">{allTasks.length} Tugas Terdistribusi</span>
              </div>
            </div>

            {/* BARIS 2 (BAWAH): GANTT CHART RADAR FULL-WIDTH (LEBAR 100%) */}
            <div className="w-full p-6 rounded-[32px] border border-white/10 bg-neutral-950/80 backdrop-blur-2xl shadow-2xl space-y-6 font-sans">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 font-sans">
                <div>
                  <div className="flex items-center gap-2 font-sans">
                    <h3 className="text-lg font-bold text-white tracking-tight font-sans">Timeline & Velocity Radar POD (Sprint Gantt)</h3>
                    {activeSprint?.status === 'draft' && (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono border border-zinc-700 font-sans">
                        Simulasi Proyeksi Draft
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">
                    {activeSprint?.status === 'draft'
                      ? 'Menampilkan simulasi distribusi kapasitas masa depan sebelum sprint dirilis ke PL'
                      : 'Monitoring distribusi beban kerja per divisi secara realtime'}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 font-sans">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Aktif</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Selesai</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Blocker</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-zinc-600 border border-zinc-400 border-dashed" /> Proyeksi Draft</span>
                </div>
              </div>

              {/* GANTT TABLE DENGAN PROPORSI LEBAR */}
              <div className="space-y-3 w-full font-sans">
                {/* Header Kolom */}
                <div className="flex items-center text-xs font-mono text-zinc-400 pb-2 border-b border-white/5 font-sans">
                  <div className="w-48 shrink-0 font-bold uppercase tracking-wider text-zinc-300">Divisi / POD</div>
                  <div className="flex-1 grid grid-cols-7 gap-2 text-center text-[11px]">
                    <div>Hari 1</div><div>Hari 2</div><div>Hari 3</div><div>Hari 4</div><div>Hari 5</div><div>Hari 6</div><div>Hari 7</div>
                  </div>
                </div>

                {/* Rows Tiap Divisi */}
                {combinedGanttData.map((item) => (
                  <div key={item.pod} className="flex items-center py-2 border-b border-white/[0.02] font-sans">
                    <div className="w-48 shrink-0 pr-4 font-sans">
                      <div className="font-semibold text-white text-sm truncate flex items-center gap-2 font-sans">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${
                          item.isDraft ? 'bg-zinc-500' : (item.blockedTasks > 0 ? 'bg-rose-400' : 'bg-emerald-400')
                        }`} />
                        <span className="truncate">{item.pod}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">{item.forecastLabel}</div>
                    </div>

                    {/* Bar Track yang Melebar Penuh */}
                    <div className="flex-1 h-9 rounded-xl bg-neutral-900/80 border border-white/5 relative flex items-center px-2 font-sans">
                      <div className="absolute inset-0 grid grid-cols-7 divide-x divide-white/[0.04] pointer-events-none" />

                      {item.isDraft ? (
                        <div
                          className="relative h-6 rounded-lg px-3 flex items-center justify-between text-xs font-bold text-zinc-300 border border-dashed border-zinc-500/50 bg-gradient-to-r from-zinc-800/80 to-zinc-900/80 shadow-inner font-sans"
                          style={{ width: '70%' }}
                        >
                          <span className="font-mono text-[10px] text-zinc-400">◌ Est: {item.totalTasks} Tugas</span>
                          <span className="font-mono text-[9px] text-zinc-500 uppercase">Simulasi Draft</span>
                        </div>
                      ) : (
                        <div
                          className={`relative h-6 rounded-lg px-3 flex items-center justify-between text-xs font-bold text-white shadow-lg transition-all duration-500 font-sans ${
                            item.blockedTasks > 0
                              ? 'bg-gradient-to-r from-rose-500/80 to-amber-500/80 border border-rose-400/30'
                              : item.progress === 100
                              ? 'bg-gradient-to-r from-emerald-500/80 to-teal-500/80 border border-emerald-400/30'
                              : 'bg-gradient-to-r from-sky-500/80 to-indigo-500/80 border border-sky-400/30'
                          }`}
                          style={{ width: `${Math.max(20, item.progress)}%` }}
                        >
                          <span className="truncate font-medium">{item.totalTasks} Tugas</span>
                          <span className="font-mono text-[10px]">{item.progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    );
  }

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

        {/* BENTO PROFILE SHOWCASE CARD (CLEAN EDITORIAL GLASS) */}
        <div
          onClick={onOpenProfileModal}
          className="group relative inline-flex items-center gap-6 p-4 pr-10 rounded-[32px] border border-white/10 bg-neutral-950/40 hover:bg-neutral-900/60 backdrop-blur-2xl transition-all duration-300 cursor-pointer shadow-2xl hover:border-white/20 hover:scale-[1.01] font-sans"
          title="Klik untuk Pengaturan Profil"
        >
          {/* FOTO PROFIL BENTO DOMINAN (BESAR & SHARP) */}
          <div className="relative shrink-0 overflow-hidden rounded-2xl w-24 h-24 sm:w-28 sm:h-28 border border-white/15 bg-neutral-900 shadow-inner">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile?.full_name || userName || 'Profile'}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center font-bold text-3xl text-white uppercase group-hover:scale-105 transition-transform duration-500">
                {(profile?.full_name || userName || 'K').charAt(0)}
              </div>
            )}

            {/* Subtle Glass Highlight Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
          </div>

          {/* CLEAN TYPOGRAPHY & IDENTITY */}
          <div className="space-y-1.5 min-w-0 font-sans">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Halo, {(profile?.full_name || userName || 'PO').split(' ')[0]}
              </h2>
              <span className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs">
                ⚙️
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-zinc-400">
              {profile?.full_name || userName || 'Project Owner'}
            </p>

            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 pt-0.5">
              <span className="text-white/80">{currentWorkspace?.name || 'Workspace Utama'}</span>
              <span>•</span>
              <span className="text-zinc-400 capitalize">{profile?.role === 'po' ? 'Project Owner' : (profile?.pod || 'PO Control')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* KOLOM 2 (TENGAH - 4 KOLOM): STRATEGIC COMMAND CENTER (PO) / TASK DISPATCHER (PL) */}
      {/* ========================================================================= */}
      <div className="lg:col-span-4 flex flex-col justify-between transition-all duration-300 ease-in-out gap-6 font-sans">
        {isUserPO ? (
          /* ========== KHUSUS LAYAR PROJECT OWNER (PO) ========== */
          <div className="rounded-[32px] border border-white/10 bg-neutral-950/70 backdrop-blur-2xl p-6 space-y-6 shadow-2xl font-sans">
            {/* Header Sprint & Tombol Set Mandat */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 font-sans">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    ACTIVE SPRINT STRATEGY
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tight mt-1">
                  {activeSprint?.goal_title || 'Belum Ada Sprint Goal yang Aktif'}
                </h3>
              </div>

              <button
                type="button"
                onClick={onOpenSprintModal}
                className="px-3.5 py-2 rounded-xl border border-white/15 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-bold transition-all shadow-md cursor-pointer shrink-0 font-sans"
              >
                {activeSprint ? '⚙️ Atur Ulang Sprint' : '➕ Buat Sprint Baru'}
              </button>
            </div>

            {/* Mini-Gantt / Progress Bar Agregat Sprint */}
            <div className="space-y-2 font-sans">
              <div className="flex justify-between text-xs text-zinc-400 font-medium">
                <span>Sprint Velocity (Penyelesaian DoD)</span>
                <span className="text-white font-bold">{sprintProgressPct}% ({completedDoDCount}/{totalDoDCount} DoD)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-neutral-900 border border-white/10 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-500"
                  style={{ width: `${sprintProgressPct}%` }}
                />
              </div>
            </div>

            {/* ================= SMART AUTO-FORECASTING BANNER ================= */}
            <div className={`p-4 rounded-2xl border transition-all text-xs space-y-1.5 font-sans ${
              forecastingResult.status === 'delay_risk'
                ? 'border-rose-500/30 bg-rose-950/20 text-rose-300'
                : 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
            }`}>
              <div className="flex items-center justify-between font-sans">
                <span className="font-bold text-[10px] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${forecastingResult.status === 'delay_risk' ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`} />
                  Smart Velocity Forecast
                </span>
                <span className="text-[10px] font-mono opacity-80">
                  {allTasks.length} Tugas Aktif dari PL
                </span>
              </div>
              <p className="font-semibold text-white text-xs leading-relaxed font-sans">
                {forecastingResult.text}
              </p>
            </div>

            {/* ================= REAL SPRINT GANTT CHART GRID ================= */}
            <div className="space-y-3 p-4 rounded-2xl border border-white/10 bg-white/[0.02] font-sans">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Timeline Distribusi POD (Sprint Gantt)
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 text-[9px] font-mono border border-sky-500/30">
                    Live Grid
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {activeSprint?.start_date} → {activeSprint?.end_date}
                </span>
              </div>

              {/* RENDER KOMPONEN GANTT */}
              {activeSprint ? (
                <div className="space-y-2 font-sans">
                  {/* Header Grid Hari (H-1 s/d H-7) */}
                  <div className="flex items-center text-[10px] font-mono text-zinc-400 border-b border-white/10 pb-1.5">
                    <div className="w-24 shrink-0 font-bold uppercase tracking-wider text-zinc-300">POD</div>
                    <div className="flex-1 grid grid-cols-7 gap-1 text-center text-zinc-500 text-[9px]">
                      <div>H-1</div>
                      <div>H-2</div>
                      <div>H-3</div>
                      <div>H-4</div>
                      <div>H-5</div>
                      <div>H-6</div>
                      <div>H-7</div>
                    </div>
                  </div>

                  {/* Row Timeline Tiap POD yang Sudah Diberi Tugas oleh PL */}
                  {podGanttData.length === 0 ? (
                    <div className="py-5 text-center text-xs text-zinc-500 font-mono">
                      Belum ada penugasan dari Project Leader.
                    </div>
                  ) : (
                    podGanttData.map((item) => (
                      <div key={item.pod} className="flex items-center gap-2 text-xs font-sans">
                        <div className="w-24 shrink-0 truncate font-semibold text-zinc-300 text-[11px] flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${item.blockedTasks > 0 ? 'bg-rose-500 animate-ping' : item.progress === 100 ? 'bg-emerald-400' : 'bg-sky-400'}`} />
                          <span className="truncate">{item.pod}</span>
                        </div>

                        {/* Grid Track */}
                        <div className="flex-1 h-6 rounded-xl bg-neutral-900/80 border border-white/5 relative flex items-center px-1">
                          {/* Grid Guides */}
                          <div className="absolute inset-0 grid grid-cols-7 divide-x divide-white/[0.03] pointer-events-none" />

                          {/* Floating Glowing Gantt Bar Pill */}
                          <div
                            className={`relative h-4 rounded-lg px-2 flex items-center justify-between text-[9px] font-bold text-white shadow-lg transition-all duration-500 ${
                              item.blockedTasks > 0
                                ? 'bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 border border-rose-400/40 text-rose-100 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                                : item.progress === 100
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border border-emerald-400/40 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                                : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 border border-sky-400/40 text-sky-100 shadow-[0_0_12px_rgba(14,165,233,0.35)]'
                            }`}
                            style={{ width: `${Math.max(25, item.progress || (item.totalTasks > 0 ? 40 : 15))}%` }}
                          >
                            <span className="truncate">{item.totalTasks} Tugas</span>
                            <span className="font-mono text-[8px] opacity-90">{item.progress}%</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-zinc-500 font-mono">
                  Kunci Sprint Goal terlebih dahulu untuk mengaktifkan Gantt Radar.
                </div>
              )}
            </div>

            {/* Petunjuk Operasional PO */}
            <div className="p-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.01] text-xs text-zinc-400 space-y-1 font-sans">
              <p className="font-semibold text-white">📌 Mandat Sprint Terkunci untuk Project Leader:</p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Project Leader (PL) akan memecah goal di atas menjadi tugas harian kepada anggota tim sesuai batas tanggal yang telah Anda tentukan.
              </p>
            </div>
          </div>
        ) : (
          /* ========== KHUSUS LAYAR PROJECT LEADER (PL) ========== */
          <div className="space-y-4 font-sans">
            {/* 1. Guideline Box dari PO */}
            {activeSprint && (
              <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/40 text-emerald-300 text-xs flex flex-col gap-2.5 shadow-lg font-sans">
                <div className="flex items-center justify-between font-sans">
                  <div>
                    <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-400 font-sans">
                      🎯 Arahan Sprint dari PO:
                    </span>
                    <p className="font-semibold text-white text-sm mt-0.5 font-sans">{activeSprint.goal_title}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 shrink-0">
                    Batas: {activeSprint.end_date}
                  </span>
                </div>

                {activeSprint.brief_notes && (
                  <p className="text-xs text-zinc-300 bg-black/20 p-2.5 rounded-xl border border-white/5 font-sans leading-relaxed">
                    📝 <strong>Catatan Briefing:</strong> {activeSprint.brief_notes}
                  </p>
                )}

                {activeSprint.document_url && (
                  <a
                    href={activeSprint.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition-all font-sans"
                  >
                    <span>📄 Unduh Dokumen Briefing PO:</span>
                    <span className="underline font-bold font-sans">{activeSprint.document_name || 'Dokumen Sprint'}</span>
                  </a>
                )}
              </div>
            )}

            {/* 2. Form Bagi Tugas Baru Milik PL */}
            <div className="rounded-[32px] bg-white text-zinc-950 p-6 shadow-xl flex flex-col justify-between flex-1 min-h-[460px] hover:scale-[1.01] transition-all duration-300 ease-in-out font-sans">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-medium text-zinc-500 block truncate max-w-[180px] sm:max-w-[220px]">
                    Penugasan Workspace: {currentWorkspace?.name}
                  </span>
                  <h3 className="text-base font-bold text-zinc-950 tracking-tight">
                    Bagi Tugas Baru
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPoFocusMode(true)}
                  className="text-[10px] font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1 px-2.5 py-1 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-all cursor-pointer shadow-2xs shrink-0"
                  title="Buka Zen Focus Mode"
                >
                  <Maximize2 className="w-3 h-3 text-zinc-500" />
                  <span>⛶ Mode Fokus</span>
                </button>
              </div>

              <form onSubmit={onCreateNewTask} className="space-y-3.5 my-auto py-2 font-sans">
                {/* 1. TOGGLE MODE PENUGASAN */}
                <div className="space-y-1.5 font-sans">
                  <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                    Target Penerima Tugas
                  </label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-xl text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setAssignTargetType('individual')}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                        assignTargetType === 'individual'
                          ? 'bg-zinc-950 text-white font-bold shadow-xs border border-zinc-950'
                          : 'text-zinc-500 hover:text-zinc-900 font-medium'
                      }`}
                    >
                      👤 Individu
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignTargetType('pod')}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                        assignTargetType === 'pod'
                          ? 'bg-zinc-950 text-white font-bold shadow-xs border border-zinc-950'
                          : 'text-zinc-500 hover:text-zinc-900 font-medium'
                      }`}
                    >
                      👥 1 Divisi
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignTargetType('all')}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                        assignTargetType === 'all'
                          ? 'bg-zinc-950 text-white font-bold shadow-xs border border-zinc-950'
                          : 'text-zinc-500 hover:text-zinc-900 font-medium'
                      }`}
                    >
                      🌐 Semua Tim
                    </button>
                  </div>
                </div>

                {/* 2. DYNAMIC INPUT SELECTOR BERDASARKAN MODE TARGET */}
                {assignTargetType === 'individual' ? (
                  <div className="space-y-1 font-sans">
                    <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Pilih Anggota Tim</label>
                    {(() => {
                      const nonPoMembers = assigneeList.filter(m => m.role !== 'po');
                      const poMembers = assigneeList.filter(m => m.role === 'po');

                      const memberOptions: GlassSelectOption[] = [];
                      if (nonPoMembers.length > 0) {
                        memberOptions.push({ value: 'hdr-1', label: 'Anggota Tim & Lead', isHeader: true });
                        nonPoMembers.forEach(m => {
                          memberOptions.push({
                            value: m.id,
                            label: m.full_name,
                            sublabel: `${m.pod} • ${m.role.toUpperCase()}`,
                            badge: m.role.toUpperCase()
                          });
                        });
                      }
                      if (poMembers.length > 0) {
                        memberOptions.push({ value: 'hdr-2', label: 'Project Owner', isHeader: true });
                        poMembers.forEach(m => {
                          memberOptions.push({
                            value: m.id,
                            label: m.full_name,
                            sublabel: `${m.pod} • OWNER`,
                            badge: 'OWNER'
                          });
                        });
                      }

                      return (
                        <CustomGlassSelect
                          theme="light"
                          value={selectedAssigneeId}
                          onChange={setSelectedAssigneeId}
                          placeholder={isLoadingAssignees ? 'Memuat anggota...' : '-- Pilih Anggota --'}
                          options={memberOptions}
                        />
                      );
                    })()}
                  </div>
                ) : assignTargetType === 'pod' ? (
                  <div className="space-y-1 font-sans">
                    <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Pilih Divisi / POD</label>
                    <CustomGlassSelect
                      theme="light"
                      value={selectedTargetPod}
                      onChange={setSelectedTargetPod}
                      options={[
                        { value: 'Marketing', label: 'Marketing' },
                        { value: 'Product Builder', label: 'Product Builder' },
                        { value: 'BA', label: 'BA (Business Analyst)' },
                        { value: 'UI/UX Designer', label: 'UI/UX Designer' },
                        { value: 'QA', label: 'QA' },
                        { value: 'General', label: 'General' },
                      ]}
                    />
                    <p className="text-[10px] text-zinc-500 mt-1 font-medium font-sans">
                      📢 Tugas ini akan ditugaskan ke seluruh anggota di divisi <strong className="text-zinc-800">{selectedTargetPod}</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-700 font-medium font-sans">
                    📢 Tugas ini akan ditugaskan serentak ke seluruh ({assigneeList.length}) anggota di workspace ini.
                  </div>
                )}

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
                <CustomGlassDatePicker
                  theme="light"
                  value={newAssignDueDate}
                  onChange={setNewAssignDueDate}
                  maxDate={activeSprint?.end_date}
                  presetButtons={
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
                  }
                />

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
                      onClick={() => setNewAssignPriority('high')}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        newAssignPriority === 'high'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs font-bold'
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                      }`}
                    >
                      🔥 Tinggi (Priority)
                    </button>
                  </div>
                </div>

                {/* Checklist Definition (DoD Points) Input */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                      Definition of Done (DoD) Checklist
                    </label>
                    {dodPoints.length < 5 && (
                      <button
                        type="button"
                        onClick={onAddDodPoint}
                        className="text-[10px] font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1 cursor-pointer transition-colors duration-300"
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
        )}
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

            {/* SEKSI ANGGOTA TIM WORKSPACE */}
            <div className="space-y-2 pt-3 border-t border-white/10 font-sans">
              <div className="flex items-center justify-between text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                <span>Anggota Tim Workspace</span>
                <span className="font-mono text-white/80">{assigneeList.length} Orang</span>
              </div>

              {assigneeList.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-2">Belum ada anggota terdaftar.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
                  {assigneeList.map((m) => {
                    const initial = (m.full_name || 'A').charAt(0).toUpperCase();
                    const isPO = m.role === 'po';
                    const isPL = m.role === 'pl';
                    return (
                      <div key={m.id || m.email} className="p-2 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 truncate max-w-[70%]">
                          <div className="w-5 h-5 rounded-full bg-white/15 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                            {initial}
                          </div>
                          <div className="truncate">
                            <span className="font-semibold text-white text-[11px] block truncate">{m.full_name}</span>
                            <span className="text-[9px] text-white/40 block truncate">{m.pod || 'General'}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase shrink-0 ${
                          isPO ? 'bg-white/20 text-white border border-white/30' :
                          isPL ? 'bg-white/15 text-zinc-200' : 'bg-white/5 text-zinc-400'
                        }`}>
                          {isPO ? 'PO' : isPL ? 'PL' : 'Member'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-zinc-500 text-center pt-2 border-t border-white/5 font-sans">
            SyncFlow PO Control Center
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* ZEN FOCUS MODE MODAL (MODE DRAFTING TUGAS PO FULLSCREEN) */}
      {/* ========================================================================= */}
      {isPoFocusMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="max-w-2xl w-full bg-neutral-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col justify-between">
            {/* Header Zen Focus */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Zen Focus Mode — Drafting Penugasan</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
                  Bagi Tugas Baru ({currentWorkspace?.name})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPoFocusMode(false)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer"
                title="Minimize Mode Fokus"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Tutup Mode Fokus</span>
              </button>
            </div>

            {/* Form Content in Zen Focus */}
            <form onSubmit={(e) => {
              onCreateNewTask(e);
              setIsPoFocusMode(false);
            }} className="space-y-4 flex-1 font-sans">

              {/* 1. TOGGLE MODE PENUGASAN */}
              <div className="space-y-1.5 font-sans">
                <label className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                  Target Penerima Tugas
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-950 border border-white/10 rounded-xl text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setAssignTargetType('individual')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      assignTargetType === 'individual'
                        ? 'bg-white text-zinc-950 font-bold shadow-xs'
                        : 'text-zinc-400 hover:text-white font-medium'
                    }`}
                  >
                    👤 Individu
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignTargetType('pod')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      assignTargetType === 'pod'
                        ? 'bg-white text-zinc-950 font-bold shadow-xs'
                        : 'text-zinc-400 hover:text-white font-medium'
                    }`}
                  >
                    👥 1 Divisi
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignTargetType('all')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      assignTargetType === 'all'
                        ? 'bg-white text-zinc-950 font-bold shadow-xs'
                        : 'text-zinc-400 hover:text-white font-medium'
                    }`}
                  >
                    🌐 Semua Tim
                  </button>
                </div>
              </div>

              {/* 2. DYNAMIC INPUT SELECTOR BERDASARKAN MODE TARGET */}
              {assignTargetType === 'individual' ? (
                <div className="space-y-1 font-sans">
                  <label className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Pilih Anggota Tim</label>
                  <CustomGlassSelect
                    theme="dark"
                    disabled={isLoadingAssignees || assigneeList.length === 0}
                    value={selectedAssigneeId}
                    onChange={setSelectedAssigneeId}
                    options={(() => {
                      const nonPoMembers = assigneeList.filter(m => m.role !== 'po');
                      const poMembers = assigneeList.filter(m => m.role === 'po');

                      const memberOptions: GlassSelectOption[] = [];
                      if (nonPoMembers.length > 0) {
                        memberOptions.push({ value: 'hdr-1', label: 'Anggota Tim & Lead', isHeader: true });
                        nonPoMembers.forEach(m => {
                          memberOptions.push({
                            value: m.id,
                            label: m.full_name,
                            sublabel: `${m.pod} • ${m.role.toUpperCase()}`,
                            badge: m.role.toUpperCase()
                          });
                        });
                      }
                      if (poMembers.length > 0) {
                        memberOptions.push({ value: 'hdr-2', label: 'Project Owner (Self Assign)', isHeader: true });
                        poMembers.forEach(m => {
                          memberOptions.push({
                            value: m.id,
                            label: `👤 ${m.full_name}`,
                            sublabel: `${m.pod} • PO`,
                            badge: 'PO'
                          });
                        });
                      }
                      return memberOptions;
                    })()}
                    placeholder={isLoadingAssignees ? "Memuat daftar tim..." : "Pilih Anggota Tim..."}
                  />
                </div>
              ) : assignTargetType === 'pod' ? (
                <div className="space-y-1 font-sans">
                  <label className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                    Pilih Divisi / POD Target
                  </label>
                  <CustomGlassSelect
                    theme="dark"
                    value={selectedTargetPod}
                    onChange={setSelectedTargetPod}
                    options={[
                      { value: 'Marketing', label: 'Marketing', badge: 'Divisi' },
                      { value: 'Product Builder', label: 'Product Builder', badge: 'Divisi' },
                      { value: 'BA', label: 'BA (Business Analyst)', badge: 'Divisi' },
                      { value: 'UI/UX Designer', label: 'UI/UX Designer', badge: 'Divisi' },
                      { value: 'QA', label: 'QA', badge: 'Divisi' },
                      { value: 'General', label: 'General', badge: 'Divisi' },
                    ]}
                    placeholder="Pilih Divisi Target..."
                  />
                </div>
              ) : null}

              {/* Judul Tugas Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Judul Tugas</label>
                <input
                  type="text"
                  required
                  placeholder="Nama tugas..."
                  value={newAssignTaskTitle}
                  onChange={e => setNewAssignTaskTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans"
                />
              </div>

              {/* Deskripsi Brief Textarea (Lapang di Zen Mode) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                  Deskripsi / Brief Singkat
                </label>
                <textarea
                  rows={5}
                  placeholder="Jelaskan detail brief atau konteks pengerjaan..."
                  value={newAssignDescription}
                  onChange={e => setNewAssignDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-neutral-950 p-3 text-xs text-white placeholder-zinc-500 outline-hidden focus:border-white/30 min-h-[120px] resize-y font-sans"
                />
              </div>

              {/* Hybrid Date Picker */}
              <CustomGlassDatePicker
                theme="dark"
                value={newAssignDueDate}
                onChange={setNewAssignDueDate}
                presetButtons={
                  <div className="flex items-center gap-1 font-sans">
                    <button
                      type="button"
                      onClick={() => onApplyDeadlinePreset(0, 'create')}
                      className="text-[10px] bg-white/10 hover:bg-white/20 text-zinc-300 px-2 py-0.5 rounded border border-white/10 transition-colors cursor-pointer"
                    >
                      Hari Ini (17:00)
                    </button>
                    <button
                      type="button"
                      onClick={() => onApplyDeadlinePreset(1, 'create')}
                      className="text-[10px] bg-white/10 hover:bg-white/20 text-zinc-300 px-2 py-0.5 rounded border border-white/10 transition-colors cursor-pointer"
                    >
                      Besok (17:00)
                    </button>
                    <button
                      type="button"
                      onClick={() => onApplyDeadlinePreset(3, 'create')}
                      className="text-[10px] bg-white/10 hover:bg-white/20 text-zinc-300 px-2 py-0.5 rounded border border-white/10 transition-colors cursor-pointer"
                    >
                      3 Hari
                    </button>
                  </div>
                }
              />

              {/* Prioritas Toggle */}
              <div className="space-y-1">
                <label className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                  Prioritas Tugas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAssignPriority('normal')}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      newAssignPriority === 'normal'
                        ? 'bg-white text-zinc-950 border-white shadow-xs'
                        : 'bg-neutral-950 text-zinc-400 border-white/10 hover:bg-white/5'
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
                        : 'bg-neutral-950 text-zinc-400 border-white/10 hover:bg-white/5'
                    }`}
                  >
                    🔥 Urgent
                  </button>
                </div>
              </div>

              {/* Checklist DoD (Hingga 10 poin) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                    Checklist DoD ({dodPoints.length}/10 Poin)
                  </label>
                  {dodPoints.length < 10 && (
                    <button
                      type="button"
                      onClick={onAddDodPoint}
                      className="text-[10px] font-bold text-white hover:text-zinc-300 flex items-center gap-0.5 cursor-pointer transition-colors duration-300"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Tambah Poin</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {dodPoints.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder={`DoD ${idx + 1}...`}
                        value={point}
                        onChange={e => onDodPointChange(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-neutral-950 border border-white/10 rounded-lg text-[11px] text-white font-sans focus:outline-hidden focus:border-white/30"
                      />
                      {dodPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveDodPoint(idx)}
                          className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors text-xs font-bold shrink-0"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedAssigneeId || !newAssignTaskTitle.trim()}
                className={`w-full py-3.5 font-bold text-xs rounded-full shadow-lg flex items-center justify-center gap-2 transition-all duration-300 ease-in-out ${
                  isTaskSubmitSuccess
                    ? 'bg-emerald-600 text-white cursor-default'
                    : selectedAssigneeId && newAssignTaskTitle.trim()
                      ? 'bg-white hover:bg-zinc-200 text-zinc-950 cursor-pointer'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                {isTaskSubmitSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white animate-bounce" />
                    <span>✓ Tugas Terkirim</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Tugas (Zen Focus Mode)</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
      )}
    </main>
  );
};
