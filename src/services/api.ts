/**
 * API Service Layer & Endpoint Simulation
 * Menyediakan endpoint CRUD, filter privasi komentar, dan validasi peran terpusat.
 */

import { User, Team, Sprint, Task, Notification, TaskStatus, PodType, ContactInfo, UserRole, TaskComment } from '../types';

export interface ProfileResponse {
  user: User;
  team?: Team;
  role: string;
}

export const api = {
  // POST /api/auth/signup
  async registerUser(
    existingUsers: User[],
    payload: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      institution?: string;
      whatsapp?: string;
      role: UserRole | 'POD_OWNER';
      team_id?: string;
      pod_label?: PodType;
    }
  ): Promise<{ success: boolean; user?: User; reason?: string }> {
    if (!payload.name || !payload.name.trim()) {
      return { success: false, reason: 'Nama lengkap wajib diisi.' };
    }
    if (!payload.email || !payload.email.trim() || !payload.email.includes('@')) {
      return { success: false, reason: 'Alamat email tidak valid.' };
    }

    const emailLower = payload.email.trim().toLowerCase();
    const isEmailTaken = existingUsers.some(u => u.email.toLowerCase() === emailLower);
    if (isEmailTaken) {
      return { success: false, reason: 'Email ini sudah pernah terdaftar di sistem SyncFlow.' };
    }

    if (!payload.password || payload.password.length < 6) {
      return { success: false, reason: 'Kata sandi minimal 6 karakter.' };
    }

    if (payload.password !== payload.confirmPassword) {
      return { success: false, reason: 'Konfirmasi kata sandi tidak cocok dengan kata sandi.' };
    }

    const isPodOwnerRequested = payload.role === 'POD_OWNER';
    const finalRole: UserRole = isPodOwnerRequested ? 'MEMBER' : (payload.role as UserRole);

    if (finalRole !== 'BUSINESS_OWNER') {
      if (!payload.team_id) {
        return { success: false, reason: 'Pilih tim tempat Anda bertugas.' };
      }
    }

    if (finalRole === 'MEMBER' || isPodOwnerRequested) {
      if (!payload.pod_label) {
        return { success: false, reason: 'Pilih Pod spesialisasi Anda (BA, PB, QA, atau MG).' };
      }
    }

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name.trim())}&background=F59E0B&color=370000&bold=true`;

    const newUser: User = {
      id: `user-registered-${Date.now()}`,
      name: payload.name.trim(),
      email: emailLower,
      password: payload.password,
      role: finalRole,
      team_id: payload.team_id,
      pod_label: payload.pod_label,
      is_pod_lead: isPodOwnerRequested,
      is_pod_owner: isPodOwnerRequested,
      avatar_url: avatarUrl,
      title: isPodOwnerRequested 
        ? `Pod Owner (${payload.pod_label})` 
        : finalRole === 'BUSINESS_OWNER' 
          ? 'Business Owner' 
          : finalRole === 'PROJECT_OWNER' 
            ? 'Project Owner' 
            : finalRole === 'PROJECT_LEADER' 
              ? 'Project Leader' 
              : `Member (${payload.pod_label || 'Pod'})`,
      institution: payload.institution?.trim() || 'PT Inovasi Digital Nusantara',
      contact_info: {
        whatsapp: payload.whatsapp?.trim() || undefined
      }
    };

    return {
      success: true,
      user: newUser
    };
  },

  // GET /api/profile
  async getProfile(currentUser: User, teams: Team[]): Promise<ProfileResponse> {
    const team = teams.find(t => t.id === currentUser.team_id);
    return {
      user: currentUser,
      team,
      role: currentUser.role
    };
  },

  // PUT /api/profile
  async updateProfile(
    currentUser: User,
    payload: {
      name: string;
      avatar_url?: string;
      bio?: string;
      institution?: string;
      contact_info?: ContactInfo;
    }
  ): Promise<{ success: boolean; user?: User; message?: string }> {
    if (!payload.name || !payload.name.trim()) {
      return { success: false, message: 'Nama tampilan tidak boleh kosong.' };
    }

    const updatedUser: User = {
      ...currentUser,
      name: payload.name.trim(),
      avatar_url: payload.avatar_url?.trim() || currentUser.avatar_url,
      bio: payload.bio !== undefined ? payload.bio.trim() : currentUser.bio,
      institution: payload.institution !== undefined ? payload.institution.trim() : currentUser.institution,
      contact_info: payload.contact_info || currentUser.contact_info
    };

    return {
      success: true,
      user: updatedUser,
      message: 'Profil berhasil diperbarui.'
    };
  },

  // GET /api/teams (Role-Based Team Visibility Filter)
  getVisibleTeams(currentUser: User, allTeams: Team[]): Team[] {
    if (currentUser.role === 'BUSINESS_OWNER' || currentUser.role === 'PROJECT_OWNER') {
      return allTeams;
    }
    if (currentUser.team_id) {
      return allTeams.filter(t => t.id === currentUser.team_id);
    }
    return allTeams.slice(0, 1);
  },

  // Periksa apakah banner Tier 1: Business Owner boleh ditampilkan
  shouldShowExecutiveBanner(role: UserRole): boolean {
    return role === 'BUSINESS_OWNER' || role === 'PROJECT_OWNER';
  },

  // FILTER KOMENTAR PRIVAT BUSINESS OWNER
  getVisibleComments(currentUser: User, comments: TaskComment[]): TaskComment[] {
    if (currentUser.role === 'PROJECT_LEADER' || currentUser.role === 'MEMBER') {
      return comments.filter(c => !c.is_private_bo);
    }
    return comments;
  },

  // WEWENANG TAHAP 1: VERIFIKASI DoD POD OWNER
  canVerifyPodDoD(currentUser: User, task: Task): boolean {
    if (currentUser.role === 'PROJECT_OWNER' && currentUser.team_id === task.team_id) return true;
    if (currentUser.role === 'PROJECT_LEADER' && currentUser.team_id === task.team_id) return true;
    if (
      currentUser.role === 'MEMBER' && 
      (currentUser.is_pod_owner || currentUser.is_pod_lead) && 
      currentUser.team_id === task.team_id && 
      currentUser.pod_label === task.pod_label
    ) {
      return true;
    }
    return false;
  },

  // WEWENANG TAHAP 2: APPROVAL AKHIR (HANYA PROJECT LEADER & PROJECT OWNER)
  canApproveFinalReview(currentUser: User, task: Task): boolean {
    if (currentUser.role === 'PROJECT_OWNER' && currentUser.team_id === task.team_id) return true;
    if (currentUser.role === 'PROJECT_LEADER' && currentUser.team_id === task.team_id) return true;
    return false;
  },

  // Authorization Guard: DoD Configuration (Hanya Project Leader dan Project Owner yang berhak menambah/mengedit kriteria DoD)
  canConfigureDoD(currentUser: User, taskTeamId?: string): boolean {
    if (currentUser.role === 'PROJECT_OWNER') return true;
    if (currentUser.role === 'PROJECT_LEADER') {
      if (!taskTeamId || currentUser.team_id === taskTeamId) return true;
    }
    return false;
  },

  // Authorization Guard: Task Mutation (Create/Update/Delete)
  canMutateTask(role: UserRole): { allowed: boolean; reason?: string } {
    if (role === 'BUSINESS_OWNER') {
      return {
        allowed: false,
        reason: 'Business Owner memiliki akses Read-Only untuk monitoring dan dilarang membuat atau memodifikasi tugas.'
      };
    }
    return { allowed: true };
  },

  // Authorization Guard: Sprint Mutation (Hanya Project Owner yang berhak)
  canMutateSprint(role: UserRole): { allowed: boolean; reason?: string } {
    if (role !== 'PROJECT_OWNER') {
      return {
        allowed: false,
        reason: 'Sesuai SOP tata kelola, HANYA Project Owner yang memiliki wewenang untuk membuat, mengedit, dan mengelola siklus Sprint mingguan.'
      };
    }
    return { allowed: true };
  },

  // Validasi Payload Pembuatan Sprint (SOP Rule)
  validateSprintPayload(payload: {
    title: string;
    start_date: string;
    end_date: string;
    goal: string;
    meeting_notes: string;
  }): { valid: boolean; reason?: string } {
    if (!payload.title || !payload.title.trim()) {
      return { valid: false, reason: 'Judul sprint tidak boleh kosong.' };
    }
    if (!payload.start_date || !payload.end_date) {
      return { valid: false, reason: 'Rentang tanggal sprint tidak boleh kosong.' };
    }
    if (!payload.goal || !payload.goal.trim()) {
      return { valid: false, reason: 'Target utama / Sprint Goal wajib diisi sesuai hasil diskusi tim.' };
    }
    if (!payload.meeting_notes || !payload.meeting_notes.trim()) {
      return { valid: false, reason: 'Notulensi rapat / background perencanaan sprint wajib diisi sesuai SOP.' };
    }
    return { valid: true };
  },

  // Validasi alur transisi status tugas (Linear 1-Jalur & Blocker System)
  validateStatusTransition(
    currentUser: User,
    task: Task,
    newStatus: TaskStatus
  ): { allowed: boolean; reason?: string } {
    if (task.status === newStatus) return { allowed: true };

    // Business Owner: DILARANG mengubah status (Read-Only)
    if (currentUser.role === 'BUSINESS_OWNER') {
      return {
        allowed: false,
        reason: 'Business Owner memiliki hak akses Read-Only untuk monitoring dan dilarang mengubah status tugas.'
      };
    }

    // 1. PELAPORAN BLOCKER (Bisa dari status apa saja oleh pelaksana)
    if (newStatus === 'BLOCKED') {
      return { allowed: true };
    }

    // 2. PENGAJUAN KE POD REVIEW (DIKERJAKAN / IN_PROGRESS -> POD_REVIEW)
    if (newStatus === 'POD_REVIEW') {
      const hasAttachments = task.attachments && task.attachments.length > 0;
      if (!hasAttachments) {
        return {
          allowed: false,
          reason: 'Lampirkan minimal 1 tautan dokumen / PR / bukti hasil kerja sebelum mengajukan ke Pod Owner.'
        };
      }
    }

    // 3. APPROVAL POD OWNER / LEADER (POD_REVIEW -> SELESAI / DONE)
    if (newStatus === 'SELESAI' || newStatus === 'DONE') {
      const canVerify = this.canVerifyPodDoD(currentUser, task);
      if (!canVerify) {
        return {
          allowed: false,
          reason: 'Hanya Pod Owner dari Pod terkait atau Project Leader / Project Owner yang berwenang menyetujui tugas.'
        };
      }
    }

    return { allowed: true };
  }
};
