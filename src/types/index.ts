export type UserRole = 
  | 'BUSINESS_OWNER' 
  | 'PROJECT_OWNER' 
  | 'PROJECT_LEADER' 
  | 'MEMBER';

export type PodType = 
  | 'BA' 
  | 'PB' 
  | 'QA' 
  | 'MG'
  | 'BUSINESS_ANALYST' 
  | 'PRODUCT_BUILDER' 
  | 'QUALITY_ASSURANCE' 
  | 'MARKETING_GROWTH';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TaskStatus = 
  | 'BACKLOG' 
  | 'TODO'
  | 'DIKERJAKAN' 
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'POD_REVIEW' 
  | 'REVIEW' 
  | 'SELESAI'
  | 'DONE';

export type SprintStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED';

export interface ContactInfo {
  whatsapp?: string;
  linkedin?: string;
  telegram?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  team_id?: string; // Khusus Project Owner, Project Leader & Member
  pod_label?: PodType; // Khusus Member sebagai penanda fungsi peran (BA, PB, QA, MG)
  is_pod_lead?: boolean; // True jika ditunjuk sebagai Pod Owner / Pod Lead (memiliki delegasi approval review pod)
  is_pod_owner?: boolean; // Field boolean penunjuk Pod Owner
  avatar_url: string;
  title: string;
  bio?: string;
  institution?: string;
  contact_info?: ContactInfo;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  project_owner_id: string; // FK users (Project Owner)
  project_leader_id: string; // FK users (Project Leader)
}

export interface Sprint {
  id: string;
  team_id: string;
  title: string;
  start_date: string;
  end_date: string;
  goal: string;
  meeting_notes: string; // Notulensi / background rapat perencanaan sprint (Wajib)
  document_url?: string; // Link dokumen pendukung (Google Docs, Figma, Notion, dll.)
  status: SprintStatus;
  created_at?: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  user_role?: UserRole;
  content: string;
  is_private_bo?: boolean; // True jika dibuat oleh Business Owner (hanya terbaca oleh BO & PO)
  created_at: string;
}

export interface TaskAttachment {
  name: string;
  url: string;
  size: string;
  uploaded_at: string;
}

export interface DodItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface Task {
  id: string;
  code: string;
  sprint_id: string;
  team_id: string;
  title: string;
  description: string;
  assignee_id: string;
  pod_label: PodType;
  priority: TaskPriority;
  deadline: string;
  status: TaskStatus;
  is_blocked?: boolean;
  blocker_reason?: string;
  progress: number; // 0-100%
  dod_checklist: DodItem[]; // Definition of Done checklist
  comments: TaskComment[];
  attachments: TaskAttachment[];
  created_at: string;
  updated_at: string;
}

export type NotificationPriority = 'INFO' | 'WARNING' | 'IMPORTANT' | 'URGENT' | 'SUCCESS';

export interface Notification {
  id: string;
  user_id: string; // Target penerima notifikasi
  type: NotificationPriority;
  title: string;
  message: string;
  link_url?: string;
  related_task_id?: string;
  related_sprint_id?: string;
  is_read: boolean;
  created_at: string;
}
