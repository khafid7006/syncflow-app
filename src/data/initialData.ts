import { User, Team, Sprint, Task, DodItem } from '../types';

export const DEFAULT_DOD_CHECKLIST: DodItem[] = [
  { id: 'dod-1', label: 'Hasil kerja sudah selesai sesuai deskripsi tugas', completed: false },
  { id: 'dod-2', label: 'Tautan dokumen / PR / bukti hasil kerja sudah dilampirkan', completed: false },
  { id: 'dod-3', label: 'Telah dicek mandiri & siap direview', completed: false }
];

/**
 * STRUKTUR ORGANISASI 4-TIER + POD OWNER DELEGATION
 * 1. Business Owner (2 orang) - Akses monitoring global
 * 2. Project Owner (3 orang) - 1 orang per Team
 * 3. Project Leader (3 orang) - 1 orang per Team
 * 4. Members (dengan label Pod: BA, PB, QA, MG & 1 Pod Owner per Pod)
 */

export const INITIAL_USERS: User[] = [
  // 1. BUSINESS OWNER (2 Orang)
  {
    id: 'user-bo-1',
    name: 'Hendrawan Pratama',
    email: 'bo1@projecthub.local',
    role: 'BUSINESS_OWNER',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Managing Director / Business Owner',
    bio: 'Memantau keselarasan strategi bisnis dan delivery lintas seluruh portofolio tim.',
    institution: 'PT Inovasi Digital Nusantara',
    contact_info: { whatsapp: '+628111222333', linkedin: 'https://linkedin.com/in/hendrawan', telegram: '@hendrawan_bo' }
  },
  {
    id: 'user-bo-2',
    name: 'Dewi Lestari',
    email: 'bo2@projecthub.local',
    role: 'BUSINESS_OWNER',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'Chief Operating Officer / Business Owner',
    bio: 'Mengawasi efisiensi operasional dan bottleneck pada seluruh tim produk.',
    institution: 'PT Inovasi Digital Nusantara',
    contact_info: { whatsapp: '+628111222444', linkedin: 'https://linkedin.com/in/dewilestari', telegram: '@dewi_bo' }
  },

  // 2. PROJECT OWNER (3 Orang - 1 per Team)
  {
    id: 'user-po-1',
    name: 'Bambang Sudiro',
    email: 'po1@projecthub.local',
    role: 'PROJECT_OWNER',
    team_id: 'team-1',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Project Owner - Team 1 (Core Banking)',
    bio: 'Penanggung jawab produk Core Banking & Payment Engine.',
    institution: 'Bank Digital Ventura',
    contact_info: { whatsapp: '+628123456701', linkedin: 'https://linkedin.com/in/bambang-po', telegram: '@bambang_po' }
  },
  {
    id: 'user-po-2',
    name: 'Maya Anggraini',
    email: 'po2@projecthub.local',
    role: 'PROJECT_OWNER',
    team_id: 'team-2',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    title: 'Project Owner - Team 2 (Customer Experience)',
    bio: 'Penanggung jawab produk Mobile App & CX Ecosystem.',
    institution: 'FinTech Solusindo',
    contact_info: { whatsapp: '+628123456702', linkedin: 'https://linkedin.com/in/maya-po', telegram: '@maya_po' }
  },
  {
    id: 'user-po-3',
    name: 'Reza Fahlevi',
    email: 'po3@projecthub.local',
    role: 'PROJECT_OWNER',
    team_id: 'team-3',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    title: 'Project Owner - Team 3 (Merchant & Ecosystem)',
    bio: 'Penanggung jawab integrasi Merchant Portal & QRIS Hub.',
    institution: 'Merchant Pay Asia',
    contact_info: { whatsapp: '+628123456703', linkedin: 'https://linkedin.com/in/reza-po', telegram: '@reza_po' }
  },

  // 3. PROJECT LEADER (3 Orang - 1 per Team)
  {
    id: 'user-pl-1',
    name: 'Budi Santoso',
    email: 'pl1@projecthub.local',
    role: 'PROJECT_LEADER',
    team_id: 'team-1',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    title: 'Project Leader - Team 1 (Core Banking)',
    bio: 'Mengkoordinasikan eksekusi teknis dan quality delivery Core Banking.',
    institution: 'Bank Digital Ventura',
    contact_info: { whatsapp: '+628987654321', linkedin: 'https://linkedin.com/in/budi-pl', telegram: '@budi_pl' }
  },
  {
    id: 'user-pl-2',
    name: 'Sinta Rahayu',
    email: 'pl2@projecthub.local',
    role: 'PROJECT_LEADER',
    team_id: 'team-2',
    avatar_url: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=150&auto=format&fit=crop&q=80',
    title: 'Project Leader - Team 2 (Customer Experience)',
    bio: 'Memimpin tim CX dalam merancang pengalaman pengguna yang mulus.',
    institution: 'FinTech Solusindo',
    contact_info: { whatsapp: '+628987654322', linkedin: 'https://linkedin.com/in/sinta-pl', telegram: '@sinta_pl' }
  },
  {
    id: 'user-pl-3',
    name: 'Agus Wijaya',
    email: 'pl3@projecthub.local',
    role: 'PROJECT_LEADER',
    team_id: 'team-3',
    avatar_url: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
    title: 'Project Leader - Team 3 (Merchant & Ecosystem)',
    bio: 'Mengawal integrasi API merchant dan infrastruktur QRIS.',
    institution: 'Merchant Pay Asia',
    contact_info: { whatsapp: '+628987654323', linkedin: 'https://linkedin.com/in/agus-pl', telegram: '@agus_pl' }
  },

  // 4. MEMBERS - TEAM 1 (Core Banking)
  {
    id: 'user-mem-101',
    name: 'Rina Wulandari',
    email: 'rina@team1.local',
    role: 'MEMBER',
    team_id: 'team-1',
    pod_label: 'BA',
    is_pod_lead: true,
    is_pod_owner: true,
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    title: 'Business Analyst Lead - Pod BA (Core Banking)',
    bio: 'Spesialis analisis kebutuhan bisnis dan dokumentasi BRD untuk modul Core Banking.',
    institution: 'Bank Digital Ventura',
    contact_info: { whatsapp: '+628111000101' }
  },
  {
    id: 'user-mem-102',
    name: 'Dimas Prasetyo',
    email: 'dimas@team1.local',
    role: 'MEMBER',
    team_id: 'team-1',
    pod_label: 'PB',
    is_pod_lead: true,
    is_pod_owner: true,
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    title: 'Product Builder Lead - Pod PB (Core Banking)',
    bio: 'Senior backend engineer untuk Core Banking API & Ledger Engine.',
    institution: 'Bank Digital Ventura',
    contact_info: { whatsapp: '+628111000102' }
  },
  {
    id: 'user-mem-103',
    name: 'Farhan Maulana',
    email: 'farhan@team1.local',
    role: 'MEMBER',
    team_id: 'team-1',
    pod_label: 'PB',
    avatar_url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&auto=format&fit=crop&q=80',
    title: 'Full-Stack Developer - Pod PB (Core Banking)',
    bio: 'Membangun fitur transfer & settlement endpoint.',
    institution: 'Bank Digital Ventura',
    contact_info: { whatsapp: '+628111000103' }
  },
  {
    id: 'user-mem-104',
    name: 'Hendra Susanto',
    email: 'hendra@team1.local',
    role: 'MEMBER',
    team_id: 'team-1',
    pod_label: 'QA',
    is_pod_lead: true,
    is_pod_owner: true,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    title: 'QA Lead - Pod QA (Core Banking)',
    bio: 'Memimpin stress testing dan validasi integrity pada sistem ledger.',
    institution: 'Bank Digital Ventura',
    contact_info: { whatsapp: '+628111000104' }
  },

  // 4. MEMBERS - TEAM 2 (Customer Experience)
  {
    id: 'user-mem-201',
    name: 'Putri Handayani',
    email: 'putri@team2.local',
    role: 'MEMBER',
    team_id: 'team-2',
    pod_label: 'BA',
    is_pod_lead: true,
    is_pod_owner: true,
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    title: 'Business Analyst Lead - Pod BA (CX)',
    bio: 'Analisis kebutuhan UX & user journey CX mobile app.',
    institution: 'FinTech Solusindo',
    contact_info: { whatsapp: '+628111000201' }
  },
  {
    id: 'user-mem-202',
    name: 'Rizky Ramadhan',
    email: 'rizky@team2.local',
    role: 'MEMBER',
    team_id: 'team-2',
    pod_label: 'PB',
    is_pod_lead: true,
    is_pod_owner: true,
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    title: 'Mobile Developer Lead - Pod PB (CX)',
    bio: 'React Native developer untuk onboarding & notifikasi push.',
    institution: 'FinTech Solusindo',
    contact_info: { whatsapp: '+628111000202' }
  },
  {
    id: 'user-mem-203',
    name: 'Yuni Astuti',
    email: 'yuni@team2.local',
    role: 'MEMBER',
    team_id: 'team-2',
    pod_label: 'QA',
    is_pod_lead: true,
    is_pod_owner: true,
    avatar_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
    title: 'QA Lead - Pod QA (CX)',
    bio: 'Automation testing & regression suite untuk CX mobile.',
    institution: 'FinTech Solusindo',
    contact_info: { whatsapp: '+628111000203' }
  },

  // 4. MEMBERS - TEAM 3 (Merchant & Ecosystem)
  {
    id: 'user-mem-301',
    name: 'Tono Hartono',
    email: 'tono@team3.local',
    role: 'MEMBER',
    team_id: 'team-3',
    pod_label: 'BA',
    is_pod_lead: true,
    is_pod_owner: true,
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    title: 'Business Analyst Lead - Pod BA (Merchant)',
    bio: 'Analisis kebutuhan merchant portal dan QRIS flow.',
    institution: 'Merchant Pay Asia',
    contact_info: { whatsapp: '+628111000301' }
  },
  {
    id: 'user-mem-302',
    name: 'Winda Pratiwi',
    email: 'winda@team3.local',
    role: 'MEMBER',
    team_id: 'team-3',
    pod_label: 'PB',
    is_pod_lead: true,
    is_pod_owner: true,
    avatar_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
    title: 'Backend Developer Lead - Pod PB (Merchant)',
    bio: 'Merchant API integration & QRIS Hub backend.',
    institution: 'Merchant Pay Asia',
    contact_info: { whatsapp: '+628111000302' }
  }
];

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-1',
    name: 'Tim 1 — Core Banking',
    code: 'T1',
    project_owner_id: 'user-po-1',
    project_leader_id: 'user-pl-1'
  },
  {
    id: 'team-2',
    name: 'Tim 2 — Customer Experience',
    code: 'T2',
    project_owner_id: 'user-po-2',
    project_leader_id: 'user-pl-2'
  },
  {
    id: 'team-3',
    name: 'Tim 3 — Merchant & Ecosystem',
    code: 'T3',
    project_owner_id: 'user-po-3',
    project_leader_id: 'user-pl-3'
  }
];

