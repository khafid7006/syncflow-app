import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TaskStatus, Task, PodType, TaskPriority 
} from '../../types';
import { 
  Plus, Filter, ArrowRight, ArrowLeft, 
  CheckCircle2, AlertOctagon, Clock, Flame, ShieldAlert, 
  CheckSquare, MoveRight, Sparkles, User as UserIcon
} from 'lucide-react';
import { StatusBadge, PriorityBadge, PodBadge, BlockerSeverityBadge } from '../common/Badge';

export const KanbanBoard: React.FC<{ onCreateTask: () => void; onReportBlocker: (taskId: string) => void }> = ({
  onCreateTask,
  onReportBlocker
}) => {
  const { 
    currentUser, 
    tasks, 
    teams, 
    sprints, 
    users, 
    moveTaskStatus, 
    setSelectedTaskId,
    selectedTeamIdFilter,
    setSelectedTeamIdFilter,
    selectedSprintIdFilter,
    setSelectedSprintIdFilter,
    selectedPodFilter,
    setSelectedPodFilter
  } = useApp();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);
  const [gateErrorMessage, setGateErrorMessage] = useState<{ taskId: string; message: string } | null>(null);

  const columns: { status: TaskStatus; label: string; bg: string; border: string }[] = [
    { status: 'BACKLOG', label: 'Backlog', bg: 'bg-slate-100/70 dark:bg-slate-800/40', border: 'border-slate-300 dark:border-slate-700' },
    { status: 'READY', label: 'Ready', bg: 'bg-indigo-50/50 dark:bg-indigo-950/20', border: 'border-indigo-200 dark:border-indigo-800' },
    { status: 'IN_PROGRESS', label: 'In Progress', bg: 'bg-sky-50/50 dark:bg-sky-950/20', border: 'border-sky-200 dark:border-sky-800' },
    { status: 'REVIEW', label: 'In Review', bg: 'bg-amber-50/50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800' },
    { status: 'QA', label: 'QA Testing', bg: 'bg-purple-50/50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-800' },
    { status: 'DONE', label: 'Done', bg: 'bg-emerald-50/50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800' }
  ];

  // Filtering
  const filteredTasks = tasks.filter(task => {
    // Team permission & filter check
    if (currentUser.role === 'PROJECT_LEADER' && currentUser.teamId) {
      if (task.teamId !== currentUser.teamId) return false;
    } else if (selectedTeamIdFilter !== 'ALL') {
      if (task.teamId !== selectedTeamIdFilter) return false;
    }

    // Sprint filter
    if (selectedSprintIdFilter !== 'ALL') {
      if (task.sprintId !== selectedSprintIdFilter) return false;
    }

    // Pod filter
    if (selectedPodFilter !== 'ALL') {
      if (task.pod !== selectedPodFilter) return false;
    }

    return true;
  });

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverCol(status);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDragOverCol(null);
    setDraggedTaskId(null);

    if (taskId) {
      const result = moveTaskStatus(taskId, newStatus);
      if (!result.success && result.reason) {
        setGateErrorMessage({ taskId, message: result.reason });
      }
    }
  };

  const handleQuickMove = (taskId: string, targetStatus: TaskStatus) => {
    const result = moveTaskStatus(taskId, targetStatus);
    if (!result.success && result.reason) {
      setGateErrorMessage({ taskId, message: result.reason });
    }
  };

  const now = new Date('2026-08-19');

  return (
    <div className="space-y-4 pb-12">
      {/* Board Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Kanban Task Execution Board
          </h1>
          <p className="text-xs text-slate-500">
            Drag cards across columns or use quick arrows. Gate verification enforced on Done transition.
          </p>
        </div>

        {/* Action button */}
        {(currentUser.role === 'PROJECT_LEADER' || currentUser.role === 'PROJECT_OWNER') && (
          <button
            id="kanban-create-task-btn"
            onClick={onCreateTask}
            className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Team filter (Disabled for PL to preserve scope) */}
        {currentUser.role === 'PROJECT_OWNER' && (
          <select
            id="kanban-team-filter"
            value={selectedTeamIdFilter}
            onChange={e => setSelectedTeamIdFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Teams (3 Teams)</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}

        {/* Pod filter */}
        <select
          id="kanban-pod-filter"
          value={selectedPodFilter}
          onChange={e => setSelectedPodFilter(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200"
        >
          <option value="ALL">All Pods (BA, Builder, QA, Growth)</option>
          <option value="BUSINESS_ANALYST">Business Analyst (BA)</option>
          <option value="PRODUCT_BUILDER">Product Builder (Dev)</option>
          <option value="QUALITY_ASSURANCE">Quality Assurance (QA)</option>
          <option value="MARKETING_GROWTH">Marketing & Growth</option>
        </select>

        {/* Sprint filter */}
        <select
          id="kanban-sprint-filter"
          value={selectedSprintIdFilter}
          onChange={e => setSelectedSprintIdFilter(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200"
        >
          <option value="ALL">All Sprints</option>
          {sprints.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
          ))}
        </select>

        <span className="text-slate-400 ml-auto">
          Showing <strong>{filteredTasks.length}</strong> tasks
        </span>
      </div>

      {/* GATE VIOLATION ERROR BANNER */}
      {gateErrorMessage && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 p-3.5 rounded-xl text-xs flex items-center justify-between text-rose-800 dark:text-rose-200 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong>Transition Blocked:</strong> {gateErrorMessage.message}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedTaskId(gateErrorMessage.taskId)}
              className="text-xs text-sky-700 dark:text-sky-400 font-bold hover:underline"
            >
              Open Checklist
            </button>
            <button
              onClick={() => setGateErrorMessage(null)}
              className="text-xs bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-white px-2 py-0.5 rounded"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* KANBAN BOARD COLUMNS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 min-h-[680px]">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.status);
          const isOver = dragOverCol === col.status;

          return (
            <div
              key={col.status}
              id={`kanban-col-${col.status.toLowerCase()}`}
              onDragOver={e => handleDragOver(e, col.status)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, col.status)}
              className={`rounded-xl border flex flex-col transition-all ${col.bg} ${col.border} ${
                isOver ? 'ring-2 ring-sky-500 bg-sky-50/40 dark:bg-sky-950/30' : ''
              }`}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 tracking-tight">
                  {col.label}
                </span>
                <span className="font-mono text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="p-2 space-y-2.5 flex-1 overflow-y-auto max-h-[750px]">
                {colTasks.map(task => {
                  const owner = users.find(u => u.id === task.ownerId);
                  const isOverdue = task.status !== 'DONE' && new Date(task.deadline) < now;
                  const completedDoD = task.dodChecklist.filter(d => d.isCompleted).length;
                  const totalDoD = task.dodChecklist.length;
                  const isBlocked = Boolean(task.blockerId);

                  return (
                    <div
                      key={task.id}
                      id={`task-card-${task.id}`}
                      draggable
                      onDragStart={e => handleDragStart(e, task.id)}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`bg-white dark:bg-slate-900 rounded-xl p-3.5 border shadow-xs hover:shadow-md hover:border-sky-400 cursor-grab active:cursor-grabbing transition-all space-y-2.5 ${
                        isBlocked ? 'border-rose-400 dark:border-rose-800 bg-rose-50/20' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {/* Top row: Code, Priority, Blocker warning */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {task.code}
                        </span>
                        <div className="flex items-center gap-1">
                          {isBlocked && (
                            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                              <ShieldAlert className="w-3 h-3 text-rose-600" /> BLK
                            </span>
                          )}
                          <PriorityBadge priority={task.priority} size="sm" />
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                        {task.title}
                      </h4>

                      {/* Pod Badge */}
                      <div>
                        <PodBadge pod={task.pod} />
                      </div>

                      {/* DoD Progress Counter */}
                      {totalDoD > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3 h-3 text-slate-400" /> DoD
                            </span>
                            <span className="font-mono font-medium">{completedDoD}/{totalDoD}</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${completedDoD === totalDoD ? 'bg-emerald-500' : 'bg-sky-500'}`}
                              style={{ width: `${(completedDoD / totalDoD) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Bottom row: Assignee, Deadline & Quick Mover */}
                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        {/* Assignee Avatar */}
                        <div className="flex items-center gap-1.5" title={owner?.name || 'Assignee'}>
                          <img
                            src={owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover border border-slate-200"
                          />
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 truncate max-w-[65px]">
                            {owner?.name.split(' ')[0]}
                          </span>
                        </div>

                        {/* Deadline */}
                        <span className={`text-[10px] font-mono flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                          <Clock className="w-2.5 h-2.5" />
                          {task.deadline.substring(5)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="text-center py-12 text-[11px] text-slate-400 italic">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
