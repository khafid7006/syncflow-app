import React from 'react';
import { Edit3, X, Plus, Trash2 } from 'lucide-react';
import { MemberTask } from '../../types';

interface EditTaskModalProps {
  isOpen: boolean;
  editingTask: MemberTask | null;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editDescription: string;
  setEditDescription: (val: string) => void;
  editDueDate: string;
  setEditDueDate: (val: string) => void;
  editDodPoints: string[];
  setEditDodPoints: (val: string[]) => void;
  onClose: () => void;
  onSaveTaskEdit: (e: React.FormEvent) => void;
  onDeleteTask: () => void;
  onApplyDeadlinePreset: (daysOffset: number, targetForm: 'create' | 'edit') => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  editingTask,
  editTitle,
  setEditTitle,
  editDescription,
  setEditDescription,
  editDueDate,
  setEditDueDate,
  editDodPoints,
  setEditDodPoints,
  onClose,
  onSaveTaskEdit,
  onDeleteTask,
  onApplyDeadlinePreset,
}) => {
  if (!isOpen || !editingTask) return null;

  const handleAddEditDodPoint = () => {
    if (editDodPoints.length < 10) {
      setEditDodPoints([...editDodPoints, '']);
    }
  };

  const handleRemoveEditDodPoint = (index: number) => {
    if (editDodPoints.length > 1) {
      setEditDodPoints(editDodPoints.filter((_, idx) => idx !== index));
    }
  };

  const handleEditDodPointChange = (index: number, value: string) => {
    const updated = [...editDodPoints];
    updated[index] = value;
    setEditDodPoints(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans transition-all duration-300 ease-in-out">
      <div className="w-full max-w-lg bg-neutral-900/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 font-sans text-xs max-h-[90vh] flex flex-col justify-between transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Edit3 className="w-4 h-4 text-zinc-300" />
            <span>Edit Detail Tugas</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSaveTaskEdit} className="space-y-3.5 flex-1 overflow-y-auto pr-1">
          {/* Edit Judul Tugas */}
          <div className="space-y-1">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Judul Tugas</label>
            <input
              type="text"
              required
              placeholder="Judul tugas..."
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="w-full p-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans"
            />
          </div>

          {/* Edit Deskripsi / Brief */}
          <div className="space-y-1">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Deskripsi / Brief Singkat</label>
            <textarea
              rows={3}
              placeholder="Detail brief..."
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              className="w-full p-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans resize-none"
            />
          </div>

          {/* Edit Tenggat Waktu (Deadline) + Presets */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Tenggat Waktu (Deadline)</label>
              <div className="flex items-center gap-1 font-sans">
                <button
                  type="button"
                  onClick={() => onApplyDeadlinePreset(0, 'edit')}
                  className="text-[10px] bg-white/5 hover:bg-white/10 text-zinc-300 px-2 py-0.5 rounded border border-white/10 transition-colors duration-300 cursor-pointer"
                >
                  Hari Ini (17:00)
                </button>
                <button
                  type="button"
                  onClick={() => onApplyDeadlinePreset(1, 'edit')}
                  className="text-[10px] bg-white/5 hover:bg-white/10 text-zinc-300 px-2 py-0.5 rounded border border-white/10 transition-colors duration-300 cursor-pointer"
                >
                  Besok (17:00)
                </button>
                <button
                  type="button"
                  onClick={() => onApplyDeadlinePreset(3, 'edit')}
                  className="text-[10px] bg-white/5 hover:bg-white/10 text-zinc-300 px-2 py-0.5 rounded border border-white/10 transition-colors duration-300 cursor-pointer"
                >
                  3 Hari
                </button>
              </div>
            </div>
            <input
              type="datetime-local"
              value={editDueDate}
              onChange={e => setEditDueDate(e.target.value)}
              className="w-full p-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-white/30 font-sans [color-scheme:dark]"
            />
          </div>

          {/* Edit Checklist DoD */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Checklist DoD ({editDodPoints.length}/10 Poin)</label>
              {editDodPoints.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddEditDodPoint}
                  className="text-[10px] font-bold text-white hover:text-zinc-300 flex items-center gap-0.5 cursor-pointer transition-colors duration-300"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Tambah Poin</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {editDodPoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder={`DoD ${idx + 1}...`}
                    value={point}
                    onChange={e => handleEditDodPointChange(idx, e.target.value)}
                    className="flex-1 p-2 bg-neutral-950 border border-white/10 rounded-xl text-[11px] text-white font-sans focus:outline-hidden focus:border-white/30"
                  />
                  {editDodPoints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEditDodPoint(idx)}
                      className="w-6 h-6 rounded-lg bg-white/5 hover:bg-rose-950/80 border border-white/10 text-zinc-400 hover:text-rose-300 flex items-center justify-center cursor-pointer transition-colors duration-300 text-xs font-bold shrink-0"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions: Delete & Save */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
            <button
              type="button"
              onClick={onDeleteTask}
              className="px-3.5 py-2 bg-rose-950/50 hover:bg-rose-900/80 border border-rose-800/60 text-rose-200 font-medium rounded-full cursor-pointer transition-colors duration-300 text-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Tugas</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-neutral-800 text-zinc-300 font-medium rounded-full cursor-pointer hover:bg-neutral-700 transition-colors duration-300 text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-full shadow-md transition-colors duration-300 cursor-pointer text-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
