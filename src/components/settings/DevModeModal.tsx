import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { RotateCcw, Terminal, Crown, Shield, Briefcase, Users } from 'lucide-react';
import { RoleBadge } from '../common/Badge';

export const DevModeModal: React.FC = () => {
  const { 
    isDevModeOpen, 
    setIsDevModeOpen, 
    currentUser, 
    setCurrentUser, 
    users, 
    teams, 
    resetToEmptyData 
  } = useApp();

  if (!isDevModeOpen) return null;

  const businessOwners = users.filter(u => u.role === 'BUSINESS_OWNER');
  const projectOwners = users.filter(u => u.role === 'PROJECT_OWNER');
  const projectLeaders = users.filter(u => u.role === 'PROJECT_LEADER');
  const members = users.filter(u => u.role === 'MEMBER');

  const handleSelectUser = (user: (typeof users)[0]) => {
    setCurrentUser(user);
    setIsDevModeOpen(false);
  };

  const handleReset = () => {
    if (confirm('Kembalikan data ke kondisi awal sistem 4-tier?')) {
      resetToEmptyData();
      setIsDevModeOpen(false);
    }
  };

  return (
    <Modal
      isOpen={isDevModeOpen}
      onClose={() => setIsDevModeOpen(false)}
      title={
        <div className="flex items-center gap-2 text-[#370000] font-mono">
          <Terminal className="w-5 h-5 text-[#F59E0B]" />
          <span>Simulasi Peran & Pengguna (4-Tier)</span>
        </div>
      }
      subtitle="Beralih peran secara instan untuk menguji hak akses dan alur kerja sistem."
      maxWidth="3xl"
    >
      <div className="space-y-4 text-xs font-mono">
        {/* Reset */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
          <div>
            <div className="font-bold text-rose-800 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              Reset Data Contoh (Fresh 4-Tier Setup)
            </div>
            <p className="text-slate-600 text-[11px] mt-0.5 font-sans">
              Mengatur ulang pengguna, tim, sprint, dan task ke konfigurasi awal 4-tier.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer shrink-0 text-xs shadow-2xs font-mono"
          >
            Reset Data
          </button>
        </div>

        {/* 1. BUSINESS OWNER (2 Orang) */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-[#370000] uppercase tracking-wider flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-[#F59E0B]" />
            Tier 1: Business Owner (Akses Monitoring Global)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {businessOwners.map(bo => {
              const isCur = currentUser.id === bo.id;
              return (
                <button
                  key={bo.id}
                  onClick={() => handleSelectUser(bo)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2 ${
                    isCur
                      ? 'bg-[#F59E0B]/15 border-[#F59E0B] ring-2 ring-[#F59E0B] font-bold'
                      : 'bg-white border-[#E2E8F0] hover:border-[#F59E0B]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={bo.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-[#370000] text-xs truncate">{bo.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{bo.title}</div>
                    </div>
                  </div>
                  <RoleBadge role="BUSINESS_OWNER" />
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. PROJECT OWNER (3 Orang) */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-[#722300] uppercase tracking-wider flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-[#F59E0B]" />
            Tier 2: Project Owner (Pembuat Sprint Mingguan)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {projectOwners.map(po => {
              const isCur = currentUser.id === po.id;
              const tm = teams.find(t => t.id === po.team_id);
              return (
                <button
                  key={po.id}
                  onClick={() => handleSelectUser(po)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                    isCur
                      ? 'bg-[#F59E0B]/20 border-[#F59E0B] ring-2 ring-[#F59E0B] font-bold'
                      : 'bg-white border-[#E2E8F0] hover:border-[#F59E0B]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={po.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-[#370000] text-xs truncate">{po.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{tm?.name}</div>
                    </div>
                  </div>
                  <RoleBadge role="PROJECT_OWNER" />
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. PROJECT LEADER (3 Orang) */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            Tier 3: Project Leader (Pembuat Task & Review Approval)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {projectLeaders.map(pl => {
              const isCur = currentUser.id === pl.id;
              const tm = teams.find(t => t.id === pl.team_id);
              return (
                <button
                  key={pl.id}
                  onClick={() => handleSelectUser(pl)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                    isCur
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 font-bold'
                      : 'bg-white border-[#E2E8F0] hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={pl.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-[#370000] text-xs truncate">{pl.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{tm?.name}</div>
                    </div>
                  </div>
                  <RoleBadge role="PROJECT_LEADER" />
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. MEMBERS */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#370000]" />
            Tier 4: Anggota Tim (Eksekusi Task & Pod Label)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
            {members.map(m => {
              const isCur = currentUser.id === m.id;
              const tm = teams.find(t => t.id === m.team_id);
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelectUser(m)}
                  className={`p-2 rounded-xl border text-left cursor-pointer transition-all space-y-1 ${
                    isCur
                      ? 'bg-[#F59E0B]/15 border-[#F59E0B] ring-2 ring-[#F59E0B] font-bold'
                      : 'bg-white border-[#E2E8F0] hover:border-[#F59E0B]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img src={m.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                    <div className="font-bold text-[#370000] text-[11px] truncate flex-1">{m.name}</div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{tm?.code}</span>
                    <span className="font-bold text-[#722300]">
                      {m.is_pod_lead ? `Lead ${m.pod_label}` : `#${m.pod_label}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
