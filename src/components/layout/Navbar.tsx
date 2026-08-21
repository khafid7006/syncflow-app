import React, { useState, useEffect, useRef } from 'react';
import { Layers, Trash2, ChevronDown, LogOut, Bell, X } from 'lucide-react';
import { Workspace, UserProfile, ActivityLog } from '../../types';

interface NavbarProps {
  currentWorkspace: Workspace | null;
  userWorkspaces: Workspace[];
  isWorkspaceMenuOpen: boolean;
  setIsWorkspaceMenuOpen: (val: boolean) => void;
  workspaceDropdownRef: React.RefObject<HTMLDivElement | null>;
  isGlobalOwner: boolean;
  onSelectWorkspace: (ws: Workspace) => void;
  onDeleteWorkspace: (wsId: string, wsName: string) => void;
  onOpenCreateWorkspaceModal: () => void;
  isPoOrPlRole: boolean;
  isOwnerOrPo: boolean;
  viewMode: 'po' | 'member';
  setViewMode: (mode: 'po' | 'member') => void;
  isProfileDropdownOpen: boolean;
  setIsProfileDropdownOpen: (val: boolean) => void;
  profileDropdownRef: React.RefObject<HTMLDivElement | null>;
  userName: string;
  userRoleDisplay: string;
  userEmail?: string;
  onSignOut: () => void;
  profile: UserProfile | null;
  notificationsList?: ActivityLog[];
}

