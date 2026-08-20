import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Users, Plus, Trash2, UserPlus, Shield, Crown, Briefcase, CheckCircle2, Award } from 'lucide-react';
import { PodBadge, RoleBadge, PodOwnerBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { PodType, UserRole } from '../../types';
import { api } from '../../services/api';

export const TeamsView: React.FC = () => {
  const { 
    currentUser, 
    teams, 
    users, 
    createTeam, 
    addMember, 
    removeMember,
    togglePodLead
  } = useApp();

  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  // Form: Team & Leader
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [selectedPoId, setSelectedPoId] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');

  // Form: Member
  const [memberTeamId, setMemberTeamId] = useState('');
  const [memberPod, setMemberPod] = useState<PodType>('PB');
  const [isPodLeadCheck, setIsPodLeadCheck] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  const isBO = currentUser.role === 'BUSINESS_OWNER';
  const isPO = currentUser.role === 'PROJECT_OWNER';
  const isLeader = currentUser.role === 'PROJECT_LEADER';
  const isMember = currentUser.role === 'MEMBER';

  // Role-Based Filtering via Service Layer
  const visibleTeams = api.getVisibleTeams(currentUser, teams);
  const showExecutiveBanner = api.shouldShowExecutiveBanner(currentUser.role);

  const projectOwners = users.filter(u => u.role === 'PROJECT_OWNER');
  const businessOwners = users.filter(u => u.role === 'BUSINESS_OWNER');

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !teamCode.trim() || !leaderName.trim() || !leaderEmail.trim()) {
      alert('Silakan lengkapi seluruh data tim dan leader.');
      return;
    }

    const poId = selectedPoId || projectOwners[0]?.id || currentUser.id;

    createTeam(
      { name: teamName.trim(), code: teamCode.trim().toUpperCase() },
      poId,
      { name: leaderName.trim(), email: leaderEmail.trim().toLowerCase(), title: 'Project Leader' }
    );

    setIsAddTeamModalOpen(false);
    setTeamName('');
    setTeamCode('');
    setLeaderName('');
    setLeaderEmail('');
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTeamId = memberTeamId || visibleTeams[0]?.id || teams[0]?.id;
    if (!targetTeamId || !memberName.trim() || !memberEmail.trim()) {
      alert('Silakan lengkapi data anggota.');
      return;
    }

    addMember({
      name: memberName.trim(),
      email: memberEmail.trim().toLowerCase(),
      team_id: targetTeamId,
      pod_label: memberPod,
      is_pod_lead: isPodLeadCheck
    });

    setIsAddMemberModalOpen(false);
    setMemberName('');
    setMemberEmail('');
    setIsPodLeadCheck(false);
  };

  const handleRemoveMember = (userId: string, name: string) => {
    if (confirm(`Hapus ${name} dari tim?`)) {
      removeMember(userId);
    }
  };

  const isSingleTeamView = visibleTeams.length === 1 && (isLeader || isMember);

  return (
    <div className="space-y-6 pb-12 text-xs">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#F59E0B]" />
            <h1 className="text-xl font-mono font-bold text-[#370000]">
              Struktur Tim & Organisasi
            </h1>
            {isSingleTeamView && (
              <span className="px-2.5 py-0.5 rounded-md bg-[#F59E0B]/20 text-[#722300] border border-[#F59E0B] font-mono font-bold text-[10px]">
                {visibleTeams[0]?.name}
              </span>
            )}
          </div>
          <p className="text-xs text-[#722300]/80 mt-1">
            {isBO || isPO
              ? 'Hierarki kepemimpinan: Business Owner, Project Owner, Project Leader, dan Pod Owner (Delegasi Approval Review).'
              : 'Struktur tim, pembagian pod kerja, dan daftar Pod Owner yang berwenang mereview tugas pod.'}
          </p>
        </div>

        {/* Global actions (Only for PO / BO) */}
        {(isBO || isPO) && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setMemberTeamId(visibleTeams[0]?.id || '');
                setIsAddMemberModalOpen(true);
              }}
              className="bg-slate-100 hover:bg-slate-200 text-[#370000] px-3.5 py-2.5 rounded-xl font-mono font-bold transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <UserPlus className="w-4 h-4 text-[#F59E0B]" />
              <span>Tambah Anggota</span>
            </button>

            <button
              onClick={() => setIsAddTeamModalOpen(true)}
              className="bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] px-4 py-2.5 rounded-xl font-mono font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Tim Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* TIER 1: BUSINESS OWNER EXECUTIVE BANNER */}
      {showExecutiveBanner && (
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono font-bold text-[#370000] uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-[#F59E0B]" />
              Tier 1: Business Owner (Akses Global Seluruh Tim)
            </div>
            <span className="text-[10px] text-[#722300] font-mono">2 Eksekutif</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {businessOwners.map(bo => (
              <div key={bo.id} className="p-3 bg-slate-50 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={bo.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0] shrink-0" />
                  <div>
                    <div className="font-mono font-bold text-[#370000] text-xs">{bo.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{bo.email}</div>
                  </div>
                </div>
                <RoleBadge role="BUSINESS_OWNER" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TIM LIST GRID */}
      <div className={`grid gap-5 ${
        isSingleTeamView
          ? 'grid-cols-1 max-w-2xl mx-auto'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {visibleTeams.map(team => {
          const po = users.find(u => u.id === team.project_owner_id);
          const pl = users.find(u => u.id === team.project_leader_id);
          const members = users.filter(u => u.team_id === team.id && u.role === 'MEMBER');

          return (
            <div
              key={team.id}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Team Card Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold bg-[#F59E0B]/20 text-[#722300] border border-[#F59E0B] px-2 py-0.5 rounded-md">
                      {team.code}
                    </span>
                    <h3 className="font-mono font-bold text-[#370000] text-sm mt-1">
                      {team.name}
                    </h3>
                  </div>

                  {(isBO || isPO) && (
                    <button
                      onClick={() => {
                        setMemberTeamId(team.id);
                        setIsAddMemberModalOpen(true);
                      }}
                      className="p-1.5 text-[#370000] hover:text-[#F59E0B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Tambah anggota ke tim ini"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Leadership Structure */}
                <div className="space-y-2 pt-1">
                  {/* Project Owner */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Shield className="w-4 h-4 text-[#F59E0B] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-500 font-mono font-semibold">Tier 2: Project Owner</div>
                        <div className="font-mono font-bold text-[#370000] truncate">{po?.name || 'Belum ditugaskan'}</div>
                      </div>
                    </div>
                    <RoleBadge role="PROJECT_OWNER" />
                  </div>

                  {/* Project Leader */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-500 font-mono font-semibold">Tier 3: Project Leader</div>
                        <div className="font-mono font-bold text-[#370000] truncate">{pl?.name || 'Belum ditugaskan'}</div>
                      </div>
                    </div>
                    <RoleBadge role="PROJECT_LEADER" />
                  </div>
                </div>

                {/* Members & Pods List */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] text-[#722300] font-mono font-bold">
                    <span>Anggota Tim & Pod Owner ({members.length})</span>
                    <span className="text-[10px] text-slate-400">Delegasi Review</span>
                  </div>

                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                    {members.map(member => (
                      <div
                        key={member.id}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-[#E2E8F0] flex items-center justify-between gap-2 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={member.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border border-[#E2E8F0] shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-semibold text-[#370000] text-[11px] truncate">{member.name}</span>
                              {(member.is_pod_owner || member.is_pod_lead) && (
                                <PodOwnerBadge pod={member.pod_label} />
                              )}
                            </div>
                            <div className="text-[9px] text-slate-400 truncate font-mono">{member.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <PodBadge pod={member.pod_label} />

                          {/* Toggle Pod Lead button for Leader / PO */}
                          {(isBO || isPO || isLeader) && (
                            <>
                              <button
                                onClick={() => togglePodLead(member.id)}
                                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                  member.is_pod_lead
                                    ? 'text-[#F59E0B] hover:bg-[#F59E0B]/20'
                                    : 'text-slate-400 hover:text-[#F59E0B] hover:bg-slate-200'
                                }`}
                                title={member.is_pod_lead ? "Hapus penunjukan Pod Owner" : "Tunjuk sebagai Pod Owner"}
                              >
                                <Award className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleRemoveMember(member.id, member.name)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Hapus dari tim"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {members.length === 0 && (
                      <div className="text-center py-4 text-slate-400 text-xs italic font-mono">
                        Belum ada anggota di tim ini.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE TEAM MODAL */}
      <Modal
        isOpen={isAddTeamModalOpen}
        onClose={() => setIsAddTeamModalOpen(false)}
        title="Buat Tim & Tunjuk Project Leader"
        subtitle="Setiap tim wajib memiliki 1 Project Owner dan 1 Project Leader."
      >
        <form onSubmit={handleCreateTeamSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Nama Tim *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Team 4 — Core Infrastructure"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Kode Tim (Singkatan) *</label>
            <input
              type="text"
              required
              placeholder="Contoh: TEAM 4 / TM4"
              value={teamCode}
              onChange={e => setTeamCode(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs uppercase font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Pilih Project Owner Penanggung Jawab *</label>
            <select
              value={selectedPoId}
              onChange={e => setSelectedPoId(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-mono"
            >
              {projectOwners.map(po => (
                <option key={po.id} value={po.id}>{po.name} ({po.email})</option>
              ))}
            </select>
          </div>

          {/* Leader Data */}
          <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-3">
            <div className="font-mono font-bold text-[#370000] text-xs">Informasi Project Leader Baru</div>
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Nama Lengkap Leader *</label>
              <input
                type="text"
                required
                placeholder="Nama Project Leader"
                value={leaderName}
                onChange={e => setLeaderName(e.target.value)}
                className="w-full p-2 bg-white border border-[#E2E8F0] rounded-lg text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">Email Leader *</label>
              <input
                type="email"
                required
                placeholder="leader@company.com"
                value={leaderEmail}
                onChange={e => setLeaderEmail(e.target.value)}
                className="w-full p-2 bg-white border border-[#E2E8F0] rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setIsAddTeamModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold rounded-xl text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-mono font-bold rounded-xl text-xs cursor-pointer shadow-xs"
            >
              Buat Tim
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD MEMBER MODAL */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Tambah Anggota ke Tim"
        subtitle="Tentukan fungsi Pod peran anggota: BA, PB, QA, atau MG."
      >
        <form onSubmit={handleAddMemberSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Pilih Tim Penugasan *</label>
            <select
              value={memberTeamId}
              onChange={e => setMemberTeamId(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-mono"
            >
              {visibleTeams.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Fungsi Pod Peran *</label>
            <select
              value={memberPod}
              onChange={e => setMemberPod(e.target.value as PodType)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-mono font-semibold"
            >
              <option value="BA">Pod BA (Business Analyst)</option>
              <option value="PB">Pod PB (Product Builder)</option>
              <option value="QA">Pod QA (Quality Assurance)</option>
              <option value="MG">Pod MG (Marketing & Growth)</option>
            </select>
          </div>

          {/* Pod Owner Checkbox */}
          <div className="p-3 bg-[#F59E0B]/10 rounded-xl border border-[#F59E0B]/30 flex items-center gap-2">
            <input
              type="checkbox"
              id="isPodLeadCheck"
              checked={isPodLeadCheck}
              onChange={e => setIsPodLeadCheck(e.target.checked)}
              className="w-4 h-4 text-[#F59E0B] rounded accent-[#F59E0B] cursor-pointer"
            />
            <label htmlFor="isPodLeadCheck" className="font-mono text-xs text-[#370000] cursor-pointer">
              Tunjuk sebagai <strong>Pod Owner / Pod Lead</strong> (Wewenang Approval Review tugas Pod)
            </label>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Nama Lengkap Anggota *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Rian Pratama"
              value={memberName}
              onChange={e => setMemberName(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Email Anggota *</label>
            <input
              type="email"
              required
              placeholder="rian@company.com"
              value={memberEmail}
              onChange={e => setMemberEmail(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setIsAddMemberModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold rounded-xl text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-mono font-bold rounded-xl text-xs cursor-pointer shadow-xs"
            >
              Tambahkan Anggota
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
