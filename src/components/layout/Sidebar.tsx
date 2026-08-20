import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Zap, Layers 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, tasks } = useApp();

  const blockedCount = tasks.filter(t => t.status === 'BLOCKED' || t.is_blocked).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dasbor',
      icon: <LayoutDashboard className="w-4 h-4 stroke-[2]" />
    },
    {
      id: 'focus',
      label: 'Lakukan (/do)',
      icon: <Zap className="w-4 h-4 stroke-[2]" />,
      badge: blockedCount > 0 ? blockedCount : undefined
    }
  ];

  return (
    <aside className="w-64 bg-white text-slate-900 flex flex-col border-r border-slate-200/80 h-screen sticky top-0 select-none shrink-0 shadow-xs z-30 font-sans text-xs">
      {/* Brand Header */}
      <div className="h-20 px-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F59E0B] flex items-center justify-center text-slate-950 font-bold shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono font-bold text-slate-900 text-base tracking-tight flex items-center gap-1.5">
              <span>SyncFlow</span>
              <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold">1.0</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-wide uppercase">
              Super Simpel Workflows
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div className="px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
          Navigasi Utama
        </div>
        <nav className="space-y-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id || (item.id === 'focus' && activeTab === 'do');
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
                    isActive ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-800'
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
      <div className="p-4 border-t border-slate-100 font-mono">
        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Live PKL System</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            8 Anak SMK • 3 Mahasiswa PO
          </p>
        </div>
      </div>
    </aside>
  );
};