export const Navbar: React.FC<NavbarProps> = ({
  currentWorkspace,
  userWorkspaces,
  isWorkspaceMenuOpen,
  setIsWorkspaceMenuOpen,
  workspaceDropdownRef,
  isGlobalOwner,
  onSelectWorkspace,
  onDeleteWorkspace,
  onOpenCreateWorkspaceModal,
  isPoOrPlRole,
  isOwnerOrPo,
  viewMode,
  setViewMode,
  isProfileDropdownOpen,
  setIsProfileDropdownOpen,
  profileDropdownRef,
  userName,
  userRoleDisplay,
  userEmail,
  onSignOut,
  profile,
  notificationsList = [],
}) => {
  const [isNotifPopoverOpen, setIsNotifPopoverOpen] = useState<boolean>(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(notificationsList.length);
  const notifPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUnreadNotifCount(notificationsList.length);
  }, [notificationsList.length]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifPopoverRef.current && !notifPopoverRef.current.contains(e.target as Node)) {
        setIsNotifPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleMarkAllAsRead = () => {
    setUnreadNotifCount(0);
  };

  return (
    <header className="w-full flex items-center justify-between gap-4 font-sans text-xs">
      {/* Logo Brand: SyncFlow & WORKSPACE SELECTOR DROPDOWN (KIRI ATAS - CONDITIONAL) */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-all duration-300">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-base tracking-tight hidden sm:inline">
            SyncFlow
          </span>
        </div>

        {/* WORKSPACE SELECTOR DROPDOWN (HANYA DITAMPILKAN JIKA CURRENTWORKSPACE ADA & VALID) */}
        {currentWorkspace && userWorkspaces.length > 0 && (
          <div className="relative font-sans" ref={workspaceDropdownRef}>
            <button 
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{currentWorkspace.name}</span>
              <span className="text-white/40 text-[10px]">▼</span>
            </button>

            {/* Menu Dropdown */}
            {isWorkspaceMenuOpen && (
              <div className="absolute left-0 mt-2 w-60 rounded-xl border border-white/10 bg-zinc-950/90 backdrop-blur-xl p-1.5 shadow-2xl z-50 font-sans">
                <div className="px-2 py-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Workspace Tim</div>
                
                {/* DROPDOWN MAX-HEIGHT & SCROLLABLE CONTAINER */}
                <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
                  {userWorkspaces.map(ws => {
                    const isSelected = currentWorkspace?.id === ws.id;
                    const canDelete = ws.role === 'po' || profile?.role === 'owner';

                    return (
                      <div
                        key={ws.id}
                        className={`group flex items-center justify-between w-full rounded-lg px-2.5 py-1.5 transition-colors ${
                          isSelected ? 'bg-white/10 text-white font-medium' : 'text-white/70 hover:bg-white/5'
                        }`}
                      >
                        <button
                          onClick={() => onSelectWorkspace(ws)}
                          className="flex-1 text-left flex items-center justify-between mr-2 truncate text-xs cursor-pointer"
                        >
                          <span className="truncate">{ws.name}</span>
                          <span className="text-[10px] text-white/40 uppercase ml-2 shrink-0">{ws.role}</span>
                        </button>

                        {/* Tombol Hapus (Hanya untuk Creator/PO/Owner) */}
                        {canDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteWorkspace(ws.id, ws.name);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-rose-400 hover:bg-white/10 transition-all rounded cursor-pointer shrink-0"
                            title="Hapus Workspace"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {isGlobalOwner && (
                  <>
                    <div className="border-t border-white/5 my-1" />
                    <button
                      onClick={() => { onOpenCreateWorkspaceModal(); setIsWorkspaceMenuOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-white/80 hover:bg-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>+ Buat Workspace Baru</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Mode Switcher Pill (HANYA DITAMPILKAN UNTUK WORKSPACE ROLE PO DAN PL) */}
      {isPoOrPlRole && currentWorkspace && (
        <nav className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-lg text-xs font-sans">
          <button
            onClick={() => setViewMode('po')}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ease-in-out cursor-pointer ${
              viewMode === 'po'
                ? 'bg-white/20 text-white font-semibold shadow-xs border border-white/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{isOwnerOrPo ? 'Papan PO' : 'Papan PL'}</span>
          </button>
          <button
            onClick={() => setViewMode('member')}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ease-in-out cursor-pointer ${
              viewMode === 'member'
                ? 'bg-white/20 text-white font-semibold shadow-xs border border-white/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>Dashboard Member</span>
          </button>
        </nav>
      )}

      {/* Right Controls: Bell Notification & User Profile Pill Dropdown */}
      <div className="flex items-center gap-2.5">
        {/* TOMBOL LONCENG NOTIFIKASI */}
        <div className="relative font-sans text-xs" ref={notifPopoverRef}>
          <button
            type="button"
            onClick={() => setIsNotifPopoverOpen(!isNotifPopoverOpen)}
            className="relative p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-md"
            title="Notifikasi Tim"
          >
            <Bell className="w-4 h-4"/>
            {unreadNotifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border border-zinc-950 shadow-xs">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            )}
          </button>

          {/* FLOATING FROSTED GLASS NOTIFICATION POPOVER */}
          {isNotifPopoverOpen && (
            <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 rounded-3xl border border-white/15 bg-neutral-900/95 backdrop-blur-2xl p-4 shadow-2xl z-50 text-white space-y-3 font-sans animate-in fade-in zoom-in-95 duration-150">
              {/* Header Popover */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Notifikasi Aktivitas</span>
                  {unreadNotifCount > 0 && (
                    <span className="px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold">
                      {unreadNotifCount} Baru
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotifPopoverOpen(false)}
                  className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5"/>
                </button>
              </div>

              {/* List Notifikasi (Scrollable) */}
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1 text-xs font-sans">
                {notificationsList.length === 0 ? (
                  <div className="p-6 text-center text-zinc-500 text-xs">
                    Belum ada notifikasi baru di workspace ini.
                  </div>
                ) : (
                  notificationsList.map((notif, idx) => (
                    <div
                      key={notif.id || idx}
                      className="p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all flex items-start gap-3 relative font-sans"
                    >
                      {/* Avatar Inisial */}
                      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0 uppercase">
                        {notif.user_name.charAt(0)}
                      </div>

                      {/* Info Text */}
                      <div className="flex-1 truncate font-sans">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-white text-xs truncate">{notif.user_name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-white/50 border border-white/5 shrink-0 uppercase font-mono">
                            {notif.pod}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-300 truncate mt-0.5">
                          {notif.action_type === 'done' && `Tugas "${notif.task_title}" telah di-ACC`}
                          {notif.action_type === 'submit' && `Menyerahkan tugas "${notif.task_title}"`}
                          {notif.action_type === 'blocked' && `Melaporkan kendala di "${notif.task_title}"`}
                          {notif.action_type === 'revision' && `Menerima catatan revisi di "${notif.task_title}"`}
                        </p>
                      </div>

                      {/* Unread Indicator Dot */}
                      {unreadNotifCount > 0 && idx < unreadNotifCount && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5 shadow-xs" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer Popover */}
              {notificationsList.length > 0 && (
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-sans">
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-zinc-400 hover:text-white cursor-pointer font-medium"
                  >
                    ✓ Tandai sudah dibaca
                  </button>
                  <span className="text-zinc-500 text-[10px]">
                    {notificationsList.length} Total Riwayat
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profil User Dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 backdrop-blur-2xl border border-white/15 rounded-full text-xs flex items-center gap-2 font-medium cursor-pointer transition-colors duration-300 shadow-md font-sans"
          >
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-white font-semibold">{userName} — {userRoleDisplay}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2 z-50 space-y-1 text-xs font-sans transition-all duration-300 ease-in-out">
              <div className="p-2.5 border-b border-white/10 space-y-0.5">
                <div className="font-bold text-white truncate">{userName}</div>
                <div className="text-[11px] text-zinc-400 truncate">{userEmail}</div>
                <div className="text-[10px] text-zinc-400">Role: {userRoleDisplay}</div>
              </div>

              <button
                onClick={onSignOut}
                className="w-full p-2.5 text-left text-zinc-300 hover:text-white hover:bg-white/10 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-colors duration-300"
              >
                <LogOut className="w-4 h-4 text-zinc-400" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
