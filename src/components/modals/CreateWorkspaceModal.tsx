import React from 'react';
import { Folder, X } from 'lucide-react';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  newWorkspaceName: string;
  setNewWorkspaceName: (val: string) => void;
  isCreatingWorkspace: boolean;
  onClose: () => void;
  onCreateWorkspaceSubmit: (e: React.FormEvent) => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  newWorkspaceName,
  setNewWorkspaceName,
  isCreatingWorkspace,
  onClose,
  onCreateWorkspaceSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 ease-in-out font-sans">
      <div className="w-full max-w-md bg-neutral-900/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 font-sans text-xs">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm">
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
              <Folder className="w-4 h-4 text-zinc-300" />
            </div>
            <span>Buat Ruang Kerja Baru</span>
          </div>
          <button
            onClick={() => !isCreatingWorkspace && onClose()}
            disabled={isCreatingWorkspace}
            className="p-1 text-zinc-400 hover:text-white cursor-pointer transition-colors disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onCreateWorkspaceSubmit} className="space-y-4 font-sans">
          <div className="space-y-1.5">
            <label className="block text-zinc-300 font-medium text-xs">Nama Workspace / Proyek *</label>
            <input
              type="text"
              required
              disabled={isCreatingWorkspace}
              placeholder="contoh: Redesign Landing Page, Sprint Klien A"
              value={newWorkspaceName}
              onChange={e => setNewWorkspaceName(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 focus:border-white/40 focus:bg-white/[0.07] text-white rounded-xl px-4 py-2.5 text-xs outline-hidden font-sans transition-all disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isCreatingWorkspace}
              onClick={onClose}
              className="bg-white/5 hover:bg-white/10 text-white/60 text-xs px-4 py-2 rounded-xl cursor-pointer transition-colors font-sans disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!newWorkspaceName.trim() || isCreatingWorkspace}
              className={`bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-xs px-5 py-2 rounded-xl shadow-md transition-all font-sans flex items-center justify-center gap-2 ${
                newWorkspaceName.trim() && !isCreatingWorkspace
                  ? 'cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {isCreatingWorkspace ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Membuat Workspace...</span>
                </>
              ) : (
                <span>Buat Workspace</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
