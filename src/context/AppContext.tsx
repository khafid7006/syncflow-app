import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, Team, Sprint, Task, TaskStatus, TaskPriority, 
  PodType, Notification, NotificationPriority, ContactInfo, UserRole 
} from '../types';
import { INITIAL_USERS, INITIAL_TEAMS, INITIAL_SPRINTS, INITIAL_TASKS, DEFAULT_DOD_CHECKLIST } from '../data/initialData';
import { api } from '../services/api';
import { supabaseService } from '../services/supabaseService';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  login: (email: string) => boolean;
  logout: () => void;
  signUp: (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    institution?: string;
    whatsapp?: string;
    role: UserRole | 'POD_OWNER';
    team_id?: string;
    pod_label?: PodType;
  }) => Promise<{ success: boolean; reason?: string }>;
  isDevModeOpen: boolean;
  setIsDevModeOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isSopModalOpen: boolean;
  setIsSopModalOpen: (open: boolean) => void;
  
  // Data state
  teams: Team[];
  users: User[];
  sprints: Sprint[];
  tasks: Task[];
  notifications: Notification[];
  
  // Navigation & filter state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTeamFilter: string; // 'ALL' or teamId
  setSelectedTeamFilter: (teamId: string) => void;
  selectedSprintFilter: string; // 'ALL' or sprintId
  setSelectedSprintFilter: (sprintId: string) => void;
  selectedPodFilter: string; // 'ALL' or PodType
  setSelectedPodFilter: (pod: string) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  focusTaskId: string | null;
  setFocusTaskId: (id: string | null) => void;
  startFocusTask: (taskId: string) => void;

  // Actions
  createTeam: (
    teamData: { name: string; code: string }, 
    poId: string,
    leaderData: { name: string; email: string; title?: string }
  ) => Team;
  addMember: (memberData: { name: string; email: string; team_id: string; pod_label: PodType; title?: string }) => User;
  removeMember: (userId: string) => void;
  createSprint: (sprintData: {
    team_id: string;
    title: string;
    start_date: string;
    end_date: string;
    goal: string;
    meeting_notes: string;
    document_url?: string;
  }) => Sprint;
  updateSprintGoal: (sprintId: string, goal: string) => void;
  createTask: (taskData: {
    title: string;
    description: string;
    team_id: string;
    pod_label: PodType;
    assignee_id: string;
    priority: TaskPriority;
    deadline: string;
    sprint_id: string;
    dod_checklist?: import('../types').DodItem[];
  }) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => { success: boolean; reason?: string };
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => { success: boolean; reason?: string };
  toggleTaskDoD: (taskId: string, dodId: string) => void;
  togglePodLead: (userId: string) => void;
  approveTaskReview: (taskId: string) => void;
  rejectTaskReview: (taskId: string, reason?: string) => void;
  reportBlocker: (taskId: string, reason: string, category?: import('../types').BlockerCategory) => void;
  resolveBlocker: (taskId: string) => void;
  addComment: (taskId: string, content: string) => void;
  addAttachment: (taskId: string, attachment: { name: string; url: string; size?: string }) => void;
  deleteTask: (taskId: string) => void;
  
  // Notification actions
  sendNotification: (notif: {
    user_id: string;
    type: NotificationPriority;
    title: string;
    message: string;
    link_url?: string;
    related_task_id?: string;
    related_sprint_id?: string;
  }) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Profile
  updateProfile: (profileData: {
    name: string;
    avatar_url?: string;
    bio?: string;
    institution?: string;
    contact_info?: ContactInfo;
  }) => Promise<{ success: boolean; message?: string }>;
  
  resetToEmptyData: () => void;
  resetAllTasks: () => Promise<void>;
  loadSampleTasks: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'PM_ORG_4TIER_V1';

