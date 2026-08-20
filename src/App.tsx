import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { 
  Layers, Check, Send, AlertTriangle, ExternalLink, 
  Folder, Figma, X, LogOut, User, Lock, Mail, ChevronDown,
  ShieldAlert, ClipboardCheck, PlusCircle, RotateCcw, CheckCircle2, Plus,
  GitBranch, Activity, Clock, CheckCircle, Sparkles, Trash2, Link as LinkIcon,
  Calendar, Edit3
} from 'lucide-react';

export interface UserProfile {
  id: string;
  full_name: string;
  role: 'member' | 'owner';
  pod: 'Product Builder' | 'BA' | 'QA' | 'Marketing';
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner_id?: string;
  role?: 'po' | 'pl' | 'member';
  created_at?: string;
}

export interface MemberTask {
  id?: string;
  workspace_id?: string;
  assignee_id?: string;
  title: string;
  description?: string;
  status: string;
  deliverable_link?: string;
  deliverable_url?: string;
  blocker_reason?: string;
  is_blocked?: boolean;
  revision_note?: string;
  resolution_note?: string;
  due_date?: string;
  submitted_at?: string;
  checklist?: { id: number; text: string; checked: boolean; is_checked?: boolean }[];
  created_at?: string;
  profiles?: {
    id?: string;
    full_name?: string;
    pod?: string;
    role?: string;
  };
}

export interface ProjectLink {
  id?: string;
  workspace_id?: string;
  title: string;
  url: string;
  icon_type?: string;
  created_at?: string;
}

// FORMAT DEADLINE & TIMESTAMPS HELPERS
const formatDeadline = (isoString?: string) => {
  if (!isoString) return null;
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return null;

  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

const getDeadlineStatus = (isoString?: string) => {
  if (!isoString) return null;
  const deadline = new Date(isoString);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) {
    return 'overdue';
  } else if (diffHours <= 2) {
    return 'urgent';
  }
  return 'normal';
};

// BADGE DEADLINE RINGKAS & RELATIF WAKTU HELPER
const getRelativeDeadlineString = (isoString?: string) => {
  if (!isoString) return null;
  const deadline = new Date(isoString);
  if (isNaN(deadline.getTime())) return null;

  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const absDiffMs = Math.abs(diffMs);
  const diffMinutes = Math.floor(absDiffMs / (1000 * 60));
  const diffHours = Math.floor(absDiffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));

  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(deadline);

  if (diffMs < 0) {
    let overdueLabel = '';
    if (diffDays >= 1) overdueLabel = `Terlewat ${diffDays} hari`;
    else if (diffHours >= 1) overdueLabel = `Terlewat ${diffHours} jam`;
    else overdueLabel = `Terlewat ${diffMinutes} menit`;

    return {
      status: 'overdue',
      text: `🔴 ${overdueLabel} (${formattedDate})`
    };
  }

  let remainingLabel = '';
  if (diffDays >= 1) remainingLabel = `${diffDays} hari lagi`;
  else if (diffHours >= 1) remainingLabel = `${diffHours} jam lagi`;
  else remainingLabel = `${diffMinutes} menit lagi`;

  const isUrgent = diffHours < 2;

  return {
    status: isUrgent ? 'urgent' : 'normal',
    text: isUrgent
      ? `⚠️ ${formattedDate} (${remainingLabel})`
      : `📅 ${formattedDate} (${remainingLabel})`
  };
};

