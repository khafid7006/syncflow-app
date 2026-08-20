import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Layers, Mail, Lock, ArrowRight, BookOpen, Crown, Target, 
  Shield, CheckSquare, Zap, UserCheck, ChevronRight, ShieldCheck, Sparkles 
} from 'lucide-react';
import { RoleBadge } from '../common/Badge';
import { SopModal } from '../common/SopModal';

export const LoginView: React.FC<{ onSwitchToSignUp?: () => void }> = ({ onSwitchToSignUp }) => {
  const { login, users, setIsSopModalOpen } = useApp();

  const [activeLoginTab, setActiveLoginTab] = useState<'demo_cards' | 'manual_form'>('demo_cards');
  
  // Custom manual login fields
  const [emailInput, setEmailInput] = useState('bo1@projecthub.local');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [errorMsg, setErrorMsg] = useState('');

  // Selected quick accounts for 5 role cards
  const boUsers = users.filter(u => u.role === 'BUSINESS_OWNER');
  const poUsers = users.filter(u => u.role === 'PROJECT_OWNER');
  const plUsers = users.filter(u => u.role === 'PROJECT_LEADER');
  const podOwnerUsers = users.filter(u => u.role === 'MEMBER' && (u.is_pod_owner || u.is_pod_lead));
  const memberUsers = users.filter(u => u.role === 'MEMBER' && !(u.is_pod_owner || u.is_pod_lead));

  const [selectedBoEmail, setSelectedBoEmail] = useState(boUsers[0]?.email || 'bo1@projecthub.local');
  const [selectedPoEmail, setSelectedPoEmail] = useState(poUsers[0]?.email || 'po1@projecthub.local');
  const [selectedPlEmail, setSelectedPlEmail] = useState(plUsers[0]?.email || 'pl1@projecthub.local');
  const [selectedPodOwnerEmail, setSelectedPodOwnerEmail] = useState(podOwnerUsers[0]?.email || 'rina@team1.local');
  const [selectedMemberEmail, setSelectedMemberEmail] = useState(memberUsers[0]?.email || 'dimas@team1.local');

  const handleQuickLogin = (email: string) => {
    const ok = login(email);
    if (!ok) {
      setErrorMsg('Akun demo tidak dapat diakses.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg('Silakan masukkan email yang terdaftar.');
      return;
    }
    const ok = login(emailInput.trim());
    if (!ok) {
      setErrorMsg('Akun tidak ditemukan. Gunakan pilihan Quick Demo Role.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#370000] flex flex-col font-sans selection:bg-[#F59E0B] selection:text-[#370000]">
      {/* ========================================================================= */}
      {/* 1. HEADER NAVIGASI MINIMALIS */}
      {/* ========================================================================= */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F59E0B] text-[#370000] flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-[#370000] tracking-tight">
                  SyncFlow
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#F59E0B]/20 text-[#722300] border border-[#F59E0B] px-2 py-0.5 rounded-full">
                  Agile System V2
                </span>
              </div>
              <p className="text-[10px] text-[#722300]/80 font-mono hidden sm:block">
                Sistem Manajemen Agile & Monitoring Eksekusi Hierarki
              </p>
            </div>
          </div>

          {/* Action Buttons: SOP & Sign Up */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSopModalOpen(true)}
              className="px-3.5 py-2 bg-slate-50 hover:bg-[#F59E0B]/15 text-[#370000] font-mono font-bold rounded-xl border border-[#E2E8F0] hover:border-[#F59E0B] flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#F59E0B]" />
              <span className="hidden sm:inline">Lihat SOP</span>
            </button>
            {onSwitchToSignUp && (
              <button
                onClick={onSwitchToSignUp}
                className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-mono font-bold rounded-xl text-xs shadow-2xs transition-colors cursor-pointer"
              >
                Daftar Akun Baru
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="py-10 px-4 text-center max-w-5xl mx-auto space-y-4">
        {/* Highlight Pills */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-[#F59E0B]/40 text-[#722300] font-mono text-[11px] font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Two-Stage Verification • 4-Tier RBAC • Pod Owner DoD Governance</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-[#370000] tracking-tight leading-tight">
          SyncFlow
        </h1>

        {/* Sub-headline */}
        <p className="text-sm sm:text-base md:text-lg text-[#722300] font-mono font-bold max-w-2xl mx-auto">
          Kerja Tim Jadi Gampang dan Cepat.
        </p>

        {/* Mode Switcher Tabs */}
        <div className="pt-4 flex items-center justify-center gap-2">
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-[#E2E8F0] inline-flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => setActiveLoginTab('demo_cards')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeLoginTab === 'demo_cards'
                  ? 'bg-white text-[#370000] shadow-sm'
                  : 'text-slate-500 hover:text-[#370000]'
              }`}
            >
              Akses Cepat 5 Peran
            </button>
            <button
              onClick={() => setActiveLoginTab('manual_form')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeLoginTab === 'manual_form'
                  ? 'bg-white text-[#370000] shadow-sm'
                  : 'text-slate-500 hover:text-[#370000]'
              }`}
            >
              Login Manual
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. LOGIN PORTAL SECTION */}
      {/* ========================================================================= */}
      <main className="flex-1 pb-16 px-4 max-w-7xl mx-auto w-full">
        {activeLoginTab === 'demo_cards' ? (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-sm font-mono font-bold text-[#370000] uppercase tracking-wider">
                Pilih Peran Untuk Pengujian Instan (1-Click Login)
              </h2>
              <p className="text-xs text-slate-500 font-sans">
                Setiap role memiliki antarmuka khusus sesuai hierarki otorisasi & verifikasi bertingkat.
              </p>
            </div>

            {/* GRID 5 CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              
              {/* CARD 1: BUSINESS OWNER */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#F59E0B] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Crown className="w-5 h-5 text-[#F59E0B]" />
                    <RoleBadge role="BUSINESS_OWNER" />
                  </div>

                  <div>
                    <h3 className="font-mono font-bold text-[#370000] text-sm">
                      Pemilik Bisnis
                    </h3>
                    <span className="text-[10px] font-mono text-[#722300] font-semibold">
                      2 Akun Global
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-sans leading-snug">
                    Monitoring performa global 3 tim, bottleneck radar, & insight privat ke PO.
                  </p>

                  <div className="space-y-1 pt-1">
                    <label className="block text-[10px] font-mono font-bold text-[#722300]">
                      Pilih Akun Demo:
                    </label>
                    <select
                      value={selectedBoEmail}
                      onChange={e => setSelectedBoEmail(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-[11px] font-mono focus:bg-white focus:outline-hidden"
                    >
                      {boUsers.map(u => (
                        <option key={u.id} value={u.email}>
                          {u.name} ({u.title.split('/')[0].trim()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickLogin(selectedBoEmail)}
                  className="w-full py-2.5 px-3 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-mono font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Masuk: Pemilik Bisnis</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* CARD 2: PROJECT OWNER */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#F59E0B] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Target className="w-5 h-5 text-[#F59E0B]" />
                    <RoleBadge role="PROJECT_OWNER" />
                  </div>

                  <div>
                    <h3 className="font-mono font-bold text-[#370000] text-sm">
                      Pemilik Proyek
                    </h3>
                    <span className="text-[10px] font-mono text-[#722300] font-semibold">
                      3 Akun Tim
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-sans leading-snug">
                    Pemilik siklus Target Mingguan, notulensi rapat, dan penentu Syarat Wajib Selesai.
                  </p>

                  <div className="space-y-1 pt-1">
                    <label className="block text-[10px] font-mono font-bold text-[#722300]">
                      Pilih Akun Demo:
                    </label>
                    <select
                      value={selectedPoEmail}
                      onChange={e => setSelectedPoEmail(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-[11px] font-mono focus:bg-white focus:outline-hidden"
                    >
                      {poUsers.map(u => (
                        <option key={u.id} value={u.email}>
                          {u.name} (Team {u.team_id?.replace('team-', '')})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickLogin(selectedPoEmail)}
                  className="w-full py-2.5 px-3 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-mono font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Masuk: Pemilik Proyek</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* CARD 3: PROJECT LEADER */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#F59E0B] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Shield className="w-5 h-5 text-[#F59E0B]" />
                    <RoleBadge role="PROJECT_LEADER" />
                  </div>

                  <div>
                    <h3 className="font-mono font-bold text-[#370000] text-sm">
                      Ketua Tim
                    </h3>
                    <span className="text-[10px] font-mono text-[#722300] font-semibold">
                      3 Akun Tim
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-sans leading-snug">
                    Pembagian tugas ke Pod, manajemen deadline, dan approval akhir melegalkan Selesai.
                  </p>

                  <div className="space-y-1 pt-1">
                    <label className="block text-[10px] font-mono font-bold text-[#722300]">
                      Pilih Akun Demo:
                    </label>
                    <select
                      value={selectedPlEmail}
                      onChange={e => setSelectedPlEmail(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-[11px] font-mono focus:bg-white focus:outline-hidden"
                    >
                      {plUsers.map(u => (
                        <option key={u.id} value={u.email}>
                          {u.name} (Team {u.team_id?.replace('team-', '')})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickLogin(selectedPlEmail)}
                  className="w-full py-2.5 px-3 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-mono font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Masuk: Ketua Tim</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* CARD 4: POD OWNER */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#F59E0B] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      KETUA_POD
                    </span>
                  </div>

                  <div>
                    <h3 className="font-mono font-bold text-[#370000] text-sm">
                      Ketua Pod
                    </h3>
                    <span className="text-[10px] font-mono text-[#722300] font-semibold">
                      4 Akun Pod
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-sans leading-snug">
                    Pemeriksa awal Pod, mengecek bukti kerja, dan mencentang syarat sebelum ke Ketua Tim.
                  </p>

                  <div className="space-y-1 pt-1">
                    <label className="block text-[10px] font-mono font-bold text-[#722300]">
                      Pilih Akun Demo:
                    </label>
                    <select
                      value={selectedPodOwnerEmail}
                      onChange={e => setSelectedPodOwnerEmail(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-[11px] font-mono focus:bg-white focus:outline-hidden"
                    >
                      {podOwnerUsers.map(u => (
                        <option key={u.id} value={u.email}>
                          {u.name} (Pod {u.pod_label})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickLogin(selectedPodOwnerEmail)}
                  className="w-full py-2.5 px-3 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-mono font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Masuk: Ketua Pod</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* CARD 5: POD MEMBER */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#F59E0B] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Zap className="w-5 h-5 text-[#F59E0B]" />
                    <RoleBadge role="MEMBER" />
                  </div>

                  <div>
                    <h3 className="font-mono font-bold text-[#370000] text-sm">
                      Anggota Tim
                    </h3>
                    <span className="text-[10px] font-mono text-[#722300] font-semibold">
                      Eksekutor Tugas
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-sans leading-snug">
                    Fokus mengerjakan tugas harian, melampirkan link bukti kerja, dan serahkan ke Ketua Pod.
                  </p>

                  <div className="space-y-1 pt-1">
                    <label className="block text-[10px] font-mono font-bold text-[#722300]">
                      Pilih Akun Demo:
                    </label>
                    <select
                      value={selectedMemberEmail}
                      onChange={e => setSelectedMemberEmail(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-[11px] font-mono focus:bg-white focus:outline-hidden"
                    >
                      {memberUsers.map(u => (
                        <option key={u.id} value={u.email}>
                          {u.name} (Pod {u.pod_label})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickLogin(selectedMemberEmail)}
                  className="w-full py-2.5 px-3 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-mono font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Masuk: Anggota Tim</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* FORM LOGIN MANUAL CONVENTIONAL */
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="space-y-1">
                <h2 className="text-base font-mono font-bold text-[#370000]">
                  Form Login Kredensial
                </h2>
                <p className="text-xs text-slate-500 font-sans">
                  Masukkan alamat email dan kata sandi akun SyncFlow terdaftar.
                </p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold font-mono text-[#370000]">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={emailInput}
                      onChange={e => { setEmailInput(e.target.value); setErrorMsg(''); }}
                      placeholder="email@domain.local"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#370000] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B] focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold font-mono text-[#370000]">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#370000] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B] focus:bg-white font-mono"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono font-semibold">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-mono font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Pills Email Fill */}
              <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
                <div className="text-[11px] text-[#722300] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
                  Auto-fill Email Demo Cepat:
                </div>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {users.slice(0, 6).map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setEmailInput(u.email)}
                      className="px-2 py-1 bg-slate-100 hover:bg-[#F59E0B]/20 text-[#370000] rounded-md border border-[#E2E8F0] cursor-pointer"
                    >
                      {u.email}
                    </button>
                  ))}
                </div>
                {onSwitchToSignUp && (
                  <div className="pt-2 text-center border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={onSwitchToSignUp}
                      className="text-xs font-mono text-[#722300] hover:text-[#370000] hover:underline cursor-pointer"
                    >
                      Belum memiliki akun terdaftar? <strong className="text-[#370000]">Daftar Akun Baru</strong>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 4. FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-slate-50 border-t border-[#E2E8F0] py-6 px-4 text-center font-sans font-light text-slate-500 text-xs sm:text-sm">
        © 2026 SyncFlow. Hak cipta dilindungi.
      </footer>

      {/* SOP Modal Component */}
      <SopModal />
    </div>
  );
};
