import React, { useState, useEffect } from 'react';
import { ActivityLog } from '../../types';

interface TeamNotificationStackProps {
  notifications: ActivityLog[];
}

export const TeamNotificationStack: React.FC<TeamNotificationStackProps> = ({ notifications }) => {
  const [isNotifExpanded, setIsNotifExpanded] = useState<boolean>(true);

  return (
    <div className="space-y-3 pt-3 border-t border-white/10 font-sans">
      {/* HEADER WIDGET: JUDUL & TOMBOL HIDE / SHOW */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-white tracking-tight uppercase">
            Notifikasi Tim
          </span>
          {!isNotifExpanded && notifications.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-extrabold shadow-xs">
              {notifications.length}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsNotifExpanded(!isNotifExpanded)}
          className="text-[10px] font-semibold text-zinc-400 hover:text-white px-2 py-0.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
        >
          {isNotifExpanded ? 'Sembunyikan' : 'Buka Notifikasi'}
        </button>
      </div>

      {/* KONDISI 1: JIKA WIDGET DI-HIDE (PILL BADGE NOTIFIKASI COMPACT) */}
      {!isNotifExpanded ? (
        <div
          onClick={() => setIsNotifExpanded(true)}
          className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all cursor-pointer flex items-center justify-between shadow-md font-sans"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <span className="text-sm">🔔</span>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-zinc-950">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">
                {notifications.length > 0
                  ? `${notifications.length} Aktivitas Tim Terbaru`
                  : 'Tidak ada notifikasi'}
              </span>
              <span className="text-[10px] text-zinc-400">Ketuk untuk melihat detail pergerakan tim</span>
            </div>
          </div>
          <span className="text-zinc-500 text-xs">▼</span>
        </div>
      ) : (
        /* KONDISI 2: JIKA WIDGET DIBUKA (MACOS / IOS NOTIFICATION STACK) */
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-0.5 font-sans">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-[11px] text-zinc-500 bg-white/[0.02] border border-white/5 rounded-2xl font-sans">
              Belum ada riwayat aktivitas tim.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3 rounded-2xl border border-white/10 bg-neutral-900/80 hover:bg-neutral-900 backdrop-blur-xl transition-all flex items-start gap-3 shadow-lg font-sans"
              >
                {/* Action Icon Badge */}
                <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  {notif.action_type === 'done' ? '✅' :
                   notif.action_type === 'submit' ? '🚀' :
                   notif.action_type === 'blocked' ? '🚨' :
                   notif.action_type === 'revision' ? '⚠️' : '📌'}
                </div>

                {/* Content Text */}
                <div className="truncate flex-1 font-sans">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-white text-xs truncate">{notif.user_name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-white/50 border border-white/5 shrink-0 uppercase font-mono">
                      {notif.pod}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 truncate mt-0.5">
                    {notif.action_type === 'done' && `Tugas "${notif.task_title}" telah di-ACC`}
                    {notif.action_type === 'submit' && `Menyerahkan hasil tugas "${notif.task_title}"`}
                    {notif.action_type === 'blocked' && `Melaporkan kendala di "${notif.task_title}"`}
                    {notif.action_type === 'revision' && `Menerima revisi di "${notif.task_title}"`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
