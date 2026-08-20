import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckSquare, Plus, AlertTriangle, 
  FileText, ExternalLink, Check, RotateCcw,
  ShieldCheck, Send, CheckCircle2, User as UserIcon, AlertCircle
} from 'lucide-react';
import { StatusBadge, PriorityBadge, PodBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { TaskStatus, BlockerCategory } from '../../types';
import { DEFAULT_DOD_CHECKLIST } from '../../data/initialData';

export const TasksView: React.FC<{ onCreateTask: () => void }> = ({ onCreateTask }) => {
  const { 
    currentUser, 
    tasks, 
    users, 
    moveTaskStatus, 
    toggleTaskDoD,
    addAttachment,
    reportBlocker,
    resolveBlocker,
    approveTaskReview,
    rejectTaskReview,
    selectedPodFilter,
    setSelectedPodFilter
  } = useApp();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // Blocker reporting modal state
  const [blockerModalTaskId, setBlockerModalTaskId] = useState<string | null>(null);
  const [blockerReasonInput, setBlockerReasonInput] = useState('');
  const [blockerCategoryInput, setBlockerCategoryInput] = useState<BlockerCategory>('OTHER');

  // Inline deliverable input state per task
  const [deliverableInputs, setDeliverableInputs] = useState<Record<string, string>>({});

  // Revision notes state per task
  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({});
  const [activeRejectId, setActiveRejectId] = useState<string | null>(null);

  const isBO = currentUser.role === 'BUSINESS_OWNER';
  const isPO = currentUser.role === 'PROJECT_OWNER' || currentUser.role === 'PROJECT_LEAD';

  // 5 VISUAL COLUMNS (Pure Agile Kanban)
  const columns = [
    { key: 'TODO', label: '📋 To Do', bg: 'bg-[#F8FAFC]', border: 'border-slate-200', headerBg: 'bg-slate-100', text: 'text-slate-800' },
    { key: 'IN_PROGRESS', label: '⚡ In Progress', bg: 'bg-amber-50/50', border: 'border-amber-200/70', headerBg: 'bg-amber-100/70', text: 'text-amber-900' },
    { key: 'BLOCKED', label: '🚨 Blocked', bg: 'bg-rose-950/20', border: 'border-rose-300', headerBg: 'bg-rose-600', text: 'text-white' },
    { key: 'UNDER_REVIEW', label: '🔍 Under Review', bg: 'bg-blue-50/50', border: 'border-blue-200/70', headerBg: 'bg-blue-100/70', text: 'text-blue-900' },
    { key: 'DONE', label: '✅ Done', bg: 'bg-emerald-50/50', border: 'border-emerald-200/70', headerBg: 'bg-emerald-100/70', text: 'text-emerald-900' }
  ];

  // Filter tasks by Pod filter
  const filteredTasks = tasks.filter(task => {
    if (selectedPodFilter !== 'ALL' && task.pod_label !== selectedPodFilter && task.pod !== selectedPodFilter) {
      return false;
    }
    return true;
  });

  // Task filtering for each column
  const getTasksForColumn = (colKey: string) => {
    return filteredTasks.filter(t => {
      if (colKey === 'TODO') {
        return (t.status === 'TODO' || t.status === 'BACKLOG') && !t.is_blocked;
      }
      if (colKey === 'IN_PROGRESS') {
        return (t.status === 'IN_PROGRESS' || t.status === 'DIKERJAKAN') && !t.is_blocked;
      }
      if (colKey === 'BLOCKED') {
        return t.status === 'BLOCKED' || Boolean(t.is_blocked);
      }
      if (colKey === 'UNDER_REVIEW') {
        return (t.status === 'UNDER_REVIEW' || t.status === 'POD_REVIEW' || t.status === 'REVIEW') && !t.is_blocked;
      }
      if (colKey === 'DONE') {
        return (t.status === 'DONE' || t.status === 'SELESAI') && !t.is_blocked;
      }
      return false;
    });
  };

  // Drag & drop
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    if (isBO) return;
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
    setAlertMsg(null);
  };

  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    if (isBO) return;
    e.preventDefault();
    setDragOverCol(colKey);
  };

  const handleDrop = (e: React.DragEvent, colKey: string) => {
    if (isBO) return;
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDragOverCol(null);
    setDraggedTaskId(null);

    if (taskId) {
      const targetStatus: TaskStatus = colKey === 'BLOCKED' ? 'BLOCKED' : colKey === 'DONE' ? 'SELESAI' : (colKey as TaskStatus);
      const res = moveTaskStatus(taskId, targetStatus);
      if (!res.success && res.reason) {
        setAlertMsg(res.reason);
      }
    }
  };

  const handleReportBlockerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockerModalTaskId || !blockerReasonInput.trim()) return;

    reportBlocker(blockerModalTaskId, blockerReasonInput.trim(), blockerCategoryInput);
    setBlockerModalTaskId(null);
    setBlockerReasonInput('');
  };

  const handleSaveDeliverable = (taskId: string) => {
    const url = deliverableInputs[taskId]?.trim();
    if (!url) return;

    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;

    addAttachment(taskId, {
      name: url.length > 25 ? url.substring(0, 23) + '...' : url,
      url: formattedUrl,
      size: 'Tautan Web'
    });

    moveTaskStatus(taskId, 'UNDER_REVIEW');
    setDeliverableInputs({ ...deliverableInputs, [taskId]: '' });
  };

  const handleConfirmReject = (taskId: string) => {
    const reason = revisionNotes[taskId] || 'Tugas perlu diperbaiki sesuai kriteria.';
    rejectTaskReview(taskId, reason);
    setActiveRejectId(null);
  };

  return (
    <div className="space-y-4 pb-12 text-xs font-sans">
      {/* Alert Warning */}
      {alertMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between shadow-xs font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold text-xs">{alertMsg}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="text-xs font-bold text-rose-600 hover:underline">
            Tutup
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#F59E0B]" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Papan Kanban Agile SyncFlow
            </h1>
            {isBO && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                Read-Only BO
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-sans">
            5 Kolom Interaktif: 📋 To Do → ⚡ In Progress → 🚨 Blocked → 🔍 Under Review → ✅ Done
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Pod Filter */}
          <select
            value={selectedPodFilter}
            onChange={e => setSelectedPodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-hidden"
          >
            <option value="ALL">Semua 4 Pod</option>
            <option value="BUSINESS_ANALYST">Pod BA (Business Analyst)</option>
            <option value="PRODUCT_BUILDER">Pod PB (Product Builder)</option>
            <option value="QA_DOCUMENTATION">Pod QA (QA & Documentation)</option>
            <option value="GROWTH_MARKETING">Pod MG (Growth Marketing)</option>
          </select>

          {isPO && (
            <button
              onClick={onCreateTask}
              className="bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Bikin Tugas Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* 5-COLUMN AGILE KANBAN BOARD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
        {columns.map(col => {
          const colTasks = getTasksForColumn(col.key);
          const isOver = dragOverCol === col.key;

          return (
            <div
              key={col.key}
              onDragOver={e => handleDragOver(e, col.key)}
              onDrop={e => handleDrop(e, col.key)}
              className={`rounded-3xl border flex flex-col transition-all min-h-[580px] ${col.bg} ${col.border} ${
                isOver ? 'ring-2 ring-[#F59E0B] bg-white scale-[1.01]' : ''
              }`}
            >
              {/* Header Kolom */}
              <div className={`p-3.5 border-b ${col.border} flex items-center justify-between rounded-t-3xl font-mono ${col.headerBg}`}>
                <span className={`font-bold text-xs uppercase tracking-wider ${col.text}`}>
                  {col.label}
                </span>
                <span className="text-xs font-bold bg-white/90 text-slate-900 px-2 py-0.5 rounded-full border border-slate-200">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards Container */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[720px]">
                {colTasks.map(task => {
                  const assignee = users.find(u => u.id === task.assignee_id);
                  const isTaskBlocked = task.status === 'BLOCKED' || task.is_blocked;
                  const deliverableUrl = task.deliverable_url || task.attachments[0]?.url;

                  return (
                    <div
                      key={task.id}
                      draggable={!isBO}
                      onDragStart={e => handleDragStart(e, task.id)}
                      className={`rounded-2xl p-4 transition-all space-y-3 cursor-grab active:cursor-grabbing border ${
                        isTaskBlocked
                          ? 'bg-rose-600 text-white border-rose-700 shadow-lg animate-pulse ring-2 ring-rose-400'
                          : 'bg-white/90 text-slate-900 border-slate-200 shadow-xs hover:shadow-md'
                      }`}
                    >
                      {/* Card Top: Code & Badges */}
                      <div className="flex items-center justify-between gap-2 font-mono">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          isTaskBlocked ? 'bg-rose-950 text-rose-200' : 'bg-slate-900 text-white'
                        }`}>
                          {task.code}
                        </span>
                        <div className="flex items-center gap-1">
                          <PodBadge pod={task.pod_label || task.pod || 'PB'} />
                          <PriorityBadge priority={task.priority} />
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h3 className={`font-mono font-bold text-xs leading-snug ${isTaskBlocked ? 'text-white' : 'text-slate-900'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className={`text-[11px] font-sans line-clamp-2 ${isTaskBlocked ? 'text-rose-100' : 'text-slate-600'}`}>
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* PIC User */}
                      <div className="flex items-center gap-1.5 text-[10px] font-mono border-t pt-2 border-slate-100">
                        <UserIcon className={`w-3.5 h-3.5 ${isTaskBlocked ? 'text-rose-200' : 'text-slate-400'}`} />
                        <span className={`font-semibold ${isTaskBlocked ? 'text-rose-100' : 'text-slate-700'}`}>
                          PIC: {assignee?.name || task.assigned_to || 'Anak PKL'}
                        </span>
                      </div>

                      {/* BLOCKED REASON DISPLAY */}
                      {isTaskBlocked && (
                        <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-100 text-xs font-sans italic space-y-1">
                          <div className="font-mono font-bold text-rose-300 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Alasan Kendala [{task.blocker_category || 'TEKNIS'}]:</span>
                          </div>
                          <div>"{task.blocker_reason || 'Terjadi hambatan yang memerlukan intervensi PO.'}"</div>
                        </div>
                      )}

                      {/* DoD Checklist Interactive */}
                      {task.dod_checklist && task.dod_checklist.length > 0 && (
                        <div className={`space-y-1.5 pt-2 border-t text-[11px] font-sans ${isTaskBlocked ? 'border-rose-500' : 'border-slate-100'}`}>
                          <div className={`font-mono font-bold text-[10px] uppercase flex items-center justify-between ${isTaskBlocked ? 'text-rose-200' : 'text-slate-500'}`}>
                            <span>DoD Checklist</span>
                            <span>{task.dod_checklist.filter(d => d.completed).length}/{task.dod_checklist.length}</span>
                          </div>
                          {task.dod_checklist.map(item => (
                            <div
                              key={item.id}
                              onClick={() => toggleTaskDoD(task.id, item.id)}
                              className={`flex items-start gap-2 cursor-pointer p-1 rounded hover:bg-slate-100/50 ${
                                isTaskBlocked ? 'hover:bg-rose-700/50' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => {}}
                                className="mt-0.5 cursor-pointer accent-[#F59E0B]"
                              />
                              <span className={item.completed ? 'line-through text-slate-400' : isTaskBlocked ? 'text-white' : 'text-slate-800'}>
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Deliverable Link Display */}
                      {deliverableUrl && (
                        <a
                          href={deliverableUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-mono font-bold flex items-center justify-between text-[11px] transition-colors"
                        >
                          <span className="truncate">🔗 Deliverable: {deliverableUrl}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1" />
                        </a>
                      )}

                      {/* INLINE DELIVERABLE INPUT (For IN_PROGRESS) */}
                      {!isBO && !isTaskBlocked && (task.status === 'IN_PROGRESS' || task.status === 'DIKERJAKAN') && (
                        <div className="space-y-1.5 pt-2 border-t border-slate-100 font-mono">
                          <input
                            type="text"
                            placeholder="Tempel URL (Drive/Figma/Docs/PR)..."
                            value={deliverableInputs[task.id] || ''}
                            onChange={e => setDeliverableInputs({ ...deliverableInputs, [task.id]: e.target.value })}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl text-[11px] focus:outline-hidden"
                          />
                          <button
                            onClick={() => handleSaveDeliverable(task.id)}
                            disabled={!deliverableInputs[task.id]?.trim()}
                            className={`w-full py-2 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 transition-all ${
                              deliverableInputs[task.id]?.trim()
                                ? 'bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Send className="w-3 h-3" />
                            <span>Kirim untuk Review PO</span>
                          </button>
                        </div>
                      )}

                      {/* PO REVIEW CONTROLS (In UNDER_REVIEW) */}
                      {isPO && (task.status === 'UNDER_REVIEW' || task.status === 'POD_REVIEW' || task.status === 'REVIEW') && !isTaskBlocked && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 font-mono">
                          {activeRejectId === task.id ? (
                            <div className="space-y-1.5">
                              <textarea
                                rows={2}
                                placeholder="Catatan revisi..."
                                value={revisionNotes[task.id] || ''}
                                onChange={e => setRevisionNotes({ ...revisionNotes, [task.id]: e.target.value })}
                                className="w-full p-2 bg-white border border-slate-300 rounded-xl text-[11px] font-sans"
                              />
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleConfirmReject(task.id)}
                                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-[11px] cursor-pointer"
                                >
                                  Kirim Revisi
                                </button>
                                <button
                                  onClick={() => setActiveRejectId(null)}
                                  className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => approveTaskReview(task.id)}
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] cursor-pointer shadow-xs flex items-center justify-center gap-1 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve (Done)</span>
                              </button>
                              <button
                                onClick={() => setActiveRejectId(task.id)}
                                className="py-2 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold rounded-xl text-[11px] cursor-pointer flex items-center justify-center gap-1 transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Minta Revisi</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* UNBLOCK BUTTON (For BLOCKED Column) */}
                      {(isPO || currentUser.role === 'PROJECT_LEAD') && isTaskBlocked && (
                        <button
                          onClick={() => resolveBlocker(task.id)}
                          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-bold rounded-xl text-xs cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Resolve Blocker (Buka Kunci)</span>
                        </button>
                      )}

                      {/* 🚨 LAPORKAN BLOCKER BUTTON (For Non-Blocked Tasks) */}
                      {!isBO && !isTaskBlocked && (task.status !== 'DONE' && task.status !== 'SELESAI') && (
                        <button
                          onClick={() => setBlockerModalTaskId(task.id)}
                          className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-mono font-bold rounded-xl text-[11px] cursor-pointer transition-colors flex items-center justify-center gap-1"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>🚨 Laporkan Blocker</span>
                        </button>
                      )}
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-xs italic font-mono">
                    Kosong
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🚨 BLOCKER REPORTING MODAL */}
      {blockerModalTaskId && (
        <Modal
          isOpen={Boolean(blockerModalTaskId)}
          onClose={() => setBlockerModalTaskId(null)}
          title="🚨 Laporkan Blocker / Hambatan Teknis"
          subtitle="Status tugas akan otomatis berpindah ke kolom BLOCKED (Merah Menyala)"
        >
          <form onSubmit={handleReportBlockerSubmit} className="space-y-4 text-xs font-sans">
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-950 rounded-2xl space-y-1">
              <div className="font-mono font-bold flex items-center gap-1.5 text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Sinyal Darurat Hambatan</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-900">
                Project Owner & Project Lead akan segera menerima notifikasi darurat untuk membantu pembongkaran kendala.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Kategori Kendala *
              </label>
              <select
                value={blockerCategoryInput}
                onChange={e => setBlockerCategoryInput(e.target.value as BlockerCategory)}
                className="w-full p-3 border border-rose-300 focus:border-rose-500 bg-white rounded-2xl text-xs font-mono focus:outline-hidden text-slate-900"
              >
                <option value="API_DEPENDENCY">🔌 API_DEPENDENCY (Ketergantungan Backend/API)</option>
                <option value="ASSET_MISSING">🎨 ASSET_MISSING (Desain Figma / Asset belum siap)</option>
                <option value="ACCESS_ISSUE">🔑 ACCESS_ISSUE (Akses Server / DB / Credential)</option>
                <option value="OTHER">⚡ OTHER (Kendala Teknis Lainnya)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                Alasan Kendala *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Tuliskan 1 kalimat alasan hambatan yang membuat Anda bingung/stuck..."
                value={blockerReasonInput}
                onChange={e => setBlockerReasonInput(e.target.value)}
                className="w-full p-4 border border-rose-300 focus:border-rose-500 bg-white rounded-2xl text-xs font-sans focus:outline-hidden text-slate-900 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setBlockerModalTaskId(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold rounded-2xl text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!blockerReasonInput.trim()}
                className={`px-5 py-2.5 font-mono font-bold rounded-2xl text-xs cursor-pointer shadow-md flex items-center gap-2 transition-all ${
                  blockerReasonInput.trim()
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Pindahkan Ke Blocked (Merah)</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
