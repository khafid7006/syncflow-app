import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { LoginView } from './components/auth/LoginView';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BusinessOwnerDashboard } from './components/dashboard/BusinessOwnerDashboard';
import { ProjectOwnerDashboard } from './components/dashboard/ProjectOwnerDashboard';
import { ProjectLeaderDashboard } from './components/dashboard/ProjectLeaderDashboard';
import { MemberDashboard } from './components/dashboard/MemberDashboard';
import { TasksView } from './components/tasks/TasksView';
import { SprintsView } from './components/sprints/SprintsView';
import { TeamsView } from './components/teams/TeamsView';
import { FocusExecutionView } from './components/focus/FocusExecutionView';
import { CommunityView } from './components/community/CommunityView';
import { TaskDetailModal } from './components/tasks/TaskDetailModal';
import { CreateTaskModal } from './components/tasks/CreateTaskModal';
import { DevModeModal } from './components/settings/DevModeModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { GoalBanner } from './components/common/GoalBanner';
import { SopModal } from './components/common/SopModal';

import { SignUpView } from './components/auth/SignUpView';

export const App: React.FC = () => {
  const { currentUser, activeTab, isAuthenticated } = useApp();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isSignUpPage, setIsSignUpPage] = useState(false);

  // If not authenticated, render Login View or Sign Up View
  if (!isAuthenticated || !currentUser) {
    if (isSignUpPage) {
      return <SignUpView onSwitchToLogin={() => setIsSignUpPage(false)} />;
    }
    return <LoginView onSwitchToSignUp={() => setIsSignUpPage(true)} />;
  }

  const renderDashboardByRole = () => {
    switch (currentUser.role) {
      case 'BUSINESS_OWNER':
        return <BusinessOwnerDashboard />;
      case 'PROJECT_OWNER':
        return <ProjectOwnerDashboard />;
      case 'PROJECT_LEADER':
        return (
          <ProjectLeaderDashboard
            onCreateTask={() => setIsCreateTaskOpen(true)}
          />
        );
      case 'MEMBER':
      default:
        return <MemberDashboard />;
    }
  };

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardByRole();

      case 'tasks':
        return <TasksView onCreateTask={() => setIsCreateTaskOpen(true)} />;

      case 'focus':
      case 'do':
        return <FocusExecutionView />;

      case 'sprints':
        return <SprintsView onCreateTask={() => setIsCreateTaskOpen(true)} />;

      case 'teams':
      case 'community':
        return <CommunityView />;

      default:
        return <TasksView onCreateTask={() => setIsCreateTaskOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#E2E8F0] via-[#CBD5E1] to-[#94A3B8] p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-x-hidden font-sans text-slate-900">
      {/* Kanvas Utama (Container Seluruh Konten - Ultra-Clean Frosted Glass) */}
      <div className="w-full max-w-[1440px] mx-auto rounded-[36px] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-6 sm:p-8 flex flex-col gap-6 transition-all flex-1">
        {/* Floating Pill Navbar (Top) */}
        <Header />

        {/* Main View Showcase Canvas (3-Column Bento Grid Showcase) */}
        <main className="flex-1 flex flex-col min-w-0 w-full">
          {renderCurrentView()}
        </main>
      </div>

      {/* MODALS */}
      <TaskDetailModal />
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
      />
      <DevModeModal />
      <UserProfileModal />
      <SopModal />
    </div>
  );
};

export default App;
