import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckSquare, Plus, 
  Kanban as KanbanIcon, List, AlertCircle, 
  FileText, ExternalLink, Target, Calendar, Zap 
} from 'lucide-react';
import { StatusBadge, PriorityBadge, PodBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { TaskStatus } from '../../types';

export const TasksView: React.FC<{ onCreateTask: () => void }> = ({ onCreateTask }) => {
  const { 
    currentUser, 
    tasks, 
    teams, 
    sprints, 
    users, 
    moveTaskStatus, 
    setSelectedTaskId,
    startFocusTask,
    selectedTeamFilter,
    setSelectedTeamFilter,
    selectedSprintFilter,
    setSelectedSprintFilter,
    selectedPodFilter,
    setSelectedPodFilter
  } = useApp();

  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [isNotulensiOpen, setIsNotulensiOpen] = useState(false);

  // 4 Kolom Kanban Linier (TODO -> IN_PROGRESS / BLOCKED -> UNDER_REVIEW -> DONE)
  const columns: { status: TaskStatus; label: string; bg: string; border: string }[] = [
    { status: 'TODO', label: 'Akan Dikerjakan (TODO)', bg: 'bg-[#F8FAFC]', border: 'border-[#E2E8F0]' },
    { status: 'IN_PROGRESS', label: 'Sedang Dikerjakan / Blocker', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/40' },
    { status: 'UNDER_REVIEW', label: 'Dalam Review Lead', bg: 'bg-indigo-50/70', border: 'border-indigo-200' },
    { status: 'DONE', label: 'Disetujui Selesai (DONE)', bg: 'bg-emerald-50/70', border: 'border-emerald-200' }
  ];

  const isBO = currentUser.role === 'BUSINESS_OWNER';
  const canCreateTask = currentUser.role === 'PROJECT_LEADER' || currentUser.role === 'PROJECT_OWNER';

  // Active or selected sprint context
  const activeSprint = sprints.find(s => 
    (selectedSprintFilter !== 'ALL' && s.id === selectedSprintFilter) ||
    (currentUser.team_id && s.team_id === currentUser.team_id && s.status === 'ACTIVE') ||
    (selectedTeamFilter !== 'ALL' && s.team_id === selectedTeamFilter && s.status === 'ACTIVE') ||
    (s.status === 'ACTIVE')
  );

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Role / team filter
    if (currentUser.role === 'BUSINESS_OWNER') {
      if (selectedTeamFilter !== 'ALL' && task.team_id !== selectedTeamFilter) return false;
    } else if (currentUser.team_id) {
      if (task.team_id !== currentUser.team_id) return false;
    }

    // Sprint filter
    if (selectedSprintFilter !== 'ALL' && task.sprint_id !== selectedSprintFilter) {
      return false;
    }

    // Pod filter
    if (selectedPodFilter !== 'ALL' && task.pod_label !== selectedPodFilter) {
      return false;
    }

    return true;
  });

  // Drag & drop handlers (Disabled for Business Owner)
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    if (isBO) return;
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
    setAlertMsg(null);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    if (isBO) return;
    e.preventDefault();
    setDragOverCol(status);
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    if (isBO) return;
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDragOverCol(null);
    setDraggedTaskId(null);

    if (taskId) {
      const res = moveTaskStatus(taskId, newStatus);
      if (!res.success && res.reason) {
        setAlertMsg(res.reason);
      }
    }
  };

  const now = new Date();

  return (
    <div className="space-y-4 pb-12 text-xs">
      {/* Alert Warning for Restricted Actions */}
      {alertMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between shadow-xs font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold text-xs">{alertMsg}</span>
          </div>
          <button
            onClick={() => setAlertMsg(null)}
            className="text-xs font-bold text-rose-600 hover:underline ml-3"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#F59E0B]" />
            <h1 className="text-xl font-mono font-bold text-[#370000]">
              Papan Tugas (Task Board)
            </h1>
            {isBO && (
              <span className="px-2.5 py-0.5 rounded-md bg-[#370000]/10 text-[#370000] border border-[#370000]/20 font-mono font-bold text-[10px]">
                Mode Read-Only (BO Monitoring)
              </span>
            )}
          </div>
          <p className="text-xs text-[#722300]/80 mt-1">
            Alur pengerjaan tugas: <strong>Backlog</strong> → <strong>Dikerjakan</strong> → <strong>Review</strong> → <strong>Selesai</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Switch View Mode */}
          <div className="flex items-center bg-[#E2E8F0] p-1 rounded-xl">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg flex items-center gap-1 font-mono font-semibold text-xs transition-colors cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-white text-[#370000] shadow-xs'
                  : 'text-slate-500 hover:text-[#370000]'
              }`}
              title="Tampilan Papan Kanban"
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Papan</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg flex items-center gap-1 font-mono font-semibold text-xs transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-[#370000] shadow-xs'
                  : 'text-slate-500 hover:text-[#370000]'
              }`}
              title="Tampilan Daftar Tabel"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Daftar</span>
            </button>
          </div>

          {/* Action Button: Create Task (Amber Gold) */}
          {canCreateTask && (
            <button
              onClick={onCreateTask}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] px-4 py-2.5 rounded-xl text-xs font-mono font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Tugas</span>
            </button>
          )}
        </div>
      </div>

      {/* SPRINT CONTEXT BANNER */}
      {activeSprint && (
        <div className="p-4 bg-white border border-[#E2E8F0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold bg-[#F59E0B]/20 text-[#722300] border border-[#F59E0B] px-2 py-0.5 rounded-md">
                TARGET SPRINT AKTIF
              </span>
              <span className="font-mono font-bold text-[#370000] text-xs truncate">
                {activeSprint.title}
              </span>
            </div>
            <p className="text-slate-600 text-xs font-medium line-clamp-1 italic">
              "{activeSprint.goal}"
            </p>
          </div>

          <button
            onClick={() => setIsNotulensiOpen(true)}
            className="px-3.5 py-2 bg-slate-50 hover:bg-[#F59E0B]/15 text-[#370000] font-mono font-bold rounded-xl border border-[#E2E8F0] hover:border-[#F59E0B] flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs text-xs transition-colors"
          >
            <FileText className="w-4 h-4 text-[#F59E0B]" />
            <span>Lihat Notulensi & Background</span>
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-[#E2E8F0] shadow-xs text-xs font-mono">
        <div className="font-bold text-[#370000] text-xs">
          Filter Tugas:
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Team Filter for Business Owner */}
          {currentUser.role === 'BUSINESS_OWNER' && (
            <select
              value={selectedTeamFilter}
              onChange={e => setSelectedTeamFilter(e.target.value)}
              className="bg-slate-50 border border-[#E2E8F0] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#370000]"
            >
              <option value="ALL">Semua Tim (Global)</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          {/* Pod Filter */}
          <select
            value={selectedPodFilter}
            onChange={e => setSelectedPodFilter(e.target.value)}
            className="bg-slate-50 border border-[#E2E8F0] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#370000]"
          >
            <option value="ALL">Semua Pod</option>
            <option value="BA">Pod BA (Business Analyst)</option>
            <option value="PB">Pod PB (Product Builder)</option>
            <option value="QA">Pod QA (Quality Assurance)</option>
            <option value="MG">Pod MG (Marketing & Growth)</option>
          </select>

          {/* Sprint Filter */}
          <select
            value={selectedSprintFilter}
            onChange={e => setSelectedSprintFilter(e.target.value)}
            className="bg-slate-50 border border-[#E2E8F0] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#370000] max-w-[200px] truncate"
          >
            <option value="ALL">Semua Sprint</option>
            {sprints.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TAMPILAN PAPAN (KANBAN BOARD) */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => {
              if (col.status === 'TODO') return t.status === 'TODO' || t.status === 'BACKLOG';
              if (col.status === 'IN_PROGRESS') return t.status === 'IN_PROGRESS' || t.status === 'DIKERJAKAN' || t.status === 'BLOCKED' || t.is_blocked;
              if (col.status === 'UNDER_REVIEW') return t.status === 'UNDER_REVIEW' || t.status === 'POD_REVIEW' || t.status === 'REVIEW';
              if (col.status === 'DONE') return t.status === 'DONE' || t.status === 'SELESAI';
              return t.status === col.status;
            });
            const isOver = dragOverCol === col.status;

            return (
              <div
                key={col.status}
                onDragOver={e => handleDragOver(e, col.status)}
                onDrop={e => handleDrop(e, col.status)}
                className={`rounded-2xl border flex flex-col transition-all ${col.bg} ${col.border} ${
                  isOver ? 'ring-2 ring-[#F59E0B] bg-white' : ''
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-white/70 rounded-t-2xl font-mono">
                  <span className="font-bold text-xs text-[#370000] uppercase tracking-wider">
                    {col.label}
                  </span>
                  <span className="text-xs font-bold bg-white text-[#722300] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[720px]">
                  {colTasks.map(task => {
                    const assignee = users.find(u => u.id === task.assignee_id);
                    return (
                      <div
                        key={task.id}
                        draggable={!isBO}
                        onDragStart={e => handleDragStart(e, task.id)}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`bg-white rounded-xl p-3.5 border border-[#E2E8F0] shadow-xs hover:border-[#F59E0B] transition-all space-y-2 cursor-pointer ${
                          !isBO ? 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-xs text-[#370000] bg-[#E2E8F0] px-2 py-0.5 rounded">
                            {task.code}
                          </span>
                          <span className="text-xs font-sans font-normal text-slate-600 truncate">
                            {assignee?.name || 'Belum ditugaskan'}
                          </span>
                        </div>
                        <h4 className="text-xs font-sans font-normal text-[#370000] leading-snug line-clamp-2">
                          {task.title}
                        </h4>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs italic font-mono">
                      Kosong
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAMPILAN DAFTAR (TABLE) */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm font-mono">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[#722300] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Kode & Judul Tugas</th>
                  <th className="py-3 px-3">Penanggung Jawab</th>
                  <th className="py-3 px-3">Pod</th>
                  <th className="py-3 px-3">Prioritas</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-3">Progress</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredTasks.map(task => {
                  const assignee = users.find(u => u.id === task.assignee_id);
                  const isOverdue = task.status !== 'SELESAI' && new Date(task.deadline) < now;

                  return (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#370000] bg-[#E2E8F0] px-1.5 py-0.5 rounded text-[10px]">{task.code}</span>
                          <span className="font-bold text-[#370000]">{task.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[#370000] font-medium">{assignee?.name || '-'}</span>
                      </td>
                      <td className="py-3 px-3">
                        <PodBadge pod={task.pod_label} />
                      </td>
                      <td className="py-3 px-3">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="py-3 px-3">
                        <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                          {task.deadline}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-[#F59E0B]">{task.progress}%</span>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        {!isBO && (task.status === 'DIKERJAKAN' || task.status === 'BACKLOG') ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startFocusTask(task.id);
                            }}
                            className="px-2.5 py-1 bg-[#F59E0B]/20 hover:bg-[#F59E0B] text-[#722300] hover:text-[#370000] rounded-lg font-mono font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-colors border border-[#F59E0B]"
                          >
                            <Zap className="w-3 h-3 fill-current" />
                            <span>Workspace</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                      Tidak ada tugas yang cocok dengan filter saat ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL: LIHAT NOTULENSI & BACKGROUND RAPAT */}
      <Modal
        isOpen={isNotulensiOpen}
        onClose={() => setIsNotulensiOpen(false)}
        title={`Notulensi & Background: ${activeSprint?.title || ''}`}
      >
        {activeSprint && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-[#E2E8F0] space-y-1 font-mono">
              <div className="text-[#722300]/70 text-[11px]">Rentang Waktu Sprint:</div>
              <div className="font-bold text-[#370000]">
                {activeSprint.start_date} s/d {activeSprint.end_date}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono font-bold text-[#370000] text-xs flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#F59E0B]" />
                Target Utama (Sprint Goal):
              </label>
              <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xl text-[#370000] font-semibold leading-relaxed">
                "{activeSprint.goal}"
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-mono font-bold text-[#370000] text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#F59E0B]" />
                Notulensi Rapat / Background Mengapa Sprint Dibuat:
              </label>
              <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                {activeSprint.meeting_notes || 'Tidak ada catatan notulensi tambahan.'}
              </div>
            </div>

            {activeSprint.document_url && (
              <div className="space-y-1 font-mono">
                <label className="font-bold text-[#370000] text-xs">Dokumen Pendukung:</label>
                <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl flex items-center justify-between">
                  <a
                    href={activeSprint.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#F59E0B] font-bold hover:underline truncate"
                  >
                    {activeSprint.document_url}
                  </a>
                  <ExternalLink className="w-4 h-4 text-[#F59E0B] shrink-0 ml-2" />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setIsNotulensiOpen(false)}
                className="px-4 py-2 bg-[#370000] hover:bg-[#250000] text-white font-mono font-bold rounded-xl text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
