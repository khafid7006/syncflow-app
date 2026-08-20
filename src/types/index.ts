export type UserRole = 
  | 'BUSINESS_OWNER' 
  | 'PROJECT_LEAD' 
  | 'PROJECT_OWNER' 
  | 'PROJECT_LEADER' 
  | 'MEMBER';

export type PodType = 
  | 'BUSINESS_ANALYST' 
  | 'PRODUCT_BUILDER' 
  | 'QA_DOCUMENTATION' 
  | 'GROWTH_MARKETING'
  | 'BA' 
  | 'PB' 
  | 'QA' 
  | 'MG';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type BlockerCategory = 
  | 'API_DEPENDENCY' 
  | 'ASSET_MISSING' 
  | 'ACCESS_ISSUE' 
  | 'OTHER';

export type TaskStatus = 
  | 'TODO'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'UNDER_REVIEW'
  | 'DONE'
  | 'BACKLOG' 
  | 'DIKERJAKAN' 
  | 'POD_REVIEW' 
  | 'REVIEW' 
  | 'SELESAI';

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
  team_id?: string;
  pod_label?: PodType;
  is_pod_lead?: boolean;
  is_pod_owner?: boolean;
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
  project_owner_id: string;
  project_leader_id: string;
}

export interface Sprint {
  id: string;
  team_id: string;
  title: string;
  start_date: string;
  end_date: string;
  goal: string;
  meeting_notes: string;
  document_url?: string;
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
  is_private_bo?: boolean;
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
  assigned_to?: string;
  pod_label: PodType;
  pod?: PodType;
  priority: TaskPriority;
  deadline: string;
  status: TaskStatus;
  is_blocked?: boolean;
  blocker_reason?: string;
  blocker_category?: BlockerCategory;
  deliverable_url?: string;
  review_feedback?: string;
  progress: number;
  dod_checklist: DodItem[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
  created_at: string;
  updated_at: string;
}

export type NotificationPriority = 'INFO' | 'WARNING' | 'IMPORTANT' | 'URGENT' | 'SUCCESS';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationPriority;
  title: string;
  message: string;
  link_url?: string;
  related_task_id?: string;
  related_sprint_id?: string;
  is_read: boolean;
  created_at: string;
}
