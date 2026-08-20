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
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  department VARCHAR(64) NOT NULL,
  lead_name VARCHAR(128) NOT NULL,
  lead_role user_role_enum NOT NULL DEFAULT 'PROJECT_LEAD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. USERS TABLE (MEMBER PROFILE & ROLE)
-- ============================================================================
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(128) NOT NULL,
  email VARCHAR(128) NOT NULL UNIQUE,
  role user_role_enum NOT NULL DEFAULT 'MEMBER',
  pod_type pod_type_enum NOT NULL DEFAULT 'PRODUCT_BUILDER',
  team_id VARCHAR(64) REFERENCES teams(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_team ON users(team_id);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- 3. SPRINTS TABLE
-- ============================================================================
CREATE TABLE sprints (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. TASKS TABLE (MASTER MONITORING FEED)
-- ============================================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(256) NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(64) NOT NULL DEFAULT 'in_progress',
  priority task_priority_enum NOT NULL DEFAULT 'MEDIUM',
  blocker_category blocker_category_enum,
  blocker_reason TEXT,
  deliverable_url TEXT,
  deliverable_link TEXT,
  revision_note TEXT,
  resolution_note TEXT,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  due_date TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);

-- ============================================================================
-- 5. TASK DODS (DEFINITION OF DONE CHECKLIST)
-- ============================================================================
CREATE TABLE task_dods (
  id VARCHAR(64) PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dods_task ON task_dods(task_id);

-- ============================================================================
-- 6. COMMUNITY MESSAGES TABLE (FEEDBACK & DISCUSSIONS)
-- ============================================================================
CREATE TABLE community_messages (
  id VARCHAR(64) PRIMARY KEY,
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
-- 8. WORKSPACES & WORKSPACE MEMBERS TABLES (MULTI-WORKSPACE TERISOLASI)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'po' | 'pl' | 'member'
  pod TEXT DEFAULT 'Product Builder',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(workspace_id, user_id)
);

-- Add workspace_id column to existing tasks and project_links tables
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.project_links ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Add invite_code column and migration fallback if workspaces table already exists
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;
UPDATE public.workspaces SET invite_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)) WHERE invite_code IS NULL;

-- Disable RLS to allow direct queries without block
ALTER TABLE public.workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members DISABLE ROW LEVEL SECURITY;
