import React, { useState, useEffect } from 'react';
import { Folder } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Workspace, UserProfile } from '../../types';

interface NoWorkspaceViewProps {
  onCreateWorkspace: () => void;
  profile: UserProfile | null;
  onOpenAccessModal: (ws: Workspace) => void;
}

export const NoWorkspaceView: React.FC<NoWorkspaceViewProps> = ({
  onCreateWorkspace,
  profile,
  onOpenAccessModal,
}) => {
  const isGlobalOwner = profile?.role === 'owner' || profile?.role === 'po';
  const [directoryWorkspaces, setDirectoryWorkspaces] = useState<any[]>([]);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState<boolean>(true);

  const fetchDirectoryWorkspaces = async () => {
    setIsLoadingDirectory(true);
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('id, name, created_at, invite_code')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("-> Direktori Workspace ditemukan:", data);
      setDirectoryWorkspaces(data || []);
    } catch (err: any) {
      console.error("Gagal load direktori workspace:", err.message || err);
    } finally {
      setIsLoadingDirectory(false);
    }
  };

  useEffect(() => {
    fetchDirectoryWorkspaces();
  }, []);

  return (
    <div className="min-h-[65vh] flex flex-col justify-center p-4 font-sans max-w-5xl mx-auto w-full my-auto space-y-6">
      {/* Header Halaman Bento Grid */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white mx-auto shadow-md">
          <Folder className="w-6 h-6 text-zinc-300" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Pusat Direktori Workspace
        </h2>
        <p className="text-xs text-white/60 leading-relaxed font-sans">
          Pilih ruang kerja tim proyek di bawah dan masukkan kode akses untuk bergabung.
        </p>

        {isGlobalOwner && (
          <div className="pt-2">
            <button
              onClick={onCreateWorkspace}
              className="py-2.5 px-5 rounded-xl bg-white text-zinc-950 font-bold text-xs hover:bg-zinc-200 transition-all shadow-md cursor-pointer font-sans"
            >
              + Buat Workspace Baru
            </button>
          </div>
        )}
      </div>

      {/* Grid Bento Responsive 3-Kolom */}
      {isLoadingDirectory ? (
        <div className="flex items-center justify-center py-12 text-xs text-zinc-400 gap-2 font-sans">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0" />
          <span>Memuat direktori proyek...</span>
        </div>
      ) : directoryWorkspaces.length === 0 ? (
        <div className="max-w-md mx-auto rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-xl p-8 text-center shadow-2xl space-y-3 font-sans">
          <p className="text-xs text-zinc-400">Belum ada workspace proyek yang terdaftar di direktori.</p>
          {isGlobalOwner && (
            <button
              onClick={onCreateWorkspace}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-all shadow-md cursor-pointer font-sans"
            >
              + Buat Workspace Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl w-full mx-auto px-4 mt-6">
          {directoryWorkspaces.map((ws) => (
            <div
              key={ws.id}
              onClick={() => onOpenAccessModal(ws)}
              className="group relative rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-xl p-5 hover:border-white/30 hover:bg-zinc-900/80 transition-all cursor-pointer shadow-xl flex flex-col justify-between h-44 text-left font-sans"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70">
                    📁
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/50 font-sans">
                    🔒 Terkunci
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight mt-3 truncate font-sans">
                  {ws.name}
                </h3>
              </div>

              <button className="w-full py-2 rounded-xl bg-white/5 group-hover:bg-white group-hover:text-zinc-950 text-white/80 font-semibold text-xs border border-white/10 group-hover:border-transparent transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans">
                <span>🔑 Masukkan Kode PIN</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
