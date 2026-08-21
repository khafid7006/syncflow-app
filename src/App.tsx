import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { 
  Layers, Check, ExternalLink, 
  Figma, X, Mail,
  RotateCcw, Link as LinkIcon
} from 'lucide-react';
import { 
  UserProfile, Workspace, WorkspaceMemberDetail, 
  MemberTask, ProjectLink, ActivityLog 
} from './types';

// Import Layout Components
import { Navbar } from './components/layout/Navbar';
import { NoWorkspaceView } from './components/layout/NoWorkspaceView';
import { PODashboard } from './components/dashboard/PODashboard';
import { MemberDashboard } from './components/dashboard/MemberDashboard';

import Cropper from 'react-easy-crop';
import { getCroppedImg } from './lib/cropImage';

// Import UI Components
import { CustomGlassSelect, GlassSelectOption } from './components/ui/CustomGlassSelect';
import { CustomGlassRangeCalendar } from './components/ui/CustomGlassRangeCalendar';

// Import Modal Components
import { AccessCodeModal } from './components/modals/AccessCodeModal';
import { CreateWorkspaceModal } from './components/modals/CreateWorkspaceModal';
import { ManageMembersModal } from './components/modals/ManageMembersModal';
import { ManageLinksModal } from './components/modals/ManageLinksModal';
import { EditTaskModal } from './components/modals/EditTaskModal';
import { ResolveBlockerModal } from './components/modals/ResolveBlockerModal';
import { RevisionModal } from './components/modals/RevisionModal';
import { ReportBlockerModal } from './components/modals/ReportBlockerModal';

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

  if (diffMs < 0) return 'overdue';
  if (diffHours <= 6) return 'urgent';
  return 'normal';
};

const getRelativeDeadlineString = (isoString?: string) => {
  if (!isoString) return null;
  const deadline = new Date(isoString);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) {
    const overdueHours = Math.abs(diffHours);
    if (overdueHours < 24) return { text: `Terlewat ${overdueHours} jam`, status: 'overdue' };
    return { text: `Terlewat ${Math.abs(diffDays)} hari`, status: 'overdue' };
  }

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return { text: `Sisa ${diffMins} menit`, status: 'urgent' };
  }

  if (diffHours <= 6) {
    return { text: `Sisa ${diffHours} jam lagi`, status: 'urgent' };
  }

  if (diffHours < 24) {
    return { text: `Sisa ${diffHours} jam lagi`, status: 'normal' };
  }

  return { text: `Sisa ${diffDays} hari lagi`, status: 'normal' };
};

// HELPER DYNAMIC RENDER ICON UNTUK ASET TIM
const renderLinkIcon = (title: string, iconType?: string) => {
  const t = title.toLowerCase();
  if (iconType === 'figma' || t.includes('figma') || t.includes('desain') || t.includes('design') || t.includes('ui')) {
    return <Figma className="w-4 h-4 text-white" />;
  }
  return <LinkIcon className="w-4 h-4 text-white" />;
};

