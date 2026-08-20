import React from 'react';
import { Lock, X } from 'lucide-react';
import { Workspace } from '../../types';

interface AccessCodeModalProps {
  isOpen: boolean;
  selectedWorkspace: Workspace | null;
  inputInviteCode: string;
  setInputInviteCode: (val: string) => void;
  selectedTargetPod: string;
  setSelectedTargetPod: (val: string) => void;
  isVerifyingCode: boolean;
  onClose: () => void;
  onVerifyAndJoin: (e: React.FormEvent) => void;
}

export const AccessCodeModal: React.FC<AccessCodeModalProps> = ({
  isOpen,
  selectedWorkspace,
  inputInviteCode,
  setInputInviteCode,
  selectedTargetPod,
  setSelectedTargetPod,
  isVerifyingCode,
  onClose,
  onVerifyAndJoin,
}) => {
  if (!isOpen || !selectedWorkspace) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans transition-all duration-300 ease-in-out">
      <div className="w-full max-w-md bg-neutral-900/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 font-sans text-xs">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5 text-white font-bold text-sm">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
              <Lock className="w-4 h-4 text-zinc-300" />
            </div>
            <span className="truncate max-w-[240px]">{selectedWorkspace.name}</span>
          </div>
          <button
            onClick={() => !isVerifyingCode && onClose()}
            disabled={isVerifyingCode}
            className="p-1 text-zinc-400 hover:text-white cursor-pointer disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onVerifyAndJoin} className="space-y-4 font-sans">
          {/* Input 1 (Kode Akses 6-digit monospaced center) */}
          <div className="space-y-1.5 text-center">
            <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
              Masukkan Kode Akses (PIN) *
            </label>
            <input
              type="text"
              required
              maxLength={6}
              disabled={isVerifyingCode}
              placeholder="6 DIGIT"
              value={inputInviteCode}
              onChange={e => setInputInviteCode(e.target.value.toUpperCase())}
              className="w-full tracking-[0.3em] font-mono text-center text-lg font-bold bg-neutral-950 border border-white/10 text-white rounded-xl p-3 uppercase focus:outline-hidden focus:border-white/40 font-sans transition-all disabled:opacity-50"
            />
            <p className="text-[10px] text-zinc-500 font-sans">
              Minta 6 karakter kode akses workspace kepada Project Owner Anda.
            </p>
          </div>

          {/* Input 2 (Pilih Pod / Divisi) */}
          <div className="space-y-1">
            <label className="block text-[10px] text-zinc-400 font-medium">Pilih Pod / Divisi Anda *</label>
            <select
              value={selectedTargetPod}
              onChange={e => setSelectedTargetPod(e.target.value)}
              disabled={isVerifyingCode}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-xs text-white outline-hidden focus:border-white/30 font-sans cursor-pointer disabled:opacity-50"
            >
              <option value="Product Builder">Product Builder</option>
              <option value="Marketing">Marketing</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              disabled={isVerifyingCode}
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 text-zinc-300 font-medium rounded-xl cursor-pointer hover:bg-neutral-700 transition-colors text-xs disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!inputInviteCode.trim() || isVerifyingCode}
              className={`px-5 py-2.5 bg-white text-zinc-950 font-bold rounded-xl shadow-md text-xs transition-all flex items-center justify-center gap-1.5 ${
                inputInviteCode.trim() && !isVerifyingCode
                  ? 'hover:bg-zinc-200 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              {isVerifyingCode ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>🔑 Verifikasi & Masuk Workspace</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
