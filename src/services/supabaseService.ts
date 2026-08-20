import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, Team, Sprint, Task, TaskStatus, TaskPriority, PodType, UserRole } from '../types';

export const supabaseService = {
  // 1. Fetch Teams from Supabase with Fallback
  async fetchTeams(fallbackTeams: Team[]): Promise<Team[]> {
    if (!isSupabaseConfigured()) return fallbackTeams;

    try {
      const { data, error } = await supabase.from('teams').select('*').order('created_at', { ascending: true });
      if (error || !data || data.length === 0) return fallbackTeams;

      return data.map(t => ({
        id: t.id,
        name: t.name,
        code: t.name.includes('1') ? 'T1' : t.name.includes('2') ? 'T2' : 'T3',
        project_owner_id: 'user-po-1',
        project_leader_id: 'user-pl-1',
      }));
    } catch (err) {
      console.warn('Supabase fetchTeams fallback:', err);
      return fallbackTeams;
    }
  },

  // 2. Fetch Sprints from Supabase with Fallback
  async fetchSprints(fallbackSprints: Sprint[]): Promise<Sprint[]> {
    if (!isSupabaseConfigured()) return fallbackSprints;

    try {
      const { data, error } = await supabase.from('sprints').select('*').order('created_at', { ascending: false });
      if (error || !data || data.length === 0) return fallbackSprints;

      return data.map(s => ({
        id: s.id,
        team_id: s.team_id,
        title: s.name,
        start_date: s.start_date,
        end_date: s.end_date,
        goal: s.sprint_goal || 'Sprint Goal',
        meeting_notes: 'Hasil rapat koordinasi tim.',
        status: s.is_active ? 'ACTIVE' : 'COMPLETED',
        created_at: s.created_at,
      }));
    } catch (err) {
      console.warn('Supabase fetchSprints fallback:', err);
      return fallbackSprints;
    }
  },

  // 3. Fetch Tasks & DODs from Supabase with Fallback
  async fetchTasks(fallbackTasks: Task[]): Promise<Task[]> {
    if (!isSupabaseConfigured()) return fallbackTasks;

    try {
      const { data: dbTasks, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (error || !dbTasks || dbTasks.length === 0) return fallbackTasks;

      // Fetch DODs
      const { data: dbDods } = await supabase.from('task_dods').select('*');

      return dbTasks.map(t => {
        const taskDods = (dbDods || []).filter(d => d.task_id === t.id).map(d => ({
          id: d.id,
          label: d.criteria_text,
          completed: d.is_checked,
        }));

        return {
          id: t.id,
          code: t.task_code,
          sprint_id: t.sprint_id,
          team_id: t.team_id,
          title: t.title,
          description: t.description || '',
          assignee_id: t.assignee_id || 'user-mem-101',
          pod_label: 'PB' as PodType,
          priority: (t.priority as TaskPriority) || 'HIGH',
          deadline: '2026-08-25',
          status: (t.status as TaskStatus) || 'BACKLOG',
          progress: t.status === 'DONE' || t.status === 'SELESAI' ? 100 : 50,
          dod_checklist: taskDods.length > 0 ? taskDods : fallbackTasks[0]?.dod_checklist || [],
          comments: [],
          attachments: t.deliverable_link ? [{ name: 'Hasil Kerja', url: t.deliverable_link, uploaded_at: 'Baru saja' }] : [],
          created_at: t.created_at,
          updated_at: t.created_at,
        };
      });
    } catch (err) {
      console.warn('Supabase fetchTasks fallback:', err);
      return fallbackTasks;
    }
  },

  // 4. Create Task in Supabase
  async createTask(task: Task): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase.from('tasks').insert({
        id: task.id,
        task_code: task.code,
        team_id: task.team_id,
        sprint_id: task.sprint_id,
        assignee_id: task.assignee_id,
        title: task.title,
        description: task.description,
        deliverable_link: task.attachments[0]?.url || null,
        status: task.status === 'SELESAI' ? 'DONE' : task.status,
        priority: task.priority,
      });

      return !error;
    } catch (err) {
      console.warn('Supabase createTask error:', err);
      return false;
    }
  },

  // 5. Update Task Status in Supabase
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const dbStatus = status === 'SELESAI' ? 'DONE' : status;
      const { error } = await supabase.from('tasks').update({ status: dbStatus }).eq('id', taskId);
      return !error;
    } catch (err) {
      console.warn('Supabase updateTaskStatus error:', err);
      return false;
    }
  },

  // 6. Create Sprint in Supabase
  async createSprint(sprint: Sprint): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase.from('sprints').insert({
        id: sprint.id,
        team_id: sprint.team_id,
        name: sprint.title,
        sprint_goal: sprint.goal,
        start_date: sprint.start_date,
        end_date: sprint.end_date,
        is_active: sprint.status === 'ACTIVE',
      });

      return !error;
    } catch (err) {
      console.warn('Supabase createSprint error:', err);
      return false;
    }
  },

  // 7. Save Community Message in Supabase
  async sendCommunityMessage(msg: {
    id: string;
    team_id?: string;
    channel_type: string;
    sender_id: string;
    message_text: string;
    attachment_url?: string;
  }): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const { error } = await supabase.from('community_messages').insert({
        id: msg.id,
        team_id: msg.team_id || null,
        channel_type: msg.channel_type === 'all' ? 'ALL_TEAMS' : 'GOVERNANCE',
        sender_id: msg.sender_id,
        message_text: msg.message_text,
        attachment_url: msg.attachment_url || null,
      });

      return !error;
    } catch (err) {
      console.warn('Supabase sendCommunityMessage error:', err);
      return false;
    }
  }
};