export const App: React.FC = () => {
  // Auth & Profile state
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // 1. INITIAL APP & WORKSPACE LOADING STATE
  const [isAppInitializing, setIsAppInitializing] = useState<boolean>(true);

  // MULTI-WORKSPACE STATES & WORKSPACE ROLE HIERARCHY
  const [userWorkspaces, setUserWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [activeWorkspaceRole, setActiveWorkspaceRole] = useState<'po' | 'pl' | 'member'>('member');
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState<boolean>(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState<boolean>(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>('');
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState<boolean>(false);
  const workspaceDropdownRef = useRef<HTMLDivElement>(null);

  // PIN-PROTECTED BENTO GRID WORKSPACE DIRECTORY STATES
  const [publicWorkspaces, setPublicWorkspaces] = useState<Workspace[]>([]);
  const [isPublicWorkspacesLoading, setIsPublicWorkspacesLoading] = useState<boolean>(true);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState<boolean>(false);
  const [selectedTargetWs, setSelectedTargetWs] = useState<Workspace | null>(null);
  const [inputInviteCode, setInputInviteCode] = useState<string>('');
  const [selectedTargetPod, setSelectedTargetPod] = useState<string>('Product Builder');
  const [isVerifyingCode, setIsVerifyingCode] = useState<boolean>(false);

  // Auth Form states
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [pod, setPod] = useState<'Product Builder' | 'BA' | 'QA' | 'Marketing'>('Product Builder');
  const [authRole, setAuthRole] = useState<'member' | 'owner'>('member');
  const [authError, setAuthError] = useState<string | null>(null);

  // Profile Pill Dropdown State
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Mode View Switcher state ('po' vs 'member')
  const [viewMode, setViewMode] = useState<'po' | 'member'>('member');

  // Global Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(prev => (prev === message ? null : prev));
    }, 3000);
  };

  // Dashboard Member Task & Workflow states
  const [memberTasksList, setMemberTasksList] = useState<MemberTask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<MemberTask | null>(null);
  const [taskTitle, setTaskTitle] = useState<string>('Buat Halaman Pembayaran Aplikasi');
  const [deliverableUrl, setDeliverableUrl] = useState<string>('');
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<'Dalam Pengerjaan' | 'Sedang Ditinjau PO' | 'Terkendala (Blocker)' | 'Perlu Revisi'>('Dalam Pengerjaan');

  // PO Dashboard states (Master Task Feed, Filter Tab, & Profiles)
  const [allTasks, setAllTasks] = useState<MemberTask[]>([]);
  const [blockedTasks, setBlockedTasks] = useState<MemberTask[]>([]);
  const [reviewTasks, setReviewTasks] = useState<MemberTask[]>([]);
  const [poTaskFeedFilter, setPoTaskFeedFilter] = useState<'active' | 'done'>('active');

  // WORKSPACE MEMBERS DIRECTORY STATES
  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState<boolean>(false);
  const [workspaceMembersList, setWorkspaceMembersList] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(true);

  // Dynamic Project Links State (Full CRUD backed by Supabase public.project_links)
  const [projectLinks, setProjectLinks] = useState<ProjectLink[]>([]);
  const [editableLinks, setEditableLinks] = useState<ProjectLink[]>([]);
  const [isManageLinksModalOpen, setIsManageLinksModalOpen] = useState<boolean>(false);

  // PO Quick Assignment Form states (Dynamic DoD list, Description, max 10 points & Due Date)
  const taskTitleInputRef = useRef<HTMLInputElement>(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [assigneeList, setAssigneeList] = useState<any[]>([]);
  const [isLoadingAssignees, setIsLoadingAssignees] = useState<boolean>(false);
  const [newAssignTaskTitle, setNewAssignTaskTitle] = useState<string>('');
  const [newAssignDescription, setNewAssignDescription] = useState<string>('');
  const [newAssignDueDate, setNewAssignDueDate] = useState<string>('');
  const [newAssignPriority, setNewAssignPriority] = useState<'normal' | 'urgent'>('normal');
  const [assignTargetType, setAssignTargetType] = useState<'individual' | 'pod' | 'all'>('individual');
  const [assignTargetPod, setAssignTargetPod] = useState<string>('Marketing');
  const [dodPoints, setDodPoints] = useState<string[]>(['', '', '']);
  const [isTaskSubmitSuccess, setIsTaskSubmitSuccess] = useState<boolean>(false);

  // EDIT TASK MODAL STATES (PO VIEW)
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<MemberTask | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editDodPoints, setEditDodPoints] = useState<string[]>(['']);

  // PO ACTION MODALS (REVISION & RESOLUTION NOTES)
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState<boolean>(false);
  const [selectedReviewTaskId, setSelectedReviewTaskId] = useState<string | null>(null);
  const [inputRevisionNote, setInputRevisionNote] = useState<string>('');

  const [isResolveBlockerModalOpen, setIsResolveBlockerModalOpen] = useState<boolean>(false);
  const [selectedBlockerTaskId, setSelectedBlockerTaskId] = useState<string | null>(null);
  const [inputResolutionNote, setInputResolutionNote] = useState<string>('');

  // MEMBER BLOCKER MODAL STATE
  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState<boolean>(false);
  const [blockerReason, setBlockerReason] = useState<string>('');

  // LIGHT AGILE MULTI-SPRINT STATES & HANDLERS
  const [sprintsList, setSprintsList] = useState<any[]>([]);
  const [activeSprint, setActiveSprint] = useState<any>(null);
  const [selectedSprintId, setSelectedSprintId] = useState<string>('all');
  const [isSprintDrawerOpen, setIsSprintDrawerOpen] = useState<boolean>(false);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [editingSprintId, setEditingSprintId] = useState<string | null>(null);

  // Form State
  const [sprintGoalInput, setSprintGoalInput] = useState<string>('');
  const [sprintBriefNotes, setSprintBriefNotes] = useState<string>('');
  const [sprintStartDate, setSprintStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [sprintEndDate, setSprintEndDate] = useState<string>('');
  const [sprintDocUrl, setSprintDocUrl] = useState<string>('');
  const [sprintDocName, setSprintDocName] = useState<string>('');
  const [isUploadingDoc, setIsUploadingDoc] = useState<boolean>(false);
  const [isSavingSprint, setIsSavingSprint] = useState<boolean>(false);

  // Ambil semua sprint per workspace
  const fetchAllSprints = async (workspaceId: string) => {
    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setSprintsList(data);
        const active = data.find((s) => s.status === 'active') || data[data.length - 1] || null;
        setActiveSprint(active);
        if (active) {
          setSprintGoalInput(active.goal_title || '');
          setSprintBriefNotes(active.brief_notes || '');
          setSprintDocUrl(active.document_url || '');
          setSprintDocName(active.document_name || '');
          setSprintStartDate(active.start_date || new Date().toISOString().split('T')[0]);
          setSprintEndDate(active.end_date || '');
        }
      } else {
        setSprintsList([]);
        setActiveSprint(null);
      }
    } catch (err) {
      console.error("Fetch sprints error:", err);
    }
  };

  // Handler Upload Dokumen Briefing ke Storage
  const handleSprintDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("⚠️ Ukuran file briefing maksimal 5 MB!");
      return;
    }

    setIsUploadingDoc(true);
    try {
      const filePath = `sprint_docs/${session.user.id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        setSprintDocUrl(publicUrlData.publicUrl);
        setSprintDocName(file.name);
        showToast("✓ File brief berhasil diunggah!");
      }
    } catch (err: any) {
      showToast(`Gagal unggah dokumen: ${err.message}`);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Handler Simpan Sprint (Draft atau Langsung Rilis/Active)
  const handleSaveSprint = async (targetStatus: 'draft' | 'active') => {
    if (!currentWorkspace?.id || !sprintGoalInput.trim() || !sprintEndDate) {
      showToast("⚠️ Mohon lengkapi judul dan rentang tanggal!");
      return;
    }
    setIsSavingSprint(true);

    try {
      // Jika targetStatus 'active', nonaktifkan active sprint yang lama
      if (targetStatus === 'active' && activeSprint && activeSprint.id !== editingSprintId) {
        await supabase
          .from('sprints')
          .update({ status: 'completed' })
          .eq('id', activeSprint.id);
      }

      const payload = {
        workspace_id: currentWorkspace.id,
        goal_title: sprintGoalInput.trim(),
        brief_notes: sprintBriefNotes.trim(),
        document_url: sprintDocUrl || null,
        document_name: sprintDocName || null,
        start_date: sprintStartDate,
        end_date: sprintEndDate,
        status: targetStatus,
        is_locked: targetStatus === 'active'
      };

      if (editingSprintId) {
        await supabase.from('sprints').update(payload).eq('id', editingSprintId);
      } else {
        await supabase.from('sprints').insert([payload]);
      }

      showToast(targetStatus === 'active' ? "🚀 Sprint berhasil dirilis ke tim!" : "💾 Sprint disimpan sebagai Draft");
      setEditingSprintId(null);
      fetchAllSprints(currentWorkspace.id);
    } catch (err: any) {
      showToast(`Gagal menyimpan sprint: ${err.message}`);
    } finally {
      setIsSavingSprint(false);
    }
  };

  // 1. SAFE DATE HELPER (MENCEGAH WHITE SCREEN ERROR)
  const safeGetDate = (dateStr?: string | null): Date | null => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const safeCalculateDaysLeft = (targetDate?: string | null): number => {
    const d = safeGetDate(targetDate);
    if (!d) return 0;
    const diff = d.getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // 2. FULL CRUD SPRINT HANDLERS
  const handleSelectSprint = (sprint: any) => {
    if (!sprint) return;
    setSelectedSprintId(sprint.id);
  };

  const handleOpenEditSprint = (sprint: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!sprint) return;
    setEditingSprintId(sprint.id);
    setSprintGoalInput(sprint.goal_title || '');
    setSprintBriefNotes(sprint.brief_notes || '');
    setSprintDocUrl(sprint.document_url || '');
    setSprintDocName(sprint.document_name || '');
    setSprintStartDate(sprint.start_date || new Date().toISOString().split('T')[0]);
    setSprintEndDate(sprint.end_date || '');
    setIsSprintDrawerOpen(true);
  };

  const handleOpenCreateSprint = () => {
    setEditingSprintId(null);
    setSprintGoalInput('');
    setSprintBriefNotes('');
    setSprintDocUrl('');
    setSprintDocName('');
    setSprintStartDate(new Date().toISOString().split('T')[0]);
    setSprintEndDate('');
    setIsSprintDrawerOpen(true);
  };

  const handleDeleteSprint = async (sprintId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus sprint ini? Tugas yang terkait akan dipindahkan ke backlog.")) return;

    try {
      const { error } = await supabase.from('sprints').delete().eq('id', sprintId);
      if (error) throw error;

      showToast("✓ Sprint berhasil dihapus.");
      
      const remaining = sprintsList.filter(s => s.id !== sprintId);
      setSprintsList(remaining);
      if (selectedSprintId === sprintId) {
        setSelectedSprintId(remaining.length > 0 ? remaining[0].id : 'all');
      }
    } catch (err: any) {
      showToast(`Gagal menghapus sprint: ${err.message || err}`);
    }
  };

  const handleToggleSprintStatus = async (sprintId: string, newStatus: 'draft' | 'active' | 'completed') => {
    try {
      if (newStatus === 'active' && currentWorkspace?.id) {
        await supabase
          .from('sprints')
          .update({ status: 'draft' })
          .eq('workspace_id', currentWorkspace.id)
          .eq('status', 'active');
      }

      const { error } = await supabase
        .from('sprints')
        .update({ status: newStatus, is_locked: newStatus === 'active' })
        .eq('id', sprintId);

      if (error) throw error;

      showToast(`✓ Status sprint diubah menjadi ${newStatus.toUpperCase()}`);
      if (currentWorkspace?.id) fetchAllSprints(currentWorkspace.id);
    } catch (err: any) {
      showToast(`Gagal update status: ${err.message || err}`);
    }
  };

  // Metrik DoD & Progress Sprint
  const activeTasksListForSprint = allTasks.length > 0 ? allTasks : memberTasksList;
  const totalDoDCount = activeTasksListForSprint.reduce(
    (acc, t) => acc + (t.checklist?.length || 1),
    0
  );
  const completedDoDCount = activeTasksListForSprint.reduce(
    (acc, t) => acc + (t.checklist?.filter((c: any) => c.done || c.is_checked)?.length || 0),
    0
  );
  const sprintProgressPct =
    totalDoDCount > 0 ? Math.round((completedDoDCount / totalDoDCount) * 100) : 0;

  // PROFILE & AVATAR CROPPER STATES
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCroppingModalOpen, setIsCroppingModalOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [editFullName, setEditFullName] = useState<string>('');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string>('');
  const [editPod, setEditPod] = useState<string>('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);

  const onCropComplete = (_: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  };

  // 1. Tangkap file saat dipilih -> Buka Cropper Modal
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      showToast("⚠️ Ukuran foto maksimal 500 KB!");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast("⚠️ Format file harus berupa gambar (JPG, PNG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageToCrop(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setIsCroppingModalOpen(true);
    });
    reader.readAsDataURL(file);
  };

  // 2. Upload potongan gambar ke Supabase Storage bucket 'avatars'
  const handleConfirmCropAndUpload = async () => {
    if (!imageToCrop || !croppedAreaPixels || !session?.user?.id) return;
    setIsUploadingAvatar(true);

    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const filePath = `${session.user.id}/${Date.now()}_avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        setEditAvatarUrl(publicUrlData.publicUrl);
        showToast("✓ Foto berhasil disesuaikan dan diunggah!");
        setIsCroppingModalOpen(false);
        setImageToCrop(null);
      }
    } catch (err: any) {
      console.error("Gagal crop/upload avatar:", err);
      showToast(`Gagal memproses foto: ${err.message || err}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Inisialisasi form profil saat modal dibuka
  const handleOpenProfileModal = () => {
    setEditFullName(profile?.full_name || '');
    setEditAvatarUrl(profile?.avatar_url || '');
    setEditPod(profile?.pod || 'Marketing');
    setIsProfileModalOpen(true);
  };

  // Simpan perubahan profil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setIsUpdatingProfile(true);

    const isUserPO = profile?.role === 'po' || profile?.role === 'owner' || activeWorkspaceRole === 'po';

    const updatedPayload = {
      full_name: editFullName.trim(),
      avatar_url: editAvatarUrl.trim() || null,
      pod: isUserPO ? 'Management' : editPod
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatedPayload)
        .eq('id', session.user.id);

      if (error) throw error;

      // 1. Update state profile secara lokal seketika
      setProfile((prev: any) => ({
        ...prev,
        ...updatedPayload
      }));

      // 2. Jika ada workspace aktif, refresh juga data tim/assignee
      if (currentWorkspace?.id) {
        if (typeof fetchPOData === 'function') fetchPOData(currentWorkspace.id);
        if (typeof fetchActiveTask === 'function') fetchActiveTask(session.user.id, currentWorkspace.id);
      }

      showToast("✓ Profil berhasil diperbarui!");
      setIsProfileModalOpen(false);
    } catch (err: any) {
      console.error("Save profile error:", err);
      showToast(`Gagal update profil: ${err.message || err}`);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Hapus akun permanen
  const handleDeleteAccount = async () => {
    if (!confirm("⚠️ PERINGATAN: Apakah Anda yakin ingin menghapus akun ini secara permanen? Seluruh riwayat tugas Anda akan dihapus.")) return;
    try {
      if (session?.user?.id) {
        await supabase.from('profiles').delete().eq('id', session.user.id);
      }
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.reload();
    } catch (err: any) {
      showToast(`Gagal menghapus akun: ${err.message}`);
    }
  };

  // Member DoD Checklist Items
  const [dodItems, setDodItems] = useState<{ id: number; text: string; checked: boolean; is_checked?: boolean }[]>([
    { id: 1, text: 'Gunakan komponen UI dari Figma', checked: false, is_checked: false },
    { id: 2, text: 'Sambungkan tombol ke halaman sukses', checked: false, is_checked: false },
    { id: 3, text: 'Lampirkan link hasil kerjaan', checked: false, is_checked: false },
  ]);

  // Calculate DoD Completion for Member Dashboard
  const completedDodCount = dodItems.filter(item => item.checked).length;
  const totalDodCount = dodItems.length;
  const isAllDoDCompleted = totalDodCount > 0 ? completedDodCount === totalDodCount : true;

  // Strict Role Check helper
  const isOwnerOrPo = profile?.role === 'owner' || activeWorkspaceRole === 'po';
  const isGlobalOwner = profile?.role === 'owner' || profile?.role === 'po';
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

  // Format daftar aktivitas dari data tasks yang ada di workspace
  const generateWorkspaceActivities = (tasks: MemberTask[]): ActivityLog[] => {
    const activities: ActivityLog[] = [];

    tasks.forEach((t) => {
      const name = t.profiles?.full_name || 'Member';
      const pod = t.profiles?.pod || 'Umum';

      // 1. Aktivitas Selesai (ACC PO)
      if (t.status === 'done') {
        activities.push({
          id: `done-${t.id || t.title}`,
          user_name: name,
          pod,
          action_type: 'done',
          task_title: t.title,
          timestamp: t.created_at || new Date().toISOString()
        });
      }

      // 2. Aktivitas Submit Hasil (Sedang Ditinjau)
      if (['review', 'in_review', 'UNDER_REVIEW'].includes(t.status) || t.submitted_at) {
        activities.push({
          id: `submit-${t.id || t.title}`,
          user_name: name,
          pod,
          action_type: 'submit',
          task_title: t.title,
          timestamp: t.submitted_at || t.created_at || new Date().toISOString()
        });
      }

      // 3. Aktivitas Blocker
      if (t.status === 'blocked' || t.is_blocked) {
        activities.push({
          id: `blocked-${t.id || t.title}`,
          user_name: name,
          pod,
          action_type: 'blocked',
          task_title: t.title,
          timestamp: t.created_at || new Date().toISOString()
        });
      }

      // 4. Aktivitas Revisi
      if (t.status === 'in_progress' && t.revision_note) {
        activities.push({
          id: `rev-${t.id || t.title}`,
          user_name: name,
          pod,
          action_type: 'revision',
          task_title: t.title,
          timestamp: t.created_at || new Date().toISOString()
        });
      }
    });

    // Urutkan aktivitas dari yang paling baru
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
  };

  const workspaceActivities = React.useMemo(() => {
    return generateWorkspaceActivities(allTasks);
  }, [allTasks]);

  const fetchPublicWorkspaces = async () => {
    setIsPublicWorkspacesLoading(true);
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('id, name, description, created_at, invite_code, owner_id')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Gagal memuat direktori workspace:", error);
      } else {
        setPublicWorkspaces(data as Workspace[] || []);
      }
    } catch (err: any) {
      console.error("Gagal memuat direktori workspace:", err);
    } finally {
      setIsPublicWorkspacesLoading(false);
    }
  };

  useEffect(() => {
    if (!currentWorkspace || userWorkspaces.length === 0) {
      fetchPublicWorkspaces();
    }
  }, [currentWorkspace?.id, userWorkspaces.length]);

  const handleOpenAccessCodeModal = (ws: Workspace) => {
    setSelectedTargetWs(ws);
    setInputInviteCode('');
    setSelectedTargetPod(profile?.pod || 'Product Builder');
    setIsAccessModalOpen(true);
  };

  // LOGIKA VERIFIKASI DATABASE (PIN MODAL)
  const handleVerifyAndJoinWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetWs?.id || !inputInviteCode.trim() || !session?.user?.id) return;

    setIsVerifyingCode(true);
    try {
      // 1. Cek kecocokan kode akses
      const { data: ws, error: checkErr } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', selectedTargetWs.id)
        .eq('invite_code', inputInviteCode.trim().toUpperCase())
        .maybeSingle();

      if (checkErr || !ws) {
        showToast("❌ Kode akses salah. Hubungi PO untuk meminta kode yang benar.");
        return;
      }

      // 2. Daftarkan user ke workspace_members menggunakan upsert
      const { error: joinErr } = await supabase
        .from('workspace_members')
        .upsert({
          workspace_id: ws.id,
          user_id: session.user.id,
          role: 'member',
          pod: selectedTargetPod
        }, { onConflict: 'workspace_id,user_id' });

      if (joinErr) {
        throw joinErr;
      }

      // 3. Simpan ke localStorage
      localStorage.setItem('syncflow_active_ws', ws.id);

      setIsAccessModalOpen(false);
      setInputInviteCode('');
      showToast(`✓ Berhasil bergabung dengan workspace "${ws.name}"!`);

      // Refresh data workspace user
      const updatedWorkspaces = await fetchUserWorkspaces(session.user.id);
      const joinedWs = updatedWorkspaces.find(w => w.id === ws.id) || { ...ws, role: 'member', pod: selectedTargetPod };
      setCurrentWorkspace(joinedWs);
      setActiveWorkspaceRole(joinedWs.role || 'member');
      setViewMode('member');

      await fetchActiveTask(session.user.id, ws.id);
      await fetchProjectLinks(ws.id);
      await fetchWorkspaceAssignees(ws.id);
    } catch (err: any) {
      console.error("Gagal bergabung:", err);
      showToast(`Gagal bergabung: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // 1. Fetch Session & Profile on Mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchOrCreateProfile(session.user);
      } else {
        setAuthLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchOrCreateProfile(session.user);
      } else {
        setProfile(null);
        setUserWorkspaces([]);
        setCurrentWorkspace(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. JANGAN HAPUS LOCALSTORAGE JIKA DATA SEMENTARA KOSONG (ANTI-WIPE INIT APP)
  useEffect(() => {
    let isMounted = true;

    const initApp = async () => {
      const userId = session?.user?.id;
      if (!userId) {
        if (isMounted) setIsAppInitializing(false);
        return;
      }

      if (isMounted) setIsAppInitializing(true);
      const workspaces = await fetchUserWorkspaces(userId);

      if (!isMounted) return;

      if (workspaces.length > 0) {
        const savedWsId = localStorage.getItem('syncflow_active_ws');
        const activeWs = workspaces.find(w => w.id === savedWsId) || workspaces[0];

        setCurrentWorkspace(activeWs);
        setActiveWorkspaceRole(activeWs.role || 'member');
        localStorage.setItem('syncflow_active_ws', activeWs.id);
      } else {
        // JANGAN HAPUS localStorage jika terjadi delay jaringan, hanya set state null jika memang user baru
        setCurrentWorkspace(null);
      }

      setIsAppInitializing(false);
    };

    if (session?.user && profile) {
      initApp();
    } else if (!authLoading && !session) {
      setIsAppInitializing(false);
    }

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id, profile?.id, authLoading]);

  // 2. STATE RESET SAAT SWITCH ATAU BUAT WORKSPACE & SCOPED FETCHING
  useEffect(() => {
    if (session?.user && currentWorkspace?.id) {
      // Immediate State Reset untuk mencegah data lama dari workspace lain tampil!
      setMemberTasksList([]);
      setSelectedTaskId(null);
      setAllTasks([]);
      setBlockedTasks([]);
      setReviewTasks([]);
      setProjectLinks([]);
      setActiveTask(null);
      setAssigneeList([]); // Reset list lama agar tidak bocor

      // Fetch data baru khusus untuk workspace terpilih
      fetchActiveTask(session.user.id, currentWorkspace.id);
      fetchProjectLinks(currentWorkspace.id);
      fetchPOData(currentWorkspace.id);
      fetchWorkspaceAssignees(currentWorkspace.id); // Fetch list anggota baru
      fetchAllSprints(currentWorkspace.id);
    }
  }, [currentWorkspace?.id, session?.user?.id]);

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

  // 4. REALTIME LISTENER SCOPE WITH WORKSPACE_ID FILTER & WORKSPACE MEMBERS
  useEffect(() => {
    if (!session?.user || !currentWorkspace?.id) return;

    const wsId = currentWorkspace.id;

    const channel = supabase
      .channel(`syncflow-realtime-ws-${wsId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `workspace_id=eq.${wsId}` 
        },
        () => {
          fetchActiveTask(session.user.id, wsId);
          fetchPOData(wsId);
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'project_links',
          filter: `workspace_id=eq.${wsId}` 
        },
        () => {
          fetchProjectLinks(wsId);
        }
      )
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'workspace_members',
          filter: `workspace_id=eq.${wsId}` 
        },
        () => {
          fetchPOData(wsId);
          fetchWorkspaceAssignees(wsId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspace?.id, session?.user?.id]);

  // Outside Click Listener for Profile Pill Dropdown & Workspace Selector
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (workspaceDropdownRef.current && !workspaceDropdownRef.current.contains(event.target as Node)) {
        setIsWorkspaceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // 3. GANTI ACTIVE WORKSPACE HANDLER (WITH LOCALSTORAGE PERSISTENCE)
  const handleSelectWorkspace = (ws: Workspace) => {
    setCurrentWorkspace(ws);
    setActiveWorkspaceRole(ws.role || (profile?.role === 'owner' ? 'po' : 'member'));
    localStorage.setItem('syncflow_active_ws', ws.id);
    setIsWorkspaceMenuOpen(false);
    fetchWorkspaceAssignees(ws.id);
    showToast(`Beralih ke workspace: ${ws.name}`);
  };

  // 2. LOGIKA DELETE WORKSPACE (STRICT CREATOR / PO AUTHORIZATION)
  const handleDeleteWorkspace = async (workspaceId: string, wsName: string) => {
    if (!window.confirm(`Yakin ingin menghapus workspace "${wsName}" beserta seluruh tugas dan data di dalamnya?`)) {
      return;
    }

    try {
      // 1. Hapus baris workspace dari Supabase
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;

      // 2. Clear state lokal
      const updatedWorkspaces = userWorkspaces.filter(w => w.id !== workspaceId);
      setUserWorkspaces(updatedWorkspaces);

      showToast(`Workspace "${wsName}" berhasil dihapus.`);

      // 3. Jika workspace yang dihapus sedang aktif, beralih ke workspace pertama / null
      if (currentWorkspace?.id === workspaceId) {
        if (updatedWorkspaces.length > 0) {
          const nextWs = updatedWorkspaces[0];
          setCurrentWorkspace(nextWs);
          setActiveWorkspaceRole(nextWs.role || 'member');
          localStorage.setItem('syncflow_active_ws', nextWs.id);
        } else {
          setCurrentWorkspace(null);
          localStorage.removeItem('syncflow_active_ws');
        }
      }

      await fetchPublicWorkspaces();
    } catch (err: any) {
      console.error("Gagal menghapus workspace:", err.message || err);
      showToast(`Gagal menghapus workspace: ${err.message || 'Terjadi kesalahan'}`);
    }
  };

  // 3. SIMPAN KE LOCALSTORAGE SAAT BUAT WORKSPACE
  const handleCreateWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = session?.user?.id;
    if (!newWorkspaceName.trim() || !userId) return;

    setIsCreatingWorkspace(true);
    try {
      // 1. Insert Workspace Baru dengan Invite Code
      const generatedInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: newWs, error: wsError } = await supabase
        .from('workspaces')
        .insert([{ 
          name: newWorkspaceName.trim(),
          created_by: userId,
          owner_id: userId,
          invite_code: generatedInviteCode
        }])
        .select()
        .single();

      if (wsError) throw wsError;

      // 2. Daftarkan pembuat sebagai role 'po'
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert([{
          workspace_id: newWs.id,
          user_id: userId,
          role: 'po',
          pod: profile?.pod || 'Project Owner'
        }]);

      if (memberError) {
        console.warn("workspace_members insert note:", memberError.message);
      }

      // 3. Update State Lokal & LocalStorage
      const createdWsObj: Workspace = { ...newWs, role: 'po', pod: profile?.pod || 'Project Owner' };
      setUserWorkspaces(prev => [createdWsObj, ...prev]);
      setCurrentWorkspace(createdWsObj);
      setActiveWorkspaceRole('po');
      setViewMode('po');
      localStorage.setItem('syncflow_active_ws', newWs.id);

      // 4. Tutup Modal & Reset Form
      setNewWorkspaceName('');
      setIsCreateWorkspaceModalOpen(false);
      
      // 5. Trigger fetch ulang data PO, Assignees & Direktori Publik
      await fetchWorkspaceAssignees(newWs.id);
      await fetchPOData(newWs.id);
      await fetchPublicWorkspaces();
      showToast(`✓ Workspace "${newWs.name}" berhasil dibuat! Kode Akses: ${generatedInviteCode}`);
    } catch (err: any) {
      console.error("Gagal membuat workspace:", err.message || err);
      showToast(`Gagal membuat workspace: ${err.message || 'Terjadi kesalahan jaringan'}`);
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  // 2. LOGIKA FETCHING ANGGOTA TIM (DIREKTORI ANGGOTA MODAL)
  const fetchWorkspaceMembersList = async () => {
    if (!currentWorkspace?.id) return;
    setIsLoadingMembers(true);

    try {
      // 1. Ambil membership workspace ini
      const { data: memberRows, error: memErr } = await supabase
        .from('workspace_members')
        .select('id, user_id, role, pod, created_at')
        .eq('workspace_id', currentWorkspace.id);

      if (memErr) throw memErr;

      if (!memberRows || memberRows.length === 0) {
        setWorkspaceMembersList([]);
        return;
      }

      // 2. Ambil seluruh profil akun untuk mapping nama & email
      const userIds = memberRows.map(m => m.user_id);
      const { data: profData, error: profErr } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profErr) throw profErr;

      const profileLookup = new Map((profData || []).map(p => [p.id, p]));

      // 3. Gabungkan data
      const mergedList = memberRows.map(m => {
        const userProf = profileLookup.get(m.user_id);
        return {
          id: m.id,
          user_id: m.user_id,
          role: m.role || 'member',
          pod: m.pod || 'General',
          full_name: userProf?.full_name || 'Member Tim',
          email: userProf?.email || '-'
        };
      });

      setWorkspaceMembersList(mergedList);
    } catch (err: any) {
      console.error("Gagal memuat list anggota:", err.message || err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceMembersList();
  }, [currentWorkspace?.id]);

  const handleOpenManageMembersModal = () => {
    if (currentWorkspace?.id) {
      fetchWorkspaceMembersList();
      setIsManageMembersModalOpen(true);
    }
  };

  const handleRemoveMember = async (memberRowId: string) => {
    if (!window.confirm("Keluarkan anggota ini dari workspace?")) return;
    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberRowId);

      if (error) throw error;
      setWorkspaceMembersList(prev => prev.filter(m => m.id !== memberRowId));
      showToast("✓ Anggota berhasil dikeluarkan dari workspace.");
      if (currentWorkspace?.id) {
        fetchPOData(currentWorkspace.id);
        fetchWorkspaceAssignees(currentWorkspace.id);
      }
    } catch (err: any) {
      alert(`Gagal mengeluarkan anggota: ${err.message || err}`);
    }
  };

  // 1. HARD-FILTER FETCHING PROJECT LINKS (PER WORKSPACE ID)
  const fetchProjectLinks = async (wsId?: string) => {
    const targetWsId = wsId || currentWorkspace?.id;
    if (!targetWsId) return;

    try {
      const { data, error } = await supabase
        .from('project_links')
        .select('*')
        .eq('workspace_id', targetWsId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Gagal memuat tautan proyek:", error.message);
      } else {
        setProjectLinks(data as ProjectLink[] || []);
      }
    } catch (err: any) {
      console.error("Gagal memuat tautan proyek:", err);
    }
  };

  const handleOpenManageLinksModal = () => {
    setEditableLinks(JSON.parse(JSON.stringify(projectLinks)));
    setIsManageLinksModalOpen(true);
  };

  const handleAddLinkRow = () => {
    setEditableLinks(prev => [
      ...prev,
      { id: `temp-${Date.now()}`, title: '', url: '', icon_type: 'link' }
    ]);
  };

  const handleRemoveLinkRow = async (index: number, linkId?: string) => {
    if (linkId && !linkId.startsWith('temp-')) {
      try {
        await supabase
          .from('project_links')
          .delete()
          .eq('id', linkId);
      } catch (err) {
        console.error("Gagal hapus link di db:", err);
      }
    }
    setEditableLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAllLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace?.id) return;

    try {
      const validLinks = editableLinks.filter(l => l.title.trim() && l.url.trim());

      for (const link of validLinks) {
        if (link.id && !link.id.startsWith('temp-')) {
          await supabase
            .from('project_links')
            .update({ 
              title: link.title.trim(), 
              url: link.url.trim(),
              workspace_id: currentWorkspace.id
            })
            .eq('id', link.id);
        } else {
          await supabase
            .from('project_links')
            .insert([{ 
              title: link.title.trim(), 
              url: link.url.trim(),
              workspace_id: currentWorkspace.id
            }]);
        }
      }

      showToast('Daftar tautan tim berhasil diperbarui!');
      setIsManageLinksModalOpen(false);
      fetchProjectLinks(currentWorkspace.id);
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
      } catch (err) {
        console.error("Error updating checklist:", err);
      }
    }
  };

  // 1. HARD-FILTER FETCH ACTIVE TASK MEMBER (PER WORKSPACE ID WITH TASK STACK)
  const fetchActiveTask = async (userId: string, wsId?: string) => {
    const targetWsId = wsId || currentWorkspace?.id;
    if (!targetWsId) return;

    try {
      // Ambil SEMUA tugas aktif milik user di workspace ini
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('workspace_id', targetWsId)
        .eq('assignee_id', userId)
        .in('status', ['in_progress', 'review', 'blocked'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rawTasks: MemberTask[] = data || [];

      // Smart sorting:
      // 1. Tugas revisi selalu prioritas tertinggi
      // 2. Urgent di atas normal
      // 3. Terbaru lebih dulu
      const sortedTasks = rawTasks.sort((a: any, b: any) => {
        const aIsRev = a.status === 'in_progress' && a.revision_note;
        const bIsRev = b.status === 'in_progress' && b.revision_note;
        if (aIsRev && !bIsRev) return -1;
        if (!aIsRev && bIsRev) return 1;

        const aIsUrgent = a.priority === 'urgent' || a.priority === 'URGENT' || a.priority === 'HIGH' || a.priority === 'CRITICAL';
        const bIsUrgent = b.priority === 'urgent' || b.priority === 'URGENT' || b.priority === 'HIGH' || b.priority === 'CRITICAL';
        if (aIsUrgent && !bIsUrgent) return -1;
        if (!aIsUrgent && bIsUrgent) return 1;

        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });

      setMemberTasksList(sortedTasks);

      if (tasks.length > 0) {
        // Prioritas pilihan:
        // 1. Task yang sedang aktif dipilih sebelumnya (jika masih ada di list)
        // 2. Task yang butuh revisi (urgent)
        // 3. Task pertama di daftar
        const activeItem = 
          tasks.find(t => t.id === selectedTaskId) ||
          tasks.find(t => t.status === 'in_progress' && t.revision_note) ||
          tasks[0];

        setSelectedTaskId(activeItem.id || null);
        setActiveTask(activeItem);
        setTaskTitle(activeItem.title || 'Tugas Member');
        
        const existingLink = activeItem.deliverable_link || activeItem.deliverable_url || '';
        
        // Sinkronisasi status visual
        if (activeItem.status === 'in_progress' && activeItem.revision_note) {
          setTaskStatus('Perlu Revisi');
          setDeliverableUrl(existingLink);
          setSubmittedUrl(null);
        } else if (['review', 'in_review', 'UNDER_REVIEW'].includes(activeItem.status)) {
          setTaskStatus('Sedang Ditinjau PO');
          setSubmittedUrl(existingLink || 'Link Tugas');
        } else if (activeItem.status === 'blocked' || activeItem.is_blocked) {
          setTaskStatus('Terkendala (Blocker)');
          setSubmittedUrl(null);
          if (activeItem.blocker_reason) setBlockerReason(activeItem.blocker_reason);
        } else {
          setTaskStatus('Dalam Pengerjaan');
          setDeliverableUrl(existingLink);
          setSubmittedUrl(null);
        }

        // Sinkronisasi DoD Checklist
        if (activeItem.checklist && Array.isArray(activeItem.checklist) && activeItem.checklist.length > 0) {
          setDodItems(activeItem.checklist.map((item: any, idx: number) => {
            const checkedVal = item.checked ?? item.is_checked ?? false;
            return {
              id: item.id || idx + 1,
              text: item.text || item.label || '',
              checked: checkedVal,
              is_checked: checkedVal
            };
          }));
        } else {
          setDodItems([]);
        }
      } else {
        setActiveTask(null);
        setSelectedTaskId(null);
        setDeliverableUrl('');
        setSubmittedUrl(null);
        setDodItems([]);
      }
    } catch (err: any) {
      console.error("Gagal load stack tugas member:", err.message || err);
      setActiveTask(null);
    }
  };

  const handleSelectTask = (task: MemberTask) => {
    setSelectedTaskId(task.id || null);
    setActiveTask(task);
    setTaskTitle(task.title || 'Tugas Member');
    const link = task.deliverable_link || task.deliverable_url || '';
    
    const isRevision = task.status === 'in_progress' && task.revision_note;
    const isReview = ['review', 'in_review', 'UNDER_REVIEW'].includes(task.status);
    const isBlocked = task.status === 'blocked' || task.is_blocked;

    if (isRevision) {
      setTaskStatus('Perlu Revisi');
      setDeliverableUrl(link);
      setSubmittedUrl(null);
    } else if (isReview) {
      setTaskStatus('Sedang Ditinjau PO');
      setSubmittedUrl(link || 'Link Tugas');
    } else if (isBlocked) {
      setTaskStatus('Terkendala (Blocker)');
      setSubmittedUrl(null);
      if (task.blocker_reason) setBlockerReason(task.blocker_reason);
    } else {
      setTaskStatus('Dalam Pengerjaan');
      setDeliverableUrl(link);
      setSubmittedUrl(null);
    }

    if (task.checklist && Array.isArray(task.checklist)) {
      setDodItems(task.checklist.map((item: any, idx: number) => ({
        id: item.id || idx + 1,
        text: item.text || item.label || '',
        checked: item.checked ?? item.is_checked ?? false,
        is_checked: item.checked ?? item.is_checked ?? false
      })));
    } else {
      setDodItems([]);
    }
  };

  // 3. DROPDOWN PENUGASAN BERBASIS ANGGOTA AKTIF WORKSPACE_MEMBERS
  const fetchPOData = async (wsId?: string) => {
    const targetWsId = wsId || currentWorkspace?.id;
    if (!targetWsId) return;

    try {
      // Fetch all tasks for PO Feed
      const { data: allTasksData, error: aErr } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles:assignee_id (
            id,
            full_name,
            pod
          )
        `)
        .eq('workspace_id', targetWsId)
        .order('created_at', { ascending: false });

      if (aErr) console.error("Error fetching all tasks:", aErr.message);
      if (allTasksData) setAllTasks(allTasksData);

      // Fetch blocked tasks
      const { data: blockedData, error: bErr } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles:assignee_id (
            id,
            full_name,
            pod
          )
        `)
        .eq('workspace_id', targetWsId)
        .or('status.eq.blocked,is_blocked.eq.true')
        .order('created_at', { ascending: false });

      if (bErr) console.error("Error fetching blocked tasks:", bErr.message);

      // Fetch review tasks
      const { data: reviewData, error: rErr } = await supabase
        .from('tasks')
        .select(`
          *,
          profiles:assignee_id (
            id,
            full_name,
            pod
          )
        `)
        .eq('workspace_id', targetWsId)
        .or('status.eq.review,status.eq.in_review,status.eq.UNDER_REVIEW')
        .order('created_at', { ascending: false });

      if (rErr) console.error("Error fetching review tasks:", rErr.message);

      if (blockedData) setBlockedTasks(blockedData);
      if (reviewData) setReviewTasks(reviewData);

      // Auto-fetch assignees setiap kali PO data di-fetch
      await fetchWorkspaceAssignees(targetWsId);
    } catch (err: any) {
      console.error('Fetch PO Data error:', err);
    }
  };

  // 1. REFACTOR FUNGSI FETCH ASSIGNEES DI APP.TSX
  const fetchWorkspaceAssignees = async (workspaceId: string) => {
    if (!workspaceId) return;
    setIsLoadingAssignees(true);

    try {
      // 1. Ambil membership di workspace ini
      const { data: memberRows, error: memberErr } = await supabase
        .from('workspace_members')
        .select('user_id, role, pod')
        .eq('workspace_id', workspaceId);

      if (memberErr || !memberRows || memberRows.length === 0) {
        setAssigneeList([]);
        return;
      }

      // 2. Ambil detail profil user
      const userIds = memberRows.map(m => m.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, pod')
        .in('id', userIds);

      const profileMap = new Map((profilesData || []).map(p => [p.id, p]));

      // 3. Gabungkan data anggota untuk dropdown
      const formattedAssignees = memberRows.map(m => {
        const p = profileMap.get(m.user_id);
        return {
          id: m.user_id,
          full_name: p?.full_name || p?.email?.split('@')[0] || 'Anggota Tim',
          email: p?.email || '',
          pod: m.pod || p?.pod || 'General',
          role: m.role || 'member'
        };
      });

      console.log("-> Assignee list loaded:", formattedAssignees);
      setAssigneeList(formattedAssignees);

      // Auto-select anggota non-PO jika tersedia, fallback ke anggota pertama
      if (formattedAssignees.length > 0) {
        const defaultMember = formattedAssignees.find(m => m.role !== 'po') || formattedAssignees[0];
        if (defaultMember) {
          setSelectedAssigneeId(defaultMember.id);
        }
      }
    } catch (err) {
      console.error("Gagal load assignees:", err);
      setAssigneeList([]);
    } finally {
      setIsLoadingAssignees(false);
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
        setProfile(data);
      } else {
        const newProfile: UserProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User SyncFlow',
          email: user.email,
          role: 'member',
          pod: 'Product Builder'
        };

        const { error: insertErr } = await supabase.from('profiles').insert(newProfile);
        if (insertErr) {
          console.error("Error insert profile:", insertErr.message);
        }
        setProfile(newProfile);
      }
    } catch (err: any) {
      console.error('Fetch profile error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  // 1. PERBAIKI FUNGSI fetchUserWorkspaces & FALLBACK PERSISTENCE
  const fetchUserWorkspaces = async (userId: string): Promise<Workspace[]> => {
    try {
      // 1. Ambil membership user
      const { data: memberRows, error: memberErr } = await supabase
        .from('workspace_members')
        .select('workspace_id, role, pod')
        .eq('user_id', userId);

      if (memberErr) {
        console.error("Gagal query workspace_members:", memberErr);
      }

      let joinedWsIds = (memberRows || []).map(m => m.workspace_id);

      // 2. Ambil juga workspace buatan user ini (Creator Fallback)
      const { data: createdWs, error: createdErr } = await supabase
        .from('workspaces')
        .select('*')
        .eq('created_by', userId);

      if (createdWs && createdWs.length > 0) {
        createdWs.forEach(cw => {
          if (!joinedWsIds.includes(cw.id)) joinedWsIds.push(cw.id);
        });
      }

      if (joinedWsIds.length === 0) {
        setUserWorkspaces([]);
        return [];
      }

      // 3. Ambil data detail seluruh workspace yang diikuti
      const { data: wsData, error: wsErr } = await supabase
        .from('workspaces')
        .select('*')
        .in('id', joinedWsIds);

      if (wsErr || !wsData) {
        console.error("Gagal fetch detail workspaces:", wsErr);
        return [];
      }

      // 4. Format workspace list dengan role yang akurat
      const fullList: Workspace[] = wsData.map(ws => {
        const mem = (memberRows || []).find(m => m.workspace_id === ws.id);
        const isCreator = ws.created_by === userId || ws.owner_id === userId;
        return {
          ...ws,
          role: (isCreator ? 'po' : mem?.role || 'member') as 'po' | 'pl' | 'member',
          pod: mem?.pod || (isCreator ? 'Project Owner' : 'General')
        };
      });

      console.log("-> Workspaces berhasil dimuat:", fullList);
      setUserWorkspaces(fullList);
      return fullList;
    } catch (err) {
      console.error("Exception fetchUserWorkspaces:", err);
      return [];
    }
  };

  // Auth Submit Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });

        if (error) throw error;
        if (data.user) {
          const targetPod = authRole === 'owner' ? 'Management' : pod;
          const newProf: UserProfile = {
            id: data.user.id,
            full_name: fullName,
            email: email,
            role: authRole,
            pod: targetPod
          };

          await supabase.from('profiles').upsert(newProf);
          setProfile(newProf);
          showToast('Akun berhasil dibuat! Selamat datang di SyncFlow.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        showToast('Berhasil masuk!');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Terjadi kesalahan autentikasi');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsProfileDropdownOpen(false);
    setProfile(null);
    setUserWorkspaces([]);
    setCurrentWorkspace(null);
    localStorage.removeItem('syncflow_active_ws');
    showToast('Berhasil keluar dari akun.');
  };

  // 2. SUBMIT DELIVERABLE DENGAN TIMESTAMP PENGUMPULAN
  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableUrl.trim() || !activeTask?.id) return;

    if (!isAllDoDCompleted) {
      showToast('⚠️ Selesaikan semua poin checklist DoD terlebih dahulu!');
      return;
    }

    try {
      const nowIso = new Date().toISOString();

      const { error } = await supabase
        .from('tasks')
        .update({
          deliverable_link: deliverableUrl.trim(),
          deliverable_url: deliverableUrl.trim(),
          status: 'review',
          is_blocked: false,
          blocker_reason: null,
          revision_note: null,
          submitted_at: nowIso,
          checklist: dodItems
        })
        .eq('id', activeTask.id);

      if (error) throw error;

      setTaskStatus('Sedang Ditinjau PO');
      setSubmittedUrl(deliverableUrl.trim());
      showToast('✓ Hasil pekerjaan berhasil diserahkan ke PO!');
      if (session?.user?.id && currentWorkspace?.id) {
        fetchActiveTask(session.user.id, currentWorkspace.id);
      }
    } catch (err: any) {
      showToast(`Gagal menyerahkan: ${err.message}`);
    }
  };

  // 3. MEMBER SUBMIT BLOCKER WITH SUPABASE PERSISTENCE
  const handleReportBlockerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockerReason.trim() || !activeTask?.id) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'blocked',
          is_blocked: true,
          blocker_reason: blockerReason.trim()
        })
        .eq('id', activeTask.id);

      if (error) throw error;

      setTaskStatus('Terkendala (Blocker)');
      setIsBlockerModalOpen(false);
      showToast('🚨 Kendala berhasil dilaporkan ke PO!');
      if (session?.user?.id && currentWorkspace?.id) {
        fetchActiveTask(session.user.id, currentWorkspace.id);
      }
    } catch (err: any) {
      showToast(`Gagal melaporkan kendala: ${err.message}`);
    }
  };

  // PO Action Handlers
  const handleAcceptReview = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'done', is_blocked: false })
        .eq('id', taskId);

      if (error) throw error;
      showToast('✓ Tugas berhasil di-ACC & ditandai Selesai!');
      if (currentWorkspace?.id) fetchPOData(currentWorkspace.id);
    } catch (err: any) {
      showToast(`Gagal menyetujui: ${err.message}`);
    }
  };

  const handleOpenRevisionModal = (taskId: string) => {
    setSelectedReviewTaskId(taskId);
    setInputRevisionNote('');
    setIsRevisionModalOpen(true);
  };

  const handleSubmitRevisionNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewTaskId || !inputRevisionNote.trim()) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'in_progress',
          revision_note: inputRevisionNote.trim()
        })
        .eq('id', selectedReviewTaskId);

      if (error) throw error;

      setIsRevisionModalOpen(false);
      setSelectedReviewTaskId(null);
      setInputRevisionNote('');
      showToast('Catatan revisi berhasil dikirim ke Member!');
      if (currentWorkspace?.id) fetchPOData(currentWorkspace.id);
    } catch (err: any) {
      showToast(`Gagal mengirim revisi: ${err.message}`);
    }
  };

  const handleOpenResolveBlockerModal = (taskId: string) => {
    setSelectedBlockerTaskId(taskId);
    setInputResolutionNote('');
    setIsResolveBlockerModalOpen(true);
  };

  const handleSubmitResolveBlocker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlockerTaskId || !inputResolutionNote.trim()) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'in_progress',
          is_blocked: false,
          resolution_note: inputResolutionNote.trim()
        })
        .eq('id', selectedBlockerTaskId);

      if (error) throw error;

      setIsResolveBlockerModalOpen(false);
      setSelectedBlockerTaskId(null);
      setInputResolutionNote('');
      showToast('💡 Arahan solusi berhasil dikirim ke Member!');
      if (currentWorkspace?.id) fetchPOData(currentWorkspace.id);
    } catch (err: any) {
      showToast(`Gagal menyelesaikan kendala: ${err.message}`);
    }
  };

  // 3. MUTASI INSERT WAJIB INJECT WORKSPACE_ID (PO KIRIM TUGAS BARU - MULTI ASSIGN & POD BROADCAST)
  const handleCreateNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignTaskTitle.trim() || !currentWorkspace?.id) return;

    // 1. Tentukan target user IDs berdasarkan mode target
    let targetUserIds: string[] = [];

    if (assignTargetType === 'individual') {
      const targetId = selectedAssigneeId || assigneeList.find(m => m.role !== 'po')?.id || assigneeList[0]?.id;
      if (!targetId) {
        showToast("Pilih anggota tim penerima tugas.");
        return;
      }
      targetUserIds = [targetId];
    } else if (assignTargetType === 'pod') {
      // Filter seluruh member yang ada di POD terpilih (Kecualikan PO)
      targetUserIds = assigneeList
        .filter(m => m.role !== 'po' && (m.pod || '').toLowerCase() === assignTargetPod.toLowerCase())
        .map(m => m.id);

      if (targetUserIds.length === 0) {
        showToast(`Belum ada anggota di divisi ${assignTargetPod}.`);
        return;
      }
    } else if (assignTargetType === 'all') {
      // Filter seluruh member di workspace ini (Kecualikan PO)
      targetUserIds = assigneeList
        .filter(m => m.role !== 'po')
        .map(m => m.id);

      if (targetUserIds.length === 0) {
        showToast("Belum ada anggota (non-PO) di workspace ini.");
        return;
      }
    }

    const checklistItems = dodPoints
      .filter(p => p.trim().length > 0)
      .map((text, idx) => ({
        id: idx + 1,
        text: text.trim(),
        checked: false,
        is_checked: false,
      }));

    const dueDateIso = newAssignDueDate ? new Date(newAssignDueDate).toISOString() : null;
    const targetSprintId = selectedSprintId === 'all' ? (activeSprint?.id || null) : selectedSprintId;

    // 2. Buat batch rows untuk di-insert sekaligus
    const taskRows = targetUserIds.map(userId => ({
      workspace_id: currentWorkspace.id,
      sprint_id: targetSprintId,
      assignee_id: userId,
      title: newAssignTaskTitle.trim(),
      description: newAssignDescription.trim() || null,
      due_date: dueDateIso,
      priority: newAssignPriority,
      checklist: checklistItems,
      status: 'in_progress',
    }));

    try {
      const { error } = await supabase
        .from('tasks')
        .insert(taskRows);

      if (error) {
        console.error("Create task error:", error.message);
        showToast(`Gagal penugasan: ${error.message}`);
      } else {
        const targetLabel = 
          assignTargetType === 'individual' ? (assigneeList.find(m => m.id === targetUserIds[0])?.full_name || 'Member') :
          assignTargetType === 'pod' ? `Divisi ${assignTargetPod} (${targetUserIds.length} orang)` :
          `Seluruh Tim (${targetUserIds.length} orang)`;

        showToast(`✓ Tugas berhasil dikirim ke ${targetLabel}`);

        // Reset form state to defaults
        setNewAssignTaskTitle('');
        setNewAssignDescription('');
        setNewAssignDueDate('');
        setNewAssignPriority('normal');
        setDodPoints(['', '', '']);

        // Trigger visual submit success animation
        setIsTaskSubmitSuccess(true);
        setTimeout(() => setIsTaskSubmitSuccess(false), 1500);

        // Auto-focus Judul Tugas input
        setTimeout(() => {
          taskTitleInputRef.current?.focus();
        }, 100);

        fetchPOData(currentWorkspace.id);
      }
    } catch (err: any) {
      console.error("Gagal broadcast tugas:", err);
      showToast(`Gagal penugasan: ${err.message || err}`);
    }
  };

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

  // EDIT TASK MODAL HANDLERS
  const handleOpenEditTaskModal = (task: MemberTask) => {
    setEditingTask(task);
    setEditTitle(task.title || '');
    setEditDescription(task.description || '');

    if (task.due_date) {
      const d = new Date(task.due_date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      setEditDueDate(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      setEditDueDate('');
    }

    if (task.checklist && Array.isArray(task.checklist) && task.checklist.length > 0) {
      setEditDodPoints(task.checklist.map(item => item.text || item.label || ''));
    } else {
      setEditDodPoints(['']);
    }

    setIsEditTaskModalOpen(true);
  };

  const handleSaveTaskEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask?.id || !editTitle.trim()) return;

    try {
      const checklistItems = editDodPoints
        .filter(p => p.trim().length > 0)
        .map((text, idx) => ({
          id: idx + 1,
          text: text.trim(),
          checked: false,
          is_checked: false
        }));

      const dueDateIso = editDueDate ? new Date(editDueDate).toISOString() : null;

      const { error } = await supabase
        .from('tasks')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          due_date: dueDateIso,
          checklist: checklistItems
        })
        .eq('id', editingTask.id);

      if (error) throw error;

      showToast('✓ Detail tugas berhasil diperbarui!');
      setIsEditTaskModalOpen(false);
      setEditingTask(null);
      if (currentWorkspace?.id) fetchPOData(currentWorkspace.id);
    } catch (err: any) {
      console.error("Save edit task error:", err);
      showToast(`Gagal menyimpan edit: ${err.message || err}`);
    }
  };

  const handleDeleteTask = async () => {
    if (!editingTask?.id) return;
    if (!window.confirm(`Yakin ingin menghapus tugas "${editingTask.title}"?`)) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', editingTask.id);

      if (error) throw error;

      showToast('✓ Tugas berhasil dihapus.');
      setIsEditTaskModalOpen(false);
      setEditingTask(null);
      if (currentWorkspace?.id) fetchPOData(currentWorkspace.id);
    } catch (err: any) {
      console.error("Delete task error:", err);
      showToast(`Gagal menghapus tugas: ${err.message || err}`);
    }
  };

  // Sprint yang sedang aktif dipilih
  const currentSelectedSprint = React.useMemo(() => {
    if (selectedSprintId === 'all') return activeSprint || sprintsList[0] || null;
    return sprintsList.find((s) => s.id === selectedSprintId) || null;
  }, [selectedSprintId, sprintsList, activeSprint]);

  // Filter tugas per sprint untuk Gantt bulanan
  const filteredTasksForGantt = React.useMemo(() => {
    if (selectedSprintId === 'all') return allTasks;
    return allTasks.filter((t) => t.sprint_id === selectedSprintId);
  }, [allTasks, selectedSprintId]);

  // Filter tasks for PO Task Feed (Active vs Done)
  const filteredMasterTasks = filteredTasksForGantt.filter(t => {
    if (poTaskFeedFilter === 'done') {
      return t.status === 'done';
    }
    return t.status !== 'done';
  });

  // Calculate metrics for PO View right column
  const activeTasksCount = allTasks.filter(t => t.status !== 'done' && !t.is_blocked && t.status !== 'blocked').length;
  const blockedTasksCount = allTasks.filter(t => t.status === 'blocked' || t.is_blocked).length;
  const doneTasksCount = allTasks.filter(t => t.status === 'done').length;

  // Login & SignUp Screen (Strict Dark Theme & Backdrop Blur)
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div 
          className="fixed inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity pointer-events-none scale-105"
          style={{ backgroundImage: `url('/assets/dark_stone_bg_1787219104310.png')` }}
        />

        <div className="relative z-10 w-full max-w-md bg-neutral-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 shadow-2xl space-y-6 font-sans">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white mx-auto shadow-md">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">SyncFlow</h1>
            <p className="text-xs text-zinc-400 font-sans">Sistem Monitoring Agile & Manajemen Sprint Tim</p>
          </div>

          {authError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xl font-sans">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4 font-sans text-xs">
            {isSignUp && (
              <div className="space-y-1">
                <label className="block text-zinc-400 font-medium">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full p-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-white/30 font-sans"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-zinc-400 font-medium">Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 pl-9 bg-neutral-950 border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-white/30 font-sans"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-zinc-400 font-medium">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-white/30 font-sans"
              />
            </div>

            {isSignUp && (
              <div className="grid grid-cols-2 gap-3">
                {authRole === 'owner' ? (
                  <div className="space-y-1">
                    <label className="block text-zinc-400 font-medium text-xs">Pod / Divisi *</label>
                    <input
                      type="text"
                      readOnly
                      value="Management / Lead"
                      className="w-full p-2.5 bg-neutral-900 border border-white/10 rounded-xl text-zinc-400 font-sans cursor-not-allowed text-xs font-semibold"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="block text-zinc-400 font-medium text-xs">Pod / Divisi *</label>
                    <CustomGlassSelect
                      theme="dark"
                      value={pod}
                      onChange={val => setPod(val as any)}
                      options={[
                        { value: 'Product Builder', label: 'Product Builder' },
                        { value: 'BA', label: 'Business Analyst' },
                        { value: 'UI/UX Designer', label: 'UI/UX Designer' },
                        { value: 'QA', label: 'QA & Testing' },
                        { value: 'Marketing', label: 'Marketing' },
                        { value: 'General', label: 'General' },
                      ]}
                      placeholder="Pilih Pod..."
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-zinc-400 font-medium text-xs">Peran *</label>
                  <CustomGlassSelect
                    theme="dark"
                    value={authRole}
                    onChange={val => {
                      const selectedRole = val as 'member' | 'owner';
                      setAuthRole(selectedRole);
                      if (selectedRole === 'owner') {
                        setPod('Management' as any);
                      } else {
                        setPod('Product Builder');
                      }
                    }}
                    options={[
                      { value: 'member', label: 'Member', badge: 'Member' },
                      { value: 'owner', label: 'Project Owner', badge: 'PO' },
                    ]}
                    placeholder="Pilih Peran..."
                  />
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

  // 1 & 4. INITIAL WORKSPACE LOADING SKELETON / SPINNER GUARD
  if (isAppInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] text-white/50 text-xs font-sans">
        <div className="flex items-center gap-2 font-sans">
          <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
          <span>Memuat Workspace...</span>
        </div>
      </div>
    );
  }

  // User Profile metadata (Clean Username - Hapus angka duplikat auth/tanda kurung)
  const rawUserName = profile?.full_name || session?.user?.email?.split('@')[0] || 'Anggota Tim';
  const userName = rawUserName.replace(/\s*\(\d+\)$/, '').replace(/\s+\d+$/, '').trim();

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
        
        {/* TOP BAR NAVBAR */}
        <Navbar
          currentWorkspace={currentWorkspace}
          userWorkspaces={userWorkspaces}
          isWorkspaceMenuOpen={isWorkspaceMenuOpen}
          setIsWorkspaceMenuOpen={setIsWorkspaceMenuOpen}
          workspaceDropdownRef={workspaceDropdownRef}
          isGlobalOwner={isGlobalOwner}
          onSelectWorkspace={handleSelectWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          onOpenCreateWorkspaceModal={() => setIsCreateWorkspaceModalOpen(true)}
          isPoOrPlRole={isPoOrPlRole}
          isOwnerOrPo={isOwnerOrPo}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isProfileDropdownOpen={isProfileDropdownOpen}
          setIsProfileDropdownOpen={setIsProfileDropdownOpen}
          profileDropdownRef={profileDropdownRef}
          userName={userName}
          userRoleDisplay={userRoleDisplay}
          userEmail={session?.user?.email}
          onSignOut={handleSignOut}
          profile={profile}
          userId={session?.user?.id}
          notificationsList={workspaceActivities}
          onOpenProfileModal={handleOpenProfileModal}
          isPlRole={isPlRole}
        />

        {/* WORKSPACE CONDITIONAL RENDERING GUARD */}
        {!currentWorkspace || userWorkspaces.length === 0 ? (
          <NoWorkspaceView
            onCreateWorkspace={() => setIsCreateWorkspaceModalOpen(true)}
            profile={profile}
            onOpenAccessModal={handleOpenAccessCodeModal}
          />
        ) : !isPoOrPlRole || viewMode === 'member' ? (
          <MemberDashboard
            currentWorkspace={currentWorkspace}
            activeTask={activeTask}
            memberTasksList={memberTasksList}
            teamNotifications={workspaceActivities}
            selectedTaskId={selectedTaskId}
            onSelectTask={handleSelectTask}
            taskStatus={taskStatus}
            taskTitle={taskTitle}
            userName={userName}
            userPod={profile?.pod || 'Product Builder'}
            teamMembers={workspaceMembersList.length > 0 ? workspaceMembersList : assigneeList}
            getRelativeDeadlineString={getRelativeDeadlineString}
            completedDodCount={completedDodCount}
            totalDodCount={totalDodCount}
            dodItems={dodItems}
            onToggleDod={toggleDod}
            deliverableUrl={deliverableUrl}
            setDeliverableUrl={setDeliverableUrl}
            submittedUrl={submittedUrl}
            onSubmitDeliverable={handleSubmitDeliverable}
            isAllDoDCompleted={isAllDoDCompleted}
            onOpenReportBlockerModal={() => setIsBlockerModalOpen(true)}
            projectLinks={projectLinks}
            renderLinkIcon={renderLinkIcon}
            profile={profile}
            onOpenProfileModal={handleOpenProfileModal}
          />
        ) : (
          <PODashboard
            currentWorkspace={currentWorkspace}
            allTasks={allTasks}
            activities={workspaceActivities}
            filteredMasterTasks={filteredMasterTasks}
            poTaskFeedFilter={poTaskFeedFilter}
            setPoTaskFeedFilter={setPoTaskFeedFilter}
            userName={userName}
            isPoOrPlRole={isPoOrPlRole}
            onOpenEditTaskModal={handleOpenEditTaskModal}
            onOpenResolveBlockerModal={handleOpenResolveBlockerModal}
            onAcceptReview={handleAcceptReview}
            onOpenRevisionModal={handleOpenRevisionModal}
            selectedAssigneeId={selectedAssigneeId}
            setSelectedAssigneeId={setSelectedAssigneeId}
            assignTargetType={assignTargetType}
            setAssignTargetType={setAssignTargetType}
            selectedTargetPod={assignTargetPod}
            setSelectedTargetPod={setAssignTargetPod}
            isLoadingAssignees={isLoadingAssignees}
            assigneeList={assigneeList}
            taskTitleInputRef={taskTitleInputRef}
            newAssignTaskTitle={newAssignTaskTitle}
            setNewAssignTaskTitle={setNewAssignTaskTitle}
            newAssignDescription={newAssignDescription}
            setNewAssignDescription={setNewAssignDescription}
            newAssignDueDate={newAssignDueDate}
            setNewAssignDueDate={setNewAssignDueDate}
            newAssignPriority={newAssignPriority}
            setNewAssignPriority={setNewAssignPriority}
            dodPoints={dodPoints}
            onApplyDeadlinePreset={handleApplyDeadlinePreset}
            onAddDodPoint={handleAddDodPoint}
            onRemoveDodPoint={handleRemoveDodPoint}
            onDodPointChange={handleDodPointChange}
            onCreateNewTask={handleCreateNewTask}
            isTaskSubmitSuccess={isTaskSubmitSuccess}
            activeTasksCount={activeTasksCount}
            blockedTasksCount={blockedTasksCount}
            doneTasksCount={doneTasksCount}
            projectLinks={projectLinks}
            onOpenManageMembersModal={handleOpenManageMembersModal}
            onOpenManageLinksModal={handleOpenManageLinksModal}
            renderLinkIcon={renderLinkIcon}
            formatDeadline={formatDeadline}
            getDeadlineStatus={getDeadlineStatus}
            profile={profile}
            onOpenProfileModal={handleOpenProfileModal}
            activeSprint={activeSprint}
            selectedSprintId={selectedSprintId}
            setSelectedSprintId={setSelectedSprintId}
            isSprintDrawerOpen={isSprintDrawerOpen}
            setIsSprintDrawerOpen={setIsSprintDrawerOpen}
            currentMonthDate={currentMonthDate}
            setCurrentMonthDate={setCurrentMonthDate}
            currentSelectedSprint={currentSelectedSprint}
            filteredTasksForGantt={filteredTasksForGantt}
            onOpenSprintModal={() => setIsSprintModalOpen(true)}
            totalDoDCount={totalDoDCount}
            completedDoDCount={completedDoDCount}
            sprintProgressPct={sprintProgressPct}
            safeGetDate={safeGetDate}
            calculateDaysLeft={safeCalculateDaysLeft}
            handleSelectSprint={handleSelectSprint}
            handleOpenEditSprint={handleOpenEditSprint}
            handleOpenCreateSprint={handleOpenCreateSprint}
            handleDeleteSprint={handleDeleteSprint}
            handleToggleSprintStatus={handleToggleSprintStatus}
            isPlRole={isPlRole}
            activeWorkspaceRole={activeWorkspaceRole}
            sprintStartDate={sprintStartDate}
            setSprintStartDate={setSprintStartDate}
            sprintEndDate={sprintEndDate}
            setSprintEndDate={setSprintEndDate}
            sprintGoalInput={sprintGoalInput}
            setSprintGoalInput={setSprintGoalInput}
            isSavingSprint={isSavingSprint}
            sprintsList={sprintsList}
            editingSprintId={editingSprintId}
            setEditingSprintId={setEditingSprintId}
            sprintBriefNotes={sprintBriefNotes}
            setSprintBriefNotes={setSprintBriefNotes}
            sprintDocUrl={sprintDocUrl}
            setSprintDocUrl={setSprintDocUrl}
            sprintDocName={sprintDocName}
            setSprintDocName={setSprintDocName}
            isUploadingDoc={isUploadingDoc}
            handleSprintDocUpload={handleSprintDocUpload}
            handleSaveSprint={handleSaveSprint}
          />
        )}

        {/* FOOTER */}
        <footer className="w-full text-center py-2 text-xs text-zinc-500 font-sans">
          SyncFlow • Strict Monochrome Glassmorphism
        </footer>

      </div>

      {/* ALL MODAL DIALOGS */}
      <AccessCodeModal
        isOpen={isAccessModalOpen}
        selectedWorkspace={selectedTargetWs}
        inputInviteCode={inputInviteCode}
        setInputInviteCode={setInputInviteCode}
        selectedTargetPod={selectedTargetPod}
        setSelectedTargetPod={setSelectedTargetPod}
        isVerifyingCode={isVerifyingCode}
        onClose={() => setIsAccessModalOpen(false)}
        onVerifyAndJoin={handleVerifyAndJoinWorkspace}
      />

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        newWorkspaceName={newWorkspaceName}
        setNewWorkspaceName={setNewWorkspaceName}
        isCreatingWorkspace={isCreatingWorkspace}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
        onCreateWorkspaceSubmit={handleCreateWorkspaceSubmit}
      />

      <ManageMembersModal
        isOpen={isManageMembersModalOpen}
        currentWorkspace={currentWorkspace}
        workspaceMembersList={workspaceMembersList}
        isLoadingMembers={isLoadingMembers}
        currentUserId={session?.user?.id}
        activeWorkspaceRole={activeWorkspaceRole}
        onClose={() => setIsManageMembersModalOpen(false)}
        onRemoveMember={handleRemoveMember}
        showToast={showToast}
      />

      <ManageLinksModal
        isOpen={isManageLinksModalOpen}
        currentWorkspace={currentWorkspace}
        editableLinks={editableLinks}
        setEditableLinks={setEditableLinks}
        onClose={() => setIsManageLinksModalOpen(false)}
        onSaveAllLinks={handleSaveAllLinks}
        onAddLinkRow={handleAddLinkRow}
        onRemoveLinkRow={handleRemoveLinkRow}
      />

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        editingTask={editingTask}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
        editDueDate={editDueDate}
        setEditDueDate={setEditDueDate}
        editDodPoints={editDodPoints}
        setEditDodPoints={setEditDodPoints}
        onClose={() => {
          setIsEditTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSaveTaskEdit={handleSaveTaskEdit}
        onDeleteTask={handleDeleteTask}
        onApplyDeadlinePreset={handleApplyDeadlinePreset}
      />

      <ResolveBlockerModal
        isOpen={isResolveBlockerModalOpen}
        inputResolutionNote={inputResolutionNote}
        setInputResolutionNote={setInputResolutionNote}
        onClose={() => setIsResolveBlockerModalOpen(false)}
        onSubmitResolveBlocker={handleSubmitResolveBlocker}
      />

      <RevisionModal
        isOpen={isRevisionModalOpen}
        inputRevisionNote={inputRevisionNote}
        setInputRevisionNote={setInputRevisionNote}
        onClose={() => setIsRevisionModalOpen(false)}
        onSubmitRevisionNote={handleSubmitRevisionNote}
      />

      <ReportBlockerModal
        isOpen={isBlockerModalOpen}
        blockerReason={blockerReason}
        setBlockerReason={setBlockerReason}
        onClose={() => setIsBlockerModalOpen(false)}
        onReportBlockerSubmit={handleReportBlockerSubmit}
      />

      {/* MODAL PENGATURAN PROFIL & AKUN (FROSTED GLASS) */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-neutral-900/95 border border-white/15 rounded-3xl p-6 shadow-2xl text-white space-y-5 font-sans animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">Pengaturan Profil</h3>
                <p className="text-[11px] text-zinc-400">Kelola identitas dan preferensi akun Anda</p>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 font-sans">
              {/* Upload Area Foto Profil (Maks. 500 KB) */}
              <div className="space-y-2 font-sans">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Foto Profil (Maks. 500 KB)
                </label>

                <div className="flex items-center gap-4 p-4 bg-neutral-950/60 rounded-2xl border border-white/10">
                  {/* Preview Avatar */}
                  <div className="relative shrink-0">
                    {editAvatarUrl ? (
                      <img
                        src={editAvatarUrl}
                        alt="Avatar Preview"
                        className="w-16 h-16 rounded-2xl object-cover border border-white/20 shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center font-bold text-xl text-white uppercase">
                        {editFullName.charAt(0) || 'U'}
                      </div>
                    )}
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center text-[10px] text-white font-bold">
                        Mengunggah...
                      </div>
                    )}
                  </div>

                  {/* Tombol Pilih File */}
                  <div className="flex-1 space-y-1.5 font-sans">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarFileChange}
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isUploadingAvatar}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingAvatar ? 'Memproses...' : 'Pilih Foto Baru'}
                      </button>
                      {editAvatarUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditAvatarUrl('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-transparent hover:bg-rose-500/20 text-[11px] font-medium text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500">
                      Format: JPG, PNG, WEBP. Ukuran maksimal 500 KB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Nama Lengkap */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-neutral-950 px-3.5 py-2.5 text-xs text-white outline-hidden focus:border-white/30 font-sans"
                />
              </div>

              {/* Pilihan Divisi/POD vs Info Akses PO */}
              {isOwnerOrPo || profile?.role === 'po' || profile?.role === 'owner' ? (
                <div className="space-y-1.5 font-sans">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Peran & Tingkat Akses
                  </label>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">Project Owner</span>
                      <span className="text-[10px] text-zinc-500 font-mono">• Lead & Management</span>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-semibold border border-white/10 uppercase tracking-wider">
                      Owner Access
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 font-sans">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Divisi / POD
                  </label>
                  <CustomGlassSelect
                    theme="dark"
                    value={editPod}
                    onChange={(val) => setEditPod(val)}
                    options={[
                      { value: 'Marketing', label: 'Marketing' },
                      { value: 'Product Builder', label: 'Product Builder' },
                      { value: 'BA', label: 'BA (Business Analyst)' },
                      { value: 'UI/UX Designer', label: 'UI/UX Designer' },
                      { value: 'QA', label: 'QA' },
                      { value: 'General', label: 'General' },
                    ]}
                  />
                </div>
              )}

              {/* Tombol Simpan */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-5 py-2 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingProfile ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </div>
            </form>

            {/* DANGER ZONE (HAPUS AKUN & LOGOUT) */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between font-sans">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                Hapus Akun Permanen
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Keluar (Sign Out)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CROPPER DIALOG */}
      {isCroppingModalOpen && imageToCrop && (
        <div className="fixed inset-0 z-[130] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-neutral-900/95 border border-white/15 rounded-3xl p-5 shadow-2xl text-white space-y-4 font-sans animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="font-bold text-sm text-white">Sesuaikan Posisi Foto</h4>
                <p className="text-[10px] text-zinc-400">Geser dan atur perbesaran foto profil Anda</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCroppingModalOpen(false);
                  setImageToCrop(null);
                }}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* AREA CROPPER BULAT */}
            <div className="relative w-full h-64 bg-neutral-950 rounded-2xl overflow-hidden border border-white/10">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* SLIDER ZOOM */}
            <div className="space-y-1.5 px-1 font-sans">
              <div className="flex justify-between text-[11px] text-zinc-400 font-medium">
                <span>Perbesar</span>
                <span>{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-white h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* AKSI SIMPAN */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10 font-sans">
              <button
                type="button"
                onClick={() => {
                  setIsCroppingModalOpen(false);
                  setImageToCrop(null);
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isUploadingAvatar}
                onClick={handleConfirmCropAndUpload}
                className="px-5 py-2 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isUploadingAvatar ? 'Memproses...' : 'Terapkan & Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