export const INITIAL_SPRINTS: Sprint[] = [
  {
    id: 'sprint-101',
    team_id: 'team-1',
    title: 'Sprint #1 — Core Banking Foundation',
    start_date: '2026-08-18',
    end_date: '2026-08-25',
    goal: 'Menyelesaikan fondasi Core Banking: Ledger API, Audit Transaksi, dan Stress Test Database.',
    meeting_notes: 'Hasil rapat 18 Aug: Prioritaskan stabilitas API ledger dan coverage audit trail 100%.',
    document_url: 'https://docs.google.com/document/d/sprint-101-core-banking',
    status: 'ACTIVE',
    created_at: '2026-08-18'
  },
  {
    id: 'sprint-201',
    team_id: 'team-2',
    title: 'Sprint #1 — CX Onboarding V2',
    start_date: '2026-08-18',
    end_date: '2026-08-25',
    goal: 'Redesign alur onboarding nasabah baru dengan UX yang lebih sederhana dan notifikasi realtime.',
    meeting_notes: 'Fokus pada pengurangan drop-off rate onboarding dari 40% menjadi di bawah 15%.',
    document_url: 'https://figma.com/file/cx-onboarding-v2',
    status: 'ACTIVE',
    created_at: '2026-08-18'
  },
  {
    id: 'sprint-301',
    team_id: 'team-3',
    title: 'Sprint #1 — Merchant Portal & QRIS',
    start_date: '2026-08-18',
    end_date: '2026-08-25',
    goal: 'Integrasi QRIS Hub dan pembangunan dashboard transaksi merchant real-time.',
    meeting_notes: 'Target: Merchant dapat melihat transaksi real-time dengan latency < 2 detik.',
    document_url: 'https://docs.google.com/document/d/sprint-301-merchant',
    status: 'ACTIVE',
    created_at: '2026-08-18'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-101',
    code: 'T1-101',
    sprint_id: 'sprint-101',
    team_id: 'team-1',
    title: 'Desain & Dokumentasi BRD Audit Transaksi',
    description: 'Membuat Business Requirements Document (BRD) lengkap untuk fitur audit log transaksi Core Banking, mencakup skenario bisnis, aturan validasi, dan acceptance criteria.',
    assignee_id: 'user-mem-101',
    pod_label: 'BA',
    priority: 'HIGH',
    deadline: '2026-08-22',
    status: 'DIKERJAKAN',
    progress: 60,
    dod_checklist: [
      { id: 'dod-1', label: 'Hasil kerja sudah selesai sesuai deskripsi tugas', completed: true },
      { id: 'dod-2', label: 'Tautan dokumen / PR / bukti hasil kerja sudah dilampirkan', completed: false },
      { id: 'dod-3', label: 'Telah dicek mandiri & siap direview', completed: false }
    ],
    comments: [],
    attachments: [],
    created_at: '2026-08-18',
    updated_at: '2026-08-20'
  },
  {
    id: 'task-102',
    code: 'T1-102',
    sprint_id: 'sprint-101',
    team_id: 'team-1',
    title: 'Implementasi Ledger API — Core Transaction Engine',
    description: 'Membangun RESTful API untuk proses debit/kredit ledger dengan ACID compliance, idempotency key, dan logging audit trail lengkap.',
    assignee_id: 'user-mem-102',
    pod_label: 'PB',
    priority: 'CRITICAL',
    deadline: '2026-08-23',
    status: 'REVIEW',
    progress: 90,
    dod_checklist: [
      { id: 'dod-1', label: 'Hasil kerja sudah selesai sesuai deskripsi tugas', completed: true },
      { id: 'dod-2', label: 'Tautan dokumen / PR / bukti hasil kerja sudah dilampirkan', completed: true },
      { id: 'dod-3', label: 'Telah dicek mandiri & siap direview', completed: true }
    ],
    comments: [],
    attachments: [
      {
        name: 'BRD_Audit_Transaksi_V1.docx',
        url: 'https://docs.google.com/document/d/sample-brd',
        size: '520 KB',
        uploaded_at: '2026-08-19'
      }
    ],
    created_at: '2026-08-18',
    updated_at: '2026-08-19'
  },
  {
    id: 'task-103',
    code: 'T1-103',
    sprint_id: 'sprint-101',
    team_id: 'team-1',
    title: 'Pengujian Stress Test Ledger Database',
    description: 'Menjalankan benchmark 10.000 concurrent TPS pada staging.',
    assignee_id: 'user-mem-104',
    pod_label: 'QA',
    priority: 'CRITICAL',
    deadline: '2026-08-25',
    status: 'BACKLOG',
    progress: 0,
    dod_checklist: [
      { id: 'dod-1', label: 'Hasil kerja sudah selesai sesuai deskripsi tugas', completed: false },
      { id: 'dod-2', label: 'Tautan dokumen / PR / bukti hasil kerja sudah dilampirkan', completed: false },
      { id: 'dod-3', label: 'Telah dicek mandiri & siap direview', completed: false }
    ],
    comments: [],
    attachments: [],
    created_at: '2026-08-18',
    updated_at: '2026-08-18'
  },
  {
    id: 'task-104',
    code: 'T1-104',
    sprint_id: 'sprint-101',
    team_id: 'team-1',
    title: 'Penyusunan Desain Database Transaksi',
    description: 'Skema tabel ACID compliant dan foreign key indexing.',
    assignee_id: 'user-mem-102',
    pod_label: 'PB',
    priority: 'HIGH',
    deadline: '2026-08-20',
    status: 'SELESAI',
    progress: 100,
    dod_checklist: [
      { id: 'dod-1', label: 'Hasil kerja sudah selesai sesuai deskripsi tugas', completed: true },
      { id: 'dod-2', label: 'Tautan dokumen / PR / bukti hasil kerja sudah dilampirkan', completed: true },
      { id: 'dod-3', label: 'Telah dicek mandiri & siap direview', completed: true }
    ],
    comments: [],
    attachments: [
      {
        name: 'Schema_Database_V1.sql',
        url: '#',
        size: '18 KB',
        uploaded_at: '2026-08-20'
      }
    ],
    created_at: '2026-08-18',
    updated_at: '2026-08-20'
  },
  {
    id: 'task-105',
    code: 'T1-105',
    sprint_id: 'sprint-101',
    team_id: 'team-1',
    title: 'Endpoint API Settlement Transaksi Antar Bank',
    description: 'Membangun controller API transfer BI-FAST dan validasi payload ISO8583.',
    assignee_id: 'user-mem-103',
    pod_label: 'PB',
    priority: 'HIGH',
    deadline: '2026-08-24',
    status: 'POD_REVIEW',
    progress: 70,
    dod_checklist: [
      { id: 'dod-1', label: 'Hasil kerja sudah selesai sesuai deskripsi tugas', completed: true },
      { id: 'dod-2', label: 'Tautan dokumen / PR / bukti hasil kerja sudah dilampirkan', completed: true },
      { id: 'dod-3', label: 'Telah dicek mandiri & siap direview', completed: false }
    ],
    comments: [],
    attachments: [
      {
        name: 'PR #18 - Settlement API Controller',
        url: 'https://github.com/company/core-banking/pull/18',
        size: 'Tautan GitHub PR',
        uploaded_at: '2026-08-20'
      }
    ],
    created_at: '2026-08-18',
    updated_at: '2026-08-20'
  }
];