function getSaved<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => getSaved(`${STORAGE_KEY}_USERS`, INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User>(() => getSaved(`${STORAGE_KEY}_CURRENT_USER`, INITIAL_USERS[0] || {
    id: 'user-admin',
    name: 'Admin User',
    email: 'admin@syncflow.local',
    role: 'PROJECT_OWNER'
  }));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_AUTH`);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [teams, setTeams] = useState<Team[]>(() => getSaved(`${STORAGE_KEY}_TEAMS`, INITIAL_TEAMS));
  const [sprints, setSprints] = useState<Sprint[]>(() => getSaved(`${STORAGE_KEY}_SPRINTS`, INITIAL_SPRINTS));
  const [tasks, setTasks] = useState<Task[]>(() => getSaved(`${STORAGE_KEY}_TASKS`, INITIAL_TASKS));
  const [notifications, setNotifications] = useState<Notification[]>(() => getSaved(`${STORAGE_KEY}_NOTIFICATIONS`, []));

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('ALL');
  const [selectedSprintFilter, setSelectedSprintFilter] = useState<string>('ALL');
  const [selectedPodFilter, setSelectedPodFilter] = useState<string>('ALL');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [isDevModeOpen, setIsDevModeOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isSopModalOpen, setIsSopModalOpen] = useState<boolean>(false);

  const startFocusTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status === 'BACKLOG') {
      moveTaskStatus(taskId, 'DIKERJAKAN');
    }
    setFocusTaskId(taskId);
    setActiveTab('focus');
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_USERS`, JSON.stringify(users));
    localStorage.setItem(`${STORAGE_KEY}_CURRENT_USER`, JSON.stringify(currentUser));
    localStorage.setItem(`${STORAGE_KEY}_AUTH`, String(isAuthenticated));
    localStorage.setItem(`${STORAGE_KEY}_TEAMS`, JSON.stringify(teams));
    localStorage.setItem(`${STORAGE_KEY}_SPRINTS`, JSON.stringify(sprints));
    localStorage.setItem(`${STORAGE_KEY}_TASKS`, JSON.stringify(tasks));
    localStorage.setItem(`${STORAGE_KEY}_NOTIFICATIONS`, JSON.stringify(notifications));
  }, [users, currentUser, isAuthenticated, teams, sprints, tasks, notifications]);

  // Supabase Async Hydration on Initial Load
  useEffect(() => {
    const hydrateSupabaseData = async () => {
      try {
        const dbTeams = await supabaseService.fetchTeams(teams);
        if (dbTeams && dbTeams.length > 0) setTeams(dbTeams);

        const dbSprints = await supabaseService.fetchSprints(sprints);
        if (dbSprints && dbSprints.length > 0) setSprints(dbSprints);

        const dbTasks = await supabaseService.fetchTasks(tasks);
        if (dbTasks && dbTasks.length > 0) setTasks(dbTasks);
      } catch (err) {
        console.warn('Supabase hydration error:', err);
      }
    };

    hydrateSupabaseData();
  }, []);

  // Adjust default team filter when switching users
  useEffect(() => {
    if (currentUser.role === 'BUSINESS_OWNER') {
      setSelectedTeamFilter('ALL');
    } else if (currentUser.team_id) {
      setSelectedTeamFilter(currentUser.team_id);
    }
  }, [currentUser]);

  // Auth logic
  const login = (userOrEmail: string | User): boolean => {
    if (typeof userOrEmail === 'object') {
      setCurrentUser(userOrEmail);
      setIsAuthenticated(true);
      return true;
    }
    const q = userOrEmail.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === q || u.name.toLowerCase() === q);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const signUp = async (payload: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    institution?: string;
    whatsapp?: string;
    role: UserRole | 'POD_OWNER';
    team_id?: string;
    pod_label?: PodType;
  }): Promise<{ success: boolean; reason?: string }> => {
    const res = await api.registerUser(users, payload);
    if (res.success && res.user) {
      setUsers(prev => [...prev, res.user!]);
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      return { success: true };
    }
    return { success: false, reason: res.reason || 'Gagal mendaftar.' };
  };

  // Notification Helper
  const sendNotification = useCallback((notif: {
    user_id: string;
    type: NotificationPriority;
    title: string;
    message: string;
    link_url?: string;
    related_task_id?: string;
    related_sprint_id?: string;
  }) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: notif.user_id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      link_url: notif.link_url,
      related_task_id: notif.related_task_id,
      related_sprint_id: notif.related_sprint_id,
      is_read: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => n.user_id === currentUser.id ? { ...n, is_read: true } : n));
  };

  // Automatic Deadline & Overdue Checker
  useEffect(() => {
    if (tasks.length === 0) return;
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);

    tasks.forEach(task => {
      if (task.status === 'SELESAI' || !task.assignee_id) return;

      const taskDeadline = new Date(task.deadline);
      const diffMs = taskDeadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // 1. Deadline tinggal 1 hari / hari H
      if (diffDays === 1 || diffDays === 0) {
        const title = `Deadline tugas mendekat`;
        const exists = notifications.some(
          n => n.user_id === task.assignee_id && n.related_task_id === task.id && n.title === title && n.created_at.startsWith(todayStr)
        );
        if (!exists) {
          sendNotification({
            user_id: task.assignee_id,
            type: 'WARNING',
            title,
            message: `Deadline tugas [${task.title}] tinggal 1 hari (${task.deadline}).`,
            related_task_id: task.id
          });
        }
      }

      // 2. Melewati deadline (Overdue)
      if (diffDays < 0) {
        const title = `Tugas melewati deadline`;
        const exists = notifications.some(
          n => n.user_id === task.assignee_id && n.related_task_id === task.id && n.title === title && n.created_at.startsWith(todayStr)
        );
        if (!exists) {
          // Notify assignee
          sendNotification({
            user_id: task.assignee_id,
            type: 'WARNING',
            title,
            message: `Tugas [${task.title}] sudah melewati batas waktu (${task.deadline}).`,
            related_task_id: task.id
          });

          // Notify team leader
          const team = teams.find(t => t.id === task.team_id);
          if (team && team.project_leader_id && team.project_leader_id !== task.assignee_id) {
            sendNotification({
              user_id: team.project_leader_id,
              type: 'WARNING',
              title,
              message: `Tugas [${task.title}] di tim Anda telah melewati deadline (${task.deadline}).`,
              related_task_id: task.id
            });
          }
        }
      }
    });
  }, [tasks, teams, notifications, sendNotification]);

  // Actions
  const createTeam = (
    teamData: { name: string; code: string }, 
    poId: string,
    leaderData: { name: string; email: string; title?: string }
  ): Team => {
    const teamId = `team-${Date.now()}`;
    const leaderId = `user-pl-${Date.now()}`;

    const newLeader: User = {
      id: leaderId,
      name: leaderData.name,
      email: leaderData.email,
      role: 'PROJECT_LEADER',
      team_id: teamId,
      avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      title: leaderData.title || 'Project Leader'
    };

    const newTeam: Team = {
      id: teamId,
      name: teamData.name,
      code: teamData.code,
      project_owner_id: poId,
      project_leader_id: leaderId
    };

    setUsers(prev => [...prev, newLeader]);
    setTeams(prev => [...prev, newTeam]);

    // Auto notification to new leader
    sendNotification({
      user_id: leaderId,
      type: 'INFO',
      title: 'Penunjukan Project Leader',
      message: `Anda ditunjuk sebagai Project Leader untuk ${teamData.name}.`
    });

    return newTeam;
  };

  const addMember = (memberData: { name: string; email: string; team_id: string; pod_label: PodType; is_pod_lead?: boolean; title?: string }): User => {
    const memberId = `user-mem-${Date.now()}`;
    const newMember: User = {
      id: memberId,
      name: memberData.name,
      email: memberData.email,
      role: 'MEMBER',
      team_id: memberData.team_id,
      pod_label: memberData.pod_label,
      is_pod_lead: Boolean(memberData.is_pod_lead),
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      title: memberData.title || `${memberData.pod_label} Specialist`
    };
    setUsers(prev => [...prev, newMember]);

    const team = teams.find(t => t.id === memberData.team_id);

    // Auto notification to member
    sendNotification({
      user_id: memberId,
      type: 'INFO',
      title: 'Bergabung ke Tim',
      message: `Anda telah ditambahkan ke ${team?.name || 'Tim'}.`
    });

    // Auto notification to leader
    if (team?.project_leader_id && team.project_leader_id !== currentUser.id) {
      sendNotification({
        user_id: team.project_leader_id,
        type: 'INFO',
        title: 'Anggota Baru',
        message: `${memberData.name} telah ditambahkan ke ${team.name}.`
      });
    }

    return newMember;
  };

  const removeMember = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const togglePodLead = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextVal = !(u.is_pod_owner || u.is_pod_lead);
        return { ...u, is_pod_lead: nextVal, is_pod_owner: nextVal };
      }
      return u;
    }));
  };

  const createSprint = (sprintData: {
    team_id: string;
    title: string;
    start_date: string;
    end_date: string;
    goal: string;
    meeting_notes: string;
    document_url?: string;
  }): Sprint => {
    const can = api.canMutateSprint(currentUser.role);
    if (!can.allowed) {
      alert(can.reason);
      throw new Error(can.reason);
    }

    const val = api.validateSprintPayload(sprintData);
    if (!val.valid) {
      alert(val.reason);
      throw new Error(val.reason);
    }

    const newSprint: Sprint = {
      id: `sprint-${Date.now()}`,
      team_id: sprintData.team_id,
      title: sprintData.title.trim(),
      start_date: sprintData.start_date,
      end_date: sprintData.end_date,
      goal: sprintData.goal.trim(),
      meeting_notes: sprintData.meeting_notes.trim(),
      document_url: sprintData.document_url?.trim() || undefined,
      status: 'ACTIVE'
    };
    setSprints(prev => [...prev, newSprint]);
    supabaseService.createSprint(newSprint);

    return newSprint;
  };

  const updateSprintGoal = (sprintId: string, goal: string) => {
    setSprints(prev => prev.map(s => s.id === sprintId ? { ...s, goal } : s));
  };

  const createTask = (taskData: {
    title: string;
    description: string;
    team_id: string;
    pod_label: PodType;
    assignee_id: string;
    priority: TaskPriority;
    deadline: string;
    sprint_id: string;
    dod_checklist?: import('../types').DodItem[];
  }): Task => {
    const can = api.canMutateTask(currentUser.role);
    if (!can.allowed) {
      alert(can.reason);
      throw new Error(can.reason);
    }

    const team = teams.find(t => t.id === taskData.team_id);
    const count = tasks.filter(t => t.team_id === taskData.team_id).length + 101;
    const code = `${team?.code || 'T'}-${count}`;

    const defaultChecklist = DEFAULT_DOD_CHECKLIST.map(d => ({ ...d, completed: false }));

    const newTask: Task = {
      id: `task-${Date.now()}`,
      code,
      title: taskData.title,
      description: taskData.description,
      team_id: taskData.team_id,
      pod_label: taskData.pod_label,
      assignee_id: taskData.assignee_id,
      priority: taskData.priority,
      deadline: taskData.deadline,
      sprint_id: taskData.sprint_id,
      status: 'BACKLOG',
      progress: 0,
      dod_checklist: taskData.dod_checklist && taskData.dod_checklist.length > 0
        ? taskData.dod_checklist
        : defaultChecklist,
      comments: [],
      attachments: [],
      created_at: new Date().toISOString().substring(0, 10),
      updated_at: new Date().toISOString().substring(0, 10)
    };

    setTasks(prev => [newTask, ...prev]);
    supabaseService.createTask(newTask);

    // Auto notification to assignee
    if (taskData.assignee_id) {
      sendNotification({
        user_id: taskData.assignee_id,
        type: 'INFO',
        title: `Tugas Baru Ditugaskan: ${taskData.title}`,
        message: `Anda mendapat tugas baru [${code}] di ${team?.name || 'tim'}.`,
        related_task_id: newTask.id
      });
    }

    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>): { success: boolean; reason?: string } => {
    const can = api.canMutateTask(currentUser.role);
    if (!can.allowed) {
      return { success: false, reason: can.reason };
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return { success: false, reason: 'Tugas tidak ditemukan.' };

    const isPO = currentUser.role === 'PROJECT_OWNER' && currentUser.team_id === task.team_id;
    const isLeader = currentUser.role === 'PROJECT_LEADER' && currentUser.team_id === task.team_id;

    // Member constraints
    if (!isPO && !isLeader) {
      if (
        updates.assignee_id !== undefined && updates.assignee_id !== task.assignee_id ||
        updates.deadline !== undefined && updates.deadline !== task.deadline ||
        updates.priority !== undefined && updates.priority !== task.priority ||
        updates.sprint_id !== undefined && updates.sprint_id !== task.sprint_id
      ) {
        return {
          success: false,
          reason: 'Member tidak dapat mengubah Penanggung Jawab, Deadline, Prioritas, atau Sprint. Hubungi Project Leader Anda.'
        };
      }
    }

    // Auto notification if assignee changed
    if (updates.assignee_id && updates.assignee_id !== task.assignee_id) {
      sendNotification({
        user_id: updates.assignee_id,
        type: 'INFO',
        title: `Tugas baru: ${task.title}`,
        message: `Anda ditugaskan pada tugas [${task.code}].`,
        related_task_id: task.id
      });
    }

    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        ...updates,
        updated_at: new Date().toISOString().substring(0, 10)
      };
    }));

    return { success: true };
  };

  const toggleTaskDoD = (taskId: string, dodId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Hak Akses Centang DoD: KHUSUS Pod Owner terkait, Project Leader, atau Project Owner
    const canVerify = api.canVerifyPodDoD(currentUser, task);
    if (!canVerify) {
      return;
    }

    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const currentList = t.dod_checklist && t.dod_checklist.length > 0 ? t.dod_checklist : DEFAULT_DOD_CHECKLIST;
      const updatedList = currentList.map(item => {
        if (item.id === dodId) {
          return { ...item, completed: !item.completed };
        }
        return item;
      });
      return {
        ...t,
        dod_checklist: updatedList,
        updated_at: new Date().toISOString().substring(0, 10)
      };
    }));
  };

  const moveTaskStatus = (taskId: string, newStatus: TaskStatus): { success: boolean; reason?: string } => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return { success: false, reason: 'Tugas tidak ditemukan.' };

    const oldStatus = task.status;
    if (oldStatus === newStatus) return { success: true };

    // Validasi alur transisi status tugas (Two-Stage Verification)
    const val = api.validateStatusTransition(currentUser, task, newStatus);
    if (!val.allowed) {
      return { success: false, reason: val.reason };
    }

    const team = teams.find(t => t.id === task.team_id);

    // 1. Member submits to Pod Owner (POD_REVIEW)
    if (newStatus === 'POD_REVIEW') {
      const podOwner = users.find(u => u.team_id === task.team_id && u.pod_label === task.pod_label && (u.is_pod_owner || u.is_pod_lead) && u.id !== currentUser.id);
      if (podOwner) {
        sendNotification({
          user_id: podOwner.id,
          type: 'IMPORTANT',
          title: `Pengajuan Verifikasi DoD Pod ${task.pod_label}`,
          message: `${currentUser.name} mengajukan tugas [${task.title}] untuk diverifikasi DoD.`,
          related_task_id: task.id
        });
      }
      if (team?.project_leader_id && team.project_leader_id !== currentUser.id) {
        sendNotification({
          user_id: team.project_leader_id,
          type: 'INFO',
          title: 'Tugas Masuk Tahap Cek Pod Owner',
          message: `Tugas [${task.title}] milik ${currentUser.name} masuk tahap verifikasi Pod Owner.`,
          related_task_id: task.id
        });
      }
    }

    // 2. Pod Owner passes to Review Leader (REVIEW)
    if (newStatus === 'REVIEW') {
      if (team?.project_leader_id && team.project_leader_id !== currentUser.id) {
        sendNotification({
          user_id: team.project_leader_id,
          type: 'IMPORTANT',
          title: 'Tugas Siap Untuk Approval Akhir',
          message: `Pod Owner telah memverifikasi DoD tugas [${task.title}]. Siap untuk diapprove Selesai.`,
          related_task_id: task.id
        });
      }
      if (team?.project_owner_id && team.project_owner_id !== currentUser.id) {
        sendNotification({
          user_id: team.project_owner_id,
          type: 'INFO',
          title: 'Tugas Siap Approval Leader/PO',
          message: `Tugas [${task.title}] telah lolos verifikasi DoD Pod.`,
          related_task_id: task.id
        });
      }
    }

    // 3. Leader/PO final approval (SELESAI)
    if (newStatus === 'SELESAI') {
      if (task.assignee_id && task.assignee_id !== currentUser.id) {
        sendNotification({
          user_id: task.assignee_id,
          type: 'SUCCESS',
          title: 'Tugas Disahkan Selesai',
          message: `Selamat! Tugas [${task.title}] telah disahkan Selesai oleh ${currentUser.name}.`,
          related_task_id: task.id
        });
      }
    }

    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const newProgress = newStatus === 'SELESAI' ? 100 : newStatus === 'BACKLOG' ? 0 : t.progress;
      return {
        ...t,
        status: newStatus,
        progress: newProgress,
        updated_at: new Date().toISOString().substring(0, 10)
      };
    }));

    supabaseService.updateTaskStatus(taskId, newStatus);

    return { success: true };
  };

  // Leader / Pod Owner Action: Approve review -> SELESAI
  const approveTaskReview = (taskId: string) => {
    moveTaskStatus(taskId, 'SELESAI');
  };

  // Leader / Pod Owner Action: Reject review -> DIKERJAKAN
  const rejectTaskReview = (taskId: string, reason?: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (reason && reason.trim()) {
      addComment(taskId, `[Catatan Review / Revisi]: ${reason.trim()}`);
    }
    moveTaskStatus(taskId, 'DIKERJAKAN');
  };

  // Member Action: Report Blocker -> BLOCKED
  const reportBlocker = (taskId: string, reason: string, category?: import('../types').BlockerCategory) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !reason.trim()) return;

    const blockerText = reason.trim();
    const blockerCat = category || 'OTHER';

    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        status: 'BLOCKED',
        is_blocked: true,
        blocker_reason: blockerText,
        blocker_category: blockerCat,
        updated_at: new Date().toISOString().substring(0, 10)
      };
    }));

    supabaseService.updateTaskBlocker(taskId, true, blockerText, blockerCat);

    const team = teams.find(t => t.id === task.team_id);
    if (team?.project_leader_id) {
      sendNotification({
        user_id: team.project_leader_id,
        type: 'URGENT',
        title: `🚨 Blocker Dilaporkan [${blockerCat}]: [${task.code}]`,
        message: `${currentUser.name} melaporkan hambatan: "${blockerText}"`,
        related_task_id: task.id
      });
    }
  };

  // Pod PIC / Leader Action: Resolve Blocker -> DIKERJAKAN
  const resolveBlocker = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        status: 'DIKERJAKAN',
        is_blocked: false,
        blocker_reason: undefined,
        blocker_category: undefined,
        updated_at: new Date().toISOString().substring(0, 10)
      };
    }));

    supabaseService.updateTaskBlocker(taskId, false);

    if (task.assignee_id && task.assignee_id !== currentUser.id) {
      sendNotification({
        user_id: task.assignee_id,
        type: 'SUCCESS',
        title: 'Blocker Berhasil Dibongkar',
        message: `Hambatan pada tugas [${task.title}] telah diselesaikan oleh ${currentUser.name}. Silakan melanjutkan pengerjaan.`,
        related_task_id: task.id
      });
    }
  };

  const addComment = (taskId: string, content: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const isBO = currentUser.role === 'BUSINESS_OWNER';

    const comment = {
      id: `c-${Date.now()}`,
      task_id: taskId,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_avatar: currentUser.avatar_url,
      user_role: currentUser.role,
      is_private_bo: isBO,
      content,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        comments: [...t.comments, comment]
      };
    }));

    const team = teams.find(t => t.id === task.team_id);

    if (isBO) {
      if (team?.project_owner_id && team.project_owner_id !== currentUser.id) {
        sendNotification({
          user_id: team.project_owner_id,
          type: 'IMPORTANT',
          title: 'Masukan BO (Khusus PO)',
          message: `${currentUser.name} (Business Owner) memberikan masukan privat pada tugas [${task.title}].`,
          related_task_id: task.id
        });
      }

      users.filter(u => u.role === 'BUSINESS_OWNER' && u.id !== currentUser.id).forEach(bo => {
        sendNotification({
          user_id: bo.id,
          type: 'INFO',
          title: 'Masukan BO Baru',
          message: `${currentUser.name} memberikan masukan pada tugas [${task.title}].`,
          related_task_id: task.id
        });
      });
    } else {
      if (task.assignee_id && task.assignee_id !== currentUser.id) {
        sendNotification({
          user_id: task.assignee_id,
          type: 'INFO',
          title: 'Komentar Baru',
          message: `${currentUser.name} mengomentari tugas [${task.title}].`,
          related_task_id: task.id
        });
      }
    }
  };

  const addAttachment = (taskId: string, attachment: { name: string; url: string; size?: string }) => {
    const can = api.canMutateTask(currentUser.role);
    if (!can.allowed) {
      alert(can.reason);
      return;
    }

    const att = {
      name: attachment.name,
      url: attachment.url || '#',
      size: attachment.size || '1.0 MB',
      uploaded_at: new Date().toISOString().substring(0, 10)
    };

    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        attachments: [...t.attachments, att]
      };
    }));
  };

  const deleteTask = (taskId: string) => {
    const can = api.canMutateTask(currentUser.role);
    if (!can.allowed) {
      alert(can.reason);
      return;
    }

    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTaskId === taskId) setSelectedTaskId(null);
  };

  const updateProfile = async (profileData: {
    name: string;
    avatar_url?: string;
    bio?: string;
    institution?: string;
    contact_info?: ContactInfo;
  }): Promise<{ success: boolean; message?: string }> => {
    const res = await api.updateProfile(currentUser, profileData);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setUsers(prev => prev.map(u => u.id === res.user?.id ? res.user! : u));
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Gagal memperbarui profil.' };
  };

  const resetToEmptyData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setIsAuthenticated(true);
    setTeams(INITIAL_TEAMS);
    setSprints(INITIAL_SPRINTS);
    setTasks(INITIAL_TASKS);
    setNotifications([]);
    setActiveTab('dashboard');
    setSelectedTeamFilter('ALL');
    setSelectedSprintFilter('ALL');
    setSelectedPodFilter('ALL');
    setSelectedTaskId(null);
  };

  const resetAllTasks = async () => {
    setTasks([]);
    localStorage.removeItem('syncflow_tasks');
    await supabaseService.deleteAllTasks();
  };

  const loadSampleTasks = async () => {
    setTasks(INITIAL_TASKS);
    localStorage.setItem('syncflow_tasks', JSON.stringify(INITIAL_TASKS));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      isAuthenticated,
      login,
      logout,
      signUp,
      isDevModeOpen,
      setIsDevModeOpen,
      isProfileModalOpen,
      setIsProfileModalOpen,
      isSopModalOpen,
      setIsSopModalOpen,
      teams,
      users,
      sprints,
      tasks,
      notifications,
      activeTab,
      setActiveTab,
      selectedTeamFilter,
      setSelectedTeamFilter,
      selectedSprintFilter,
      setSelectedSprintFilter,
      selectedPodFilter,
      setSelectedPodFilter,
      selectedTaskId,
      setSelectedTaskId,
      focusTaskId,
      setFocusTaskId,
      startFocusTask,
      createTeam,
      addMember,
      removeMember,
      createSprint,
      updateSprintGoal,
      createTask,
      updateTask,
      moveTaskStatus,
      approveTaskReview,
      rejectTaskReview,
      reportBlocker,
      resolveBlocker,
      addComment,
      addAttachment,
      deleteTask,
      sendNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      updateProfile,
      resetToEmptyData,
      resetAllTasks,
      loadSampleTasks
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
