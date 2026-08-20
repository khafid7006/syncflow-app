import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Live Supabase Environment variables configuration
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://bvjyqotpaenglurlnwjb.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2anlxb3RwYWVuZ2x1cmxud2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMDUxNjksImV4cCI6MjEwMjc4MTE2OX0.jtUt4k4F8JcddezmZaeswmQEgmpEZHb6pTHyDgJ2Z7A';

// Check if credentials are valid
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl) && Boolean(supabaseAnonKey);
};

// Create Supabase client instance with graceful error handling
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper database types interface for TypeScript completion
export interface DatabaseSchema {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['teams']['Row'], 'created_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['teams']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          role: 'BUSINESS_OWNER' | 'PROJECT_OWNER' | 'PROJECT_LEADER' | 'POD_OWNER' | 'MEMBER';
          team_id: string | null;
          pod_type: 'BA' | 'PB' | 'QA' | 'MG' | 'ALL' | null;
          created_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['users']['Row'], 'created_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['users']['Insert']>;
      };
      sprints: {
        Row: {
          id: string;
          team_id: string;
          name: string;
          sprint_goal: string | null;
          start_date: string;
          end_date: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['sprints']['Row'], 'created_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['sprints']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          task_code: string;
          team_id: string;
          sprint_id: string;
          assignee_id: string | null;
          title: string;
          description: string | null;
          deliverable_link: string | null;
          status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'POD_REVIEW' | 'TEAM_REVIEW' | 'DONE';
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          created_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['tasks']['Row'], 'created_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['tasks']['Insert']>;
      };
      task_dods: {
        Row: {
          id: string;
          task_id: string;
          criteria_text: string;
          is_checked: boolean;
          verified_by: string | null;
          updated_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['task_dods']['Row'], 'updated_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['task_dods']['Insert']>;
      };
      community_messages: {
        Row: {
          id: string;
          team_id: string | null;
          channel_type: 'ALL_TEAMS' | 'EXECUTIVE' | 'GOVERNANCE' | 'TEAM_INTERNAL' | 'POD_BA' | 'POD_PB' | 'POD_QA' | 'POD_MG';
          sender_id: string;
          message_text: string;
          attachment_url: string | null;
          created_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['community_messages']['Row'], 'created_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['community_messages']['Insert']>;
      };
    };
  };
}
