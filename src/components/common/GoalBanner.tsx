import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Target, Edit2, Check, X } from 'lucide-react';

export const GoalBanner: React.FC = () => {
  const { currentUser, sprints, teams, updateSprintGoal } = useApp();
  
  const currentTeam = teams.find(t => t.id === currentUser.team_id) || teams[0];
  const activeSprint = sprints.find(s => (s.team_id === currentTeam?.id && s.status === 'ACTIVE') || s.status === 'ACTIVE') || sprints[0];

  const [isEditing, setIsEditing] = useState(false);
  const [goalText, setGoalText] = useState(activeSprint?.goal || 'Menyelesaikan target utama mingguan tim.');

  const isPO = currentUser.role === 'PROJECT_OWNER';

  const handleSave = () => {
    if (activeSprint && goalText.trim()) {
      updateSprintGoal(activeSprint.id, goalText.trim());
    }
    setIsEditing(false);
  };

  if (!activeSprint) return null;

  return (
    <div className="max-w-5xl mx-auto w-[calc(100%-2rem)] bg-white border border-slate-200/80 rounded-2xl px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-900 shadow-xs mb-4">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-7 h-7 rounded-full bg-[#F59E0B]/20 text-[#EA580C] flex items-center justify-center shrink-0">
          <Target className="w-4 h-4 text-[#F59E0B]" />
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input
              type="text"
              value={goalText}
              onChange={e => setGoalText(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B]"
              placeholder="Ketik target sprint minggu ini..."
            />
            <button
              onClick={handleSave}
              className="p-1.5 bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 rounded-xl cursor-pointer transition-colors shadow-2xs font-bold"
              title="Simpan Target"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer transition-colors"
              title="Batal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="truncate">
            <span className="font-bold text-slate-900">Sprint Goal:</span>{' '}
            <span className="text-slate-700 font-normal">{activeSprint.goal}</span>{' '}
            <span className="text-[#EA580C] font-semibold text-[11px] ml-1">({activeSprint.end_date})</span>
          </div>
        )}
      </div>

      {isPO && !isEditing && (
        <button
          onClick={() => {
            setGoalText(activeSprint.goal);
            setIsEditing(true);
          }}
          className="px-3 py-1.5 bg-slate-100 hover:bg-[#F59E0B]/20 text-slate-800 hover:text-[#EA580C] border border-slate-200 hover:border-[#F59E0B] rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
          title="Ubah Target Sprint"
        >
          <Edit2 className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Ubah Goal</span>
        </button>
      )}
    </div>
  );
};
