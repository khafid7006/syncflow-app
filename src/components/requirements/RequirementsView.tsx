import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookmarkCheck, Plus, FileText, CheckCircle2, 
  Clock, ArrowRight, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { Requirement } from '../../types';

export const RequirementsView: React.FC = () => {
  const { 
    currentUser, 
    requirements, 
    teams, 
    tasks, 
    createRequirement,
    setSelectedTaskId 
  } = useApp();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [teamId, setTeamId] = useState(currentUser.teamId || 'team-1');
  const [title, setTitle] = useState('');
  const [userStory, setUserStory] = useState('');
  const [criteriaInput, setCriteriaInput] = useState('');

  const filteredReqs = requirements.filter(r => {
    if (currentUser.role === 'PROJECT_LEADER' && currentUser.teamId) {
      return r.teamId === currentUser.teamId;
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !userStory.trim()) return;

    const criteriaList = criteriaInput
      .split('\n')
      .map(c => c.trim())
      .filter(Boolean);

    createRequirement({
      teamId,
      authorId: currentUser.id,
      title: title.trim(),
      userStory: userStory.trim(),
      acceptanceCriteria: criteriaList.length > 0 ? criteriaList : ['Acceptance criteria pending final review'],
      status: 'APPROVED',
      linkedTaskIds: []
    });

    setIsCreateOpen(false);
    setTitle('');
    setUserStory('');
    setCriteriaInput('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-sky-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Business Analyst (BA) Requirements & PRD Specs
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Formal User Stories and Acceptance Criteria linking directly into Product Builder development tasks.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Requirement Spec
        </button>
      </div>

      {/* Requirements List */}
      <div className="space-y-4">
        {filteredReqs.map(req => {
          const team = teams.find(t => t.id === req.teamId);
          const linkedTasks = tasks.filter(t => t.linkedRequirementId === req.id || req.linkedTaskIds.includes(t.id));

          return (
            <div 
              key={req.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-sky-700 bg-sky-100 dark:bg-sky-950 px-2 py-0.5 rounded">
                      {req.code}
                    </span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 rounded">
                      {team?.name.split(' - ')[0]}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {req.title}
                  </h3>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Created: {req.createdAt}
                </div>
              </div>

              {/* User Story Box */}
              <div className="bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-900/60 rounded-xl p-4 space-y-1 text-xs">
                <span className="text-[10px] font-mono uppercase font-bold text-sky-800 dark:text-sky-300">
                  User Story Format
                </span>
                <p className="text-slate-800 dark:text-slate-200 italic font-serif leading-relaxed">
                  "{req.userStory}"
                </p>
              </div>

              {/* Acceptance Criteria */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Acceptance Criteria (DoD Verification Baseline):
                </h4>
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {req.acceptanceCriteria.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border">
                      <span className="text-sky-600 font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Linked Tasks */}
              {linkedTasks.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-500 font-medium">Linked Development Tasks:</span>
                  {linkedTasks.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 hover:text-sky-700 px-2 py-1 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer"
                    >
                      {t.code} ({t.status})
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-sky-600" />
              Create Requirement Specification
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Target Team</label>
                <select
                  value={teamId}
                  onChange={e => setTeamId(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Feature / Spec Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Multi-Currency Settlement Engine"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">User Story *</label>
                <textarea
                  required
                  value={userStory}
                  onChange={e => setUserStory(e.target.value)}
                  placeholder="As a merchant, I want to accept EUR & JPY so that I can expand globally..."
                  className="w-full h-20 p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Acceptance Criteria (1 per line)
                </label>
                <textarea
                  value={criteriaInput}
                  onChange={e => setCriteriaInput(e.target.value)}
                  placeholder="FX conversion updated every 60s&#10;Zero settlement rounding error&#10;Audit log entry generated"
                  className="w-full h-20 p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg"
                >
                  Save Spec
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
