import React from 'react';
import { Folder, X, Trash2, Plus } from 'lucide-react';
import { Workspace, ProjectLink } from '../../types';

interface ManageLinksModalProps {
  isOpen: boolean;
  currentWorkspace: Workspace | null;
  editableLinks: ProjectLink[];
  setEditableLinks: React.Dispatch<React.SetStateAction<ProjectLink[]>>;
  onClose: () => void;
  onSaveAllLinks: (e: React.FormEvent) => void;
  onAddLinkRow: () => void;
  onRemoveLinkRow: (index: number, linkId?: string) => void;
}

export const ManageLinksModal: React.FC<ManageLinksModalProps> = ({
  isOpen,
  currentWorkspace,
  editableLinks,
  setEditableLinks,
  onClose,
  onSaveAllLinks,
  onAddLinkRow,
  onRemoveLinkRow,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans transition-all duration-300 ease-in-out">
      <div className="w-full max-w-lg bg-neutral-900/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 font-sans text-xs max-h-[90vh] flex flex-col justify-between transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Folder className="w-4 h-4 text-zinc-300" />
            <span>Kelola Tautan Tim ({currentWorkspace?.name})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSaveAllLinks} className="space-y-4 flex-1 overflow-y-auto pr-1">
          <div className="space-y-3">
            {editableLinks.map((link, idx) => (
              <div key={link.id || idx} className="p-3 bg-neutral-950 border border-white/10 rounded-2xl space-y-2 relative group">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Tautan #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveLinkRow(idx, link.id)}
                    className="p-1 bg-white/5 hover:bg-rose-950/80 border border-white/10 hover:border-rose-800 text-zinc-400 hover:text-rose-300 rounded-lg transition-colors duration-300 cursor-pointer"
                    title="Hapus Tautan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-5 space-y-0.5">
                    <label className="text-[10px] text-zinc-400 font-medium">Nama Tautan</label>
                    <input
                      type="text"
                      required
                      placeholder="misal: Drive Proyek"
                      value={link.title}
                      onChange={e => {
                        const updated = [...editableLinks];
                        updated[idx].title = e.target.value;
                        setEditableLinks(updated);
                      }}
                      className="w-full p-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans"
                    />
                  </div>

                  <div className="sm:col-span-7 space-y-0.5">
                    <label className="text-[10px] text-zinc-400 font-medium">URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://..."
                      value={link.url}
                      onChange={e => {
                        const updated = [...editableLinks];
                        updated[idx].url = e.target.value;
                        setEditableLinks(updated);
                      }}
                      className="w-full p-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onAddLinkRow}
            className="w-full py-2.5 border border-dashed border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 rounded-2xl text-xs text-white font-medium flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Tautan Baru</span>
          </button>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
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
        </form>
      </div>
    </div>
  );
};
