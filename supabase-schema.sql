-- ============================================================================
-- SYNCFLOW DATABASE SQL SCHEMA FOR SUPABASE
-- High-Performance Multi-Tier Project Management & Development Monitoring System
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up existing tables if re-running
DROP TABLE IF EXISTS project_links CASCADE;
DROP TABLE IF EXISTS community_messages CASCADE;
DROP TABLE IF EXISTS task_dods CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS sprints CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- Clean up existing types if re-running
DROP TYPE IF EXISTS user_role_enum CASCADE;
DROP TYPE IF EXISTS pod_type_enum CASCADE;
DROP TYPE IF EXISTS task_status_enum CASCADE;
DROP TYPE IF EXISTS task_priority_enum CASCADE;
DROP TYPE IF EXISTS channel_type_enum CASCADE;
DROP TYPE IF EXISTS blocker_category_enum CASCADE;

-- Create Custom Enum Types
CREATE TYPE user_role_enum AS ENUM (
  'BUSINESS_OWNER', 
  'PROJECT_LEAD',
  'PROJECT_OWNER', 
  'PROJECT_LEADER', 
  'POD_OWNER', 
  'MEMBER'
);

CREATE TYPE pod_type_enum AS ENUM (
  'BUSINESS_ANALYST',
  'PRODUCT_BUILDER',
  'QA_DOCUMENTATION',
  'GROWTH_MARKETING',
  'BA', 
  'PB', 
  'QA', 
  'MG', 
  'ALL'
);

CREATE TYPE blocker_category_enum AS ENUM (
  'API_DEPENDENCY',
  'ASSET_MISSING',
  'ACCESS_ISSUE',
  'OTHER'
);

CREATE TYPE task_status_enum AS ENUM (
  'TODO',
  'IN_PROGRESS',
  'BLOCKED',
  'UNDER_REVIEW',
  'DONE',
  'BACKLOG', 
  'POD_REVIEW', 
  'TEAM_REVIEW', 
  'REVIEW', 
  'SELESAI'
);

CREATE TYPE task_priority_enum AS ENUM (
  'LOW', 
  'MEDIUM', 
  'HIGH', 
  'CRITICAL'
);

CREATE TYPE channel_type_enum AS ENUM (
  'ALL_TEAMS', 
  'EXECUTIVE', 
  'GOVERNANCE', 
  'TEAM_INTERNAL', 
  'POD_BA', 
  'POD_PB', 
  'POD_QA', 
  'POD_MG'
);

-- ============================================================================
-- PROFILES TABLE LINKED WITH SUPABASE AUTH (auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- 'member' | 'owner'
  pod TEXT DEFAULT 'Product Builder', -- 'Product Builder' | 'BA' | 'QA' | 'Marketing'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 1. TEAMS TABLE
-- ============================================================================
CREATE TABLE teams (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. USERS TABLE
-- ============================================================================
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  role user_role_enum NOT NULL DEFAULT 'MEMBER',
  team_id VARCHAR(64) REFERENCES teams(id) ON DELETE SET NULL,
  pod_type pod_type_enum DEFAULT 'ALL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast role & team lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- 3. SPRINTS TABLE
-- ============================================================================
CREATE TABLE sprints (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  team_id VARCHAR(64) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sprint_goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for active sprints per team
CREATE INDEX idx_sprints_team_id ON sprints(team_id);
CREATE INDEX idx_sprints_is_active ON sprints(is_active);

-- ============================================================================
-- 4. TASKS TABLE
-- ============================================================================
CREATE TABLE tasks (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  task_code VARCHAR(50) NOT NULL,
  team_id VARCHAR(64) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  sprint_id VARCHAR(64) NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  assignee_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  assigned_to VARCHAR(255),
  pod pod_type_enum DEFAULT 'PRODUCT_BUILDER',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  deliverable_link TEXT,
  deliverable_url TEXT,
  status task_status_enum NOT NULL DEFAULT 'TODO',
  priority task_priority_enum NOT NULL DEFAULT 'MEDIUM',
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  blocker_reason TEXT,
  blocker_category blocker_category_enum,
  review_feedback TEXT,
  checklist JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for task queries
CREATE INDEX idx_tasks_team_id ON tasks(team_id);
CREATE INDEX idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ============================================================================
-- 5. TASK DODS TABLE (Definition of Done Criteria)
-- ============================================================================
CREATE TABLE task_dods (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  task_id VARCHAR(64) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  criteria_text TEXT NOT NULL,
  is_checked BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_dods_task_id ON task_dods(task_id);

-- ============================================================================
-- 6. COMMUNITY MESSAGES TABLE
-- ============================================================================
CREATE TABLE community_messages (
  id VARCHAR(64) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  team_id VARCHAR(64) REFERENCES teams(id) ON DELETE SET NULL,
  channel_type channel_type_enum NOT NULL DEFAULT 'ALL_TEAMS',
  sender_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_community_messages_channel ON community_messages(channel_type);
CREATE INDEX idx_community_messages_sender ON community_messages(sender_id);

-- ============================================================================
-- 7. PROJECT LINKS TABLE (FULL CRUD DYNAMIC ASSETS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.project_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_type TEXT DEFAULT 'link',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) FOR PUBLIC ACCESS
-- ============================================================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dods ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert to teams" ON teams FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert to users" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to sprints" ON sprints FOR SELECT USING (true);
CREATE POLICY "Allow public insert to sprints" ON sprints FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to tasks" ON tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update to tasks" ON tasks FOR ALL USING (true);

CREATE POLICY "Allow public access to task_dods" ON task_dods FOR ALL USING (true);
CREATE POLICY "Allow public access to community_messages" ON community_messages FOR ALL USING (true);
CREATE POLICY "Allow public access to project_links" ON public.project_links FOR ALL USING (true);
