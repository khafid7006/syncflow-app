import React from 'react';
import { Users, X, Trash2 } from 'lucide-react';
import { Workspace } from '../../types';

interface ManageMembersModalProps {
  isOpen: boolean;
  currentWorkspace: Workspace | null;
  workspaceMembersList: any[];
  isLoadingMembers: boolean;
  currentUserId?: string;
  activeWorkspaceRole?: string;
  onClose: () => void;
  onRemoveMember: (memberId: string) => void;
  showToast: (msg: string) => void;
}

export const ManageMembersModal: React.FC<ManageMembersModalProps> = ({
  isOpen,
  currentWorkspace,
  workspaceMembersList,
  isLoadingMembers,
  currentUserId,
  activeWorkspaceRole,
  onClose,
  onRemoveMember,
  showToast,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans transition-all duration-300 ease-in-out">
      <div className="w-full max-w-lg bg-neutral-900/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 font-sans text-xs max-h-[90vh] flex flex-col justify-between">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-zinc-300" />
            </div>
            <span>Anggota Workspace ({workspaceMembersList.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-1 font-sans">
          {/* Banner Kode Akses Tim (Top Section) */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 mb-4 font-sans">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">Kode Akses Bergabung</span>
              <span className="text-base font-bold font-mono tracking-widest text-white">{currentWorkspace?.invite_code || '---'}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (currentWorkspace?.invite_code) {
                  navigator.clipboard.writeText(currentWorkspace.invite_code);
                  showToast("✓ Kode akses berhasil disalin ke clipboard!");
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-all cursor-pointer font-sans"
            >
              Salin Kode
            </button>
          </div>

          {/* Daftar Anggota Tim (Main List Section) */}
          {isLoadingMembers ? (
            <div className="flex items-center justify-center py-10 text-xs text-zinc-400 gap-2 font-sans">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0" />
              <span>Memuat anggota workspace...</span>
            </div>
          ) : workspaceMembersList.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 bg-neutral-950 border border-white/10 rounded-2xl">
              Belum ada anggota yang bergabung di workspace ini.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1 font-sans">
              {workspaceMembersList.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors font-sans text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-xs font-bold text-white uppercase">
                      {(member.full_name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-2">
                        <span>{member.full_name}</span>
                        {member.user_id === currentUserId && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-medium">Kamu</span>
                        )}
                      </div>
                      <span className="text-[11px] text-white/40 block font-sans">{member.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Badge POD / Divisi */}
                    <span className="px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-[10px] text-white/70 font-medium font-sans">
                      {member.pod}
                    </span>

                    {/* Badge Role */}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-sans ${
                      member.role === 'po' ? 'bg-white text-zinc-950' :
                      member.role === 'pl' ? 'bg-zinc-800 text-white border border-white/20' :
                      'bg-white/5 text-white/50 border border-white/5'
                    }`}>
                      {member.role === 'po' ? 'Project Owner' : member.role === 'pl' ? 'Project Leader' : 'Member'}
                    </span>

                    {/* Tombol Kick (Hanya PO yang bisa kick, dan tidak bisa kick diri sendiri) */}
                    {activeWorkspaceRole === 'po' && member.user_id !== currentUserId && (
                      <button
                        type="button"
                        onClick={() => onRemoveMember(member.id)}
                        className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all ml-1 cursor-pointer"
                        title="Keluarkan dari Workspace"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-white/10 font-sans">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-neutral-800 text-zinc-300 font-medium rounded-full cursor-pointer hover:bg-neutral-700 transition-colors text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
