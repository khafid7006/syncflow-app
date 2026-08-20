import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';
import { 
  BookOpen, Users, Target, CheckSquare, Clock, 
  ShieldAlert, Crown, Shield, Briefcase, FileText, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { RoleBadge } from './Badge';

export const SopModal: React.FC = () => {
  const { isSopModalOpen, setIsSopModalOpen } = useApp();

  if (!isSopModalOpen) return null;

  const sopSteps = [
    {
      step: 1,
      title: 'Diskusi Rapat Perencanaan (Sprint Planning)',
      role: 'Project Owner & Seluruh Tim',
      badgeRole: 'PROJECT_OWNER' as const,
      desc: 'Project Owner dan seluruh anggota tim wajib melakukan diskusi/meeting Sprint Planning terlebih dahulu sebelum memulai siklus baru. Menentukan prioritas, cakupan fitur, dan target bersama.',
      icon: <Users className="w-4 h-4 text-[#0D1282]" />
    },
    {
      step: 2,
      title: 'Pembuatan Sprint & Lampiran Notulensi Rapat',
      role: 'Project Owner',
      badgeRole: 'PROJECT_OWNER' as const,
      desc: 'Project Owner membuat Sprint baru di sistem dengan menyertakan Target Utama (Sprint Goal), rangkuman Notulensi Rapat / Background, serta link dokumen pendukung (Google Docs, Figma, Notion).',
      icon: <FileText className="w-4 h-4 text-[#0D1282]" />
    },
    {
      step: 3,
      title: 'Breakdown Task & Penugasan Pod Member',
      role: 'Project Leader',
      badgeRole: 'PROJECT_LEADER' as const,
      desc: 'Project Leader memecah target sprint menjadi tugas-tugas teknis terukur (Task) dan menugaskannya kepada anggota sesuai Pod fungsi peran (BA, PB, QA, MG) beserta tenggat waktu (Deadline).',
      icon: <CheckSquare className="w-4 h-4 text-emerald-600" />
    },
    {
      step: 4,
      title: 'Eksekusi Tugas & Pengajuan Review',
      role: 'Member Tim (Pod)',
      badgeRole: 'MEMBER' as const,
      desc: 'Member mengeksekusi tugas: Memindahkan status dari Backlog → Dikerjakan → Review, memperbarui progress pengerjaan (0-100%), dan melampirkan hasil kerja. Member dilarang memindahkan langsung ke Selesai.',
      icon: <ArrowRight className="w-4 h-4 text-amber-600" />
    },
    {
      step: 5,
      title: 'Pemeriksaan & Approval Review (Maks. 1x24 Jam)',
      role: 'Project Leader',
      badgeRole: 'PROJECT_LEADER' as const,
      desc: 'Project Leader wajib menguji dan mereview tugas berstatus Review maksimal 1x24 jam: Mengklik [ Selesai (Setujui) ] jika pekerjaan valid, atau [ Kembalikan ] disertai catatan revisi jika butuh perbaikan.',
      icon: <Clock className="w-4 h-4 text-emerald-600" />
    },
    {
      step: 6,
      title: 'Monitoring Eksekutif & Insight Privat',
      role: 'Business Owner',
      badgeRole: 'BUSINESS_OWNER' as const,
      desc: 'Business Owner memantau kinerja portofolio seluruh tim secara makro (Read-Only) dan dapat memberikan insight strategis privat yang hanya dapat dibaca oleh Project Owner dan sesama Business Owner.',
      icon: <Crown className="w-4 h-4 text-[#0D1282]" />
    }
  ];

  return (
    <Modal
      isOpen={isSopModalOpen}
      onClose={() => setIsSopModalOpen(false)}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <BookOpen className="w-5 h-5 text-[#0D1282]" />
          <span>Panduan SOP & Alur Kerja Standar</span>
        </div>
      }
      subtitle="Pedoman alur kolaborasi 4-Tier, perencanaan sprint, eksekusi, dan review tugas."
      maxWidth="3xl"
    >
      <div className="space-y-4 text-xs">
        {/* Banner Prinsip Inti */}
        <div className="p-4 bg-[#0D1282]/5 border border-[#0D1282]/20 rounded-xl space-y-1">
          <div className="font-bold text-[#0D1282] text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#0D1282] shrink-0" />
            Prinsip Utama: Transparan, Terukur, & Bertanggung Jawab
          </div>
          <p className="text-slate-700 text-xs leading-relaxed">
            Setiap Sprint harus berakar dari kesepakatan rapat bersama tim. Tidak boleh ada Sprint atau Task tanpa kejelasan latar belakang dan penanggung jawab yang tegas.
          </p>
        </div>

        {/* 6 Step Alur Kerja Standar */}
        <div className="space-y-2.5">
          <div className="font-bold text-xs uppercase tracking-wider text-slate-400">
            6 Tahapan Alur Kerja (SOP)
          </div>

          <div className="space-y-2.5">
            {sopSteps.map(step => (
              <div
                key={step.step}
                className="p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs hover:border-[#0D1282]/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0D1282]/10 text-[#0D1282] font-mono font-bold text-xs flex items-center justify-center">
                      {step.step}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      {step.icon}
                      {step.title}
                    </h3>
                  </div>

                  <RoleBadge role={step.badgeRole} />
                </div>

                <p className="text-slate-600 text-xs leading-relaxed pl-7">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsSopModalOpen(false)}
            className="px-5 py-2 bg-[#0D1282] hover:bg-[#090D5E] text-white font-bold rounded-xl shadow-xs cursor-pointer text-xs"
          >
            Mengerti & Tutup Panduan
          </button>
        </div>
      </div>
    </Modal>
  );
};
