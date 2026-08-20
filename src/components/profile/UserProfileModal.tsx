import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { 
  User, Mail, Shield, Users, Briefcase, 
  Building, Phone, Globe, Send, Lock, Check, Image as ImageIcon 
} from 'lucide-react';
import { PodBadge } from '../common/Badge';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
];

export const UserProfileModal: React.FC = () => {
  const { 
    isProfileModalOpen, 
    setIsProfileModalOpen, 
    currentUser, 
    teams, 
    updateProfile 
  } = useApp();

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [institution, setInstitution] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [telegram, setTelegram] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isProfileModalOpen && currentUser) {
      setName(currentUser.name || '');
      setAvatarUrl(currentUser.avatar_url || PRESET_AVATARS[0]);
      setBio(currentUser.bio || '');
      setInstitution(currentUser.institution || '');
      setWhatsapp(currentUser.contact_info?.whatsapp || '');
      setLinkedin(currentUser.contact_info?.linkedin || '');
      setTelegram(currentUser.contact_info?.telegram || '');
      setFeedback(null);
    }
  }, [isProfileModalOpen, currentUser]);

  if (!isProfileModalOpen) return null;

  const currentTeam = teams.find(t => t.id === currentUser.team_id);

  const roleName = currentUser.role === 'BUSINESS_OWNER'
    ? 'Business Owner'
    : currentUser.role === 'PROJECT_OWNER'
      ? 'Project Owner'
      : currentUser.role === 'PROJECT_LEADER'
        ? 'Project Leader'
        : 'Member Tim';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedback({ type: 'error', message: 'Nama lengkap wajib diisi.' });
      return;
    }

    const res = await updateProfile({
      name: name.trim(),
      avatar_url: avatarUrl.trim(),
      bio: bio.trim(),
      institution: institution.trim(),
      contact_info: {
        whatsapp: whatsapp.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        telegram: telegram.trim() || undefined
      }
    });

    if (res.success) {
      setFeedback({ type: 'success', message: 'Profil berhasil diperbarui!' });
      setTimeout(() => {
        setIsProfileModalOpen(false);
      }, 700);
    } else {
      setFeedback({ type: 'error', message: res.message || 'Gagal memperbarui profil.' });
    }
  };

  return (
    <Modal
      isOpen={isProfileModalOpen}
      onClose={() => setIsProfileModalOpen(false)}
      title={
        <div className="flex items-center gap-2 text-[#370000] font-mono">
          <User className="w-5 h-5 text-[#F59E0B]" />
          <span>Profil Pengguna</span>
        </div>
      }
      subtitle="Kelola identitas dan informasi akun Anda di SyncFlow."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Feedback alert */}
        {feedback && (
          <div className={`p-3 rounded-xl border flex items-center gap-2 font-mono ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <Check className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{feedback.message}</span>
          </div>
        )}

        {/* Read-Only System Metadata Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-[#E2E8F0] space-y-3 font-mono">
          <div className="flex items-center justify-between text-[11px] text-[#722300] font-bold uppercase">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Informasi Terkunci (Sistem / Admin)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <div className="text-[10px] text-[#722300]/70">Peran Akun (Role)</div>
              <div className="font-bold text-[#370000] mt-0.5">{roleName}</div>
            </div>

            <div>
              <div className="text-[10px] text-[#722300]/70">Tim Terdaftar</div>
              <div className="font-bold text-[#370000] mt-0.5">{currentTeam?.name || 'Akses Global'}</div>
            </div>

            <div>
              <div className="text-[10px] text-[#722300]/70">Fungsi Pod</div>
              <div className="mt-0.5">
                <PodBadge pod={currentUser.pod_label} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#E2E8F0] text-slate-500">
            Email Terdaftar: <strong className="text-[#370000] font-mono">{currentUser.email}</strong>
          </div>
        </div>

        {/* Avatar Selection */}
        <div className="space-y-2">
          <label className="block font-bold text-slate-700">Foto Profil / Avatar</label>
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl || PRESET_AVATARS[0]}
              alt=""
              className="w-14 h-14 rounded-full object-cover ring-2 ring-[#F59E0B] shrink-0 shadow-xs"
            />
            <div className="space-y-1.5 flex-1">
              <div className="text-[11px] text-slate-500">Pilih dari preset atau masukkan URL foto:</div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {PRESET_AVATARS.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    onClick={() => setAvatarUrl(url)}
                    className={`w-7 h-7 rounded-full object-cover cursor-pointer transition-transform hover:scale-110 ${
                      avatarUrl === url ? 'ring-2 ring-[#F59E0B]' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                className="w-full p-2 bg-white border border-[#E2E8F0] rounded-xl text-xs mt-1 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Nama Lengkap */}
        <div className="space-y-1">
          <label className="block font-bold text-slate-700">Nama Tampilan (Full Name) *</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs"
          />
        </div>

        {/* Bio */}
        <div className="space-y-1">
          <label className="block font-bold text-slate-700">Bio / Deskripsi Singkat</label>
          <textarea
            rows={2}
            placeholder="Deskripsi keahlian atau fokus peran Anda..."
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-sans"
          />
        </div>

        {/* Institusi / Kampus */}
        <div className="space-y-1">
          <label className="block font-bold text-slate-700">Asal Kampus / Sekolah / Institusi</label>
          <input
            type="text"
            placeholder="Contoh: Universitas Indonesia / Google LLC"
            value={institution}
            onChange={e => setInstitution(e.target.value)}
            className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs"
          />
        </div>

        {/* Kontak (WA & LinkedIn) */}
        <div className="grid grid-cols-2 gap-3 font-mono">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 font-sans">Nomor WhatsApp</label>
            <input
              type="text"
              placeholder="+62 812..."
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700 font-sans">LinkedIn URL</label>
            <input
              type="text"
              placeholder="https://linkedin.com/in/..."
              value={linkedin}
              onChange={e => setLinkedin(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-mono"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold rounded-xl text-xs cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#370000] font-mono font-bold rounded-xl text-xs cursor-pointer shadow-xs"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </Modal>
  );
};
