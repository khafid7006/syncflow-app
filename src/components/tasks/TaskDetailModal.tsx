import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { StatusBadge, PriorityBadge, PodBadge, RoleBadge, PodOwnerBadge } from '../common/Badge';
import { TaskStatus, TaskPriority, PodType } from '../../types';
import { api } from '../../services/api';
import { 
  User, Calendar, Timer, Link as LinkIcon, ExternalLink, 
  Send, Trash2, Edit3, Check, RotateCcw, AlertCircle, 
  Lock, Play, ArrowRight, MessageSquare, Plus, X, 
  CheckSquare, Square, ShieldCheck, Crown, Zap 
} from 'lucide-react';
import { DEFAULT_DOD_CHECKLIST } from '../../data/initialData';

export const TaskDetailModal: React.FC = () => {
  const { 
    selectedTaskId, 
    setSelectedTaskId, 
    tasks, 
    users, 
    teams, 
    sprints, 
    currentUser, 
    updateTask, 
    moveTaskStatus, 
    toggleTaskDoD,
    startFocusTask,
    approveTaskReview,
    rejectTaskReview,
    addComment, 
    addAttachment, 
    deleteTask 
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [attachmentInput, setAttachmentInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit fields (for Leader / PO)
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAssigneeId, setEditAssigneeId] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('MEDIUM');
  const [editDeadline, setEditDeadline] = useState('');
  const [editSprintId, setEditSprintId] = useState('');
  const [editDodItems, setEditDodItems] = useState<import('../../types').DodItem[]>([]);
  const [newEditDodText, setNewEditDodText] = useState('');

  if (!selectedTaskId) return null;

  const task = tasks.find(t => t.id === selectedTaskId);
  if (!task) return null;

  const team = teams.find(t => t.id === task.team_id);
  const assignee = users.find(u => u.id === task.assignee_id);
  const sprint = sprints.find(s => s.id === task.sprint_id);
  const teamMembers = users.filter(u => u.team_id === task.team_id);
  const teamSprints = sprints.filter(s => s.team_id === task.team_id);

  const isLeader = currentUser.role === 'PROJECT_LEADER' && currentUser.team_id === task.team_id;
  const isPO = currentUser.role === 'PROJECT_OWNER' && currentUser.team_id === task.team_id;
  const isBO = currentUser.role === 'BUSINESS_OWNER';
  const isAssignee = currentUser.id === task.assignee_id;
  const isMember = currentUser.role === 'MEMBER';

  // Wewenang Tahap 1 (Pod Owner): Verifikasi DoD Pod
  const canVerifyPodDoD = api.canVerifyPodDoD(currentUser, task);
  // Wewenang Tahap 2 (Project Leader & Project Owner): Sahkan Selesai
  const canApproveFinal = api.canApproveFinalReview(currentUser, task);
  const isPodOwner = Boolean(currentUser.role === 'MEMBER' && (currentUser.is_pod_owner || currentUser.is_pod_lead));

  const canEditCommitment = isLeader || isPO;

  // Filter visible comments according to RBAC privacy rules
  const visibleComments = api.getVisibleComments(currentUser, task.comments);

  // DoD status
  const dodList = task.dod_checklist && task.dod_checklist.length > 0 ? task.dod_checklist : DEFAULT_DOD_CHECKLIST;
  const allDoDDone = dodList.every(item => item.completed);
  const completedDoDCount = dodList.filter(item => item.completed).length;

  const handleStartEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditAssigneeId(task.assignee_id);
    setEditPriority(task.priority);
    setEditDeadline(task.deadline);
    setEditSprintId(task.sprint_id);
    setEditDodItems(task.dod_checklist && task.dod_checklist.length > 0 ? [...task.dod_checklist] : [...DEFAULT_DOD_CHECKLIST]);
    setNewEditDodText('');
    setIsEditing(true);
    setErrorMsg(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = updateTask(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      assignee_id: editAssigneeId,
      priority: editPriority,
      deadline: editDeadline,
      sprint_id: editSprintId,
      dod_checklist: editDodItems
    });

    if (res.success) {
      setIsEditing(false);
      setErrorMsg(null);
    } else if (res.reason) {
      setErrorMsg(res.reason);
    }
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    setErrorMsg(null);
    const res = moveTaskStatus(task.id, newStatus);
    if (!res.success && res.reason) {
      setErrorMsg(res.reason);
    }
  };

  const handleApproveFinal = () => {
    setErrorMsg(null);
    const res = moveTaskStatus(task.id, 'SELESAI');
    if (!res.success && res.reason) {
      setErrorMsg(res.reason);
    }
  };

  const handlePodOwnerPassToLeader = () => {
    setErrorMsg(null);
    const res = moveTaskStatus(task.id, 'REVIEW');
    if (!res.success && res.reason) {
      setErrorMsg(res.reason);
    }
  };

  const handleReject = () => {
    setErrorMsg(null);
    if (!rejectReason.trim()) {
      alert('Silakan tuliskan catatan perbaikan sebelum mengembalikan tugas.');
      return;
    }
    rejectTaskReview(task.id, rejectReason.trim());
    setRejectReason('');
    setIsRejectOpen(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addComment(task.id, commentText.trim());
    setCommentText('');
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentInput.trim()) return;

    const val = attachmentInput.trim();
    const isUrl = val.startsWith('http://') || val.startsWith('https://');

    addAttachment(task.id, {
      name: isUrl ? (val.length > 40 ? val.substring(0, 37) + '...' : val) : val,
      url: isUrl ? val : '#'
    });
    setAttachmentInput('');
  };

  const handleDelete = () => {
    if (confirm(`Hapus tugas "${task.title}"?`)) {
      deleteTask(task.id);
      setSelectedTaskId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-[#370000]" onClick={e => e.stopPropagation()}>
        
        {/* ========================================================================= */}
        {/* STREAMLINED HEADER */}
        {/* ========================================================================= */}
        <div className="p-6 border-b border-[#E2E8F0] space-y-3 bg-white">
          {/* Baris 1: ID, Pod, Judul, & Tombol Close */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-xs bg-[#E2E8F0] text-[#370000] px-2 py-0.5 rounded">
                  {task.code}
                </span>
                <PodBadge pod={task.pod_label} />
                {(assignee?.is_pod_owner || assignee?.is_pod_lead) && (
                  <PodOwnerBadge pod={task.pod_label} />
                )}
                <PriorityBadge priority={task.priority} size="sm" />
                <StatusBadge status={task.status} size="sm" />
              </div>

              {!isEditing && (
                <h2 className="text-base font-mono font-bold text-[#370000] tracking-tight pt-0.5">
                  {task.title}
                </h2>
              )}
            </div>

            <button
              onClick={() => setSelectedTaskId(null)}
              className="p-1.5 text-slate-400 hover:text-[#370000] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Baris 2: Quick Meta Inline & Header Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3 text-[11px] text-[#722300]/80 font-mono flex-wrap">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#F59E0B]" />
                <strong className="text-[#370000]">{assignee?.name || 'Belum ditugaskan'}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#722300]" />
                <span>{task.deadline}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 truncate max-w-[180px]">
                <Timer className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="truncate">{sprint?.title || 'Tanpa Sprint'}</span>
              </span>
            </div>

            {/* Quick Action Buttons in Header */}
            {!isEditing && (
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {/* 1. TAHAP POD_REVIEW (POD OWNER VERIFICATION) */}
                {task.status === 'POD_REVIEW' && (
                  <>
                    {canVerifyPodDoD ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handlePodOwnerPassToLeader}
                          disabled={!allDoDDone}
                          title={allDoDDone ? "Loloskan tugas ke tahap Review Leader" : "Centang semua checklist DoD terlebih dahulu"}
                          className={`px-3.5 py-1.5 font-mono font-bold rounded-xl transition-colors flex items-center gap-1 text-xs shadow-2xs ${
                            allDoDDone
                              ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] cursor-pointer'
                              : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                          }`}
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>{allDoDDone ? 'Loloskan ke Leader' : `Verifikasi DoD (${completedDoDCount}/${dodList.length})`}</span>
                        </button>
                        <button
                          onClick={() => setIsRejectOpen(!isRejectOpen)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-mono font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer text-xs border border-rose-200"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Kembalikan</span>
                        </button>
                      </div>
                    ) : (
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-mono font-bold rounded-lg border border-indigo-200 text-[11px]">
                        ⏳ Cek Pod Owner ({task.pod_label})
                      </span>
                    )}
                  </>
                )}

                {/* 2. TAHAP REVIEW (LEADER/PO FINAL APPROVAL) */}
                {task.status === 'REVIEW' && (
                  <>
                    {canApproveFinal ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleApproveFinal}
                          disabled={!allDoDDone}
                          title={allDoDDone ? "Sahkan tugas selesai" : "DoD belum lengkap"}
                          className={`px-3.5 py-1.5 font-mono font-bold rounded-xl transition-colors flex items-center gap-1 text-xs shadow-2xs ${
                            allDoDDone
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                              : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{allDoDDone ? 'Sahkan Selesai' : `DoD (${completedDoDCount}/${dodList.length})`}</span>
                        </button>
                        <button
                          onClick={() => setIsRejectOpen(!isRejectOpen)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-mono font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer text-xs border border-rose-200"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Kembalikan</span>
                        </button>
                      </div>
                    ) : (
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 font-mono font-bold rounded-lg border border-blue-200 text-[11px]">
                        ⏳ Menunggu Approval Leader/PO
                      </span>
                    )}
                  </>
                )}

                {/* 3. TAHAP DIKERJAKAN & BACKLOG (MEMBER ACTION) */}
                {!isBO && task.status !== 'POD_REVIEW' && task.status !== 'REVIEW' && (
                  <>
                    {(task.status === 'DIKERJAKAN' || task.status === 'BACKLOG') && (
                      <button
                        onClick={() => {
                          setSelectedTaskId(null);
                          startFocusTask(task.id);
                        }}
                        className="px-3.5 py-1.5 bg-[#F59E0B]/20 hover:bg-[#F59E0B] text-[#722300] hover:text-[#370000] border border-[#F59E0B] font-mono font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>Buka Workspace</span>
                      </button>
                    )}

                    {task.status === 'BACKLOG' && (
                      <button
                        onClick={() => handleStatusChange('DIKERJAKAN')}
                        className="px-3.5 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-mono font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs text-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Mulai Kerjakan</span>
                      </button>
                    )}

                    {task.status === 'DIKERJAKAN' && (
                      <button
                        onClick={() => handleStatusChange('POD_REVIEW')}
                        title={task.attachments.length > 0 ? "Ajukan ke Pod Owner untuk verifikasi DoD" : "Lampirkan minimal 1 tautan hasil kerja terlebih dahulu"}
                        className={`px-3.5 py-1.5 font-mono font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs text-xs ${
                          task.attachments.length > 0
                            ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#370000]'
                            : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Ajukan ke Pod Owner {task.attachments.length > 0 ? '' : '(Wajib Link)'}</span>
                      </button>
                    )}

                    {task.status === 'SELESAI' && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-mono font-bold rounded-lg border border-emerald-200 text-[11px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Selesai
                      </span>
                    )}
                  </>
                )}

                {/* Edit / Delete (Leader & PO) */}
                {canEditCommitment && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleStartEdit}
                      className="p-1.5 text-slate-500 hover:text-[#370000] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Tugas"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Tugas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Reject Drawer */}
          {isRejectOpen && (
            <div className="pt-2 border-t border-rose-200 flex gap-2 animate-in fade-in duration-100">
              <input
                type="text"
                placeholder="Tuliskan catatan revisi sebelum tugas dikembalikan ke Dikerjakan..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="flex-1 p-2 bg-rose-50/50 border border-rose-200 rounded-xl text-xs font-sans focus:outline-hidden focus:ring-1 focus:ring-rose-400"
              />
              <button
                onClick={handleReject}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold rounded-xl cursor-pointer text-xs shrink-0"
              >
                Kirim Revisi
              </button>
            </div>
          )}
        </div>

        {/* Warning Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-xs font-bold hover:underline">
              Tutup
            </button>
          </div>
        )}

        {/* ================================================== */}
        {/* B. AREA KONTEN UTAMA: STREAMLINED & BERSIH */}
        {/* ================================================== */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-white">
          {/* JIKA MODE EDIT */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4 font-mono">
              <div className="font-bold text-[#370000] text-xs">
                Edit Data Tugas
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 font-sans">Judul Tugas</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 font-sans">Deskripsi</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 font-sans">Penanggung Jawab</label>
                  <select
                    value={editAssigneeId}
                    onChange={e => setEditAssigneeId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs"
                  >
                    {teamMembers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.is_pod_lead ? `Lead ${u.pod_label}` : u.pod_label || u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 font-sans">Sprint</label>
                  <select
                    value={editSprintId}
                    onChange={e => setEditSprintId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs"
                  >
                    <option value="">Tanpa Sprint</option>
                    {teamSprints.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 font-sans">Prioritas</label>
                  <select
                    value={editPriority}
                    onChange={e => setEditPriority(e.target.value as TaskPriority)}
                    className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-semibold"
                  >
                    <option value="LOW">Rendah</option>
                    <option value="MEDIUM">Sedang</option>
                    <option value="HIGH">Tinggi</option>
                    <option value="CRITICAL">Kritis</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 font-sans">Deadline</label>
                  <input
                    type="date"
                    required
                    value={editDeadline}
                    onChange={e => setEditDeadline(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* DoD Editor for Leader & PO */}
              <div className="p-3.5 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2.5 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#370000]">
                    <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                    <span>Kriteria Definition of Done (DoD)</span>
                  </div>
                  <span className="text-[10px] text-[#722300] bg-[#F59E0B]/20 px-2 py-0.5 rounded font-bold">
                    Edit oleh Leader / PO
                  </span>
                </div>

                <div className="space-y-1.5">
                  {editDodItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="w-5 text-[11px] font-bold text-[#722300]">{idx + 1}.</span>
                      <input
                        type="text"
                        value={item.label}
                        onChange={e => {
                          const val = e.target.value;
                          setEditDodItems(prev => prev.map(d => d.id === item.id ? { ...d, label: val } : d));
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-sans focus:outline-hidden focus:ring-1 focus:ring-[#F59E0B]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (editDodItems.length <= 1) {
                            alert('Tugas wajib memiliki minimal 1 syarat DoD.');
                            return;
                          }
                          setEditDodItems(prev => prev.filter(d => d.id !== item.id));
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Hapus kriteria DoD"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Tambah kriteria DoD baru..."
                    value={newEditDodText}
                    onChange={e => setNewEditDodText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newEditDodText.trim()) {
                          setEditDodItems(prev => [...prev, { id: `dod-${Date.now()}`, label: newEditDodText.trim(), completed: false }]);
                          setNewEditDodText('');
                        }
                      }
                    }}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-sans focus:outline-hidden focus:ring-1 focus:ring-[#F59E0B]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newEditDodText.trim()) {
                        setEditDodItems(prev => [...prev, { id: `dod-${Date.now()}`, label: newEditDodText.trim(), completed: false }]);
                        setNewEditDodText('');
                      }
                    }}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-[#F59E0B] text-[#370000] rounded-lg font-mono font-bold text-xs cursor-pointer transition-colors shrink-0"
                  >
                    + Tambah
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-mono font-bold rounded-xl cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" /> Simpan
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* 1. DESKRIPSI TUGAS */}
              <div className="space-y-1.5">
                <div className="font-mono font-bold text-xs text-[#370000] uppercase tracking-wider">
                  Deskripsi Tugas
                </div>
                <p className="text-slate-700 text-xs leading-relaxed font-sans whitespace-pre-wrap">
                  {task.description || 'Tidak ada deskripsi detail untuk tugas ini.'}
                </p>
              </div>

              {/* 2. DEFINITION OF DONE (DoD) CHECKLIST */}
              <div className="space-y-2.5 pt-4 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between font-mono">
                  <div className="font-bold text-xs text-[#370000] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>
                      Syarat Wajib Selesai ({completedDoDCount}/{dodList.length} Dicentang)
                    </span>
                  </div>
                  {task.status === 'REVIEW' && canApproveFinal ? (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      allDoDDone 
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                        : 'text-[#722300] bg-[#F59E0B]/20 border-[#F59E0B]'
                    }`}>
                      {allDoDDone ? '✓ Siap Disetujui Selesai' : 'Centang semua DoD untuk approve'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {completedDoDCount > 0 ? `${completedDoDCount}/${dodList.length} Diverifikasi` : 'Diverifikasi oleh Leader saat Review'}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-[#E2E8F0]">
                  {dodList.map((dodItem, idx) => {
                    const isReviewerInteractive = (task.status === 'POD_REVIEW' && canVerifyPodDoD) || (task.status === 'REVIEW' && canApproveFinal);

                    return (
                      <div
                        key={dodItem.id}
                        onClick={() => isReviewerInteractive && toggleTaskDoD(task.id, dodItem.id)}
                        className={`flex items-start gap-2.5 p-2 rounded-lg transition-colors ${
                          isReviewerInteractive ? 'cursor-pointer hover:bg-white' : 'cursor-default'
                        } ${dodItem.completed ? 'bg-white/80' : ''}`}
                      >
                        <button
                          type="button"
                          className={`mt-0.5 focus:outline-hidden ${isReviewerInteractive ? 'cursor-pointer' : 'cursor-default'}`}
                          disabled={!isReviewerInteractive}
                        >
                          {dodItem.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <div className="flex-1 text-xs select-none">
                          <span className={`${dodItem.completed ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                            {idx + 1}. {dodItem.label}
                          </span>
                          {!isReviewerInteractive && task.status !== 'SELESAI' && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              (Akan diverifikasi oleh Pod Owner / Leader saat Review)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. BUKTI / LINK HASIL PEKERJAAN */}
              <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between font-mono">
                  <div className="font-bold text-xs text-[#370000] uppercase tracking-wider flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Bukti / Link Hasil Kerja ({task.attachments.length})</span>
                  </div>
                </div>

                {/* 1-Baris Minimalist Link Input */}
                {!isBO && (
                  <form onSubmit={handleAddAttachment} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan URL / Link Dokumen Hasil (e.g., https://github.com/... atau PR #24)"
                      value={attachmentInput}
                      onChange={e => setAttachmentInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs font-mono placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#F59E0B]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-mono font-bold rounded-xl text-xs cursor-pointer shadow-2xs transition-colors shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Simpan Link</span>
                    </button>
                  </form>
                )}

                {/* List of Saved Links */}
                {task.attachments.length > 0 ? (
                  <div className="space-y-1.5">
                    {task.attachments.map((att, i) => {
                      const isUrl = att.url && att.url !== '#';
                      return (
                        <div
                          key={i}
                          className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-[#E2E8F0] flex items-center justify-between text-xs font-mono transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <ExternalLink className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                            {isUrl ? (
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-[#370000] hover:text-[#F59E0B] hover:underline truncate"
                              >
                                {att.name}
                              </a>
                            ) : (
                              <span className="font-semibold text-[#370000] truncate">{att.name}</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2 font-mono">{att.uploaded_at}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs italic font-sans">
                    Belum ada tautan atau bukti hasil kerja yang dilampirkan.
                  </div>
                )}
              </div>

              {/* 4. DISKUSI & KOMENTAR (Feed Thread) */}
              <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between font-mono">
                  <div className="font-bold text-xs text-[#370000] uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Diskusi & Catatan ({visibleComments.length})</span>
                  </div>
                  {isBO && (
                    <span className="text-[10px] text-[#722300] bg-[#F59E0B]/15 px-2 py-0.5 rounded-md border border-[#F59E0B]/40 font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#F59E0B]" /> Masukan Privat BO
                    </span>
                  )}
                </div>

                {/* Comments List */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {visibleComments.map(c => {
                    const isBoInsight = Boolean(c.is_private_bo);

                    return (
                      <div
                        key={c.id}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all ${
                          isBoInsight
                            ? 'bg-[#F59E0B]/10 border-[#F59E0B]/40'
                            : 'bg-slate-50 border-[#E2E8F0]'
                        }`}
                      >
                        <img
                          src={c.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover border border-[#E2E8F0] shrink-0 mt-0.5"
                        />
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[#370000]">{c.user_name}</span>
                              {isBoInsight && (
                                <span className="px-1.5 py-0.2 rounded bg-[#F59E0B]/20 text-[#722300] font-bold text-[9px]">
                                  Masukan BO (Khusus PO)
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0">{c.created_at}</span>
                          </div>
                          <p className={`text-xs leading-relaxed font-sans ${isBoInsight ? 'text-[#722300] font-medium' : 'text-slate-700'}`}>
                            {c.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {visibleComments.length === 0 && (
                    <div className="text-center py-3 text-slate-400 text-xs italic font-sans">
                      Belum ada komentar diskusi.
                    </div>
                  )}
                </div>

                {/* Input Komentar Cepat */}
                <form onSubmit={handleAddComment} className="pt-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-[#E2E8F0] shrink-0"
                    />
                    <input
                      type="text"
                      placeholder={
                        isBO
                          ? "Tulis insight / arahan strategis privat untuk Project Owner..."
                          : "Tulis komentar atau koordinasi pengerjaan..."
                      }
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-xl text-xs bg-slate-50 border-[#E2E8F0] focus:bg-white focus:ring-1 focus:ring-[#F59E0B] focus:outline-hidden font-sans"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 text-[#370000] font-mono font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer shadow-2xs transition-colors shrink-0 bg-[#F59E0B] hover:bg-[#D97706]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isBO ? 'Insight' : 'Kirim'}</span>
                    </button>
                  </div>

                  {isBO && (
                    <div className="text-[10px] text-[#722300] italic pl-9 pt-1 font-mono">
                      * Catatan insight ini hanya dapat dibaca oleh Project Owner dan sesama Business Owner.
                    </div>
                  )}
                </form>
              </div>

              {/* 5. TOMBOL AKSI UTAMA DI BAGIAN BAWAH MODAL */}
              <div className="pt-4 border-t border-[#E2E8F0]">
                {task.status === 'BACKLOG' && (
                  <button
                    onClick={() => {
                      moveTaskStatus(task.id, 'DIKERJAKAN');
                      setSelectedTaskId(null);
                    }}
                    className="w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-sans font-normal text-xs rounded-xl cursor-pointer shadow-xs transition-colors"
                  >
                    Kerjakan Tugas Ini
                  </button>
                )}

                {task.status === 'DIKERJAKAN' && (
                  <button
                    onClick={() => {
                      if (!task.attachments || task.attachments.length === 0) {
                        alert('Lampirkan minimal 1 link hasil kerja sebelum mengirim.');
                        return;
                      }
                      moveTaskStatus(task.id, 'POD_REVIEW');
                      setSelectedTaskId(null);
                    }}
                    className="w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-sans font-normal text-xs rounded-xl cursor-pointer shadow-xs transition-colors"
                  >
                    Kirim ke Pod Owner
                  </button>
                )}

                {task.status === 'POD_REVIEW' && (
                  <button
                    onClick={() => {
                      if (!allDoDDone) {
                        alert('Centang semua syarat selesai sebelum meneruskan ke Ketua Tim.');
                        return;
                      }
                      moveTaskStatus(task.id, 'REVIEW');
                      setSelectedTaskId(null);
                    }}
                    disabled={!canVerifyPodDoD || !allDoDDone}
                    className={`w-full py-3 font-sans font-normal text-xs rounded-xl shadow-xs transition-colors ${
                      canVerifyPodDoD && allDoDDone
                        ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    Teruskan ke Ketua Tim
                  </button>
                )}

                {task.status === 'REVIEW' && (
                  <button
                    onClick={() => {
                      approveTaskReview(task.id);
                      setSelectedTaskId(null);
                    }}
                    disabled={!canApproveFinal}
                    className={`w-full py-3 font-sans font-normal text-xs rounded-xl shadow-xs transition-colors ${
                      canApproveFinal
                        ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    Sahkan Selesai
                  </button>
                )}

                {task.status === 'SELESAI' && (
                  <div className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-sans font-normal text-xs rounded-xl text-center">
                    Tugas Telah Selesai
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
