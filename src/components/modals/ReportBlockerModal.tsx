import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ReportBlockerModalProps {
  isOpen: boolean;
  blockerReason: string;
  setBlockerReason: (val: string) => void;
  onClose: () => void;
  onReportBlockerSubmit: (e: React.FormEvent) => void;
}

export const ReportBlockerModal: React.FC<ReportBlockerModalProps> = ({
  isOpen,
  blockerReason,
  setBlockerReason,
  onClose,
  onReportBlockerSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 ease-in-out">
      <div className="w-full max-w-md bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-zinc-300" />
            <span>Laporkan Kendala</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onReportBlockerSubmit} className="space-y-4 font-sans">
          <textarea
            rows={3}
            required
            placeholder="Tuliskan kendala Anda..."
            value={blockerReason}
            onChange={e => setBlockerReason(e.target.value)}
            className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans"
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-800 text-zinc-300 font-medium rounded-full cursor-pointer hover:bg-neutral-700 transition-colors duration-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!blockerReason.trim()}
              className={`px-5 py-2 font-medium rounded-full shadow-md flex items-center gap-1.5 transition-all duration-300 ${
                blockerReason.trim()
                  ? 'bg-white text-zinc-950 hover:bg-zinc-200 cursor-pointer'
                  : 'bg-neutral-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <span>Kirim Kendala</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
