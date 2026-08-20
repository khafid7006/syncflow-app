-- ============================================================================
-- SYNCFLOW DATABASE SQL SCHEMA FOR SUPABASE
-- High-Performance Multi-Tier Project Management & Development Monitoring System
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up existing tables if re-running
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

-- Create Custom Enum Types
CREATE TYPE user_role_enum AS ENUM (
  'BUSINESS_OWNER', 
  'PROJECT_OWNER', 
  'PROJECT_LEADER', 
  'POD_OWNER', 
  'MEMBER'
);

CREATE TYPE pod_type_enum AS ENUM (
  'BA', 
  'PB', 
  'QA', 
  'MG', 
  'ALL'
);

CREATE TYPE task_status_enum AS ENUM (
  'BACKLOG', 
  'TODO', 
  'IN_PROGRESS', 
  'POD_REVIEW', 
  'TEAM_REVIEW', 
  'DONE'
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
  title VARCHAR(255) NOT NULL,
  description TEXT,
  deliverable_link TEXT,
  status task_status_enum NOT NULL DEFAULT 'BACKLOG',
  priority task_priority_enum NOT NULL DEFAULT 'MEDIUM',
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

-- Index for task DODs
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

-- Index for community messages
CREATE INDEX idx_community_messages_channel ON community_messages(channel_type);
CREATE INDEX idx_community_messages_sender ON community_messages(sender_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) FOR PUBLIC ACCESS / ANONYMOUS DEVELOPMENT
-- ============================================================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dods ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access policies for prototype development
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


-- ============================================================================
-- DUMMY SEED DATA FOR INITIAL TESTING ACCOUNTS
-- ============================================================================

-- Insert Teams
INSERT INTO teams (id, name, description) VALUES
('team-1', 'Tim 1 — Core Banking Engine', 'Pengembangan fondasi API Core Banking, Ledger Engine, dan Settlement Transaksi'),
('team-2', 'Tim 2 — Customer Experience', 'Pengembangan Mobile App Nasabah dan Ecosystem UX'),
('team-3', 'Tim 3 — Merchant & Ecosystem', 'Integrasi QRIS Hub dan Portal Transaksi Merchant');

-- Insert Initial Users (BO, PO, Leader, Member, Pod Owners)
INSERT INTO users (id, name, email, avatar_url, role, team_id, pod_type) VALUES
('user-bo-1', 'Hendrawan Pratama', 'bo1@projecthub.local', NULL, 'BUSINESS_OWNER', NULL, 'ALL'),
('user-bo-2', 'Dewi Lestari', 'bo2@projecthub.local', NULL, 'BUSINESS_OWNER', NULL, 'ALL'),
('user-po-1', 'Bambang Sudiro', 'po1@projecthub.local', NULL, 'PROJECT_OWNER', 'team-1', 'ALL'),
('user-po-2', 'Maya Anggraini', 'po2@projecthub.local', NULL, 'PROJECT_OWNER', 'team-2', 'ALL'),
('user-pl-1', 'Budi Santoso', 'pl1@projecthub.local', NULL, 'PROJECT_LEADER', 'team-1', 'ALL'),
('user-pl-2', 'Sinta Rahayu', 'pl2@projecthub.local', NULL, 'PROJECT_LEADER', 'team-2', 'ALL'),
('user-mem-101', 'Rina Wulandari', 'rina@team1.local', NULL, 'POD_OWNER', 'team-1', 'BA'),
('user-mem-102', 'Dimas Prasetyo', 'dimas@team1.local', NULL, 'POD_OWNER', 'team-1', 'PB'),
('user-mem-103', 'Farhan Maulana', 'farhan@team1.local', NULL, 'MEMBER', 'team-1', 'PB'),
('user-mem-104', 'Hendra Susanto', 'hendra@team1.local', NULL, 'POD_OWNER', 'team-1', 'QA');

-- Insert Initial Active Sprints
INSERT INTO sprints (id, team_id, name, sprint_goal, start_date, end_date, is_active) VALUES
('sprint-101', 'team-1', 'Sprint #1 — Core Banking Foundation', 'Menyelesaikan fondasi Core Banking: Ledger API, Audit Transaksi, dan Stress Test Database', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', TRUE),
('sprint-201', 'team-2', 'Sprint #1 — CX Onboarding V2', 'Redesign alur onboarding nasabah baru dengan alur realtime', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', TRUE);

-- Insert Initial Tasks
INSERT INTO tasks (id, task_code, team_id, sprint_id, assignee_id, title, description, deliverable_link, status, priority) VALUES
('task-101', 'T1-101', 'team-1', 'sprint-101', 'user-mem-101', 'Desain & Dokumentasi BRD Audit Transaksi', 'Membuat BRD lengkap audit log transaksi Core Banking', 'https://docs.google.com/document/d/sample-brd', 'IN_PROGRESS', 'HIGH'),
('task-102', 'T1-102', 'team-1', 'sprint-101', 'user-mem-102', 'Implementasi Ledger API — Core Transaction Engine', 'RESTful API debit/kredit ledger dengan ACID compliance', 'https://github.com/company/core-banking/pull/18', 'POD_REVIEW', 'CRITICAL'),
('task-103', 'T1-103', 'team-1', 'sprint-101', 'user-mem-104', 'Pengujian Stress Test Ledger Database', 'Benchmark 10.000 concurrent TPS pada staging', NULL, 'BACKLOG', 'CRITICAL');

-- Insert Task DODs
INSERT INTO task_dods (id, task_id, criteria_text, is_checked, verified_by) VALUES
('dod-101-1', 'task-101', 'Hasil kerja sudah selesai sesuai deskripsi tugas', TRUE, 'user-mem-101'),
('dod-101-2', 'task-101', 'Tautan dokumen / PR / bukti hasil kerja sudah dilampirkan', FALSE, NULL),
('dod-101-3', 'task-101', 'Telah dicek mandiri & siap direview', FALSE, NULL),
('dod-102-1', 'task-102', 'Hasil kerja sudah selesai sesuai deskripsi tugas', TRUE, 'user-mem-102'),
('dod-102-2', 'task-102', 'Tautan dokumen / PR / bukti hasil kerja sudah dilampirkan', TRUE, 'user-mem-102'),
('dod-102-3', 'task-102', 'Telah dicek mandiri & siap direview', TRUE, 'user-mem-102');

-- Insert Sample Community Messages
INSERT INTO community_messages (id, team_id, channel_type, sender_id, message_text, attachment_url) VALUES
('msg-101', NULL, 'ALL_TEAMS', 'user-bo-1', 'Selamat datang di SyncFlow Community Hub. Mari tingkatkan transparansi delivery.', NULL),
('msg-102', 'team-1', 'EXECUTIVE', 'user-bo-2', 'Evaluasi alokasi resource kuartal ini membutuhkan penyesuaian target pada Tim 1 Core Banking.', NULL),
('msg-103', 'team-1', 'GOVERNANCE', 'user-po-1', 'Target Sprint Goal #1 telah dikunci. Mohon Leader memverifikasi kesiapan DoD.', NULL),
('msg-104', 'team-1', 'POD_PB', 'user-mem-102', 'Implementasi ISO8583 settlement API controller sudah selesai di-commit ke branch main staging.', 'https://github.com/company/core-banking/pull/18');