// NO WORKSPACE VIEW COMPONENT (ENHANCED COPYWRITING & ONBOARDING)
const NoWorkspaceView: React.FC<{
  onCreateWorkspace: () => void;
  profile: UserProfile | null;
}> = ({ onCreateWorkspace, profile }) => {
  const isOwner = profile?.role === 'owner';

  return (
    <div className="min-h-[65vh] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-zinc-950/70 backdrop-blur-xl p-8 text-center shadow-2xl space-y-5 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white mx-auto shadow-md">
          <Folder className="w-6 h-6 text-zinc-300" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-white">
            Mulai dengan Membuat Workspace
          </h2>
          <p className="text-xs text-white/60 leading-relaxed max-w-xs mx-auto font-sans">
            {isOwner
              ? 'SyncFlow mengisolasi setiap proyek ke dalam ruang kerja mandiri. Buat workspace pertama untuk mulai membagi tugas ke tim.'
              : 'Kamu belum ditambahkan ke workspace proyek mana pun. Silakan hubungi Project Owner kamu untuk dimasukkan ke dalam tim.'}
          </p>
        </div>

        <div className="pt-2">
          {isOwner ? (
            <button
              onClick={onCreateWorkspace}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-all shadow-md cursor-pointer font-sans"
            >
              + Buat Workspace Pertama
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/50 font-sans">
              ⏳ Menunggu Undangan PO
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  // Auth & Profile state
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // MULTI-WORKSPACE STATES & WORKSPACE ROLE HIERARCHY
  const [userWorkspaces, setUserWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [activeWorkspaceRole, setActiveWorkspaceRole] = useState<'po' | 'pl' | 'member'>('member');
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState<boolean>(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState<boolean>(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>('');
  const workspaceDropdownRef = useRef<HTMLDivElement>(null);
  
  // DEFAULT VIEW STATE: Set initial viewMode strictly to 'member' (anti-flash for members)
  const [viewMode, setViewMode] = useState<'po' | 'member'>('member');

  // Login / Signup form states
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authFullName, setAuthFullName] = useState<string>('');
  const [authRole, setAuthRole] = useState<'member' | 'owner'>('member');
  const [authPod, setAuthPod] = useState<'Product Builder' | 'BA' | 'QA' | 'Marketing'>('Product Builder');
  const [authError, setAuthError] = useState<string | null>(null);

  // Profile dropdown menu state
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dashboard Member Task & Workflow states
  const [activeNav, setActiveNav] = useState<number>(0);
  const [activeTask, setActiveTask] = useState<MemberTask | null>(null);
  const [taskTitle, setTaskTitle] = useState<string>('Buat Halaman Pembayaran Aplikasi');
  const [deliverableUrl, setDeliverableUrl] = useState<string>('');
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<'Dalam Pengerjaan' | 'Sedang Ditinjau PO' | 'Terkendala (Blocker)' | 'Perlu Revisi'>('Dalam Pengerjaan');

  // PO Dashboard states (Master Task Feed, Filter Tab, & Profiles)
  const [allTasks, setAllTasks] = useState<MemberTask[]>([]);
  const [blockedTasks, setBlockedTasks] = useState<MemberTask[]>([]);
  const [reviewTasks, setReviewTasks] = useState<MemberTask[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<UserProfile[]>([]);
  const [poTaskFeedFilter, setPoTaskFeedFilter] = useState<'active' | 'done'>('active');

  // Dynamic Project Links State (Full CRUD backed by Supabase public.project_links)
  const [projectLinks, setProjectLinks] = useState<ProjectLink[]>([]);
  const [editableLinks, setEditableLinks] = useState<ProjectLink[]>([]);
  const [isManageLinksModalOpen, setIsManageLinksModalOpen] = useState<boolean>(false);

  // PO Quick Assignment Form states (Dynamic DoD list, Description, max 10 points & Due Date)
  const taskTitleInputRef = useRef<HTMLInputElement>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [newAssignTaskTitle, setNewAssignTaskTitle] = useState<string>('');
  const [newAssignDescription, setNewAssignDescription] = useState<string>('');
  const [newAssignDueDate, setNewAssignDueDate] = useState<string>('');
  const [dodPoints, setDodPoints] = useState<string[]>(['', '', '']);
  const [isTaskSubmitSuccess, setIsTaskSubmitSuccess] = useState<boolean>(false);

  // PO Edit Task Modal States
  const [editingTask, setEditingTask] = useState<MemberTask | null>(null);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editDodPoints, setEditDodPoints] = useState<string[]>([]);

  // PO Feedback Modals states
  const [targetTaskId, setTargetTaskId] = useState<string | null>(null);
  const [isResolveBlockerModalOpen, setIsResolveBlockerModalOpen] = useState<boolean>(false);
  const [inputResolutionNote, setInputResolutionNote] = useState<string>('');

  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState<boolean>(false);
  const [inputRevisionNote, setInputRevisionNote] = useState<string>('');

  // Member Modals & Toasts
  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState<boolean>(false);
  const [blockerReason, setBlockerReason] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // DoD checklist state for Member View
  const [dodItems, setDodItems] = useState([
    { id: 1, text: 'Buat tampilan tombol dan form pembayaran', checked: true, is_checked: true },
    { id: 2, text: 'Sambungkan tombol ke halaman sukses', checked: false, is_checked: false },
    { id: 3, text: 'Lampirkan link hasil kerjaan', checked: false, is_checked: false },
  ]);

  // Calculate DoD Completion for Member Dashboard
  const completedDodCount = dodItems.filter(item => item.checked).length;
  const totalDodCount = dodItems.length;
  const isAllDoDCompleted = totalDodCount > 0 ? completedDodCount === totalDodCount : true;

  // Strict Role Check helper
  const isOwnerOrPo = profile?.role === 'owner' || activeWorkspaceRole === 'po';
  const isPlRole = activeWorkspaceRole === 'pl';
  const isPoOrPlRole = isOwnerOrPo || isPlRole;

  // Header Role Badge display logic
  let userRoleDisplay = profile?.pod || 'Member';
  if (isOwnerOrPo) {
    userRoleDisplay = 'Project Owner';
  } else if (isPlRole) {
    userRoleDisplay = 'Project Leader';
  }

  // Quick Deadline Preset Handler for PO Assignment Form & Edit Form
  const handleApplyDeadlinePreset = (daysOffset: number, targetForm: 'create' | 'edit' = 'create') => {
    const target = new Date();
    target.setDate(target.getDate() + daysOffset);
    target.setHours(17, 0, 0, 0);

    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const hours = String(target.getHours()).padStart(2, '0');
    const minutes = String(target.getMinutes()).padStart(2, '0');

    const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
    if (targetForm === 'edit') {
      setEditDueDate(formatted);
    } else {
      setNewAssignDueDate(formatted);
    }
  };

  // 1. Fetch Session & Profile on Mount + Fetch Workspaces
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchOrCreateProfile(session.user);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchOrCreateProfile(session.user);
      } else {
        setProfile(null);
        setActiveTask(null);
        setUserWorkspaces([]);
        setCurrentWorkspace(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Workspaces whenever profile or session is ready
  useEffect(() => {
    if (session?.user && profile) {
      fetchUserWorkspaces(session.user.id, profile.role);
    }
  }, [session, profile]);

  // Fetch Workspace-Scoped Data whenever currentWorkspace changes
  useEffect(() => {
    if (session?.user && currentWorkspace?.id) {
      fetchActiveTask(session.user.id, currentWorkspace.id);
      fetchProjectLinks(currentWorkspace.id);
      fetchPOData(currentWorkspace.id);
    }
  }, [currentWorkspace, session]);

  // FORCE DEFAULT VIEW BERDASARKAN ROLE WORKSPACE (ANTI-FLASH)
  useEffect(() => {
    if (profile) {
      if (isPoOrPlRole) {
        setViewMode('po');
      } else {
        setViewMode('member');
      }
    }
  }, [profile, activeWorkspaceRole, currentWorkspace]);

  // 3. SUPABASE REALTIME SUBSCRIPTION FOR TASKS & PROJECT_LINKS
  useEffect(() => {
    if (!session?.user || !currentWorkspace?.id) return;

    const channel = supabase
      .channel('syncflow-realtime-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Realtime task change received:', payload);
          if (isPoOrPlRole && currentWorkspace?.id) fetchPOData(currentWorkspace.id);
          if (session?.user?.id && currentWorkspace?.id) {
            fetchActiveTask(session.user.id, currentWorkspace.id);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'project_links' },
        (payload) => {
          console.log('Realtime project_links change received:', payload);
          if (currentWorkspace?.id) fetchProjectLinks(currentWorkspace.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, isPoOrPlRole, currentWorkspace]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (workspaceDropdownRef.current && !workspaceDropdownRef.current.contains(e.target as Node)) {
        setIsWorkspaceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // FETCH & MANAGE WORKSPACES (PERSISTENCE VIA LOCALSTORAGE)
  const fetchUserWorkspaces = async (userId: string, userProfileRole?: string) => {
    try {
      // Query workspace_members joining workspaces
      const { data: memberData, error: mErr } = await supabase
        .from('workspace_members')
        .select(`
          role,
          workspaces:workspace_id (
            id,
            name,
            description,
            owner_id,
            created_at
          )
        `)
        .eq('user_id', userId);

      if (mErr) {
        console.warn("Gagal fetch workspace_members:", mErr.message);
      }

      let loadedWorkspaces: Workspace[] = [];

      if (memberData && memberData.length > 0) {
        loadedWorkspaces = memberData
          .filter((m: any) => m.workspaces)
          .map((m: any) => ({
            ...m.workspaces,
            role: m.role as 'po' | 'pl' | 'member',
          }));
      }

      setUserWorkspaces(loadedWorkspaces);

      if (loadedWorkspaces.length > 0) {
        // WORKSPACE PERSISTENCE: Baca dari localStorage agar tidak ter-reset saat refresh
        const savedWsId = localStorage.getItem('syncflow_active_ws');
        const foundSaved = savedWsId ? loadedWorkspaces.find(w => w.id === savedWsId) : null;
        const activeWs = foundSaved || loadedWorkspaces[0];

        setCurrentWorkspace(activeWs);
        setActiveWorkspaceRole(activeWs.role || (userProfileRole === 'owner' ? 'po' : 'member'));
        localStorage.setItem('syncflow_active_ws', activeWs.id);
      } else {
        setCurrentWorkspace(null);
      }
    } catch (err: any) {
      console.error("Fetch workspaces error:", err);
    }
  };

  // SWITCH WORKSPACE HANDLER WITH LOCALSTORAGE PERSISTENCE
  const handleSelectWorkspace = (ws: Workspace) => {
    setCurrentWorkspace(ws);
    setActiveWorkspaceRole(ws.role || (profile?.role === 'owner' ? 'po' : 'member'));
    setIsWorkspaceMenuOpen(false);
    localStorage.setItem('syncflow_active_ws', ws.id);
    showToast(`Beralih ke workspace: ${ws.name}`);
  };

  // CREATE NEW WORKSPACE HANDLER (INSTANT SINGLE INPUT WITH AUTO SWITCH)
  const handleCreateWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim() || !session?.user?.id) return;

    const wsName = newWorkspaceName.trim();

    try {
      const { data: newWs, error } = await supabase
        .from('workspaces')
        .insert([{
          name: wsName,
          owner_id: session.user.id
        }])
        .select()
        .single();

      if (error) {
        showToast(`Gagal membuat workspace: ${error.message}`);
        return;
      }

      if (newWs) {
        // Set creator as 'po' in workspace_members
        await supabase.from('workspace_members').insert([{
          workspace_id: newWs.id,
          user_id: session.user.id,
          role: 'po'
        }]);

        const newWsObj: Workspace = { ...newWs, role: 'po' };
        setUserWorkspaces([...userWorkspaces, newWsObj]);
        setCurrentWorkspace(newWsObj);
        setActiveWorkspaceRole('po');
        setViewMode('po'); // Directly enter PO Dashboard View
        setIsCreateWorkspaceModalOpen(false);
        setNewWorkspaceName('');
        localStorage.setItem('syncflow_active_ws', newWs.id);
        showToast(`✓ Workspace "${wsName}" berhasil dibuat!`);
      }
    } catch (err: any) {
      console.error("Create workspace error:", err);
      showToast(`Gagal membuat workspace: ${err.message || err}`);
    }
  };

  // FETCHING PROJECT LINKS FROM SUPABASE (PUBLIC.PROJECT_LINKS - FILTERED BY WORKSPACE)
  const fetchProjectLinks = async (wsId?: string) => {
    const targetWsId = wsId || currentWorkspace?.id;
    if (!targetWsId) return;

    try {
      let query = supabase.from('project_links').select('*');
      query = query.or(`workspace_id.eq.${targetWsId},workspace_id.is.null`);

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) {
        console.warn("Gagal fetch project_links:", error.message);
        setProjectLinks([
          { id: '1', title: 'Drive Proyek', url: 'https://drive.google.com', icon_type: 'drive' },
          { id: '2', title: 'Figma UI/UX', url: 'https://figma.com', icon_type: 'figma' },
          { id: '3', title: 'Repository Code', url: 'https://github.com/khafid7006/syncflow-app', icon_type: 'github' },
        ]);
      } else if (data && data.length > 0) {
        setProjectLinks(data as ProjectLink[]);
      } else {
        const defaults: ProjectLink[] = [
          { workspace_id: targetWsId, title: 'Drive Proyek', url: 'https://drive.google.com', icon_type: 'drive' },
          { workspace_id: targetWsId, title: 'Figma UI/UX', url: 'https://figma.com', icon_type: 'figma' },
          { workspace_id: targetWsId, title: 'Repository Code', url: 'https://github.com/khafid7006/syncflow-app', icon_type: 'github' },
        ];
        const { data: insertedData } = await supabase.from('project_links').insert(defaults).select();
        if (insertedData) setProjectLinks(insertedData as ProjectLink[]);
        else setProjectLinks(defaults);
      }
    } catch (err: any) {
      console.error("Fetch project_links error:", err);
    }
  };

  // Helper render icon dinamis berdasarkan judul link
  const renderLinkIcon = (title: string, iconType?: string) => {
    const lower = (title || '').toLowerCase();
    if (lower.includes('drive') || iconType === 'drive') return <Folder className="w-3.5 h-3.5" />;
    if (lower.includes('figma') || iconType === 'figma') return <Figma className="w-3.5 h-3.5" />;
    if (lower.includes('repo') || lower.includes('github') || lower.includes('git') || iconType === 'github') return <GitBranch className="w-3.5 h-3.5" />;
    return <LinkIcon className="w-3.5 h-3.5" />;
  };

  // FETCHING ACTIVE TASK FROM SUPABASE FOR MEMBER (FILTERED BY WORKSPACE & ASSIGNEE)
  const fetchActiveTask = async (userId: string, wsId?: string) => {
    const targetWsId = wsId || currentWorkspace?.id;
    if (!targetWsId) return;

    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', userId)
        .in('status', ['in_progress', 'review', 'blocked']);

      query = query.or(`workspace_id.eq.${targetWsId},workspace_id.is.null`);

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching task:", error.message);
      }

      if (data) {
        setActiveTask(data);
        if (data.title) setTaskTitle(data.title);

        const existingLink = data.deliverable_link || data.deliverable_url || '';

        // 1. REVISION MODE (STATUS IN_PROGRESS DENGAN REVISION_NOTE)
        if (data.status === 'in_progress' && data.revision_note) {
          setTaskStatus('Perlu Revisi');
          setDeliverableUrl(existingLink);
          setSubmittedUrl(null);
        } 
        // 2. IN REVIEW MODE (STATUS REVIEW)
        else if (data.status === 'review' || data.status === 'in_review' || data.status === 'UNDER_REVIEW') {
          setTaskStatus('Sedang Ditinjau PO');
          setSubmittedUrl(existingLink || 'Link Tugas');
        } 
        // 3. BLOCKED MODE (STATUS BLOCKED)
        else if (data.status === 'blocked' || data.status === 'BLOCKED' || data.is_blocked) {
          setTaskStatus('Terkendala (Blocker)');
          setSubmittedUrl(null);
          if (data.blocker_reason) setBlockerReason(data.blocker_reason);
        } 
        // 4. IN PROGRESS MODE (TANPA REVISION NOTE)
        else {
          setTaskStatus('Dalam Pengerjaan');
          setDeliverableUrl(existingLink);
          setSubmittedUrl(null);
        }

        if (data.checklist && Array.isArray(data.checklist) && data.checklist.length > 0) {
          setDodItems(data.checklist.map((item: any, idx: number) => {
            const checkedVal = item.checked ?? item.is_checked ?? false;
            return {
              id: item.id || idx + 1,
              text: item.text || item.label || '',
              checked: checkedVal,
              is_checked: checkedVal
            };
          }));
        }
      } else {
        // EMPTY STATE: TIDAK ADA TUGAS AKTIF DI WORKSPACE INI
        setActiveTask(null);
        setSubmittedUrl(null);
        setDeliverableUrl('');
      }
    } catch (err: any) {
      console.error('Fetch active task error:', err);
      setActiveTask(null);
    }
  };

  // 1. FETCH ALL TASKS & WORKSPACE MEMBERS FOR PO FEED & ASSIGNMENT DROPDOWN
  const fetchPOData = async (wsId?: string) => {
    const targetWsId = wsId || currentWorkspace?.id;
    if (!targetWsId) return;

    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          profiles:assignee_id (
            id,
            full_name,
            pod
          )
        `);

      query = query.or(`workspace_id.eq.${targetWsId},workspace_id.is.null`);

      const { data: allTasksData, error: aErr } = await query.order('created_at', { ascending: false });

      if (aErr) console.error("Error fetching all tasks:", aErr.message);
      if (allTasksData) setAllTasks(allTasksData);

      // Fetch blocked tasks
      let blockedQuery = supabase
        .from('tasks')
        .select(`
          *,
          profiles:assignee_id (
            id,
            full_name,
            pod
          )
        `)
        .or('status.eq.blocked,is_blocked.eq.true');

      blockedQuery = blockedQuery.or(`workspace_id.eq.${targetWsId},workspace_id.is.null`);

      const { data: blockedData, error: bErr } = await blockedQuery.order('created_at', { ascending: false });
      if (bErr) console.error("Error fetching blocked tasks:", bErr.message);

      // Fetch review tasks
      let reviewQuery = supabase
        .from('tasks')
        .select(`
          *,
          profiles:assignee_id (
            id,
            full_name,
            pod
          )
        `)
        .or('status.eq.review,status.eq.in_review,status.eq.UNDER_REVIEW');

      reviewQuery = reviewQuery.or(`workspace_id.eq.${targetWsId},workspace_id.is.null`);

      const { data: reviewData, error: rErr } = await reviewQuery.order('created_at', { ascending: false });
      if (rErr) console.error("Error fetching review tasks:", rErr.message);

      // FIX DROPDOWN PENUGASAN: FETCH MEMBERS DARI PUBLIC.WORKSPACE_MEMBERS DENGAN FALLBACK PROFILES
      let parsedMembers: UserProfile[] = [];

      if (targetWsId) {
        const { data: wsMembers, error: wmErr } = await supabase
          .from('workspace_members')
          .select(`
            user_id,
            role,
            profiles:user_id (id, full_name, email, pod, role)
          `)
          .eq('workspace_id', targetWsId);

        if (!wmErr && wsMembers && wsMembers.length > 0) {
          parsedMembers = wsMembers.map((item: any) => ({
            id: item.profiles?.id || item.user_id,
            full_name: item.profiles?.full_name || 'Anggota Tim',
            role: item.role || item.profiles?.role || 'member',
            pod: item.profiles?.pod || 'Product Builder'
          }));
        }
      }

      // Fallback jika workspace_members kosong
      if (parsedMembers.length === 0) {
        const { data: allProfiles, error: pErr } = await supabase
          .from('profiles')
          .select('id, full_name, pod, role')
          .order('full_name', { ascending: true });

        if (!pErr && allProfiles && allProfiles.length > 0) {
          parsedMembers = allProfiles as UserProfile[];
        }
      }

      setMemberProfiles(parsedMembers);
      if (parsedMembers.length > 0 && (!selectedAssigneeId || !parsedMembers.some(m => m.id === selectedAssigneeId))) {
        setSelectedAssigneeId(parsedMembers[0].id);
      }

      if (blockedData) setBlockedTasks(blockedData);
      if (reviewData) setReviewTasks(reviewData);
    } catch (err: any) {
      console.error('Fetch PO Data error:', err);
    }
  };

  // Fetch or Create Profile in Supabase
  const fetchOrCreateProfile = async (user: any) => {
    try {
      setAuthLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setProfile(data as UserProfile);
      } else {
        const newProfile: UserProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anggota Tim',
          role: user.user_metadata?.role || 'member',
          pod: user.user_metadata?.pod || 'Product Builder',
        };

        await supabase.from('profiles').insert([newProfile]);
        setProfile(newProfile);
      }
    } catch (err) {
      console.warn('Fetch profile error:', err);
      const fallback: UserProfile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Dimas',
        role: user.user_metadata?.role || 'member',
        pod: user.user_metadata?.pod || 'Product Builder',
      };
      setProfile(fallback);
    } font-sans
  };

  // Auth Submit (Login / Sign Up)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              full_name: authFullName,
              role: authRole,
              pod: authPod,
            }
          }
        });

        if (error) throw error;
        if (data.user) {
          const newProfile: UserProfile = {
            id: data.user.id,
            full_name: authFullName || 'Anggota Tim',
            role: authRole,
            pod: authPod,
          };
          await supabase.from('profiles').insert([newProfile]);
          setProfile(newProfile);
          showToast('Akun berhasil dibuat & Anda berhasil masuk!');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });

        if (error) throw error;
        showToast('Berhasil masuk!');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Terjadi kesalahan autentikasi.');
    } font-sans
  };

  // Auth Sign Out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsProfileDropdownOpen(false);
    showToast('Anda telah keluar.');
  };

  // TOAST HELPER (AUTOHIDE 3 DETIK)
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // MODAL KELOLA TAUTAN TIM (FULL CRUD FOR PO VIEW)
  const handleOpenManageLinksModal = () => {
    setEditableLinks(JSON.parse(JSON.stringify(projectLinks)));
    setIsManageLinksModalOpen(true);
  };

  const handleAddLinkRow = () => {
    setEditableLinks([
      ...editableLinks,
      { id: `temp-${Date.now()}`, workspace_id: currentWorkspace?.id, title: '', url: 'https://' }
    ]);
  };

  const handleRemoveLinkRow = async (index: number, linkId?: string) => {
    if (linkId && !linkId.startsWith('temp-')) {
      try {
        await supabase.from('project_links').delete().eq('id', linkId);
      } catch (err) {
        console.error("Delete link error:", err);
      }
    }
    setEditableLinks(editableLinks.filter((_, idx) => idx !== index));
  };

  const handleSaveAllLinks = async (e: React.FormEvent) => {
    e.preventDefault();

    const validLinks = editableLinks.filter(l => l.title.trim().length > 0 && l.url.trim().length > 0);

    try {
      for (const link of validLinks) {
        if (link.id && !link.id.startsWith('temp-')) {
          await supabase
            .from('project_links')
            .update({ 
              title: link.title.trim(), 
              url: link.url.trim(),
              workspace_id: currentWorkspace?.id
            })
            .eq('id', link.id);
        } else {
          await supabase
            .from('project_links')
            .insert([{ 
              title: link.title.trim(), 
              url: link.url.trim(),
              workspace_id: currentWorkspace?.id
            }]);
        }
      }

      showToast('Daftar tautan tim berhasil diperbarui!');
      setIsManageLinksModalOpen(false);
      if (currentWorkspace?.id) fetchProjectLinks(currentWorkspace.id);
    } catch (err: any) {
      console.error("Save links error:", err);
      showToast(`Gagal menyimpan tautan: ${err.message || err}`);
    }
  };

  // CHECKLIST TOGGLE & SUPABASE REALTIME PERSISTENCE FOR MEMBER
  const toggleDod = async (id: number) => {
    const updatedItems = dodItems.map(item => {
      if (item.id === id) {
        const nextVal = !item.checked;
        return { ...item, checked: nextVal, is_checked: nextVal };
      }
      return item;
    });
    setDodItems(updatedItems);

    if (activeTask?.id) {
      try {
        const { error } = await supabase
          .from('tasks')
          .update({ checklist: updatedItems })
          .eq('id', activeTask.id);

        if (error) {
          console.error("Error updating checklist:", error.message);
        }
      } catch (err: any) {
        console.error("Error updating checklist:", err);
      }
    }
  };

  // MEMBER: SUBMIT DELIVERABLE LINK (FEEDBACK TOAST: "✓ Hasil tugas berhasil dikirim untuk ditinjau")
  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. VALIDASI KETAT DOD: Cegah submit jika ada poin yang belum dicentang
    if (!isAllDoDCompleted) {
      showToast(`Selesaikan semua checklist (${completedDodCount}/${totalDodCount}) untuk menyerahkan tugas.`);
      return;
    }

    if (!deliverableUrl.trim() || !session?.user?.id) return;

    const linkInput = deliverableUrl.trim();
    const nowIso = new Date().toISOString();

    try {
      if (activeTask?.id) {
        const { data, error } = await supabase
          .from('tasks')
          .update({ 
            deliverable_link: linkInput,
            deliverable_url: linkInput,
            submitted_at: nowIso,
            status: 'review',
            checklist: dodItems,
            revision_note: null,
            resolution_note: null,
            blocker_reason: null,
            is_blocked: false,
            workspace_id: currentWorkspace?.id
          })
          .eq('id', activeTask.id)
          .select();

        if (error) {
          console.error("Error updating deliverable link:", error.message);
          showToast(`Gagal kirim tugas: ${error.message}`);
          return;
        }

        if (data && data[0]) {
          setActiveTask(data[0]);
          setTaskStatus('Sedang Ditinjau PO');
          setSubmittedUrl(linkInput);
        }
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            assignee_id: session.user.id,
            workspace_id: currentWorkspace?.id,
            title: taskTitle || 'Buat Halaman Pembayaran Aplikasi',
            deliverable_link: linkInput,
            deliverable_url: linkInput,
            submitted_at: nowIso,
            status: 'review',
            checklist: dodItems,
            revision_note: null,
            resolution_note: null,
            blocker_reason: null,
            is_blocked: false
          })
          .select();

        if (error) {
          console.error("Error inserting deliverable link:", error.message);
          showToast(`Gagal kirim tugas: ${error.message}`);
          return;
        }

        if (data && data[0]) {
          setActiveTask(data[0]);
          setTaskStatus('Sedang Ditinjau PO');
          setSubmittedUrl(linkInput);
        }
      }
    } catch (err: any) {
      console.error('Supabase deliverable mutation error:', err);
      showToast(`Gagal kirim tugas: ${err.message || err}`);
      return;
    }

    setSubmittedUrl(linkInput);
    setTaskStatus('Sedang Ditinjau PO');
    showToast('✓ Hasil tugas berhasil dikirim untuk ditinjau');
  };

  // MEMBER: REPORT BLOCKER (FEEDBACK TOAST: "🚨 Kendala berhasil dilaporkan ke PO")
  const handleReportBlockerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockerReason.trim() || !session?.user?.id) return;

    const blockerInput = blockerReason.trim();

    try {
      if (activeTask?.id) {
        const { data, error } = await supabase
          .from('tasks')
          .update({ 
            blocker_reason: blockerInput,
            is_blocked: true,
            status: 'blocked' 
          })
          .eq('id', activeTask.id)
          .select();

        if (error) {
          console.error("Error updating blocker reason:", error.message);
          showToast(`Gagal lapor kendala: ${error.message}`);
          return;
        }

        if (data && data[0]) setActiveTask(data[0]);
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            assignee_id: session.user.id,
            workspace_id: currentWorkspace?.id,
            title: taskTitle || 'Tugas Member',
            blocker_reason: blockerInput,
            is_blocked: true,
            status: 'blocked'
          })
          .select();

        if (error) {
          console.error("Error inserting blocker task:", error.message);
          showToast(`Gagal lapor kendala: ${error.message}`);
          return;
        }

        if (data && data[0]) setActiveTask(data[0]);
      }
    } catch (err: any) {
      console.error('Supabase blocker mutation error:', err);
      showToast(`Gagal lapor kendala: ${err.message || err}`);
      return;
    }

    setTaskStatus('Terkendala (Blocker)');
    setIsBlockerModalOpen(false);
    showToast('🚨 Kendala berhasil dilaporkan ke PO');
  };

  // PO DASHBOARD INTERACTION HANDLERS (MODAL INPUT INSTRUKSI)
  const handleOpenResolveBlockerModal = (taskId: string) => {
    setTargetTaskId(taskId);
    setInputResolutionNote('');
    setIsResolveBlockerModalOpen(true);
  };

  const handleSubmitResolveBlocker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTaskId || !inputResolutionNote.trim()) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'in_progress', 
          is_blocked: false,
          resolution_note: inputResolutionNote.trim() 
        })
        .eq('id', targetTaskId);

      if (error) {
        console.error("Resolve blocker error:", error.message);
        showToast(`Gagal kirim solusi: ${error.message}`);
      } else {
        showToast('💡 Solusi kendala telah dikirimkan ke Member!');
        setIsResolveBlockerModalOpen(false);
        setTargetTaskId(null);
        setInputResolutionNote('');
        if (currentWorkspace?.id) fetchPOData(currentWorkspace.id);
      }
    } catch (err: any) {
      console.error("Resolve blocker error:", err);
      showToast(`Gagal kirim solusi: ${err.message || err}`);
    }
  };

  const handleOpenRevisionModal = (taskId: string) => {
    setTargetTaskId(taskId);
    setInputRevisionNote('');
    setIsRevisionModalOpen(true);
  };

  // PO MINTA REVISI (FEEDBACK TOAST: "Catatan revisi terkirim ke {nama member}")
  const handleSubmitRevisionNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTaskId || !inputRevisionNote.trim()) return;

    const targetTask = allTasks.find(t => t.id === targetTaskId);
    const targetMemberName = targetTask?.profiles?.full_name || 'Member';

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'in_progress', 
          revision_note: inputRevisionNote.trim() 
        })
        .eq('id', targetTaskId);

      if (error) {
        console.error("Request revision error:", error.message);
        showToast(`Gagal kirim catatan revisi: ${error.message}`);
      } else {
        showToast(`Catatan revisi terkirim ke ${targetMemberName}`);
        setIsRevisionModalOpen(false);
        setTargetTaskId(null);
        setInputRevisionNote('');
        if (currentWorkspace?.id) fetchPOData(currentWorkspace.id);
      }
    } catch (err: any) {
      console.error("Request revision error:", err);
      showToast(`Gagal kirim catatan revisi: ${err.message || err}`);
    }
  };

  // PO ACC TUGAS (FEEDBACK TOAST: "✓ Tugas disetujui & dipindahkan ke Selesai")
  const handleAcceptReview = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'done',
          revision_note: null,
          resolution_note: null,
          blocker_reason: null,
          is_blocked: false
        })
        .eq('id', taskId);

      if (error) {
        console.error("Accept review error:", error.message);
        showToast(`Gagal ACC tugas: ${error.message}`);
      } else {
        showToast('✓ Tugas disetujui & dipindahkan ke Selesai');
        if (currentWorkspace?.id) fetchPOData(currentWorkspace.id);
      }
    } catch (err: any) {
      console.error("Accept review error:", err);
    }
  };

  // PO EDIT TASK MODAL HANDLERS
  const handleOpenEditTaskModal = (task: MemberTask) => {
    setEditingTask(task);
    setEditTitle(task.title || '');
    setEditDescription(task.description || '');
    
    if (task.due_date) {
      const d = new Date(task.due_date);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        setEditDueDate(`${year}-${month}-${day}T${hours}:${minutes}`);
      } else setEditDueDate('');
    } else setEditDueDate('');

    if (task.checklist && Array.isArray(task.checklist) && task.checklist.length > 0) {
      setEditDodPoints(task.checklist.map(c => c.text || (c as any).label || ''));
    } else {
      setEditDodPoints(['']);
    }

    setIsEditTaskModalOpen(true);
  };

  const handleAddEditDodPoint = () => {
    if (editDodPoints.length < 10) {
      setEditDodPoints([...editDodPoints, '']);
    }
  };

  const handleRemoveEditDodPoint = (index: number) => {
    if (editDodPoints.length > 1) {
      setEditDodPoints(editDodPoints.filter((_, idx) => idx !== index));
    }
  };

  const handleEditDodPointChange = (index: number, value: string) => {
    const updated = [...editDodPoints];
    updated[index] = value;
    setEditDodPoints(updated);
  };

  const handleSaveTaskEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask?.id || !editTitle.trim()) return;

    const checklistItems = editDodPoints
      .filter(p => p.trim().length > 0)
      .map((text, idx) => ({
        id: idx + 1,
        text: text.trim(),
        checked: false,
        is_checked: false,
      }));

    const dueDateIso = editDueDate ? new Date(editDueDate).toISOString() : null;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          due_date: dueDateIso,
          checklist: checklistItems,
        })
        .eq('id', editingTask.id);

      if (error) {
        console.error("Save task edit error:", error.message);
        showToast(`Gagal memperbarui tugas: ${error.message}`);
      } else {
        showToast('✓ Detail tugas berhasil diperbarui');
        setIsEditTaskModalOpen(false);
        setEditingTask(null);
        if (currentWorkspace?.id) fetchPOData(currentWorkspace.id);
      }
    } catch (err: any) {
      console.error("Save task edit error:", err);
      showToast(`Gagal memperbarui tugas: ${err.message || err}`);
    }
  };

  const handleDeleteTask = async () => {
    if (!editingTask?.id) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', editingTask.id);

      if (error) {
        console.error("Delete task error:", error.message);
        showToast(`Gagal menghapus tugas: ${error.message}`);
      } else {
        showToast('🗑️ Tugas berhasil dihapus');
        setIsEditTaskModalOpen(false);
        setEditingTask(null);
        if (currentWorkspace?.id) fetchPOData(currentWorkspace.id);
      }
    } catch (err: any) {
      console.error("Delete task error:", err);
      showToast(`Gagal menghapus tugas: ${err.message || err}`);
    }
  };

  // DYNAMIC DOD LIST HELPERS FOR PO ASSIGNMENT FORM
  const handleAddDodPoint = () => {
    if (dodPoints.length < 10) {
      setDodPoints([...dodPoints, '']);
    }
  };

  const handleRemoveDodPoint = (index: number) => {
    if (dodPoints.length > 1) {
      setDodPoints(dodPoints.filter((_, idx) => idx !== index));
    }
  };

  const handleDodPointChange = (index: number, value: string) => {
    const updated = [...dodPoints];
    updated[index] = value;
    setDodPoints(updated);
  };

  // PO KIRIM TUGAS (AUTO-FOCUS & SMOOTH RESET FORM + WORKSPACE SCOPING)
  const handleCreateNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssigneeId || !newAssignTaskTitle.trim()) return;

    const assigneeName = memberProfiles.find(m => m.id === selectedAssigneeId)?.full_name || 'Member';

    const checklistItems = dodPoints
      .filter(p => p.trim().length > 0)
      .map((text, idx) => ({
        id: idx + 1,
        text: text.trim(),
        checked: false,
        is_checked: false,
      }));

    const dueDateIso = newAssignDueDate ? new Date(newAssignDueDate).toISOString() : null;

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          workspace_id: currentWorkspace?.id,
          assignee_id: selectedAssigneeId,
          title: newAssignTaskTitle.trim(),
          description: newAssignDescription.trim() || null,
          due_date: dueDateIso,
          checklist: checklistItems,
          status: 'in_progress',
        });

      if (error) {
        console.error("Create task error:", error.message);
        showToast(`Gagal penugasan: ${error.message}`);
      } else {
        showToast(`✓ Tugas berhasil dikirim ke ${assigneeName}`);
        
        // 1. Reset form state to defaults
        setNewAssignTaskTitle('');
        setNewAssignDescription('');
        setNewAssignDueDate('');
        setDodPoints(['', '', '']);

        // 2. Trigger visual submit success animation
        setIsTaskSubmitSuccess(true);
        setTimeout(() => setIsTaskSubmitSuccess(false), 1500);

        // 3. Auto-focus Judul Tugas input
        setTimeout(() => {
          taskTitleInputRef.current?.focus();
        }, 100);

        if (currentWorkspace?.id) fetchPOData(currentWorkspace.id);
      }
    } catch (err: any) {
      console.error("Create task error:", err);
      showToast(`Gagal penugasan: ${err.message || err}`);
    }
  };

  // Summary Metrics Calculation for Column 3
  const activeTasksCount = allTasks.filter(t => t.status !== 'done').length;
  const blockedTasksCount = allTasks.filter(t => t.status === 'blocked' || t.is_blocked).length;
  const doneTasksCount = allTasks.filter(t => t.status === 'done').length;

  // Filtered & Sorted Master Tasks for Column 1 Task Feed
  const filteredMasterTasks = allTasks.filter(t => {
    if (poTaskFeedFilter === 'active') {
      return t.status !== 'done';
    } else {
      return t.status === 'done';
    }
  }).sort((a, b) => {
    if (poTaskFeedFilter === 'active') {
      const priorityScore = (task: MemberTask) => {
        if (task.status === 'blocked' || task.is_blocked) return 0;
        if (task.status === 'review' || task.status === 'in_review' || task.status === 'UNDER_REVIEW') return 1;
        return 2;
      };
      return priorityScore(a) - priorityScore(b);
    } else {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

  // Loading Screen
  if (authLoading && !session) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a0c] text-white flex items-center justify-center font-sans">
        <div className="p-8 bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl text-center space-y-3 shadow-2xl">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-400 font-medium">Memuat sesi SyncFlow...</p>
        </div>
      </div>
    );
  }

  // AUTH SCREEN (LOGIN / SIGN UP)
  if (!session) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a0c] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div 
          className="fixed inset-0 bg-cover bg-center opacity-20 mix-blend-luminosity pointer-events-none scale-105"
          style={{ backgroundImage: `url('/assets/dark_stone_bg_1787219104310.png')` }}
        />
        <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-zinc-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-neutral-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center text-white font-bold mx-auto shadow-md">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              SyncFlow Auth
            </h1>
            <p className="text-xs text-zinc-400 font-sans">
              {isSignUp ? 'Daftar akun baru' : 'Masuk ke Dashboard SyncFlow'}
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 text-rose-200 rounded-xl text-xs flex items-center gap-2 font-sans">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs font-sans">
            {isSignUp && (
              <div className="space-y-1">
                <label className="block text-zinc-400 font-medium">Nama Lengkap *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Nama Anda"
                    value={authFullName}
                    onChange={e => setAuthFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-zinc-400 font-medium">Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="email@domain.com"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-zinc-400 font-medium">Kata Sandi *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-zinc-400 font-medium">Pod *</label>
                  <select
                    value={authPod}
                    onChange={e => setAuthPod(e.target.value as any)}
                    className="w-full p-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-white/30 font-sans"
                  >
                    <option value="Product Builder">Product Builder</option>
                    <option value="BA">BA</option>
                    <option value="QA">QA</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-zinc-400 font-medium">Peran *</label>
                  <select
                    value={authRole}
                    onChange={e => setAuthRole(e.target.value as any)}
                    className="w-full p-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-white/30 font-sans"
                  >
                    <option value="member">Member</option>
                    <option value="owner">Project Owner</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-xl shadow-lg transition-all cursor-pointer mt-2"
            >
              {authLoading ? 'Memproses...' : isSignUp ? 'Daftar Akun Baru' : 'Masuk'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-white/10">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError(null);
              }}
              className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              {isSignUp ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar disini'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User Profile metadata
  const userName = profile?.full_name || session.user.email?.split('@')[0] || 'Anggota Tim';

  // =========================================================================
  // MAIN APP CONTAINER (HEADER & ROUTING SWITCHER)
  // =========================================================================
  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col justify-between font-sans relative overflow-x-hidden selection:bg-white selection:text-black">
      {/* BACKGROUND 3D DARK METALLIC / STONE LAYER */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity pointer-events-none scale-105"
        style={{ backgroundImage: `url('/assets/dark_stone_bg_1787219104310.png')` }}
      />

      {/* AMBIENT SOFT GLOW LIGHTS */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-zinc-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-zinc-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* TOP-RIGHT FLOATING MONOCHROME TOAST NOTIFICATION (3 Detik Auto Disappear) */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 max-w-xs sm:max-w-sm bg-neutral-900/95 border border-white/20 text-white px-4 py-3 rounded-2xl flex items-center justify-between gap-3 text-xs font-sans backdrop-blur-2xl shadow-2xl transition-all duration-300 ease-in-out">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white shrink-0" />
            <span className="font-medium leading-tight">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-zinc-400 hover:text-white cursor-pointer transition-colors p-0.5 shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8 flex-1 min-h-screen justify-between font-sans">
        
        {/* ========================================================================= */}
        {/* TOP BAR NAVBAR (MULTI-WORKSPACE SELECTOR & ROLE CONTROL) */}
        {/* ========================================================================= */}
        <header className="w-full flex items-center justify-between gap-4 font-sans text-xs">
          
          {/* Logo Brand: SyncFlow & WORKSPACE SELECTOR DROPDOWN (KIRI ATAS - CONDITIONAL) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-all duration-300">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-base tracking-tight hidden sm:inline">
                SyncFlow
              </span>
            </div>

            {/* WORKSPACE SELECTOR DROPDOWN (1. HANYA DITAMPILKAN JIKA CURRENTWORKSPACE ADA & VALID) */}
            {currentWorkspace && userWorkspaces.length > 0 && (
              <div className="relative font-sans" ref={workspaceDropdownRef}>
                <button 
                  onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{currentWorkspace.name}</span>
                  <span className="text-white/40 text-[10px]">▼</span>
                </button>

                {/* Menu Dropdown */}
                {isWorkspaceMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-xl border border-white/10 bg-zinc-950/90 backdrop-blur-xl p-1.5 shadow-2xl z-50 font-sans">
                    <div className="px-2 py-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">Workspace Tim</div>
                    {userWorkspaces.map(ws => (
                      <button
                        key={ws.id}
                        onClick={() => handleSelectWorkspace(ws)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${currentWorkspace?.id === ws.id ? 'bg-white/10 text-white font-medium' : 'text-white/70 hover:bg-white/5'}`}
                      >
                        <span>{ws.name}</span>
                        <span className="text-[10px] text-white/40 uppercase">{ws.role}</span>
                      </button>
                    ))}
                    <div className="border-t border-white/5 my-1" />
                    <button
                      onClick={() => { setIsCreateWorkspaceModalOpen(true); setIsWorkspaceMenuOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-white/80 hover:bg-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>+ Buat Workspace Baru</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* View Mode Switcher Pill (HANYA DITAMPILKAN UNTUK WORKSPACE ROLE PO DAN PL) */}
          {isPoOrPlRole && currentWorkspace && (
            <nav className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-lg text-xs font-sans">
              <button
                onClick={() => setViewMode('po')}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ease-in-out cursor-pointer ${
                  viewMode === 'po'
                    ? 'bg-white/20 text-white font-semibold shadow-xs border border-white/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{isOwnerOrPo ? 'Papan PO' : 'Papan PL'}</span>
              </button>
              <button
                onClick={() => setViewMode('member')}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ease-in-out cursor-pointer ${
                  viewMode === 'member'
                    ? 'bg-white/20 text-white font-semibold shadow-xs border border-white/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>Dashboard Member</span>
              </button>
            </nav>
          )}

          {/* Right Controls: User Profile Pill Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 backdrop-blur-2xl border border-white/15 rounded-full text-xs flex items-center gap-2 font-medium cursor-pointer transition-colors duration-300 shadow-md font-sans"
            >
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-white font-semibold">{userName} — {userRoleDisplay}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2 z-50 space-y-1 text-xs font-sans transition-all duration-300 ease-in-out">
                <div className="p-2.5 border-b border-white/10 space-y-0.5">
                  <div className="font-bold text-white truncate">{userName}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{session.user.email}</div>
                  <div className="text-[10px] text-zinc-400">Role: {userRoleDisplay}</div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full p-2.5 text-left text-zinc-300 hover:text-white hover:bg-white/10 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-colors duration-300"
                >
                  <LogOut className="w-4 h-4 text-zinc-400" />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 1. WORKSPACE CONDITIONAL RENDERING GUARD (STRICT ONBOARDING STATE) */}
        {/* ========================================================================= */}
        {!currentWorkspace || userWorkspaces.length === 0 ? (
          <NoWorkspaceView
            onCreateWorkspace={() => setIsCreateWorkspaceModalOpen(true)}
            profile={profile}
          />
        ) : !isPoOrPlRole || viewMode === 'member' ? (
          /* ========================================================================= */
          /* DASHBOARD MEMBER VIEW (RESPONSIVE BENTO GRID MOBILE & TABLET FRIENDLY) */
          /* ========================================================================= */
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 my-auto font-sans transition-all duration-300 ease-in-out">
            
            {/* GRID KIRI (7 Kolom di Desktop / 1 Kolom di Mobile & Tablet) */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-6 transition-all duration-300 ease-in-out">
              
              {/* TOP ROW KIRI: 2 Kartu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* KARTU KIRI ATAS (Fetch & Render Tugas Aktif Member / Empty State) */}
                {!activeTask ? (
                  /* EMPTY STATE: TIDAK ADA TUGAS AKTIF */
                  <div className="rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between min-h-[280px] hover:border-white/20 transition-all duration-300 ease-in-out font-sans">
                    <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                      <span>Tugas Aktif</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-400 font-medium">
                        Standby
                      </span>
                    </div>

                    <div className="text-center my-auto py-4 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white mx-auto shadow-md">
                        <CheckCircle2 className="w-6 h-6 text-zinc-300" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-white tracking-tight leading-snug">
                          Semua tugas selesai di workspace {currentWorkspace?.name}.
                        </h3>
                        <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xs mx-auto">
                          Tunggu instruksi tugas berikutnya dari Project Owner / Lead.
                        </p>
                      </div>
                    </div>

                    <div className="text-[10px] text-zinc-500 text-center pt-2 border-t border-white/5 font-sans">
                      SyncFlow Status: Standby ({currentWorkspace?.name})
                    </div>
                  </div>
                ) : (
                  /* KARTU TUGAS AKTIF BIASA DENGAN BADGE DEADLINE RELATIF & BRIEF BOX */
                  <div className="rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between min-h-[280px] hover:border-white/20 transition-all duration-300 ease-in-out space-y-3 font-sans">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                        <span>Tugas Aktif</span>
                        {/* Top Right Status Badge on Member Card */}
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-medium transition-colors duration-300 ${
                          taskStatus === 'Perlu Revisi'
                            ? 'bg-neutral-800 text-zinc-200 border-white/30'
                            : taskStatus === 'Terkendala (Blocker)'
                              ? 'bg-neutral-800 text-zinc-300 border-white/20'
                              : taskStatus === 'Sedang Ditinjau PO'
                                ? 'bg-white/10 text-white border-white/20'
                                : 'bg-white/5 text-zinc-400 border-white/10'
                        }`}>
                          {taskStatus}
                        </span>
                      </div>
                      {/* Render Judul Tugas */}
                      <h2 className="text-base font-bold text-white tracking-tight leading-snug">
                        {taskTitle}
                      </h2>

                      {/* BADGE DEADLINE RINGKAS & RELATIF WAKTU */}
                      {activeTask?.due_date && (() => {
                        const rel = getRelativeDeadlineString(activeTask.due_date);
                        if (!rel) return null;

                        return (
                          <div className="pt-0.5">
                            <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium tracking-tight font-sans transition-colors duration-300 ${
                              rel.status === 'overdue'
                                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                                : rel.status === 'urgent'
                                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                                  : 'bg-white/5 border border-white/10 text-white/70'
                            }`}>
                              <span>{rel.text}</span>
                            </span>
                          </div>
                        );
                      })()}

                      {/* TAMPILKAN DESKRIPSI BRIEF DI DASHBOARD MEMBER */}
                      {activeTask?.description && (
                        <div className="my-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80 leading-relaxed whitespace-pre-line font-sans">
                          <span className="text-white/40 block font-medium mb-1 uppercase tracking-wider text-[10px]">Brief Tugas:</span>
                          {activeTask.description}
                        </div>
                      )}
                    </div>

                    {/* PO Feedback Action Cards in Member Dashboard */}
                    {activeTask?.revision_note && (
                      <div className="p-3 bg-neutral-900 border border-white/20 rounded-2xl text-xs text-zinc-200 font-sans space-y-1">
                        <div className="font-semibold text-white text-[11px] flex items-center gap-1">
                          <span>⚠️ Catatan Revisi PO:</span>
                        </div>
                        <p className="text-zinc-300 text-[11px] leading-relaxed">
                          {activeTask.revision_note}
                        </p>
                      </div>
                    )}

                    {/* REDESAIN KARTU SOLUSI PO: TAMPILKAN RIWAYAT KENDALA VS SOLUSI PO */}
                    {activeTask?.resolution_note && (
                      <div className="my-3 rounded-2xl border border-white/10 bg-neutral-900/90 p-3.5 space-y-2 text-xs font-sans">
                        {/* Baris 1: Kendala Member */}
                        {activeTask.blocker_reason && (
                          <div>
                            <span className="text-zinc-400 block font-medium text-[10px] uppercase tracking-wider">
                              Kendala yang Kamu Laporkan:
                            </span>
                            <p className="text-zinc-300 mt-0.5 line-through decoration-zinc-500 text-[11px]">
                              {activeTask.blocker_reason}
                            </p>
                          </div>
                        )}

                        {/* Divider halus */}
                        {activeTask.blocker_reason && <div className="border-t border-white/10" />}

                        {/* Baris 2: Solusi PO */}
                        <div>
                          <span className="text-white block font-semibold text-[11px] flex items-center gap-1.5">
                            💡 Solusi / Arahan PO:
                          </span>
                          <p className="text-zinc-200 font-normal mt-0.5 text-xs leading-relaxed">
                            {activeTask.resolution_note}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* HEADER & LABEL DOD (DEFINITION OF DONE) */}
                    <div className="mt-4 mb-2 flex items-center justify-between border-t border-white/5 pt-3 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold tracking-wider text-white/60 uppercase">Checklist DoD</span>
                        <span className="text-[10px] text-white/30">(Definition of Done)</span>
                      </div>
                      <span className="text-[11px] font-medium text-white/40">
                        {completedDodCount}/{totalDodCount} Selesai
                      </span>
                    </div>

                    {/* Render Array Checklist (DoD) dengan Realtime State */}
                    <div className="space-y-1.5 text-xs font-sans">
                      {dodItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => toggleDod(item.id)}
                          className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 rounded-xl hover:bg-white/5 transition-colors duration-300"
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0 ${
                            item.checked 
                              ? 'bg-white border-white text-zinc-950' 
                              : 'border-zinc-500 bg-transparent'
                          }`}>
                            {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={`text-xs transition-colors duration-300 ${item.checked ? 'line-through text-white/40' : 'text-zinc-200'}`}>
                            {item.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* KARTU TENGAH ATAS (Submit Deliverable - VALIDASI KETAT DOD & FORM UNLOCK & EMPTY STATE) */}
                <div className="rounded-[32px] bg-white text-zinc-950 p-6 shadow-xl flex flex-col justify-between min-h-[280px] hover:scale-[1.01] transition-all duration-300 ease-in-out font-sans">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-zinc-500">
                      Penyerahan Tugas
                    </span>
                    <h3 className="text-base font-bold text-zinc-950 tracking-tight">
                      {!activeTask
                        ? 'Kirim Hasil Tugas'
                        : taskStatus === 'Perlu Revisi'
                          ? 'Kirim Hasil Revisi'
                          : 'Kirim Hasil Tugas'}
                    </h3>
                  </div>

                  {/* Form Input Clean & Lock / Validation Logic */}
                  <form onSubmit={handleSubmitDeliverable} className="space-y-3 my-auto py-2 font-sans">
                    {!activeTask ? (
                      /* EMPTY STATE INPUT FORM TERKUNCI */
                      <input
                        type="text"
                        disabled
                        placeholder="Menunggu tugas aktif..."
                        className="w-full px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-2xl text-xs text-zinc-400 placeholder-zinc-400 cursor-not-allowed font-sans"
                      />
                    ) : submittedUrl && taskStatus === 'Sedang Ditinjau PO' ? (
                      <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-2xl text-xs space-y-1 font-sans">
                        <div className="font-semibold text-zinc-700 text-[11px]">Deliverable Terkirim:</div>
                        <a href={submittedUrl} target="_blank" rel="noreferrer" className="text-zinc-900 underline truncate block font-medium">
                          {submittedUrl}
                        </a>
                      </div>
                    ) : (
                      <input
                        type="text"
                        required
                        disabled={taskStatus === 'Sedang Ditinjau PO'}
                        placeholder="Link tugas..."
                        value={deliverableUrl}
                        onChange={e => setDeliverableUrl(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-800 transition-colors duration-300 disabled:opacity-50 font-sans"
                      />
                    )}

                    <button
                      type="submit"
                      disabled={!activeTask || taskStatus === 'Sedang Ditinjau PO' || !isAllDoDCompleted}
                      className={`w-full py-2.5 font-medium text-xs rounded-full shadow-md flex items-center justify-center gap-2 transition-all duration-300 ease-in-out ${
                        !activeTask || taskStatus === 'Sedang Ditinjau PO' || !isAllDoDCompleted
                          ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                          : 'bg-zinc-950 hover:bg-zinc-800 text-white cursor-pointer'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {!activeTask
                          ? 'Belum Ada Tugas'
                          : taskStatus === 'Sedang Ditinjau PO'
                            ? 'Sedang Ditinjau PO'
                            : taskStatus === 'Perlu Revisi'
                              ? 'Kirim Hasil Revisi'
                              : 'Kirim Hasil Tugas'}
                      </span>
                    </button>

                    {/* Helper text jika DoD belum lengkap */}
                    {activeTask && taskStatus !== 'Sedang Ditinjau PO' && !isAllDoDCompleted && (
                      <p className="text-[10px] text-zinc-500 text-center font-sans font-medium pt-0.5">
                        Selesaikan semua checklist ({completedDodCount}/{totalDodCount}) untuk menyerahkan tugas.
                      </p>
                    )}
                  </form>

                  {/* Tombol Laporkan Kendala */}
                  <div className="pt-2 border-t border-zinc-100 font-sans">
                    <button
                      onClick={() => setIsBlockerModalOpen(true)}
                      disabled={!activeTask}
                      className={`w-full py-2 border text-xs rounded-full transition-colors duration-300 flex items-center justify-center gap-1.5 ${
                        !activeTask
                          ? 'border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed'
                          : 'border-zinc-300 hover:bg-zinc-100 text-zinc-800 font-medium cursor-pointer'
                      }`}
                    >
                      <AlertTriangle className={`w-3.5 h-3.5 ${!activeTask ? 'text-zinc-400' : 'text-zinc-600'}`} />
                      <span>🚨 Laporkan Kendala</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* AREA BAWAH KIRI (Header Teks Sapaan Otomatis & Subtitle Dinamis Target) */}
              <div className="space-y-2 pt-2 font-sans transition-all duration-300 ease-in-out">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  Halo, {userName}
                </h1>
                <p className="text-base text-zinc-400 font-sans">
                  {activeTask
                    ? `Target (${currentWorkspace?.name}): ${taskTitle}`
                    : `Workspace: ${currentWorkspace?.name || 'Utama'} • Standby`}
                </p>
              </div>

            </div>

            {/* GRID KANAN (5 Kolom di Desktop / 1 Kolom di Mobile & Tablet - DYNAMIC PROJECT LINKS MEMBER READ-ONLY) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6 font-sans transition-all duration-300 ease-in-out">
              
              {/* KARTU KANAN (Aset Tim Workspace) */}
              <div className="rounded-[36px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between flex-1 min-h-[280px] hover:border-white/20 transition-all duration-300 ease-in-out font-sans">
                
                <div className="space-y-1">
                  <span className="text-xs font-medium text-zinc-400">
                    Aset Tim ({currentWorkspace?.name})
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Tautan Utama ({projectLinks.length})
                  </h3>
                </div>

                {/* Dynamic Links List (Read-Only for Member) */}
                <div className="space-y-3 pt-4 flex-1">
                  {projectLinks.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">Belum ada tautan tim di workspace ini.</p>
                  ) : (
                    projectLinks.map(link => (
                      <a
                        key={link.id || link.title}
                        href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center justify-between transition-all duration-300 ease-in-out group/link"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-zinc-300">
                            {renderLinkIcon(link.title, link.icon_type)}
                          </div>
                          <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-[260px]">
                            {link.title}
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-zinc-500 group-hover/link:text-white transition-colors duration-300 shrink-0" />
                      </a>
                    ))
                  )}
                </div>

                <div className="text-xs text-zinc-500 text-center pt-2 border-t border-white/5 font-sans">
                  SyncFlow Dashboard ({currentWorkspace?.name})
                </div>

              </div>

            </div>

          </main>
        ) : (
          /* ========================================================================= */
          /* PO / PL CONTROL CENTER VIEW (RESPONSIVE BENTO GRID MOBILE & TABLET FRIENDLY) */
          /* ========================================================================= */
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 my-auto font-sans transition-all duration-300 ease-in-out">
            
            {/* ========================================================================= */}
            {/* KOLOM 1 (KIRI - LEBAR - 5 KOLOM): RADAR & STATUS TIM (MASTER TASK FEED) */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6 transition-all duration-300 ease-in-out">
              
              <div className="rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between flex-1 min-h-[460px] hover:border-white/20 transition-all duration-300 ease-in-out font-sans">
                <div className="space-y-4">
                  {/* Header & Tab Feed Switcher */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <Activity className="w-4 h-4 text-zinc-300" />
                        <span>Radar Tim ({currentWorkspace?.name})</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] text-zinc-300 font-medium font-sans">
                        {allTasks.length} Total
                      </span>
                    </div>

                    {/* MONOCHROME TAB TOGGLE: Aktif & Review vs Selesai */}
                    <div className="flex items-center p-1 bg-neutral-950 border border-white/10 rounded-2xl text-xs font-sans">
                      <button
                        onClick={() => setPoTaskFeedFilter('active')}
                        className={`flex-1 py-1.5 rounded-xl font-medium text-[11px] transition-all duration-300 ease-in-out cursor-pointer ${
                          poTaskFeedFilter === 'active'
                            ? 'bg-white text-zinc-950 font-bold shadow-xs'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Aktif & Review ({allTasks.filter(t => t.status !== 'done').length})
                      </button>
                      <button
                        onClick={() => setPoTaskFeedFilter('done')}
                        className={`flex-1 py-1.5 rounded-xl font-medium text-[11px] transition-all duration-300 ease-in-out cursor-pointer ${
                          poTaskFeedFilter === 'done'
                            ? 'bg-white text-zinc-950 font-bold shadow-xs'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Selesai ({allTasks.filter(t => t.status === 'done').length})
                      </button>
                    </div>
                  </div>

                  {/* EMPTY STATE PADA FEED PO (TAB AKTIF & REVIEW KOSONG) */}
                  {filteredMasterTasks.length === 0 ? (
                    <div className="p-8 text-center bg-neutral-900/60 border border-white/10 rounded-2xl text-xs text-zinc-400 space-y-2 my-auto font-sans transition-all duration-300 ease-in-out">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white mx-auto shadow-xs">
                        <Sparkles className="w-5 h-5 text-zinc-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-white text-xs">
                          {poTaskFeedFilter === 'active' ? 'Semua tugas aktif beres.' : 'Belum ada tugas selesai.'}
                        </p>
                        <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xs mx-auto">
                          {poTaskFeedFilter === 'active'
                            ? 'Tidak ada kendala aktif maupun antrean deliverable yang menunggu review.'
                            : 'Tugas yang di-ACC akan tercatat di tab ini.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                      {filteredMasterTasks.map(t => {
                        const completedDod = t.checklist?.filter(c => c.checked || c.is_checked).length || 0;
                        const totalDod = t.checklist?.length || 0;
                        const isBlocked = t.status === 'blocked' || t.is_blocked;
                        const isReview = t.status === 'review' || t.status === 'in_review' || t.status === 'UNDER_REVIEW';
                        const isDone = t.status === 'done';
                        const deliverableContent = t.deliverable_link || t.deliverable_url || '';
                        const formattedDate = t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

                        return (
                          <div key={t.id} className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-3 text-xs font-sans hover:border-white/20 transition-all duration-300 ease-in-out">
                            {/* Member Header & Edit Button */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-xs">{t.profiles?.full_name || 'Member Tim'}</span>
                              <div className="flex items-center gap-1.5">
                                {formattedDate && <span className="text-[10px] text-zinc-500">{formattedDate}</span>}
                                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] text-zinc-400">
                                  {t.profiles?.pod || 'Umum'}
                                </span>
                                {isPoOrPlRole && (
                                  <button
                                    onClick={() => handleOpenEditTaskModal(t)}
                                    className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] text-zinc-300 hover:text-white font-medium cursor-pointer transition-colors duration-300 flex items-center gap-1"
                                    title="Edit Tugas"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Task Title & Description Brief */}
                            <div className="space-y-1">
                              <div className="font-medium text-zinc-200 text-xs">
                                {t.title}
                              </div>
                              {t.description && (
                                <div className="text-[11px] text-zinc-300 bg-white/5 p-2 rounded-xl border border-white/5 font-sans leading-relaxed whitespace-pre-line">
                                  <span className="text-[10px] text-zinc-500 uppercase font-medium block">Brief:</span>
                                  {t.description}
                                </div>
                              )}
                            </div>

                            {/* PREVIEW CHECKLIST DOD DETAIL ON PO CARDS */}
                            {t.checklist && Array.isArray(t.checklist) && t.checklist.length > 0 && (
                              <div className="my-2 space-y-1.5 rounded-xl bg-neutral-950 p-2.5 text-[11px] border border-white/10 font-sans">
                                <div className="flex items-center justify-between text-zinc-400 text-[10px] font-medium pb-1 border-b border-white/5">
                                  <span>Progres Checklist DoD:</span>
                                  {completedDod < totalDod ? (
                                    <span className="text-zinc-300 font-semibold flex items-center gap-1">
                                      ⚠️ DoD Belum Lengkap ({completedDod}/{totalDod})
                                    </span>
                                  ) : (
                                    <span className="text-white font-medium flex items-center gap-1">
                                      ✓ DoD Lengkap ({completedDod}/{totalDod})
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-1 pt-0.5">
                                  {t.checklist.map((item: any, idx: number) => {
                                    const isChecked = item.checked ?? item.is_checked ?? false;
                                    return (
                                      <div key={idx} className="flex items-center gap-2 text-zinc-300">
                                        <span className={isChecked ? 'text-white font-bold' : 'text-zinc-500'}>
                                          {isChecked ? '✓' : '○'}
                                        </span>
                                        <span className={isChecked ? 'line-through text-zinc-500' : 'text-zinc-200'}>
                                          {item.text || item.label || `Poin ${idx + 1}`}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* TIMESTAMP PENGUMPULAN & PERBANDINGAN DI PO REVIEW */}
                            {t.submitted_at ? (
                              <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-white/5 pt-2 font-sans">
                                <span>Diserahkan: {formatDeadline(t.submitted_at)}</span>
                                {t.due_date && new Date(t.submitted_at) > new Date(t.due_date) ? (
                                  <span className="text-rose-400 font-medium">Terlambat</span>
                                ) : (
                                  <span className="text-emerald-400 font-medium">✓ Tepat Waktu</span>
                                )}
                              </div>
                            ) : t.due_date ? (
                              <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-white/5 pt-2 font-sans">
                                <span>Tenggat Waktu:</span>
                                <span className={getDeadlineStatus(t.due_date) === 'overdue' ? 'text-rose-400 font-medium' : 'text-zinc-300 font-medium'}>
                                  {formatDeadline(t.due_date)}
                                </span>
                              </div>
                            ) : null}

                            {/* Status Indicator & Specific Action Controls */}
                            {isBlocked ? (
                              <div className="space-y-2 pt-1 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                  <span className="px-2 py-0.5 rounded-md bg-neutral-800 border border-white/15 text-[10px] text-zinc-300 font-semibold flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-zinc-400" />
                                    <span>🚨 Blocker</span>
                                  </span>
                                  <button
                                    onClick={() => t.id && handleOpenResolveBlockerModal(t.id)}
                                    className="px-3 py-1 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-[11px] rounded-full transition-all duration-300 cursor-pointer flex items-center gap-1"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Selesaikan</span>
                                  </button>
                                </div>
                                <p className="text-[11px] text-zinc-300 bg-white/5 p-2 rounded-xl border border-white/5">
                                  {t.blocker_reason || 'Terjadi kendala teknis'}
                                </p>
                              </div>
                            ) : isReview ? (
                              <div className="space-y-2 pt-1 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                  <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-[10px] text-white font-semibold flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-zinc-300" />
                                    <span>⏳ Butuh Review</span>
                                  </span>
                                </div>

                                {/* SMART EXTERNAL LINK BUTTON / BLOCKQUOTE PREVIEW HASIL KIRIMAN MEMBER */}
                                {deliverableContent && (
                                  <div className="p-2.5 bg-neutral-950 border border-white/10 rounded-xl space-y-1.5 font-sans">
                                    <span className="text-[10px] text-zinc-400 font-medium block uppercase tracking-wider">Hasil Kiriman Member:</span>
                                    {deliverableContent.startsWith('http://') || deliverableContent.startsWith('https://') ? (
                                      <a
                                        href={deliverableContent}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors border border-white/10"
                                      >
                                        <span>Buka Link Hasil Kerja</span>
                                        <ExternalLink className="w-3 h-3 text-white shrink-0" />
                                      </a>
                                    ) : (
                                      <blockquote className="p-2.5 bg-neutral-900 border-l-2 border-white/30 text-xs text-zinc-300 rounded-r-xl italic leading-relaxed whitespace-pre-line font-sans">
                                        {deliverableContent}
                                      </blockquote>
                                    )}
                                  </div>
                                )}

                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => t.id && handleAcceptReview(t.id)}
                                    className="flex-1 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-full transition-all duration-300 cursor-pointer text-center text-[11px]"
                                  >
                                    Terima (ACC)
                                  </button>
                                  <button
                                    onClick={() => t.id && handleOpenRevisionModal(t.id)}
                                    className="flex-1 py-1.5 border border-white/20 hover:bg-white/10 text-white font-medium rounded-full transition-all duration-300 cursor-pointer text-center text-[11px]"
                                  >
                                    Minta Revisi
                                  </button>
                                </div>
                              </div>
                            ) : isDone ? (
                              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                                <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-[10px] text-white font-semibold flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                  <span>✅ Selesai</span>
                                </span>
                                <span className="text-zinc-500 text-[10px]">Telah di-ACC PO</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                                  <Activity className="w-3 h-3 text-zinc-400" />
                                  <span>⚡ Sedang Mengerjakan</span>
                                </span>
                                <span className="text-zinc-400 font-medium text-[10px]">
                                  {completedDod}/{totalDod} DoD Selesai
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="text-xs text-zinc-500 text-center pt-2 border-t border-white/5 font-sans">
                  SyncFlow Master Task Feed
                </div>
              </div>

              {/* AREA BAWAH KIRI (Header Teks Sapaan Personal Dinamis PO) */}
              <div className="space-y-2 pt-2 font-sans transition-all duration-300 ease-in-out">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  Halo, {userName}
                </h1>
                <p className="text-base text-zinc-400 font-sans">
                  Papan kontrol & radar tim untuk {currentWorkspace?.name || 'Workspace Utama'}.
                </p>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* KOLOM 2 (TENGAH - PUTIH SOLID - 4 KOLOM): BAGI TUGAS BARU */}
            {/* ========================================================================= */}
            <div className="lg:col-span-4 flex flex-col justify-between transition-all duration-300 ease-in-out">
              
              <div className="rounded-[32px] bg-white text-zinc-950 p-6 shadow-xl flex flex-col justify-between flex-1 min-h-[460px] hover:scale-[1.01] transition-all duration-300 ease-in-out font-sans">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-zinc-500">
                    Penugasan Workspace: {currentWorkspace?.name}
                  </span>
                  <h3 className="text-base font-bold text-zinc-950 tracking-tight">
                    Bagi Tugas Baru
                  </h3>
                </div>

                <form onSubmit={handleCreateNewTask} className="space-y-3.5 my-auto py-2 font-sans">
                  {/* Dropdown Select Member */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Pilih Anggota Tim</label>
                    <select
                      value={selectedAssigneeId}
                      onChange={e => setSelectedAssigneeId(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-800 transition-colors duration-300 font-sans cursor-pointer"
                    >
                      {memberProfiles.length === 0 ? (
                        <option value="">Memuat daftar tim...</option>
                      ) : (
                        memberProfiles.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.full_name} — {m.pod || 'General'} ({ (m.role || 'member').toUpperCase() })
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Task Title Input with Ref for Auto-Focus */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Judul Tugas</label>
                    <input
                      ref={taskTitleInputRef}
                      type="text"
                      required
                      placeholder="Nama tugas..."
                      value={newAssignTaskTitle}
                      onChange={e => setNewAssignTaskTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-800 transition-colors duration-300 font-sans"
                    />
                  </div>

                  {/* FORM INPUT DESKRIPSI TUGAS (PO VIEW - TENGAH) */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                      Deskripsi / Brief Singkat
                    </label>
                    <textarea
                      placeholder="Jelaskan detail brief atau konteks pengerjaan..."
                      value={newAssignDescription}
                      onChange={e => setNewAssignDescription(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-900 outline-hidden focus:border-zinc-400 min-h-[70px] resize-none font-sans"
                    />
                  </div>

                  {/* INPUT DEADLINE DI FORM PO DENGAN PRESET TENGGAT WAKTU CEPAT */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                        Tenggat Waktu (Deadline)
                      </label>
                      <div className="flex items-center gap-1 font-sans">
                        <button
                          type="button"
                          onClick={() => handleApplyDeadlinePreset(0, 'create')}
                          className="text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200 transition-colors duration-300 cursor-pointer"
                        >
                          Hari Ini (17:00)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyDeadlinePreset(1, 'create')}
                          className="text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200 transition-colors duration-300 cursor-pointer"
                        >
                          Besok (17:00)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyDeadlinePreset(3, 'create')}
                          className="text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200 transition-colors duration-300 cursor-pointer"
                        >
                          3 Hari
                        </button>
                      </div>
                    </div>
                    <input
                      type="datetime-local"
                      value={newAssignDueDate}
                      onChange={e => setNewAssignDueDate(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-400 transition-colors duration-300 font-sans [color-scheme:light]"
                    />
                  </div>

                  {/* DYNAMIC DOD CHECKLIST LIST (MAX 10 POINTS) */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                        Checklist DoD ({dodPoints.length}/10 Poin)
                      </label>
                      {dodPoints.length < 10 && (
                        <button
                          type="button"
                          onClick={handleAddDodPoint}
                          className="text-[10px] font-bold text-zinc-900 hover:text-zinc-600 flex items-center gap-0.5 cursor-pointer transition-colors duration-300"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Tambah Poin</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {dodPoints.map((point, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder={`DoD ${idx + 1}...`}
                            value={point}
                            onChange={e => handleDodPointChange(idx, e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] text-zinc-900 font-sans focus:outline-hidden focus:border-zinc-800"
                          />
                          {dodPoints.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDodPoint(idx)}
                              className="w-6 h-6 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center cursor-pointer transition-colors duration-300 text-xs font-bold shrink-0"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedAssigneeId || !newAssignTaskTitle.trim()}
                    className={`w-full py-3 font-bold text-xs rounded-full shadow-md flex items-center justify-center gap-2 transition-all duration-300 ease-in-out ${
                      isTaskSubmitSuccess
                        ? 'bg-emerald-600 text-white cursor-default'
                        : selectedAssigneeId && newAssignTaskTitle.trim()
                          ? 'bg-zinc-950 hover:bg-zinc-800 text-white cursor-pointer'
                          : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {isTaskSubmitSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white animate-bounce" />
                        <span>✓ Tugas Terkirim</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Tugas ke Member</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* KOLOM 3 (KANAN - 3 KOLOM): DYNAMIC PROJECT LINKS (FULL CRUD) */}
            {/* ========================================================================= */}
            <div className="lg:col-span-3 flex flex-col justify-between gap-6 font-sans transition-all duration-300 ease-in-out">
              
              <div className="rounded-[36px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between flex-1 min-h-[460px] hover:border-white/20 transition-all duration-300 ease-in-out font-sans">
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-zinc-400">
                      Pusat Operasional
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      Aset & Referensi Tim
                    </h3>
                  </div>

                  {/* Summary Metrics */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/10 text-center">
                    <div className="space-y-0.5">
                      <div className="text-lg font-bold text-white">{activeTasksCount}</div>
                      <div className="text-[9px] text-zinc-400 uppercase font-medium tracking-wider">Aktif</div>
                    </div>
                    <div className="space-y-0.5 border-x border-white/10">
                      <div className="text-lg font-bold text-white">{blockedTasksCount}</div>
                      <div className="text-[9px] text-zinc-400 uppercase font-medium tracking-wider">Kendala</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-lg font-bold text-white">{doneTasksCount}</div>
                      <div className="text-[9px] text-zinc-400 uppercase font-medium tracking-wider">Done</div>
                    </div>
                  </div>

                  {/* Dynamic Master Quick Links & Edit Button */}
                  <div className="space-y-2.5 pt-2 font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-medium text-zinc-400 tracking-wider">
                        Tautan Workspace ({projectLinks.length})
                      </span>
                      {isPoOrPlRole && (
                        <button
                          onClick={handleOpenManageLinksModal}
                          className="text-[10px] text-zinc-300 hover:text-white underline cursor-pointer font-medium"
                        >
                          Kelola Tautan
                        </button>
                      )}
                    </div>

                    {projectLinks.length === 0 ? (
                      <p className="text-xs text-zinc-500 text-center py-4">Belum ada tautan di workspace ini.</p>
                    ) : (
                      projectLinks.map(link => (
                        <a
                          key={link.id || link.title}
                          href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center justify-between transition-all duration-300 ease-in-out group/link"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-zinc-300">
                              {renderLinkIcon(link.title, link.icon_type)}
                            </div>
                            <span className="font-semibold text-white text-xs truncate max-w-[140px] sm:max-w-[180px]">
                              {link.title}
                            </span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover/link:text-white transition-colors duration-300 shrink-0" />
                        </a>
                      ))
                    )}
                  </div>
                </div>

                <div className="text-xs text-zinc-500 text-center pt-2 border-t border-white/5 font-sans">
                  SyncFlow PO Control Center
                </div>

              </div>

            </div>

          </main>
        )}

        {/* FOOTER */}
        <footer className="w-full text-center py-2 text-xs text-zinc-500 font-sans">
          SyncFlow • Strict Monochrome Glassmorphism
        </footer>

      </div>

      {/* MODAL BUAT WORKSPACE BARU (2. UPGRADE INSTANT SINGLE INPUT MODAL) */}
      {isCreateWorkspaceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 ease-in-out font-sans">
          <div className="w-full max-w-md bg-neutral-900/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
                  <Folder className="w-4 h-4 text-zinc-300" />
                </div>
                <span>Buat Ruang Kerja Baru</span>
              </div>
              <button
                onClick={() => setIsCreateWorkspaceModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspaceSubmit} className="space-y-4 font-sans">
              <div className="space-y-1.5">
                <label className="block text-zinc-300 font-medium text-xs">Nama Workspace / Proyek *</label>
                <input
                  type="text"
                  required
                  placeholder="contoh: Redesign Landing Page, Sprint Klien A"
                  value={newWorkspaceName}
                  onChange={e => setNewWorkspaceName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 focus:border-white/40 focus:bg-white/[0.07] text-white rounded-xl px-4 py-2.5 text-xs outline-hidden font-sans transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateWorkspaceModalOpen(false)}
                  className="bg-white/5 hover:bg-white/10 text-white/60 text-xs px-4 py-2 rounded-xl cursor-pointer transition-colors font-sans"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newWorkspaceName.trim()}
                  className={`bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-xs px-5 py-2 rounded-xl shadow-md transition-all font-sans ${
                    newWorkspaceName.trim()
                      ? 'cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  Buat Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT DETAIL TUGAS LENGKAP (PO VIEW) */}
      {isEditTaskModalOpen && editingTask && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans transition-all duration-300 ease-in-out">
          <div className="w-full max-w-lg bg-neutral-900/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 font-sans text-xs max-h-[90vh] flex flex-col justify-between transition-all duration-300 ease-in-out">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Edit3 className="w-4 h-4 text-zinc-300" />
                <span>Edit Detail Tugas</span>
              </div>
              <button
                onClick={() => {
                  setIsEditTaskModalOpen(false);
                  setEditingTask(null);
                }}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTaskEdit} className="space-y-3.5 flex-1 overflow-y-auto pr-1">
              {/* Edit Judul Tugas */}
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Judul Tugas</label>
                <input
                  type="text"
                  required
                  placeholder="Judul tugas..."
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full p-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans"
                />
              </div>

              {/* Edit Deskripsi / Brief */}
              <div className="space-y-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Deskripsi / Brief Singkat</label>
                <textarea
                  rows={3}
                  placeholder="Detail brief..."
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full p-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans resize-none"
                />
              </div>

              {/* Edit Tenggat Waktu (Deadline) + Presets */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Tenggat Waktu (Deadline)</label>
                  <div className="flex items-center gap-1 font-sans">
                    <button
                      type="button"
                      onClick={() => handleApplyDeadlinePreset(0, 'edit')}
                      className="text-[10px] bg-white/5 hover:bg-white/10 text-zinc-300 px-2 py-0.5 rounded border border-white/10 transition-colors duration-300 cursor-pointer"
                    >
                      Hari Ini (17:00)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyDeadlinePreset(1, 'edit')}
                      className="text-[10px] bg-white/5 hover:bg-white/10 text-zinc-300 px-2 py-0.5 rounded border border-white/10 transition-colors duration-300 cursor-pointer"
                    >
                      Besok (17:00)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyDeadlinePreset(3, 'edit')}
                      className="text-[10px] bg-white/5 hover:bg-white/10 text-zinc-300 px-2 py-0.5 rounded border border-white/10 transition-colors duration-300 cursor-pointer"
                    >
                      3 Hari
                    </button>
                  </div>
                </div>
                <input
                  type="datetime-local"
                  value={editDueDate}
                  onChange={e => setEditDueDate(e.target.value)}
                  className="w-full p-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-white/30 font-sans [color-scheme:dark]"
                />
              </div>

              {/* Edit Checklist DoD */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Checklist DoD ({editDodPoints.length}/10 Poin)</label>
                  {editDodPoints.length < 10 && (
                    <button
                      type="button"
                      onClick={handleAddEditDodPoint}
                      className="text-[10px] font-bold text-white hover:text-zinc-300 flex items-center gap-0.5 cursor-pointer transition-colors duration-300"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Tambah Poin</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {editDodPoints.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder={`DoD ${idx + 1}...`}
                        value={point}
                        onChange={e => handleEditDodPointChange(idx, e.target.value)}
                        className="flex-1 p-2 bg-neutral-950 border border-white/10 rounded-xl text-[11px] text-white font-sans focus:outline-hidden focus:border-white/30"
                      />
                      {editDodPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEditDodPoint(idx)}
                          className="w-6 h-6 rounded-lg bg-white/5 hover:bg-rose-950/80 border border-white/10 text-zinc-400 hover:text-rose-300 flex items-center justify-center cursor-pointer transition-colors duration-300 text-xs font-bold shrink-0"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions: Delete & Save */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-2">
                <button
                  type="button"
                  onClick={handleDeleteTask}
                  className="px-3.5 py-2 bg-rose-950/50 hover:bg-rose-900/80 border border-rose-800/60 text-rose-200 font-medium rounded-full cursor-pointer transition-colors duration-300 text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Tugas</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditTaskModalOpen(false);
                      setEditingTask(null);
                    }}
                    className="px-4 py-2 bg-neutral-800 text-zinc-300 font-medium rounded-full cursor-pointer hover:bg-neutral-700 transition-colors duration-300 text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-full shadow-md transition-colors duration-300 cursor-pointer text-xs"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KELOLA TAUTAN TIM (FULL CRUD FOR PO VIEW) */}
      {isManageLinksModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans transition-all duration-300 ease-in-out">
          <div className="w-full max-w-lg bg-neutral-900/95 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 font-sans text-xs max-h-[90vh] flex flex-col justify-between transition-all duration-300 ease-in-out">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Folder className="w-4 h-4 text-zinc-300" />
                <span>Kelola Tautan Tim ({currentWorkspace?.name})</span>
              </div>
              <button
                onClick={() => setIsManageLinksModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAllLinks} className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div className="space-y-3">
                {editableLinks.map((link, idx) => (
                  <div key={link.id || idx} className="p-3 bg-neutral-950 border border-white/10 rounded-2xl space-y-2 relative group">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">Tautan #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLinkRow(idx, link.id)}
                        className="p-1 bg-white/5 hover:bg-rose-950/80 border border-white/10 hover:border-rose-800 text-zinc-400 hover:text-rose-300 rounded-lg transition-colors duration-300 cursor-pointer"
                        title="Hapus Tautan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <div className="sm:col-span-5 space-y-0.5">
                        <label className="text-[10px] text-zinc-400 font-medium">Nama Tautan</label>
                        <input
                          type="text"
                          required
                          placeholder="misal: Drive Proyek"
                          value={link.title}
                          onChange={e => {
                            const updated = [...editableLinks];
                            updated[idx].title = e.target.value;
                            setEditableLinks(updated);
                          }}
                          className="w-full p-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans"
                        />
                      </div>

                      <div className="sm:col-span-7 space-y-0.5">
                        <label className="text-[10px] text-zinc-400 font-medium">URL</label>
                        <input
                          type="url"
                          required
                          placeholder="https://..."
                          value={link.url}
                          onChange={e => {
                            const updated = [...editableLinks];
                            updated[idx].url = e.target.value;
                            setEditableLinks(updated);
                          }}
                          className="w-full p-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddLinkRow}
                className="w-full py-2.5 border border-dashed border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 rounded-2xl text-xs text-white font-medium flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Tautan Baru</span>
              </button>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsManageLinksModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-zinc-300 font-medium rounded-full cursor-pointer hover:bg-neutral-700 transition-colors duration-300 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-full shadow-md transition-colors duration-300 cursor-pointer text-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INPUT ARANAN SOLUSI KENDALA (PO VIEW) */}
      {isResolveBlockerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 ease-in-out">
          <div className="w-full max-w-md bg-neutral-900/95 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs transition-all duration-300 ease-in-out">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <RotateCcw className="w-4 h-4 text-zinc-300" />
                <span>Solusi / Arahan Kendala</span>
              </div>
              <button
                onClick={() => setIsResolveBlockerModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitResolveBlocker} className="space-y-4 font-sans">
              <div className="space-y-1">
                <label className="block text-zinc-400 font-medium">Berikan Solusi / Arahan untuk Kendala Ini</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan arahan/solusi teknis..."
                  value={inputResolutionNote}
                  onChange={e => setInputResolutionNote(e.target.value)}
                  className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResolveBlockerModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-zinc-300 font-medium rounded-full cursor-pointer hover:bg-neutral-700 transition-colors duration-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!inputResolutionNote.trim()}
                  className={`px-5 py-2 font-medium rounded-full shadow-md flex items-center gap-1.5 transition-all duration-300 ${
                    inputResolutionNote.trim()
                      ? 'bg-white text-zinc-950 hover:bg-zinc-200 cursor-pointer'
                      : 'bg-neutral-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <span>Kirim Arahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INPUT CATATAN REVISI (PO VIEW - APA YANG PERLU DIPERBAIKI?) */}
      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 ease-in-out">
          <div className="w-full max-w-md bg-neutral-900/95 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs transition-all duration-300 ease-in-out">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-zinc-300" />
                <span>Catatan Revisi Tugas</span>
              </div>
              <button
                onClick={() => setIsRevisionModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRevisionNote} className="space-y-4 font-sans">
              <div className="space-y-1">
                <label className="block text-zinc-400 font-medium">Apa yang perlu diperbaiki?</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan poin revisi & arahan..."
                  value={inputRevisionNote}
                  onChange={e => setInputRevisionNote(e.target.value)}
                  className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-zinc-300 font-medium rounded-full cursor-pointer hover:bg-neutral-700 transition-colors duration-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!inputRevisionNote.trim()}
                  className={`px-5 py-2 font-medium rounded-full shadow-md flex items-center gap-1.5 transition-all duration-300 ${
                    inputRevisionNote.trim()
                      ? 'bg-white text-zinc-950 hover:bg-zinc-200 cursor-pointer'
                      : 'bg-neutral-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <span>Kirim Arahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LAPORKAN KENDALA (MEMBER VIEW) */}
      {isBlockerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 ease-in-out">
          <div className="w-full max-w-md bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs transition-all duration-300 ease-in-out">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-zinc-300" />
                <span>Laporkan Kendala</span>
              </div>
              <button
                onClick={() => setIsBlockerModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReportBlockerSubmit} className="space-y-4 font-sans">
              <textarea
                rows={3}
                required
                placeholder="Tuliskan kendala Anda..."
                value={blockerReason}
                onChange={e => setBlockerReason(e.target.value)}
                className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBlockerModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-zinc-300 font-medium rounded-full cursor-pointer hover:bg-neutral-700 transition-colors duration-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!blockerReason.trim()}
                  className={`px-5 py-2 font-medium rounded-full shadow-md flex items-center gap-1.5 transition-all duration-300 ${
                    blockerReason.trim()
                      ? 'bg-white text-zinc-950 hover:bg-zinc-200 cursor-pointer'
                      : 'bg-neutral-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <span>Kirim Kendala</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
