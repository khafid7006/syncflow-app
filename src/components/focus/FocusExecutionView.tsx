import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Zap, ArrowLeft, ExternalLink, Plus, CheckSquare, Square, 
  ShieldCheck, Send, CheckCircle2, FileText, Calendar, 
  User, Timer, Layers, ArrowRight, Play, BookOpen, AlertCircle, 
  RotateCcw, Check, Lock, Shield, Crown, Briefcase, Award, 
  MessageSquare, Sparkles, X, Activity, Target, CheckCheck
} from 'lucide-react';
import { StatusBadge, PriorityBadge, PodBadge, PodOwnerBadge, RoleBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { DEFAULT_DOD_CHECKLIST } from '../../data/initialData';
import { Task, Sprint } from '../../types';

export const FocusExecutionView: React.FC = () => {
  const { 
    currentUser, 
    tasks, 
    sprints, 
    users, 
    teams, 
    focusTaskId, 
    setFocusTaskId, 
    startFocusTask, 
    setActiveTab, 
    setIsSopModalOpen,
    toggleTaskDoD, 
    addAttachment, 
    moveTaskStatus,
    approveTaskReview,
    rejectTaskReview,
    addComment,
    sendNotification
  } = useApp();

  const now = new Date();

  // Active user role
  const isBO = currentUser.role === 'BUSINESS_OWNER';
  const isPO = currentUser.role === 'PROJECT_OWNER';
  const isPL = currentUser.role === 'PROJECT_LEADER';
  const isPodOwner = Boolean(currentUser.role === 'MEMBER' && (currentUser.is_pod_owner || currentUser.is_pod_lead));
  const isRegularMember = currentUser.role === 'MEMBER' && !isPodOwner;

  // Active team context
  const currentTeam = teams.find(t => t.id === currentUser.team_id) || teams[0];
  const activeSprint = sprints.find(s => s.team_id === currentTeam?.id && s.status === 'ACTIVE');

  // =========================================================================
  // 1. STATE FOR MEMBER / EXECUTION VIEW
  // =========================================================================
  const [linkInput, setLinkInput] = useState('');
  const [linkNameInput, setLinkNameInput] = useState('');
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [showMemberSuccess, setShowMemberSuccess] = useState(false);
  const [workspaceNotes, setWorkspaceNotes] = useState('');

  // User's assigned tasks
  const myAssignedTasks = tasks.filter(t => t.assignee_id === currentUser.id);
  const currentExecutionTask = tasks.find(t => t.id === focusTaskId) || 
    myAssignedTasks.find(t => t.status === 'DIKERJAKAN') || 
    myAssignedTasks[0];

  // DoD calculation for current execution task
  const memberDodList = currentExecutionTask?.dod_checklist && currentExecutionTask.dod_checklist.length > 0 
    ? currentExecutionTask.dod_checklist 
    : DEFAULT_DOD_CHECKLIST;
  const completedMemberDoDCount = memberDodList.filter(item => item.completed).length;
  const hasMemberAttachments = currentExecutionTask?.attachments && currentExecutionTask.attachments.length > 0;
  const canMemberSubmitReview = Boolean(hasMemberAttachments && currentExecutionTask?.status !== 'REVIEW' && currentExecutionTask?.status !== 'SELESAI');

  // Handle member adding quick link
  const handleAddMemberLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim() || !currentExecutionTask) return;

    const url = linkInput.trim();
    const isHttp = url.startsWith('http://') || url.startsWith('https://');
    const formattedUrl = isHttp ? url : `https://${url}`;
    
    let defaultName = linkNameInput.trim();
    if (!defaultName) {
      if (url.includes('figma.com')) defaultName = 'Desain Figma';
      else if (url.includes('github.com')) defaultName = 'GitHub Pull Request / Commit';
      else if (url.includes('docs.google.com')) defaultName = 'Google Docs Deliverables';
      else if (url.includes('notion.so')) defaultName = 'Dokumen Notion';
      else defaultName = url.length > 35 ? url.substring(0, 32) + '...' : url;
    }

    addAttachment(currentExecutionTask.id, {
      name: defaultName,
      url: formattedUrl,
      size: 'Tautan Web'
    });

    setLinkInput('');
    setLinkNameInput('');
  };

  const handleMemberSubmitReview = () => {
    if (!currentExecutionTask || !canMemberSubmitReview) return;
    const res = moveTaskStatus(currentExecutionTask.id, 'POD_REVIEW');
    if (res.success) {
      setShowMemberSuccess(true);
    } else if (res.reason) {
      alert(res.reason);
    }
  };

  // Next available task for member
  const nextMemberTask = myAssignedTasks.find(t => t.id !== currentExecutionTask?.id && (t.status === 'DIKERJAKAN' || t.status === 'BACKLOG'));

  // =========================================================================
  // 2. STATE FOR POD OWNER & PROJECT LEADER (REVIEW & UNBLOCK HUB)
  // =========================================================================
  const [activeLeaderTab, setActiveLeaderTab] = useState<'review_queue' | 'my_execution'>('review_queue');
  const [reviewFeedbacks, setReviewFeedbacks] = useState<Record<string, string>>({});
  const [reviewActionSuccess, setReviewActionSuccess] = useState<string | null>(null);

  // Review queue: tasks in status REVIEW
  // Review queue:
  // - Pod Owner: tasks with status POD_REVIEW in same team & same pod_label
  // - Project Leader / Project Owner: tasks with status REVIEW in same team
  const podReviewTasks = tasks.filter(t => t.status === 'POD_REVIEW' && t.team_id === currentUser.team_id && (isPL || isPO || (isPodOwner && t.pod_label === currentUser.pod_label)));
  const leaderReviewTasks = tasks.filter(t => t.status === 'REVIEW' && t.team_id === currentUser.team_id);

  const reviewQueueTasks = isPodOwner ? podReviewTasks : (isPL || isPO ? leaderReviewTasks : []);

  // Pod Owner action: Loloskan ke Review Leader (POD_REVIEW -> REVIEW)
  const handlePodOwnerPassToLeader = (taskId: string, title: string) => {
    const res = moveTaskStatus(taskId, 'REVIEW');
    if (res.success) {
      setReviewActionSuccess(`Tugas [${title}] telah berhasil diverifikasi dan diloloskan ke Review Leader!`);
      setTimeout(() => setReviewActionSuccess(null), 4000);
    } else if (res.reason) {
      alert(res.reason);
    }
  };

  // Project Leader & PO action: Sahkan Selesai (REVIEW -> SELESAI)
  const handleLeaderFinalApprove = (taskId: string, title: string) => {
    const res = moveTaskStatus(taskId, 'SELESAI');
    if (res.success) {
      setReviewActionSuccess(`Tugas [${title}] telah disahkan SELESAI`);
      setTimeout(() => setReviewActionSuccess(null), 4000);
    } else if (res.reason) {
      alert(res.reason);
    }
  };

  // Reject / Return action (POD_REVIEW or REVIEW -> DIKERJAKAN)
  const handleRejectToMember = (taskId: string, title: string) => {
    const reason = reviewFeedbacks[taskId]?.trim() || 'Tugas perlu diperbaiki sesuai kriteria DoD.';
    rejectTaskReview(taskId, reason);
    setReviewFeedbacks(prev => ({ ...prev, [taskId]: '' }));
    setReviewActionSuccess(`Tugas [${title}] telah dikembalikan ke Member untuk revisi.`);
    setTimeout(() => setReviewActionSuccess(null), 4000);
  };

  // =========================================================================
  // 3. STATE FOR PROJECT OWNER (SPRINT GOVERNANCE HUB)
  // =========================================================================
  const [sprintGovNotes, setSprintGovNotes] = useState('');
  const [governanceChecklist, setGovernanceChecklist] = useState({
    reviewBacklog: true,
    checkDoDStandards: true,
    meetingNotesReady: true,
    stagingVerified: false
  });

  // Calculate PO sprint tasks
  const poSprintTasks = tasks.filter(t => t.team_id === currentTeam?.id);
  const poDoneTasks = poSprintTasks.filter(t => t.status === 'SELESAI');
  const poSprintProgress = poSprintTasks.length > 0 ? Math.round((poDoneTasks.length / poSprintTasks.length) * 100) : 0;

  // =========================================================================
  // 4. STATE FOR BUSINESS OWNER (STRATEGIC INSIGHT HUB)
  // =========================================================================
  const [selectedBoTargetTeamId, setSelectedBoTargetTeamId] = useState<string>(() => teams[0]?.id || '');
  const [selectedBoTaskId, setSelectedBoTaskId] = useState<string>('');
  const [boInsightContent, setBoInsightContent] = useState('');
  const [boSuccessMessage, setBoSuccessMessage] = useState<string | null>(null);

  // Critical bottleneck calculation for BO
  const overdueTasks = tasks.filter(t => t.status !== 'SELESAI' && new Date(t.deadline) < now);
  const stuckInReviewTasks = tasks.filter(t => t.status === 'REVIEW');

  const handleSendBoInsight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boInsightContent.trim()) {
      alert('Silakan tuliskan masukan strategis sebelum mengirim.');
      return;
    }

    const targetTeam = teams.find(t => t.id === selectedBoTargetTeamId);
    if (!targetTeam || !targetTeam.project_owner_id) {
      alert('Project Owner untuk tim ini belum ditentukan.');
      return;
    }

    const targetTask = tasks.find(t => t.id === selectedBoTaskId);

    // If attached to task, add comment
    if (selectedBoTaskId && targetTask) {
      addComment(selectedBoTaskId, boInsightContent.trim());
    } else {
      // Send notification direct to PO
      sendNotification({
        user_id: targetTeam.project_owner_id,
        type: 'IMPORTANT',
        title: `Arahan Strategis BO: ${targetTeam.name}`,
        message: `${currentUser.name} (Business Owner): "${boInsightContent.trim()}"`
      });
    }

    setBoSuccessMessage(`Masukan strategis berhasil dikirimkan secara privat ke Project Owner ${targetTeam.name}!`);
    setBoInsightContent('');
    setSelectedBoTaskId('');
    setTimeout(() => setBoSuccessMessage(null), 5000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC] p-2 sm:p-4 pb-16 space-y-6 max-w-7xl mx-auto text-xs font-sans">
      {/* ================================================== */}
      {/* 1. TOP HEADER & ROLE IDENTIFICATION */}
      {/* ================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-full border border-slate-200 font-mono text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Dasbor</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#EA580C] bg-[#F59E0B]/15 px-3 py-1.5 rounded-full border border-[#F59E0B]/40">
              <Zap className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
              <span>
                {isBO && 'Action Hub: Strategic Insight'}
                {isPO && 'Action Hub: Sprint Governance'}
                {(isPL || isPodOwner) && 'Action Hub: Review & Unblock'}
                {isRegularMember && 'Bento Execution Mode (/do)'}
              </span>
            </span>
            <RoleBadge role={currentUser.role} />
            {isPodOwner && <PodOwnerBadge pod={currentUser.pod_label} />}
          </div>
        </div>

        {/* Action Toggle for Leader & Pod Owner */}
        {(isPL || isPodOwner) && (
          <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-full font-mono text-xs">
            <button
              onClick={() => setActiveLeaderTab('review_queue')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                activeLeaderTab === 'review_queue'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Antrean Review ({reviewQueueTasks.length})
            </button>
            <button
              onClick={() => setActiveLeaderTab('my_execution')}
              className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
                activeLeaderTab === 'my_execution'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tugas Sendiri ({myAssignedTasks.length})
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VARIATION A: MEMBER / FOCUS EXECUTION (3-COLUMN BENTO SHOWCASE) */}
      {/* ========================================================================= */}
      {(isRegularMember || ((isPL || isPodOwner) && activeLeaderTab === 'my_execution')) && (
        <div className="space-y-6">
          {!currentExecutionTask ? (
            <div className="bento-card text-center space-y-4 max-w-xl mx-auto py-16">
              <div className="w-16 h-16 rounded-full bg-[#F59E0B]/20 text-[#EA580C] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-[#F59E0B]" />
              </div>
              <h2 className="text-xl font-mono font-bold text-slate-900">
                Semua Tugas Anda Telah Selesai
              </h2>
              <p className="text-xs text-slate-500 font-sans max-w-md mx-auto">
                Tidak ada tugas aktif di antrean kerja Anda. Silakan buka Papan Tugas untuk mengambil tugas dari Backlog.
              </p>
              <button
                onClick={() => setActiveTab('tasks')}
                className="px-6 py-3 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 font-mono font-bold rounded-full text-xs cursor-pointer shadow-xs transition-colors"
              >
                Buka Papan Tugas
              </button>
            </div>
          ) : (
            <>
              {/* Member Success Banner */}
              {showMemberSuccess && (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-emerald-950 text-sm">
                        Tugas Berhasil Diajukan untuk Review
                      </h3>
                      <p className="text-xs text-emerald-800 font-sans mt-0.5">
                        Status tugas kini <strong>POD_REVIEW</strong>. Pod Owner & Project Leader telah menerima notifikasi.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {nextMemberTask ? (
                      <button
                        onClick={() => {
                          startFocusTask(nextMemberTask.id);
                          setShowMemberSuccess(false);
                        }}
                        className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-bold rounded-full text-xs cursor-pointer shadow-xs flex items-center gap-2"
                      >
                        <span>Lanjut Tugas Berikutnya</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('dashboard')}
                        className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-bold rounded-full text-xs cursor-pointer shadow-xs"
                      >
                        Kembali ke Dasbor
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 3-COLUMN BENTO GRID SHOWCASE (Xbox Reference Layout) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ========================================================================= */}
                {/* KOLOM KIRI (3 Kolom): Metric Cards & Task Identity */}
                {/* ========================================================================= */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Kartu Atas (Dark Bento Card): Sprint & Role Badge */}
                  <div className="bento-dark-card space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-400 font-bold uppercase tracking-wider">Sprint Goal</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] font-bold text-[10px]">
                        Aktif
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans italic leading-relaxed">
                      "{activeSprint?.goal || 'Mencapai target deliverable sprint dengan kualitas terbaik.'}"
                    </p>
                    <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>{currentTeam?.name}</span>
                      <span>{activeSprint?.end_date}</span>
                    </div>
                  </div>

                  {/* Kartu Tengah (White Bento Card): Metrik Progres (+100% Delivery Rate) */}
                  <div className="bento-card space-y-3 text-center">
                    <div className="text-3xl font-mono font-bold text-slate-900 tracking-tight">
                      +{myAssignedTasks.length > 0 ? Math.round((myAssignedTasks.filter(t => t.status === 'SELESAI').length / myAssignedTasks.length) * 100) : 100}%
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                      Delivery Rate Tim
                    </div>
                    <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                      Penyelesaian tugas sesuai standar Definition of Done dan alur Pod Review.
                    </p>

                    <div className="pt-2 flex items-center justify-center gap-2">
                      <div className="flex -space-x-2">
                        {users.slice(0, 3).map((u, i) => (
                          <img
                            key={i}
                            src={u.avatar_url}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border-2 border-white ring-1 ring-slate-200"
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                        {users.length} Member
                      </span>
                    </div>
                  </div>

                  {/* Kartu Bawah: Workspace Title & Quick CTAs */}
                  <div className="bento-card space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Modul Pelaksanaan
                      </span>
                      <h2 className="text-lg font-mono font-bold text-slate-900">
                        SyncFlow Action Hub
                      </h2>
                    </div>

                    <div className="space-y-2 font-mono text-xs">
                      <button
                        onClick={() => setActiveTab('tasks')}
                        className="w-full py-3 bg-[#18181B] hover:bg-zinc-800 text-white font-bold rounded-2xl cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-2"
                      >
                        <Briefcase className="w-4 h-4 text-[#F59E0B]" />
                        <span>Lihat Papan Tugas</span>
                      </button>

                      <button
                        onClick={() => setIsSopModalOpen(true)}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl cursor-pointer transition-colors flex items-center justify-center gap-2"
                      >
                        <BookOpen className="w-4 h-4 text-[#EA580C]" />
                        <span>Tonton SOP Panduan</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* KOLOM TENGAH (6 Kolom - HERO FOCUS STAGE): Panggung Utama Task Aktif */}
                {/* ========================================================================= */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Hero Showcase Card (Large Central Focal Container) */}
                  <div className="bento-card space-y-6 p-6 sm:p-8 relative overflow-hidden">
                    {/* Top Row Badges & Code */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs bg-[#18181B] text-white px-3 py-1 rounded-full">
                          {currentExecutionTask.code}
                        </span>
                        <PodBadge pod={currentExecutionTask.pod_label} />
                        <PriorityBadge priority={currentExecutionTask.priority} size="md" />
                      </div>

                      <StatusBadge status={currentExecutionTask.status} size="md" />
                    </div>

                    {/* Judul & Deskripsi Ringkas Clean */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                        Fokus Pengerjaan Aktif
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-bold font-mono text-[#18181B] tracking-tight leading-snug">
                        {currentExecutionTask.title}
                      </h1>
                      <p className="text-xs text-slate-600 font-sans leading-relaxed pt-1">
                        Deskripsi: {currentExecutionTask.description || 'Membangun controller API transfer BI-FAST dan validasi payload ISO8583.'}
                      </p>
                    </div>

                    {/* Form Input Clean 1-Baris Tempel Link */}
                    <div className="space-y-3 pt-4 border-t border-white/60">
                      <div className="flex items-center justify-between font-mono">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-[#F59E0B]" />
                          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            Pengajuan Link / Bukti Deliverable
                          </h2>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {currentExecutionTask.attachments.length} Link Terlampir
                        </span>
                      </div>

                      <form onSubmit={handleAddMemberLink} className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Tempel URL (Figma, GitHub PR, Google Docs...)"
                          value={linkInput}
                          onChange={e => setLinkInput(e.target.value)}
                          className="flex-1 px-4 py-3 bg-white/50 border border-white/70 rounded-2xl text-xs font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B]"
                        />
                        <button
                          type="submit"
                          className="px-5 py-3 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 font-mono font-bold rounded-2xl text-xs cursor-pointer transition-colors shadow-xs shrink-0 flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Simpan Link</span>
                        </button>
                      </form>

                      {/* Saved Links Display */}
                      <div className="space-y-2 pt-2">
                        {currentExecutionTask.attachments.map((att, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white/50 hover:bg-white/80 rounded-2xl border border-white/60 flex items-center justify-between text-xs font-mono transition-colors"
                          >
                            <span className="font-semibold text-slate-900 truncate">{att.name}</span>
                            {att.url && att.url !== '#' && (
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 bg-amber-100 text-amber-900 hover:bg-[#F59E0B] hover:text-slate-950 font-bold rounded-xl flex items-center gap-1 shrink-0 transition-colors"
                              >
                                <span>Buka Link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========================================================================= */}
                {/* KOLOM KANAN (3 Kolom): Verification Checklist & Dark Action Card */}
                {/* ========================================================================= */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Kartu Atas: DoD Checklist Card */}
                  <div className="bento-card space-y-4">
                    <div className="flex items-center justify-between font-mono border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          Syarat Selesai (DoD)
                        </h2>
                      </div>
                      <span className="text-xs font-bold text-[#EA580C] font-mono">
                        {completedMemberDoDCount} / {memberDodList.length}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {memberDodList.map((item, idx) => (
                        <div
                          key={item.id}
                          className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-2.5 text-xs font-sans"
                        >
                          <span className="w-4 text-[11px] font-bold text-slate-400 font-mono mt-0.5">{idx + 1}.</span>
                          <span className="text-slate-800 leading-snug">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kartu Bawah (Dark Bento Card): High-Contrast Action Hub */}
                  <div className="bento-dark-card space-y-5">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                        Status Verifikasi
                      </span>
                      <span className="text-[10px] bg-zinc-800 text-[#F59E0B] px-2.5 py-0.5 rounded-full font-bold border border-zinc-700">
                        {currentExecutionTask.status}
                      </span>
                    </div>

                    <div className="space-y-2 font-mono text-xs text-zinc-300">
                      <div className="flex items-center justify-between">
                        <span>Checklist DoD:</span>
                        <strong className="text-white">{completedMemberDoDCount}/{memberDodList.length}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Bukti Link:</span>
                        <strong className="text-white">{currentExecutionTask.attachments.length} Tautan</strong>
                      </div>
                    </div>

                    {/* Primary High-Contrast Amber Action Button */}
                    <div className="pt-2">
                      {currentExecutionTask.status === 'BACKLOG' && (
                        <button
                          onClick={() => moveTaskStatus(currentExecutionTask.id, 'DIKERJAKAN')}
                          className="w-full py-4 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 font-mono font-bold rounded-2xl text-xs cursor-pointer shadow-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          <span>Mulai Pengerjaan Tugas</span>
                        </button>
                      )}

                      {currentExecutionTask.status === 'DIKERJAKAN' && (
                        <button
                          onClick={handleMemberSubmitReview}
                          disabled={!canMemberSubmitReview}
                          className={`w-full py-4 font-mono font-bold rounded-2xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${
                            canMemberSubmitReview
                              ? 'bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 cursor-pointer'
                              : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                          }`}
                        >
                          <Send className="w-4 h-4" />
                          <span>{hasMemberAttachments ? 'Serahkan ke Pod Owner' : 'Wajib Lampirkan Link'}</span>
                        </button>
                      )}

                      {currentExecutionTask.status === 'POD_REVIEW' && (
                        <div className="p-3.5 bg-zinc-800/90 border border-zinc-700 text-amber-400 font-mono text-center rounded-2xl text-xs space-y-1">
                          <div className="font-bold">Menunggu Cek Pod Owner</div>
                          <div className="text-[10px] text-zinc-400 font-sans">Pod Owner ({currentExecutionTask.pod_label}) sedang memverifikasi DoD.</div>
                        </div>
                      )}

                      {currentExecutionTask.status === 'REVIEW' && (
                        <div className="p-3.5 bg-zinc-800/90 border border-zinc-700 text-blue-400 font-mono text-center rounded-2xl text-xs space-y-1">
                          <div className="font-bold">Menunggu Review Leader</div>
                          <div className="text-[10px] text-zinc-400 font-sans">Leader sedang memproses approval final.</div>
                        </div>
                      )}

                      {currentExecutionTask.status === 'SELESAI' && (
                        <div className="p-3.5 bg-emerald-950/80 border border-emerald-700 text-emerald-400 font-mono text-center rounded-2xl text-xs font-bold">
                          Tugas Disahkan Selesai
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      )}
      {/* ========================================================================= */}
      {/* VARIATION B / C: PROJECT OWNER / LEADER (3-KOLOM BENTO GRID REVIEW HUB) */}
      {/* ========================================================================= */}
      {(isPL || isPO || isPodOwner) && activeLeaderTab === 'review_queue' && (
        <div className="grid grid-cols-12 gap-5 items-stretch w-full flex-1 font-sans text-xs">
          
          {/* ========================================================================= */}
          {/* A. KOLOM KIRI (col-span-12 lg:col-span-3 flex flex-col gap-4) */}
          {/* ========================================================================= */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            {/* Card 1 (Target Sprint) */}
            <div className="rounded-3xl bg-neutral-900/90 backdrop-blur-xl border border-white/10 text-white p-6 shadow-md flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-amber-400 font-bold">Target Sprint</span>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                  {activeSprint?.end_date || 'Minggu Ini'}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-mono font-bold text-white text-sm">
                  Target Minggu Ini: {activeSprint?.title || 'Integrasi QRIS Hub & Dashboard Real-Time'}
                </h3>
                <p className="text-zinc-300 text-xs italic font-sans line-clamp-2">
                  "{activeSprint?.goal || 'Memastikan seluruh endpoint API dan dashboard real-time siap dirilis.'}"
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-800 text-[11px] font-mono text-zinc-400">
                Tenggat waktu: <strong className="text-amber-400">{activeSprint?.end_date || 'Akhir Minggu'}</strong>
              </div>
            </div>

            {/* Card 2 (Metrik Ringkas) */}
            <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/70 p-6 shadow-sm flex flex-col justify-between gap-3 text-center">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Progres Review Hub
              </div>
              <div className="text-3xl font-mono font-bold text-[#EA580C]">
                {poDoneTasks.length} / {poSprintTasks.length > 0 ? poSprintTasks.length : 8} Selesai ({poSprintProgress}%)
              </div>
              <div className="pt-2 border-t border-white/60 font-mono text-xs text-slate-600">
                Antrean Review: <strong className="text-[#EA580C]">{reviewQueueTasks.length} Task</strong>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* B. KOLOM TENGAH / PANGGUNG UTAMA (col-span-12 lg:col-span-6 flex flex-col) */}
          {/* ========================================================================= */}
          <div className="col-span-12 lg:col-span-6 flex flex-col">
            {reviewQueueTasks.length === 0 ? (
              /* State Antrean Kosong */
              <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/70 p-8 shadow-sm h-full flex flex-col justify-center items-center text-center space-y-4 min-h-[400px]">
                <div className="w-14 h-14 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-2xs">
                  <CheckCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold font-mono text-[#18181B] tracking-tight">
                    Semua Tugas Sudah Disetujui
                  </h2>
                  <p className="text-xs text-slate-500 font-sans max-w-sm mx-auto">
                    Tidak ada pengajuan tugas yang menunggu persetujuan saat ini.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="px-6 py-3 bg-white/80 hover:bg-white text-slate-800 font-mono font-bold text-xs rounded-2xl border border-white/80 shadow-2xs cursor-pointer transition-colors"
                >
                  Lihat Papan Tugas
                </button>
              </div>
            ) : (
              /* State Ada Antrean Tasks */
              <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/70 p-8 shadow-sm h-full flex flex-col justify-between space-y-6">
                {(() => {
                  const task = reviewQueueTasks[0];
                  const assignee = users.find(u => u.id === task.assignee_id);

                  return (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="font-bold text-slate-900 bg-white/80 border border-white/80 px-3 py-1 rounded-full">
                            {task.code}
                          </span>
                          <span className="text-slate-500 font-mono">
                            Pengaju: <strong className="text-slate-900">{assignee?.name}</strong>
                          </span>
                        </div>
                        <h1 className="text-2xl font-bold font-mono text-[#18181B] leading-snug">
                          {task.title}
                        </h1>
                        <p className="text-xs text-slate-600 font-sans">
                          {task.description || 'Pengajuan hasil kerja tugas sprint minggu ini.'}
                        </p>
                      </div>

                      {/* Bukti Link Column */}
                      <div className="space-y-3 font-mono text-xs border-t border-white/60 pt-4">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>Bukti Link Deliverable ({task.attachments.length}):</span>
                        </div>
                        <div className="space-y-2 max-h-36 overflow-y-auto">
                          {task.attachments.map((att, i) => (
                            <div key={i} className="p-3 bg-white/50 rounded-2xl border border-white/60 flex items-center justify-between">
                              <span className="font-semibold text-slate-900 truncate">{att.name}</span>
                              {att.url && att.url !== '#' && (
                                <a href={att.url} target="_blank" rel="noreferrer" className="px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-xl text-[11px] flex items-center gap-1 hover:bg-[#F59E0B]">
                                  <span>Buka Link</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                          {task.attachments.length === 0 && (
                            <div className="text-slate-400 italic text-[11px] font-sans py-3 text-center bg-white/40 rounded-2xl">
                              Belum ada link terlampir.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-white/60 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
                        <button
                          onClick={() => isPodOwner ? handlePodOwnerPassToLeader(task.id, task.title) : handleLeaderFinalApprove(task.id, task.title)}
                          className="w-full sm:w-auto px-6 py-3.5 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 font-bold rounded-2xl cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Sahkan Selesai</span>
                        </button>
                        <button
                          onClick={() => handleRejectToMember(task.id, task.title)}
                          className="w-full sm:w-auto px-5 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-2xl cursor-pointer transition-all border border-rose-200 flex items-center justify-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Kembalikan</span>
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* C. KOLOM KANAN (col-span-12 lg:col-span-3 flex flex-col gap-4) */}
          {/* ========================================================================= */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            {/* Card 1 (Syarat Selesai Tim / DoD - Read-Only Checklist) */}
            <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/70 p-6 shadow-sm flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider">Syarat Selesai Tim (DoD)</span>
                <span className="text-amber-800 font-bold text-[10px]">Read-only</span>
              </div>
              <div className="space-y-2 font-sans text-xs">
                <div className="p-2.5 bg-white/50 rounded-2xl border border-white/60 flex items-center gap-2 text-slate-800">
                  <span className="font-mono font-bold text-slate-400">1.</span>
                  <span>Kode telah di-review & lolos unit test.</span>
                </div>
                <div className="p-2.5 bg-white/50 rounded-2xl border border-white/60 flex items-center gap-2 text-slate-800">
                  <span className="font-mono font-bold text-slate-400">2.</span>
                  <span>Dokumentasi API & link PR terlampir.</span>
                </div>
                <div className="p-2.5 bg-white/50 rounded-2xl border border-white/60 flex items-center gap-2 text-slate-800">
                  <span className="font-mono font-bold text-slate-400">3.</span>
                  <span>Diverifikasi oleh Pod Owner / Leader.</span>
                </div>
              </div>
            </div>

            {/* Card 2 (Aksi Kelola Sprint) */}
            <div className="rounded-3xl bg-neutral-900/90 backdrop-blur-xl border border-white/10 text-white p-6 shadow-md flex flex-col justify-between h-full gap-4 flex-1">
              <div className="space-y-2 font-mono">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Tata Kelola Tim</span>
                <h3 className="font-bold text-white text-sm">Kelola Target & Sprint</h3>
                <p className="text-zinc-300 text-xs font-sans">
                  Rilis target sprint baru dan distribusikan beban kerja tim.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('sprints')}
                className="w-full py-3.5 px-4 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 font-mono font-bold rounded-2xl text-xs cursor-pointer shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Rilis Target Baru</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VARIATION C: PROJECT OWNER (SPRINT GOVERNANCE HUB) */}
      {/* ========================================================================= */}
      {isPO && (
        <div className="space-y-6">
          {/* PO Header */}
          <div className="bento-card space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F59E0B]/20 text-[#EA580C] flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <h1 className="text-xl font-mono font-bold text-slate-900">
                  Sprint Governance & Quality Hub — {currentTeam?.name}
                </h1>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-3.5 py-1.5 rounded-full border border-slate-200">
                Project Owner Governance
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Pantau keselarasan delivery terhadap Sprint Goal, tentukan standar Definition of Done (DoD), dan verifikasi kesiapan siklus berikutnya.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Active Sprint Progress */}
            <div className="lg:col-span-7 space-y-6">
              {/* Active Sprint Goal Card */}
              <div className="bento-card space-y-4">
                <div className="flex items-center justify-between font-mono">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#F59E0B]" />
                    <span>Sprint Berjalan: {activeSprint?.title || 'Sprint Aktif'}</span>
                  </h2>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {activeSprint?.start_date} s/d {activeSprint?.end_date}
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                  <div className="font-mono font-bold text-slate-900 text-xs">Target Utama (Sprint Goal):</div>
                  <p className="text-xs text-slate-700 font-sans italic">
                    "{activeSprint?.goal || 'Mencapai target delivery sesuai perencanaan tim.'}"
                  </p>
                </div>

                {/* Sprint Progress Bar */}
                <div className="space-y-2 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Penyelesaian Target Tugas:</span>
                    <strong className="text-[#EA580C]">{poDoneTasks.length} / {poSprintTasks.length} ({poSprintProgress}%)</strong>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/60">
                    <div className="h-full bg-[#F59E0B] rounded-full transition-all duration-500" style={{ width: `${poSprintProgress}%` }}></div>
                  </div>
                </div>

                {/* Button View Notulensi */}
                {activeSprint && (
                  <button
                    onClick={() => setIsSprintModalOpen(true)}
                    className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-900 font-mono font-bold rounded-2xl border border-slate-200 text-xs cursor-pointer flex items-center justify-center gap-2 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-[#F59E0B]" />
                    <span>Lihat Notulensi Rapat & Dokumen Rujukan Sprint</span>
                  </button>
                )}
              </div>

              {/* Template Definition of Done (DoD) Standard */}
              <div className="bento-card space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                    <span>Standar Definition of Done (DoD) Sprint Ini</span>
                  </h2>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                    Aktif
                  </span>
                </div>
                <div className="space-y-2">
                  {DEFAULT_DOD_CHECKLIST.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs font-sans">
                      <span className="w-5 text-[11px] font-bold text-slate-400 font-mono">{idx + 1}.</span>
                      <span className="text-slate-800">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Sprint Readiness Checklist & Governance Actions */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bento-card space-y-4">
                <div className="flex items-center justify-between font-mono border-b border-slate-100 pb-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-[#F59E0B]" />
                    <span>Checklist Tata Kelola Sprint</span>
                  </h2>
                </div>

                <div className="space-y-2.5">
                  <div
                    onClick={() => setGovernanceChecklist(p => ({ ...p, reviewBacklog: !p.reviewBacklog }))}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 cursor-pointer"
                  >
                    <input type="checkbox" checked={governanceChecklist.reviewBacklog} readOnly className="accent-[#F59E0B] cursor-pointer w-4 h-4" />
                    <span className="text-xs font-sans text-slate-800 font-medium">Review backlog & kelayakan deliverable</span>
                  </div>

                  <div
                    onClick={() => setGovernanceChecklist(p => ({ ...p, checkDoDStandards: !p.checkDoDStandards }))}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 cursor-pointer"
                  >
                    <input type="checkbox" checked={governanceChecklist.checkDoDStandards} readOnly className="accent-[#F59E0B] cursor-pointer w-4 h-4" />
                    <span className="text-xs font-sans text-slate-800 font-medium">Standar Definition of Done terdistribusi ke tugas</span>
                  </div>

                  <div
                    onClick={() => setGovernanceChecklist(p => ({ ...p, meetingNotesReady: !p.meetingNotesReady }))}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 cursor-pointer"
                  >
                    <input type="checkbox" checked={governanceChecklist.meetingNotesReady} readOnly className="accent-[#F59E0B] cursor-pointer w-4 h-4" />
                    <span className="text-xs font-sans text-slate-800 font-medium">Notulensi & Sprint Goal disetujui tim</span>
                  </div>

                  <div
                    onClick={() => setGovernanceChecklist(p => ({ ...p, stagingVerified: !p.stagingVerified }))}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 cursor-pointer"
                  >
                    <input type="checkbox" checked={governanceChecklist.stagingVerified} readOnly className="accent-[#F59E0B] cursor-pointer w-4 h-4" />
                    <span className="text-xs font-sans text-slate-800 font-medium">Verifikasi staging & kesiapan demo hasil sprint</span>
                  </div>
                </div>

                {/* Primary Governance Actions */}
                <div className="pt-3 space-y-2 border-t border-slate-100">
                  <button
                    onClick={() => setActiveTab('sprints')}
                    className="w-full py-3.5 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 font-mono font-bold rounded-2xl text-xs cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Kelola & Rilis Siklus Sprint Baru</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold rounded-2xl text-xs cursor-pointer flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Buka Papan Tugas Tim</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VARIATION D: BUSINESS OWNER (STRATEGIC INSIGHT HUB) */}
      {/* ========================================================================= */}
      {isBO && (
        <div className="space-y-6">
          {/* BO Alert */}
          {boSuccessMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl font-mono flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold">{boSuccessMessage}</span>
              </div>
              <button onClick={() => setBoSuccessMessage(null)} className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer">
                Tutup
              </button>
            </div>
          )}

          {/* BO Header Card */}
          <div className="bento-card space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F59E0B]/20 text-[#EA580C] flex items-center justify-center font-bold shrink-0">
                  <Crown className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-mono font-bold text-slate-900 tracking-tight">
                    Strategic Insight & Bottleneck Hub — Business Owner
                  </h1>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">
                    Identifikasi potensi keterlambatan (bottleneck) lintas tim produk dan kirimkan arahan strategis privat langsung ke Project Owner.
                  </p>
                </div>
              </div>
              <span className="bg-amber-50 text-amber-700 border border-amber-200/60 text-xs px-3 py-1 rounded-full font-mono font-bold shadow-2xs">
                Akses Eksekutif Read-Only
              </span>
            </div>
          </div>

          {/* 12-COLUMN RESTRUCTURED BENTO GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* ========================================================================= */}
            {/* KOLOM KIRI (5 Kolom / 40%): Panel Deteksi Bottleneck & Tugas Kritis */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 flex flex-col justify-between bento-card space-y-4 min-h-[460px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono border-b border-slate-100 pb-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#F59E0B]" />
                    <span>Deteksi Bottleneck & Tugas Kritis</span>
                  </h2>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                    overdueTasks.length + stuckInReviewTasks.length > 0
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {overdueTasks.length + stuckInReviewTasks.length > 0
                      ? `${overdueTasks.length + stuckInReviewTasks.length} Perlu Perhatian`
                      : 'Operasional Sehat'}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {overdueTasks.map(t => {
                    const tm = teams.find(team => team.id === t.team_id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedBoTargetTeamId(t.team_id);
                          setSelectedBoTaskId(t.id);
                        }}
                        className="p-3.5 bg-rose-50/70 hover:bg-rose-100/90 border border-rose-200/80 rounded-2xl cursor-pointer transition-all space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-rose-950">[{t.code}] {t.title}</span>
                          <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                            Melewati Deadline
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>{tm?.name} • #{t.pod_label}</span>
                          <span>Deadline: {t.deadline}</span>
                        </div>
                      </div>
                    );
                  })}

                  {stuckInReviewTasks.map(t => {
                    const tm = teams.find(team => team.id === t.team_id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedBoTargetTeamId(t.team_id);
                          setSelectedBoTaskId(t.id);
                        }}
                        className="p-3.5 bg-amber-50/70 hover:bg-amber-100/90 border border-amber-200/80 rounded-2xl cursor-pointer transition-all space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-slate-900">[{t.code}] {t.title}</span>
                          <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            Menunggu Review
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                          <span>{tm?.name} • #{t.pod_label}</span>
                          <span>{t.attachments.length} Lampiran</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Visualisasi Zero Bottleneck jika tidak ada issue */}
                  {overdueTasks.length === 0 && stuckInReviewTasks.length === 0 && (
                    <div className="py-8 px-4 text-center space-y-4">
                      <div className="relative w-14 h-14 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200/80 shadow-2xs">
                        <ShieldCheck className="w-7 h-7 text-emerald-600 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-mono font-bold text-slate-900 text-sm">
                          Operasional Seluruh Tim Sehat
                        </h3>
                        <p className="text-xs text-slate-500 font-sans">
                          (0 Critical Bottlenecks terdeteksi saat ini)
                        </p>
                      </div>

                      {/* 3 Ringkasan Metrik Mini Bento */}
                      <div className="grid grid-cols-3 gap-2.5 pt-3">
                        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-center space-y-1">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tim Terpantau</div>
                          <div className="font-mono font-bold text-emerald-700 text-xs">100% On-Track</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-center space-y-1">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Rata-rata Velocity</div>
                          <div className="font-mono font-bold text-amber-600 text-xs">Normal</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-center space-y-1">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Menunggu Review</div>
                          <div className="font-mono font-bold text-slate-800 text-xs">0 Blockers</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 font-mono text-[11px] text-slate-400 text-center">
                Pemantauan real-time status sprint lintas tim
              </div>
            </div>

            {/* ========================================================================= */}
            {/* KOLOM KANAN (7 Kolom / 60%): Form Arahan Strategis ke PO */}
            {/* ========================================================================= */}
            <div className="lg:col-span-7 flex flex-col justify-between bento-card space-y-5 min-h-[460px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between font-mono border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#F59E0B]" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Form Arahan Strategis (Khusus Project Owner)
                    </h2>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Privat & Enkripsi BO</span>
                </div>

                <form onSubmit={handleSendBoInsight} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Pilih Tim Tujuan *
                      </label>
                      <select
                        value={selectedBoTargetTeamId}
                        onChange={e => setSelectedBoTargetTeamId(e.target.value)}
                        className="w-full p-3 border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50/50 rounded-xl text-xs font-mono focus:outline-hidden text-slate-900"
                      >
                        {teams.map(t => {
                          const po = users.find(u => u.id === t.project_owner_id);
                          return (
                            <option key={t.id} value={t.id}>
                              {t.name} (PO: {po?.name || 'Belum ada'})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Kaitkan Tugas (Opsional)
                      </label>
                      <select
                        value={selectedBoTaskId}
                        onChange={e => setSelectedBoTaskId(e.target.value)}
                        className="w-full p-3 border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50/50 rounded-xl text-xs font-mono focus:outline-hidden text-slate-900"
                      >
                        <option value="">-- Arahan Umum Tim --</option>
                        {tasks.filter(t => t.team_id === selectedBoTargetTeamId).map(t => (
                          <option key={t.id} value={t.id}>
                            [{t.code}] {t.title} ({t.status})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Isi Arahan / Masukan Strategis *
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Tuliskan arahan mitigasi risiko, prioritas deliverables, atau feedback bottleneck untuk Project Owner..."
                      value={boInsightContent}
                      onChange={e => setBoInsightContent(e.target.value)}
                      className="w-full min-h-[140px] p-4 border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-slate-50/50 rounded-xl text-xs font-sans focus:outline-hidden text-slate-900 leading-relaxed"
                    />
                  </div>

                  <div className="text-[10px] text-slate-400 italic font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>* Arahan ini bersifat rahasia dan hanya dikirimkan secara langsung ke akun Project Owner terkait.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-5 rounded-xl font-mono font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-[0.99] bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Kirim Pesan ke Project Owner</span>
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SPRINT BACKGROUND MODAL HELPER */}
      {activeSprint && (
        <Modal
          isOpen={isSprintModalOpen}
          onClose={() => setIsSprintModalOpen(false)}
          title={`Notulensi & Background: ${activeSprint.title}`}
          subtitle={`Rentang Waktu: ${activeSprint.start_date} s/d ${activeSprint.end_date}`}
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="space-y-1">
              <div className="font-mono font-bold text-slate-900 text-xs">Target Utama (Sprint Goal)</div>
              <div className="p-3.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-2xl text-slate-900 font-semibold italic">
                "{activeSprint.goal}"
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-mono font-bold text-slate-900 text-xs">Notulensi Rapat & Background Tim</div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 leading-relaxed whitespace-pre-wrap font-sans max-h-60 overflow-y-auto">
                {activeSprint.meeting_notes || 'Belum ada notulensi rinci.'}
              </div>
            </div>

            {activeSprint.document_url && (
              <div className="pt-2">
                <a
                  href={activeSprint.document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold rounded-2xl inline-flex items-center gap-2 border border-slate-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-[#F59E0B]" />
                  <span>Buka Dokumen Rujukan Sprint</span>
                </a>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsSprintModalOpen(false)}
                className="px-5 py-2.5 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 font-mono font-bold rounded-2xl text-xs cursor-pointer shadow-xs transition-colors"
              >
                Tutup Notulensi
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
