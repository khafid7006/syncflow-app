import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Layers, Mail, Lock, User, Building, Phone, 
  ShieldCheck, ArrowRight, BookOpen, CheckCircle2, UserPlus, AlertCircle 
} from 'lucide-react';
import { UserRole, PodType } from '../../types';
import { SopModal } from '../common/SopModal';

export const SignUpView: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const { signUp, teams, setIsSopModalOpen } = useApp();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [institution, setInstitution] = useState('Telkom University Purwokerto');
  const [whatsapp, setWhatsapp] = useState('+6281234567890');
  
  const [role, setRole] = useState<UserRole | 'POD_OWNER'>('MEMBER');
  const [teamId, setTeamId] = useState<string>(teams[0]?.id || 'team-1');
  const [podLabel, setPodLabel] = useState<PodType>('PB');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isPodOrMemberRole = role === 'MEMBER' || role === 'POD_OWNER';
  const isTeamRequired = role !== 'BUSINESS_OWNER';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        institution: institution.trim(),
        whatsapp: whatsapp.trim(),
        role,
        team_id: isTeamRequired ? teamId : undefined,
        pod_label: isPodOrMemberRole ? podLabel : undefined
      });

      if (!res.success && res.reason) {
        setErrorMsg(res.reason);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan saat mendaftar akun baru.');
    } finally {
      setIsLoading(false);
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
                  Registrasi Akun Baru
                </span>
              </div>
              <p className="text-[10px] text-[#722300]/80 font-mono hidden sm:block">
                Pendaftaran Anggota & Penempatan Struktural Organisasi Tim
              </p>
            </div>
          </div>

          {/* Helper SOP & Login Link */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSopModalOpen(true)}
              className="px-3.5 py-2 bg-slate-50 hover:bg-[#F59E0B]/15 text-[#370000] font-mono font-bold rounded-xl border border-[#E2E8F0] hover:border-[#F59E0B] flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#F59E0B]" />
              <span className="hidden sm:inline">Lihat SOP</span>
            </button>
            <button
              onClick={onSwitchToLogin}
              className="px-4 py-2 bg-[#F59E0B]/15 hover:bg-[#F59E0B] text-[#722300] hover:text-[#370000] font-mono font-bold rounded-xl border border-[#F59E0B] text-xs transition-colors cursor-pointer"
            >
              Sudah punya akun? Masuk
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. FORM REGISTRASI MAIN */}
      {/* ========================================================================= */}
      <main className="flex-1 py-10 px-4 max-w-3xl mx-auto w-full">
        <div className="bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-10 shadow-lg space-y-6">
          {/* Header Title */}
          <div className="space-y-1 text-center border-b border-[#E2E8F0] pb-5">
            <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/20 border border-[#F59E0B] text-[#722300] flex items-center justify-center mx-auto mb-2">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-mono font-bold text-[#370000] tracking-tight">
              Pendaftaran Akun Pengguna Baru
            </h1>
            <p className="text-xs text-[#722300] font-sans max-w-lg mx-auto">
              Lengkapi data pribadi dan pilih posisi peran untuk langsung masuk ke dasbor kerja terintegrasi SyncFlow.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* SEKSI A: DATA PRIBADI & AKUN */}
            <div className="space-y-4">
              <div className="text-xs font-mono font-bold text-[#370000] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-1.5">
                <User className="w-4 h-4 text-[#F59E0B]" />
                <span>1. Data Pribadi & Akses Login</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Lengkap */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#370000]">
                    Nama Lengkap <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Budi Santoso"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#370000] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B] focus:bg-white font-sans"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#370000]">
                    Alamat Email Institusi <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. budi@domain.local"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#370000] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B] focus:bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#370000]">
                    Kata Sandi (Password) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#370000] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B] focus:bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#370000]">
                    Konfirmasi Kata Sandi <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang password"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#370000] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B] focus:bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Asal Kampus / Institusi */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#370000]">
                    Asal Kampus / Institusi
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={institution}
                      onChange={e => setInstitution(e.target.value)}
                      placeholder="e.g. Telkom University Purwokerto"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#370000] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B] focus:bg-white font-sans"
                    />
                  </div>
                </div>

                {/* Nomor WhatsApp */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#370000]">
                    Nomor WhatsApp / Kontak
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={e => setWhatsapp(e.target.value)}
                      placeholder="e.g. +6281234567890"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#370000] placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B] focus:bg-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SEKSI B: PENEMPATAN TIM & ROLE */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="text-xs font-mono font-bold text-[#370000] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-1.5">
                <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                <span>2. Penempatan Struktural & Peran (Role)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Role Select */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#370000]">
                    Peran (Role) Dituju <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole | 'POD_OWNER')}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#370000] font-mono font-bold focus:bg-white focus:outline-hidden"
                  >
                    <option value="MEMBER">Member (Eksekutor Tugas)</option>
                    <option value="POD_OWNER">Ketua Pod (Gatekeeper DoD Pod)</option>
                    <option value="PROJECT_LEADER">Ketua Tim (Manajer Tugas Tim)</option>
                    <option value="PROJECT_OWNER">Pemilik Proyek (Pemilik Sprint Tim)</option>
                    <option value="BUSINESS_OWNER">Pemilik Bisnis (Monitoring Global)</option>
                  </select>
                </div>

                {/* Team Select */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#370000]">
                    Penempatan Tim {isTeamRequired && <span className="text-rose-600">*</span>}
                  </label>
                  <select
                    disabled={!isTeamRequired}
                    value={teamId}
                    onChange={e => setTeamId(e.target.value)}
                    className={`w-full p-2.5 text-xs border rounded-xl font-mono focus:bg-white focus:outline-hidden ${
                      isTeamRequired
                        ? 'bg-slate-50 border-[#E2E8F0] text-[#370000]'
                        : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.code} — {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pod Select */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#370000]">
                    Pod Spesialisasi {isPodOrMemberRole && <span className="text-rose-600">*</span>}
                  </label>
                  <select
                    disabled={!isPodOrMemberRole}
                    value={podLabel}
                    onChange={e => setPodLabel(e.target.value as PodType)}
                    className={`w-full p-2.5 text-xs border rounded-xl font-mono font-bold focus:bg-white focus:outline-hidden ${
                      isPodOrMemberRole
                        ? 'bg-slate-50 border-[#E2E8F0] text-[#370000]'
                        : 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <option value="BA">BA — Business Analyst</option>
                    <option value="PB">PB — Product Builder</option>
                    <option value="QA">QA — Quality Assurance</option>
                    <option value="MG">MG — Marketing & Growth</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button & Switch Link */}
            <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-mono font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isLoading ? 'Memproses...' : 'Daftar Akun'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-xs font-mono text-[#722300] hover:text-[#370000] hover:underline cursor-pointer"
                >
                  Sudah memiliki akun? <strong className="text-[#370000]">Masuk</strong>
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <footer className="bg-slate-50 border-t border-[#E2E8F0] py-6 px-4 text-center font-sans font-light text-slate-500 text-xs sm:text-sm">
        © 2026 SyncFlow. Hak cipta dilindungi.
      </footer>

      {/* SOP Modal Component */}
      <SopModal />
    </div>
  );
};
