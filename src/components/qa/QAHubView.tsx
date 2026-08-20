import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckCheck, ShieldCheck, AlertTriangle, Bug, 
  CheckCircle2, Clock, MessageSquare, ArrowRight, 
  Sparkles, Filter, ShieldAlert
} from 'lucide-react';
import { StatusBadge, PriorityBadge, PodBadge } from '../common/Badge';
import { Task } from '../../types';

export const QAHubView: React.FC = () => {
  const { 
    currentUser, 
    tasks, 
    teams, 
    users, 
    submitQAResult, 
    submitReview, 
    setSelectedTaskId 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'QA_GATE' | 'REVIEW_GATE' | 'DEFECT_LOG'>('QA_GATE');
  const [selectedTaskToTest, setSelectedTaskToTest] = useState<Task | null>(null);
  const [qaNotes, setQaNotes] = useState('');
  const [bugInput, setBugInput] = useState('');
  const [bugSeverity, setBugSeverity] = useState<'MINOR' | 'MAJOR' | 'BLOCKER'>('MAJOR');

  const [selectedTaskToReview, setSelectedTaskToReview] = useState<Task | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Tasks in QA
  const qaQueue = tasks.filter(t => {
    if (currentUser.role === 'PROJECT_LEADER' && currentUser.teamId && t.teamId !== currentUser.teamId) return false;
    return t.status === 'QA';
  });

  // Tasks in Review
  const reviewQueue = tasks.filter(t => {
    if (currentUser.role === 'PROJECT_LEADER' && currentUser.teamId && t.teamId !== currentUser.teamId) return false;
    return t.status === 'REVIEW';
  });

  // All QA History items across tasks
  const allQAHistory = tasks
    .flatMap(t => t.qaHistory.map(q => ({ ...q, taskCode: t.code, taskTitle: t.title, taskId: t.id, teamId: t.teamId })))
    .sort((a, b) => (b.testedAt > a.testedAt ? 1 : -1));

  const handlePassQA = (task: Task) => {
    if (!qaNotes.trim()) {
      alert('Please provide QA verification notes (environment, scope tested)');
      return;
    }
    submitQAResult(task.id, true, qaNotes);
    setSelectedTaskToTest(null);
    setQaNotes('');
  };

  const handleFailQA = (task: Task) => {
    if (!qaNotes.trim()) {
      alert('Please provide QA test failure notes');
      return;
    }
    const bugs = bugInput.trim() ? [bugInput.trim()] : ['Functional defect found during test matrix execution'];
    submitQAResult(task.id, false, qaNotes, bugs, bugSeverity);
    setSelectedTaskToTest(null);
    setQaNotes('');
    setBugInput('');
  };

  const handleApproveReview = (task: Task) => {
    submitReview(task.id, true, reviewNotes || 'Code and requirements approved. Ready for QA testing.');
    setSelectedTaskToReview(null);
    setReviewNotes('');
  };

  const handleRejectReview = (task: Task) => {
    submitReview(task.id, false, reviewNotes || 'Changes requested. Returned to In Progress.');
    setSelectedTaskToReview(null);
    setReviewNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Quality Assurance & Review Hard Gates
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tasks cannot transition to Done without passing Definition of Done & QA Verification.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('QA_GATE')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'QA_GATE' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            QA Testing Queue ({qaQueue.length})
          </button>
          <button
            onClick={() => setActiveTab('REVIEW_GATE')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'REVIEW_GATE' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Leader Review Queue ({reviewQueue.length})
          </button>
          <button
            onClick={() => setActiveTab('DEFECT_LOG')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'DEFECT_LOG' ? 'bg-slate-900 text-white dark:bg-slate-700 shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            QA Defect Log ({allQAHistory.length})
          </button>
        </div>
      </div>

      {/* 1. QA TESTING QUEUE */}
      {activeTab === 'QA_GATE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-purple-600" />
              Tasks Awaiting QA Hard Gate Verification ({qaQueue.length})
            </h2>
            <span className="text-xs text-slate-400">Enforces zero-defect completion</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {qaQueue.map(task => {
              const team = teams.find(t => t.id === task.teamId);
              const owner = users.find(u => u.id === task.ownerId);

              return (
                <div 
                  key={task.id}
                  className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-purple-800 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded">
                        {task.code}
                      </span>
                      <PriorityBadge priority={task.priority} />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Team: <strong>{team?.name.split(' - ')[0]}</strong></span>
                      <span>Assignee: <strong>{owner?.name || 'Unassigned'}</strong></span>
                    </div>

                    {/* DoD Status */}
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xs space-y-1">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        DoD Checklist: {task.dodChecklist.filter(d => d.isCompleted).length}/{task.dodChecklist.length} Checked
                      </div>
                      <div className="text-[10px] text-slate-400">
                        All mandatory items must be fulfilled prior to final verification.
                      </div>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedTaskId(task.id)}
                      className="text-xs text-sky-600 hover:underline font-medium"
                    >
                      View Full Details
                    </button>
                    <button
                      onClick={() => setSelectedTaskToTest(task)}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Execute QA Test
                    </button>
                  </div>
                </div>
              );
            })}

            {qaQueue.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                QA Gate is clear! No tasks currently pending test verification.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. LEADER REVIEW QUEUE */}
      {activeTab === 'REVIEW_GATE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-amber-600" />
              Tasks in Leader Review Queue ({reviewQueue.length})
            </h2>
            <span className="text-xs text-slate-400">Leader code / spec authorization</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewQueue.map(task => {
              const team = teams.find(t => t.id === task.teamId);
              const owner = users.find(u => u.id === task.ownerId);

              return (
                <div 
                  key={task.id}
                  className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded">
                        {task.code}
                      </span>
                      <PodBadge pod={task.pod} />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Team: <strong>{team?.name.split(' - ')[0]}</strong></span>
                      <span>Submitted by: <strong>{owner?.name}</strong></span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedTaskId(task.id)}
                      className="text-xs text-sky-600 hover:underline font-medium"
                    >
                      Inspect Details
                    </button>
                    <button
                      onClick={() => setSelectedTaskToReview(task)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCheck className="w-4 h-4" />
                      Review & Authorize
                    </button>
                  </div>
                </div>
              );
            })}

            {reviewQueue.length === 0 && (
              <div className="col-span-2 text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                Review queue is empty! No tasks pending leader sign-off.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. DEFECT LOG & AUDIT HISTORY */}
      {activeTab === 'DEFECT_LOG' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bug className="w-4 h-4 text-rose-600" />
            QA Execution Defect & Verification Log ({allQAHistory.length})
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {allQAHistory.map((q, idx) => (
              <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {q.taskCode}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{q.taskTitle}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${q.status === 'PASSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {q.status}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border">
                    {q.testNotes}
                  </p>
                  {q.bugsFound && q.bugsFound.length > 0 && (
                    <div className="text-rose-600 font-mono text-[11px]">
                      Defects Found: {q.bugsFound.join('; ')}
                    </div>
                  )}
                </div>

                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  <div>Tester: <strong>{q.testerName}</strong></div>
                  <div className="font-mono">{q.testedAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QA TEST MODAL */}
      {selectedTaskToTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              Execute QA Hard Gate: {selectedTaskToTest.code}
            </h3>

            <p className="text-xs text-slate-500">
              Perform complete cross-device, regression, and unit test matrix. Document test environment and results.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                QA Test Notes & Environment *
              </label>
              <textarea
                value={qaNotes}
                onChange={e => setQaNotes(e.target.value)}
                placeholder="Tested on Staging v2.4, PostgreSQL sandbox, Chrome/Safari, verified all payload schemas."
                className="w-full h-20 p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
              />
            </div>

            <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-lg space-y-2 text-xs">
              <div className="font-semibold text-rose-800 dark:text-rose-200">If Defect Found (QA Fail):</div>
              <input
                type="text"
                value={bugInput}
                onChange={e => setBugInput(e.target.value)}
                placeholder="Specific bug description (e.g. Unhandled null pointer on empty cart checkout)..."
                className="w-full p-2 bg-white dark:bg-slate-900 border rounded text-xs"
              />
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Bug Severity:</span>
                <select
                  value={bugSeverity}
                  onChange={e => setBugSeverity(e.target.value as any)}
                  className="bg-white dark:bg-slate-900 border rounded px-2 py-1 text-xs"
                >
                  <option value="MINOR">Minor (Cosmetic/Edge)</option>
                  <option value="MAJOR">Major (Core flow broken)</option>
                  <option value="BLOCKER">Blocker (Data corruption/Crash)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTaskToTest(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFailQA(selectedTaskToTest)}
                className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
              >
                FAIL QA (Return to Dev)
              </button>
              <button
                onClick={() => handlePassQA(selectedTaskToTest)}
                className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                PASS QA (Move to DONE)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEADER REVIEW MODAL */}
      {selectedTaskToReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCheck className="w-5 h-5 text-amber-600" />
              Leader Review: {selectedTaskToReview.code}
            </h3>

            <p className="text-xs text-slate-500">
              Inspect code quality, PR diff, and requirements completion.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Leader Feedback Notes
              </label>
              <textarea
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="Code structure verified, clean abstractions, ready for QA."
                className="w-full h-20 p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTaskToReview(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectReview(selectedTaskToReview)}
                className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
              >
                Request Rework
              </button>
              <button
                onClick={() => handleApproveReview(selectedTaskToReview)}
                className="px-4 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
              >
                Approve → Advance to QA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
