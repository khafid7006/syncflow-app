import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, CheckSquare, Timer, Users, 
  Layers, Zap 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, tasks } = useApp();

  const myTasksCount = tasks.filter(t => {
    if (currentUser.role === 'BUSINESS_OWNER') return t.status !== 'SELESAI';
    if (currentUser.role === 'PROJECT_OWNER') return t.team_id === currentUser.team_id && t.status !== 'SELESAI';
    if (currentUser.role === 'PROJECT_LEADER') return t.team_id === currentUser.team_id && t.status !== 'SELESAI';
    return t.assignee_id === currentUser.id && t.status !== 'SELESAI';
  }).length;

  const inProgressCount = tasks.filter(t => t.assignee_id === currentUser.id && t.status === 'DIKERJAKAN').length;

  const getActionHubLabel = () => {
    if (currentUser.role === 'BUSINESS_OWNER') return 'Insight Strategis';
    if (currentUser.role === 'PROJECT_OWNER') return 'Tata Kelola PO';
    if (currentUser.role === 'PROJECT_LEADER' || (currentUser.role === 'MEMBER' && currentUser.is_pod_lead)) return 'Review & Unblock';
    return 'Fokus Lakukan';
  };

  const getActionHubBadge = () => {
    if (currentUser.role === 'BUSINESS_OWNER') {
      const overdueCount = tasks.filter(t => t.status !== 'SELESAI' && new Date(t.deadline) < new Date()).length;
      return overdueCount > 0 ? overdueCount : undefined;
    }
    if (currentUser.role === 'PROJECT_LEADER') {
      const revCount = tasks.filter(t => t.team_id === currentUser.team_id && t.status === 'REVIEW').length;
      return revCount > 0 ? revCount : undefined;
    }
    if (currentUser.role === 'MEMBER' && currentUser.is_pod_lead) {
      const revCount = tasks.filter(t => t.team_id === currentUser.team_id && t.pod_label === currentUser.pod_label && t.status === 'REVIEW').length;
      return revCount > 0 ? revCount : undefined;
    }
    return inProgressCount > 0 ? inProgressCount : undefined;
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dasbor',
      icon: <LayoutDashboard className="w-4 h-4 stroke-[2]" />
    },
    {
      id: 'tasks',
      label: 'Tugas',
      icon: <CheckSquare className="w-4 h-4 stroke-[2]" />,
      badge: myTasksCount > 0 ? myTasksCount : undefined
    },
    {
      id: 'focus',
      label: 'Lakukan (/do)',
      icon: <Zap className="w-4 h-4 stroke-[2]" />,
      badge: getActionHubBadge()
    },
    {
      id: 'community',
      label: 'Komunitas',
      icon: <Users className="w-4 h-4 stroke-[2]" />
    }
  ];

  return (
    <aside className="w-64 bg-white text-slate-900 flex flex-col border-r border-slate-200/80 h-screen sticky top-0 select-none shrink-0 shadow-xs z-30">
      {/* Brand Header */}
      <div className="h-20 px-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F59E0B] flex items-center justify-center text-slate-950 font-bold shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono font-bold text-slate-900 text-base tracking-tight flex items-center gap-1.5">
              <span>SyncFlow</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">
              Bento Agile Workspace
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div className="px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
          Navigasi Proyek
        </div>
        <nav className="space-y-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-mono transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold shadow-sm translate-x-1'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#F59E0B]' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-[#F59E0B] text-slate-950' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status / Footer info */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>SyncFlow v2.0 Bento</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            Linear / Apple UI Minimalist
          </p>
        </div>
      </div>
    </aside>
  );
};
