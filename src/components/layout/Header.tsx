import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Layers, ChevronDown, Terminal, LogOut, 
  Bell, Check, Info, AlertTriangle, AlertCircle, User as UserIcon, BookOpen 
} from 'lucide-react';
import { NotificationPriority } from '../../types';
import { RoleBadge } from '../common/Badge';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    teams, 
    sprints,
    activeTab, 
    setActiveTab, 
    setIsDevModeOpen, 
    setIsProfileModalOpen, 
    setIsSopModalOpen, 
    logout, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    setSelectedTaskId,
    resetAllTasks,
    loadSampleTasks
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Filter notifications for current user
  const myNotifications = notifications.filter(n => n.user_id === currentUser.id);
  const unreadCount = myNotifications.filter(n => !n.is_read).length;

  const handleNotificationClick = (notif: (typeof notifications)[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.related_task_id) {
      setSelectedTaskId(notif.related_task_id);
    }
    if (notif.link_url) {
      if (notif.link_url.startsWith('/sprints')) setActiveTab('sprints');
      else if (notif.link_url.startsWith('/teams')) setActiveTab('teams');
      else if (notif.link_url.startsWith('/tasks')) setActiveTab('tasks');
    }
    setIsNotifOpen(false);
  };

  const getPriorityIcon = (type: NotificationPriority) => {
    switch (type) {
      case 'URGENT':
        return <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />;
      case 'SUCCESS':
        return <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-[#722300] shrink-0 mt-0.5" />;
    }
  };

  const isPodOwner = Boolean(currentUser.role === 'MEMBER' && (currentUser.is_pod_owner || currentUser.is_pod_lead));

  const roleLabel = currentUser.role === 'BUSINESS_OWNER'
    ? 'Business Owner'
    : currentUser.role === 'PROJECT_OWNER'
      ? 'Project Owner'
      : currentUser.role === 'PROJECT_LEADER'
        ? 'Project Leader'
        : isPodOwner
          ? `Pod Owner (${currentUser.pod_label || 'Pod'})`
          : `Member (${currentUser.pod_label || 'Tim'})`;

  const currentTeam = teams.find(t => t.id === currentUser.team_id);

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dasbor Utama';
      case 'tasks': return 'Papan Tugas';
      case 'sprints': return 'Sprint Mingguan';
      case 'teams': return 'Struktur Tim & Organisasi';
      default: return 'SyncFlow';
    }
  };

  const activeSprint = sprints.find(s => (s.team_id === currentTeam?.id && s.status === 'ACTIVE') || s.status === 'ACTIVE') || sprints[0];

  return (
    <header className="w-full flex items-center justify-between px-8 py-3.5 bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm rounded-full font-mono text-xs transition-all">
      {/* Left: Logo SyncFlow */}
      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
        <div className="w-8 h-8 rounded-full bg-[#18181B] text-[#F59E0B] flex items-center justify-center font-bold shadow-xs border border-zinc-700">
          <Layers className="w-4 h-4" />
        </div>
        <div className="font-bold text-zinc-900 text-sm tracking-tight flex items-center gap-1.5">
          <span>SyncFlow</span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#18181B] text-white font-bold">
            1.0
          </span>
        </div>
      </div>

      {/* Center: Floating Pill Navigation Tabs (Dasbor, Lakukan /do) */}
      <div className="flex items-center gap-1 p-1 bg-white/80 backdrop-blur-md rounded-full border border-white/70 shadow-sm font-mono text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-[#18181B] text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
          }`}
        >
          Dasbor
        </button>

        <button
          onClick={() => setActiveTab('do')}
          className={`px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'do' || activeTab === 'focus'
              ? 'bg-[#F59E0B] text-zinc-950 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C]"></span>
          <span>Lakukan (/do)</span>
        </button>
      </div>

      {/* Right: Reset Data, Sample Data & Logout Button */}
      <div className="flex items-center gap-2">
        {/* RESET DATA BUTTON */}
        <button
          onClick={async () => {
            if (confirm('Kosongkan semua data tugas di Supabase & Local State?')) {
              await resetAllTasks();
              alert('Semua data tugas berhasil dikosongkan!');
            }
          }}
          className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-mono font-bold text-[11px] rounded-full border border-rose-200 transition-colors cursor-pointer"
          title="Reset Data (Hapus Semua)"
        >
          <span>Reset Data</span>
        </button>

        {/* MUAT SAMPLE DATA BUTTON */}
        <button
          onClick={async () => {
            await loadSampleTasks();
            alert('Sample data berhasil dimuat!');
          }}
          className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-mono font-bold text-[11px] rounded-full border border-amber-200 transition-colors cursor-pointer"
          title="Muat Sample Data"
        >
          <span>Muat Sample Data</span>
        </button>

        {/* NOTIFICATION BELL */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#F59E0B] text-slate-950 text-[10px] font-mono font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-xl border border-slate-200 text-slate-900 z-50 overflow-hidden">
              {/* Popover Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-xs text-slate-900">Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="bg-[#F59E0B]/20 text-[#EA580C] text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                      {unreadCount} baru
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-[#EA580C] hover:underline font-mono font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Tandai semua dibaca</span>
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {myNotifications.length > 0 ? (
                  myNotifications.slice(0, 15).map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                        !notif.is_read ? 'bg-[#F59E0B]/5' : ''
                      }`}
                    >
                      <div className="pt-0.5">
                        {getPriorityIcon(notif.type)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs truncate ${!notif.is_read ? 'font-bold font-mono text-slate-900' : 'font-semibold text-slate-700'}`}>
                            {notif.title}
                          </span>
                          {!notif.is_read && (
                            <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" title="Belum dibaca"></span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="text-[10px] text-slate-400 font-mono pt-0.5">
                          {notif.created_at}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs italic">
                    Belum ada notifikasi.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* USER PROFILE DROPDOWN */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pl-1 pr-2.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          >
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt=""
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#F59E0B]/40 shrink-0"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-mono font-bold text-slate-900 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 font-mono leading-tight">
                {roleLabel}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* White Pill Logout Button */}
          <button
            onClick={logout}
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-zinc-100 text-zinc-900 font-mono font-bold text-xs rounded-full border border-zinc-200 shadow-2xs cursor-pointer transition-colors"
            title="Keluar dari akun"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Keluar</span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-xl border border-slate-200 text-slate-900 z-50 p-2 text-xs space-y-1 overflow-hidden">
              {/* Header Dropdown: Read-Only User Summary */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#F59E0B] shrink-0 shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-mono font-bold text-slate-900 text-xs truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-[#EA580C] font-mono font-semibold truncate">
                    {roleLabel}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-mono">
                    {currentTeam ? currentTeam.name : 'Seluruh Tim (Global)'}
                  </div>
                </div>
              </div>

              <div className="pt-1 space-y-0.5">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left hover:bg-slate-100 text-slate-700 font-medium cursor-pointer transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-[#F59E0B]" />
                  <span className="font-mono">Profil Saya</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsDevModeOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left hover:bg-slate-100 text-slate-700 font-medium cursor-pointer transition-colors"
                >
                  <Terminal className="w-4 h-4 text-slate-600" />
                  <span className="font-mono">Ganti Akun Demo (4-Tier)</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span className="font-mono">Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

