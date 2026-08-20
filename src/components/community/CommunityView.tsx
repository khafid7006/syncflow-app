import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { supabaseService } from '../../services/supabaseService';
import { 
  MessageSquare, ThumbsUp, Send, Users, Hash, 
  Lock, Shield, Award, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { User, UserRole, PodType } from '../../types';

interface ChannelDef {
  id: string;
  name: string;
  category: 'FORUM_UMUM' | 'EKSEKUTIF' | 'GOVERNANCE' | 'INTERNAL_TIM' | 'POD_SPESIFIK';
  categoryLabel: string;
  description: string;
  podLabel?: PodType;
}

interface ChannelMessage {
  id: string;
  channelId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorPod?: PodType;
  isPodOwner?: boolean;
  content: string;
  timestamp: string;
  likes: number;
  liked: boolean;
}

const ALL_CHANNELS: ChannelDef[] = [
  {
    id: 'forum-all-teams',
    name: 'forum-all-teams',
    category: 'FORUM_UMUM',
    categoryLabel: 'GRUP 1: FORUM UMUM',
    description: 'Forum Terbuka Lintas Tim & Seluruh Peran SyncFlow',
  },
  {
    id: 'executive-sync',
    name: 'executive-sync',
    category: 'EKSEKUTIF',
    categoryLabel: 'GRUP 2: EKSEKUTIF BO & PO',
    description: 'Koordinasi Strategis Khusus Business Owner & Project Owner',
  },
  {
    id: 'sprint-governance',
    name: 'sprint-governance',
    category: 'GOVERNANCE',
    categoryLabel: 'GRUP 3: TATA KELOLA PO & LEADER',
    description: 'Tata Kelola Target & Pengesahan Sprint PO & Project Leader',
  },
  {
    id: 'internal-team',
    name: 'internal-team',
    category: 'INTERNAL_TIM',
    categoryLabel: 'GRUP 4: INTERNAL TIM PRODUK',
    description: 'Diskusi Operasional & Deliverables Internal Tim',
  },
  {
    id: 'pod-ba',
    name: 'pod-ba',
    category: 'POD_SPESIFIK',
    categoryLabel: 'GRUP 5: POD SPESIFIK',
    description: 'Diskusi Spesifikasi & BRD Pod Business Analyst',
    podLabel: 'BA',
  },
  {
    id: 'pod-pb',
    name: 'pod-pb',
    category: 'POD_SPESIFIK',
    categoryLabel: 'GRUP 5: POD SPESIFIK',
    description: 'Diskusi Kode & API Pod Product Builder',
    podLabel: 'PB',
  },
  {
    id: 'pod-qa',
    name: 'pod-qa',
    category: 'POD_SPESIFIK',
    categoryLabel: 'GRUP 5: POD SPESIFIK',
    description: 'Diskusi Testing & DoD Pod Quality Assurance',
    podLabel: 'QA',
  },
  {
    id: 'pod-mg',
    name: 'pod-mg',
    category: 'POD_SPESIFIK',
    categoryLabel: 'GRUP 5: POD SPESIFIK',
    description: 'Diskusi Peluncuran & Growth Pod Marketing',
    podLabel: 'MG',
  },
];

export const CommunityView: React.FC = () => {
  const { currentUser, users } = useApp();

  // Otorisasi Hak Akses Kanal per Peran
  const canUserAccessChannel = (user: User, channel: ChannelDef): boolean => {
    switch (channel.category) {
      case 'FORUM_UMUM':
        return true; // Semua pengguna
      case 'EKSEKUTIF':
        return user.role === 'BUSINESS_OWNER' || user.role === 'PROJECT_OWNER';
      case 'GOVERNANCE':
        return user.role === 'BUSINESS_OWNER' || user.role === 'PROJECT_OWNER' || user.role === 'PROJECT_LEADER';
      case 'INTERNAL_TIM':
        return true; // Anggota tim pengguna
      case 'POD_SPESIFIK':
        return (
          user.role === 'BUSINESS_OWNER' ||
          user.role === 'PROJECT_OWNER' ||
          user.role === 'PROJECT_LEADER' ||
          user.pod_label === channel.podLabel
        );
      default:
        return false;
    }
  };

  // Filter kanal yang boleh diakses pengguna aktif
  const availableChannels = useMemo(() => {
    return ALL_CHANNELS.filter(ch => canUserAccessChannel(currentUser, ch));
  }, [currentUser]);

  // Active Channel State
  const [activeChannelId, setActiveChannelId] = useState<string>(
    availableChannels[0]?.id || 'forum-all-teams'
  );

  const activeChannel = useMemo(() => {
    return ALL_CHANNELS.find(c => c.id === activeChannelId) || availableChannels[0];
  }, [activeChannelId, availableChannels]);

  // Input Message State
  const [inputMessage, setInputMessage] = useState<string>('');

  // Initial Messages Data Store per Channel
  const [messages, setMessages] = useState<ChannelMessage[]>([
    {
      id: 'm-1',
      channelId: 'forum-all-teams',
      authorId: 'user-bo-1',
      authorName: 'Hendrawan Pratama',
      authorRole: 'BUSINESS_OWNER',
      content: 'Selamat datang di SyncFlow Community Hub. Mari tingkatkan transparansi delivery lintas tim.',
      timestamp: '10.00 WIB',
      likes: 6,
      liked: false,
    },
    {
      id: 'm-2',
      channelId: 'executive-sync',
      authorId: 'user-bo-2',
      authorName: 'Dewi Lestari',
      authorRole: 'BUSINESS_OWNER',
      content: 'Evaluasi alokasi resource kuartal ini membutuhkan penyesuaian target pada Tim 1 Core Banking.',
      timestamp: '10.15 WIB',
      likes: 4,
      liked: false,
    },
    {
      id: 'm-3',
      channelId: 'executive-sync',
      authorId: 'user-po-1',
      authorName: 'Bambang Sudiro',
      authorRole: 'PROJECT_OWNER',
      content: 'Siap Bu Dewi, skema target Sprint #1 sudah diselaraskan dengan Project Leader.',
      timestamp: '10.30 WIB',
      likes: 3,
      liked: false,
    },
    {
      id: 'm-4',
      channelId: 'sprint-governance',
      authorId: 'user-po-1',
      authorName: 'Bambang Sudiro',
      authorRole: 'PROJECT_OWNER',
      content: 'Target Sprint Goal #1 telah dikunci. Mohon Leader memverifikasi kesiapan DoD.',
      timestamp: '11.00 WIB',
      likes: 5,
      liked: false,
    },
    {
      id: 'm-5',
      channelId: 'sprint-governance',
      authorId: 'user-pl-1',
      authorName: 'Budi Santoso',
      authorRole: 'PROJECT_LEADER',
      content: 'Siap Pak Bambang, antrean review ledger API sudah masuk tahap pengujian final.',
      timestamp: '11.20 WIB',
      likes: 4,
      liked: false,
    },
    {
      id: 'm-6',
      channelId: 'internal-team',
      authorId: 'user-pl-1',
      authorName: 'Budi Santoso',
      authorRole: 'PROJECT_LEADER',
      content: 'Rekan-rekan Tim 1, pastikan seluruh bukti PR terlampir di papan tugas sebelum hari Jumat.',
      timestamp: '11.45 WIB',
      likes: 7,
      liked: false,
    },
    {
      id: 'm-7',
      channelId: 'pod-pb',
      authorId: 'user-mem-102',
      authorName: 'Dimas Prasetyo',
      authorRole: 'MEMBER',
      authorPod: 'PB',
      isPodOwner: true,
      content: 'Implementasi ISO8583 settlement API controller sudah selesai di-commit ke branch main staging.',
      timestamp: '12.10 WIB',
      likes: 5,
      liked: false,
    },
    {
      id: 'm-8',
      channelId: 'pod-ba',
      authorId: 'user-mem-101',
      authorName: 'Rina Wulandari',
      authorRole: 'MEMBER',
      authorPod: 'BA',
      isPodOwner: true,
      content: 'Dokumen BRD Audit Trail V1 sudah diunggah dan siap di-review oleh Project Leader.',
      timestamp: '12.30 WIB',
      likes: 4,
      liked: false,
    },
    {
      id: 'm-9',
      channelId: 'pod-qa',
      authorId: 'user-mem-104',
      authorName: 'Hendra Susanto',
      authorRole: 'MEMBER',
      authorPod: 'QA',
      isPodOwner: true,
      content: 'Skenario stress test 10.000 TPS ledger DB sudah disiapkan di staging environment.',
      timestamp: '13.00 WIB',
      likes: 3,
      liked: false,
    },
  ]);

  // Filter messages for current active channel
  const channelMessages = useMemo(() => {
    return messages.filter(m => m.channelId === activeChannel.id);
  }, [messages, activeChannel]);

  // Filter users authorized in current active channel (For Right Column)
  const usersInActiveChannel = useMemo(() => {
    return users.filter(u => canUserAccessChannel(u, activeChannel));
  }, [users, activeChannel]);

  // Handler Kirim Pesan
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChannelMessage = {
      id: `m-${Date.now()}`,
      channelId: activeChannel.id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorPod: currentUser.pod_label,
      isPodOwner: currentUser.is_pod_owner || currentUser.is_pod_lead,
      content: inputMessage.trim(),
      timestamp: 'Baru saja',
      likes: 0,
      liked: false,
    };

    setMessages([...messages, newMsg]);
    setInputMessage('');

    supabaseService.sendCommunityMessage({
      id: newMsg.id,
      team_id: currentUser.team_id,
      channel_type: activeChannel.id,
      sender_id: currentUser.id,
      message_text: newMsg.content,
    });
  };

  // Handler Like Pesan
  const handleToggleLike = (msgId: string) => {
    setMessages(messages.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          liked: !m.liked,
          likes: m.liked ? m.likes - 1 : m.likes + 1,
        };
      }
      return m;
    }));
  };

  // Helper render role badge
  const renderRoleBadge = (role: UserRole, podLabel?: PodType, isPodLead?: boolean) => {
    if (role === 'BUSINESS_OWNER') {
      return <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 font-mono font-bold text-[10px]">Business Owner</span>;
    }
    if (role === 'PROJECT_OWNER') {
      return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold text-[10px]">Project Owner</span>;
    }
    if (role === 'PROJECT_LEADER') {
      return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200 font-mono font-bold text-[10px]">Project Leader</span>;
    }
    if (isPodLead) {
      return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono font-bold text-[10px]">Pod Owner {podLabel}</span>;
    }
    return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono font-bold text-[10px]">Anggota Pod {podLabel || 'DEV'}</span>;
  };

  // Grouping available channels by category
  const categoriesList = [
    { key: 'FORUM_UMUM', label: 'FORUM UMUM' },
    { key: 'EKSEKUTIF', label: 'EKSEKUTIF BO & PO' },
    { key: 'GOVERNANCE', label: 'TATA KELOLA PO & LEADER' },
    { key: 'INTERNAL_TIM', label: 'INTERNAL TIM' },
    { key: 'POD_SPESIFIK', label: 'POD SPESIFIK' },
  ];

  return (
    <div className="grid grid-cols-12 gap-5 items-stretch w-full flex-1 font-sans text-xs">
      
      {/* ========================================================================= */}
      {/* A. KOLOM KIRI: DAFTAR GRUP / CHANNEL SIDEBAR (col-span-12 lg:col-span-3) */}
      {/* ========================================================================= */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
        <div className="rounded-3xl bg-neutral-900/90 backdrop-blur-xl border border-white/10 text-white p-6 shadow-md h-full flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono text-xs border-b border-zinc-800 pb-3">
              <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#F59E0B]" />
                <span>Saluran Resmi SyncFlow</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono font-bold">
                {availableChannels.length} Kanal
              </span>
            </div>

            {/* List Group Channels Categorized */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {categoriesList.map(cat => {
                const groupChannels = availableChannels.filter(c => c.category === cat.key);
                if (groupChannels.length === 0) return null;

                return (
                  <div key={cat.key} className="space-y-1.5 font-mono text-xs">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2">
                      {cat.label}
                    </div>
                    {groupChannels.map(ch => {
                      const isSelected = activeChannel.id === ch.id;
                      const unreadCount = messages.filter(m => m.channelId === ch.id).length;

                      return (
                        <button
                          key={ch.id}
                          onClick={() => setActiveChannelId(ch.id)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer font-bold flex items-center justify-between group ${
                            isSelected
                              ? 'bg-[#F59E0B] text-slate-950 shadow-md'
                              : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                          }`}
                        >
                          <span className="truncate flex items-center gap-2">
                            <span>#{ch.name}</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {unreadCount > 0 && (
                              <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                                isSelected ? 'bg-slate-950 text-white font-bold' : 'bg-zinc-800 text-amber-400'
                              }`}>
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 font-mono text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Akses Peran: <strong className="text-white">{currentUser.role}</strong></span>
            <Lock className="w-3.5 h-3.5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* B. KOLOM TENGAH: FEED DISKUSI GRUP TERPILIH (col-span-12 lg:col-span-6) */}
      {/* ========================================================================= */}
      <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
        <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/70 p-6 sm:p-8 shadow-sm h-full flex flex-col justify-between space-y-6">
          
          {/* Header Kanal Aktif */}
          <div className="space-y-1 border-b border-white/60 pb-4">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Hash className="w-5 h-5 text-[#F59E0B]" />
                <span>{activeChannel.name}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/80 border border-white/80 font-mono font-bold text-slate-700 text-[11px]">
                {usersInActiveChannel.length} Anggota Terotorisasi
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans leading-relaxed">
              {activeChannel.description}
            </p>
          </div>

          {/* Feed Pesan Kanal */}
          <div className="flex-1 space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {channelMessages.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-sans italic space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <div>Belum ada pesan dalam kanal <strong>#{activeChannel.name}</strong>.</div>
                <div className="text-[11px]">Jadilah yang pertama memulai koordinasi di saluran ini.</div>
              </div>
            ) : (
              channelMessages.map(msg => (
                <div key={msg.id} className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/70 space-y-2.5 shadow-2xs">
                  {/* Author Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar Inisial Nama Bersih */}
                      <div className="w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-zinc-700">
                        {msg.authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                          <span>{msg.authorName}</span>
                          {renderRoleBadge(msg.authorRole, msg.authorPod, msg.isPodOwner)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>

                  {/* Message Content */}
                  <p className="text-xs text-slate-800 font-sans leading-relaxed pl-10">
                    {msg.content}
                  </p>

                  {/* Actions */}
                  <div className="pt-2 border-t border-white/60 flex items-center justify-end font-mono text-xs">
                    <button
                      onClick={() => handleToggleLike(msg.id)}
                      className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer text-[11px] ${
                        msg.liked
                          ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                          : 'bg-white/60 border-white/80 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{msg.likes} Dukungan</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form Kirim Pesan */}
          <form onSubmit={handleSendMessage} className="pt-4 border-t border-white/60 flex items-center gap-2.5">
            <input
              type="text"
              placeholder={`Tulis pesan ke #${activeChannel.name}...`}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/50 border border-white/70 rounded-2xl text-xs font-sans focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#F59E0B] text-slate-900"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className={`px-6 py-3 font-mono font-bold rounded-2xl text-xs cursor-pointer transition-all shadow-md flex items-center gap-2 shrink-0 ${
                inputMessage.trim()
                  ? 'bg-[#F59E0B] hover:bg-[#EA580C] text-slate-950 hover:scale-[1.01]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Kirim Pesan</span>
            </button>
          </form>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* C. KOLOM KANAN: DAFTAR ANGGOTA DALAM GRUP TERPILIH (col-span-12 lg:col-span-3) */}
      {/* ========================================================================= */}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
        <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/70 p-6 shadow-sm h-full flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono text-xs border-b border-white/60 pb-3">
              <span className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#EA580C]" />
                <span>Anggota Kanal Terotorisasi</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {usersInActiveChannel.length} User
              </span>
            </div>

            {/* List Authorized Members in Active Channel */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {usersInActiveChannel.map(u => (
                <div key={u.id} className="p-3 bg-white/50 rounded-2xl border border-white/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#18181B] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-zinc-700">
                      {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="truncate space-y-0.5">
                      <div className="font-bold text-slate-900 truncate">{u.name}</div>
                      <div>
                        {renderRoleBadge(u.role, u.pod_label, u.is_pod_owner || u.is_pod_lead)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/60 text-[11px] font-mono text-slate-500 text-center">
            Terisolasi secara terenkripsi per kanal
          </div>
        </div>
      </div>

    </div>
  );
};
