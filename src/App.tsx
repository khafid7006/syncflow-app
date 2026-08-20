import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { 
  Layers, Check, Send, AlertTriangle, ExternalLink, 
  Folder, Figma, X, LogOut, User, Lock, Mail, ChevronDown,
  ShieldAlert, ClipboardCheck, PlusCircle, RotateCcw, CheckCircle2, Plus,
  GitBranch, Activity, Clock, CheckCircle
} from 'lucide-react';

export interface UserProfile {
  id: string;
  full_name: string;
  role: 'member' | 'owner';
  pod: 'Product Builder' | 'BA' | 'QA' | 'Marketing';
}

export interface MemberTask {
  id?: string;
  assignee_id?: string;
  title: string;
  status: string;
  deliverable_link?: string;
  deliverable_url?: string;
  blocker_reason?: string;
  is_blocked?: boolean;
  revision_note?: string;
  resolution_note?: string;
  checklist?: { id: number; text: string; checked: boolean; is_checked?: boolean }[];
  created_at?: string;
  profiles?: {
    id?: string;
    full_name?: string;
    pod?: string;
    role?: string;
  };
}

export const App: React.FC = () => {
  // Auth & Profile state
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
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

  // PO Dashboard states (Master Task Feed & Profiles)
  const [allTasks, setAllTasks] = useState<MemberTask[]>([]);
  const [blockedTasks, setBlockedTasks] = useState<MemberTask[]>([]);
  const [reviewTasks, setReviewTasks] = useState<MemberTask[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<UserProfile[]>([]);

  // PO Quick Assignment Form states (Dynamic DoD list, max 10 points)
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [newAssignTaskTitle, setNewAssignTaskTitle] = useState<string>('');
  const [dodPoints, setDodPoints] = useState<string[]>([
    'Buat tampilan tombol dan form pembayaran',
    'Sambungkan tombol ke halaman sukses',
    'Lampirkan link hasil kerjaan',
  ]);

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
    { id: 1, text: 'Buat tampilan tombol dan form pembayaran', checked: true },
    { id: 2, text: 'Sambungkan tombol ke halaman sukses', checked: false },
    { id: 3, text: 'Lampirkan link hasil kerjaan', checked: false },
  ]);

  // 1. Fetch Session & Profile on Mount + Fetch Members & Tasks
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchOrCreateProfile(session.user);
        fetchActiveTask(session.user.id);
        fetchPOData();
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchOrCreateProfile(session.user);
        fetchActiveTask(session.user.id);
        fetchPOData();
      } else {
        setProfile(null);
        setActiveTask(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch PO Data when viewMode is 'po' or profile is loaded
  useEffect(() => {
    if (session?.user && (profile?.role === 'owner' || viewMode === 'po')) {
      fetchPOData();
    }
  }, [profile, viewMode, session]);

  // 3. SUPABASE REALTIME SUBSCRIPTION
  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel('tasks-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Realtime task change received:', payload);
          fetchPOData();
          if (session?.user?.id) {
            fetchActiveTask(session.user.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // FETCHING ACTIVE TASK FROM SUPABASE FOR MEMBER (LOGIKA REVISI & UNLOCK FORM)
  const fetchActiveTask = async (userId: string) => {
    try {
      console.log("Current User ID:", userId);

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', userId)
        .neq('status', 'done')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching task:", error.message);
      }

      console.log("Fetched Task Data:", data);

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
          setDodItems(data.checklist.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            text: item.text || item.label || '',
            checked: item.checked ?? item.is_checked ?? false
          })));
        }
      }
    } catch (err: any) {
      console.error('Fetch active task error:', err);
    }
  };

  // 1. FETCH ALL TASKS & PROFILES FOR BENTO PO CONTROL CENTER
  const fetchPOData = async () => {
    try {
      // Fetch ALL tasks with profiles:assignee_id join
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
        .or('status.eq.blocked,is_blocked.eq.true')
        .order('created_at', { ascending: false });

      if (bErr) console.error("Error fetching blocked tasks:", bErr.message);

      // Fetch review tasks with status review, in_review, or UNDER_REVIEW
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
        .or('status.eq.review,status.eq.in_review,status.eq.UNDER_REVIEW')
        .order('created_at', { ascending: false });

      if (rErr) console.error("Error fetching review tasks:", rErr.message);

      // Fetch members from public.profiles
      const { data: membersData, error: mErr } = await supabase
        .from('profiles')
        .select('id, full_name, pod, role')
        .order('full_name', { ascending: true });

      if (mErr) {
        console.error('Gagal fetch profiles:', mErr.message);
      } else if (membersData) {
        console.log('Daftar member ditemukan:', membersData);
        setMemberProfiles(membersData as UserProfile[]);
        if (membersData.length > 0 && (!selectedAssigneeId || !membersData.some(m => m.id === selectedAssigneeId))) {
          setSelectedAssigneeId(membersData[0].id);
        }
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
        if (data.role === 'owner') {
          setViewMode('po');
        }
      } else {
        const newProfile: UserProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anggota Tim',
          role: user.user_metadata?.role || 'member',
          pod: user.user_metadata?.pod || 'Product Builder',
        };

        await supabase.from('profiles').insert([newProfile]);
        setProfile(newProfile);
        if (newProfile.role === 'owner') {
          setViewMode('po');
        }
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
    } finally {
      setAuthLoading(false);
    }
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
          if (newProfile.role === 'owner') setViewMode('po');
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
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth Sign Out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsProfileDropdownOpen(false);
    showToast('Anda telah keluar.');
  };

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // CHECKLIST TOGGLE & SUPABASE PERSISTENCE FOR MEMBER
  const toggleDod = async (id: number) => {
    const updatedItems = dodItems.map(item => item.id === id ? { ...item, checked: !item.checked } : item);
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

  // MEMBER: SUBMIT DELIVERABLE LINK (RESET REVISION & RESOLUTION NOTES + LOCK FORM TO REVIEW MODE)
  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableUrl.trim() || !session?.user?.id) return;

    const linkInput = deliverableUrl.trim();
    console.log("Current User ID:", session.user.id);

    try {
      if (activeTask?.id) {
        const { data, error } = await supabase
          .from('tasks')
          .update({ 
            deliverable_link: linkInput,
            deliverable_url: linkInput,
            status: 'review',
            revision_note: null,
            resolution_note: null
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
            title: taskTitle || 'Buat Halaman Pembayaran Aplikasi',
            deliverable_link: linkInput,
            deliverable_url: linkInput,
            status: 'review',
            revision_note: null,
            resolution_note: null
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
    showToast('Hasil tugas berhasil dikirim & sedang ditinjau PO.');
  };

  // MEMBER: REPORT BLOCKER
  const handleReportBlockerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockerReason.trim() || !session?.user?.id) return;

    const blockerInput = blockerReason.trim();
    console.log("Current User ID:", session.user.id);

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
    showToast('🚨 Kendala berhasil dilaporkan ke Project Owner.');
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
          blocker_reason: null,
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
        fetchPOData();
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

  const handleSubmitRevisionNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTaskId || !inputRevisionNote.trim()) return;

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
        showToast('⚠️ Catatan revisi telah dikirimkan ke Member!');
        setIsRevisionModalOpen(false);
        setTargetTaskId(null);
        setInputRevisionNote('');
        fetchPOData();
      }
    } catch (err: any) {
      console.error("Request revision error:", err);
      showToast(`Gagal kirim catatan revisi: ${err.message || err}`);
    }
  };

  const handleAcceptReview = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'done',
          revision_note: null,
          resolution_note: null
        })
        .eq('id', taskId);

      if (error) {
        console.error("Accept review error:", error.message);
        showToast(`Gagal ACC tugas: ${error.message}`);
      } else {
        showToast('✅ Tugas telah di-ACC (Done)!');
        fetchPOData();
      }
    } catch (err: any) {
      console.error("Accept review error:", err);
    }
  };

  // DYNAMIC DOD LIST HELPERS
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

  // SUBMIT PENUGASAN CEPAT
  const handleCreateNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssigneeId || !newAssignTaskTitle.trim()) return;

    const checklistItems = dodPoints
      .filter(p => p.trim().length > 0)
      .map((text, idx) => ({
        id: idx + 1,
        text: text.trim(),
        checked: false,
        is_checked: false,
      }));

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          assignee_id: selectedAssigneeId,
          title: newAssignTaskTitle.trim(),
          checklist: checklistItems,
          status: 'in_progress',
        });

      if (error) {
        console.error("Create task error:", error.message);
        showToast(`Gagal penugasan: ${error.message}`);
      } else {
        showToast('Tugas baru berhasil dikirim ke Member!');
        setNewAssignTaskTitle('');
        setDodPoints([
          'Buat tampilan tombol dan form pembayaran',
          'Sambungkan tombol ke halaman sukses',
          'Lampirkan link hasil kerjaan',
        ]);
        fetchPOData();
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

  // Review Tasks list filtered for PO review cards
  const reviewTasksList = allTasks.filter(task => 
    task.status === 'review' || task.status === 'in_review' || task.status === 'UNDER_REVIEW'
  );

  // Sorted tasks for Master Task Feed (Blocked first, then Review, then In Progress, then Done)
  const sortedMasterTasks = [...allTasks].sort((a, b) => {
    const priorityScore = (task: MemberTask) => {
      if (task.status === 'blocked' || task.is_blocked) return 0;
      if (task.status === 'review' || task.status === 'in_review' || task.status === 'UNDER_REVIEW') return 1;
      if (task.status === 'in_progress') return 2;
      return 3;
    };
    return priorityScore(a) - priorityScore(b);
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
  const userPod = profile?.pod || 'Product Builder';
  const userRole = profile?.role === 'owner' ? 'Project Owner' : userPod;

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

      {/* MAIN CONTAINER */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8 flex-1 min-h-screen justify-between font-sans">
        
        {/* ========================================================================= */}
        {/* TOP BAR NAVBAR (WITH ROLE/VIEW SWITCHER CAPSULE) */}
        {/* ========================================================================= */}
        <header className="w-full flex items-center justify-between gap-4 font-sans text-xs">
          
          {/* Logo Brand: SyncFlow */}
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-all">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-base tracking-tight">
              SyncFlow
            </span>
          </div>

          {/* View Mode Switcher Pill */}
          <nav className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-lg text-xs font-sans">
            <button
              onClick={() => setViewMode('po')}
              className={`px-4 py-2 rounded-full font-medium transition-all cursor-pointer ${
                viewMode === 'po'
                  ? 'bg-white/20 text-white font-semibold shadow-xs border border-white/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>Papan PO</span>
            </button>
            <button
              onClick={() => setViewMode('member')}
              className={`px-4 py-2 rounded-full font-medium transition-all cursor-pointer ${
                viewMode === 'member'
                  ? 'bg-white/20 text-white font-semibold shadow-xs border border-white/20'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>Dashboard Member</span>
            </button>
          </nav>

          {/* Right Controls: User Profile Pill Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 backdrop-blur-2xl border border-white/15 rounded-full text-xs flex items-center gap-2 font-medium cursor-pointer transition-colors shadow-md font-sans"
            >
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-white font-semibold">{userName} — {userRole}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-neutral-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2 z-50 space-y-1 text-xs font-sans">
                <div className="p-2.5 border-b border-white/10 space-y-0.5">
                  <div className="font-bold text-white truncate">{userName}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{session.user.email}</div>
                  <div className="text-[10px] text-zinc-400">Peran: {profile?.role || 'member'}</div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full p-2.5 text-left text-zinc-300 hover:text-white hover:bg-white/10 rounded-xl flex items-center gap-2 font-medium cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-zinc-400" />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* MONOCHROME TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="p-4 bg-neutral-900/90 border border-white/15 text-white rounded-2xl flex items-center justify-between text-xs font-sans backdrop-blur-md shadow-2xl animate-fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-white" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW ROUTER: PAPAN KONTROL PROJECT OWNER vs DASHBOARD MEMBER */}
        {/* ========================================================================= */}
        {viewMode === 'po' ? (
          /* ========================================================================= */
          /* PO DASHBOARD VIEW (BENTO GRID ALL-IN-ONE PO CONTROL CENTER) */
          /* ========================================================================= */
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 my-auto font-sans">
            
            {/* ========================================================================= */}
            {/* KOLOM 1 (KIRI - LEBAR - 5 KOLOM): RADAR & STATUS TIM (MASTER TASK FEED) */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              
              <div className="rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between flex-1 min-h-[460px] hover:border-white/20 transition-all font-sans">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Activity className="w-4 h-4 text-zinc-300" />
                      <span>Radar & Status Tim</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] text-zinc-300 font-medium font-sans">
                      {allTasks.length} Tugas Total
                    </span>
                  </div>

                  {sortedMasterTasks.length === 0 ? (
                    <div className="p-8 text-center bg-white/5 border border-white/5 rounded-2xl text-xs text-zinc-400 space-y-1 my-auto font-sans">
                      <CheckCircle2 className="w-6 h-6 text-zinc-500 mx-auto" />
                      <p className="font-medium text-white">Belum ada tugas di database.</p>
                      <p className="text-[11px] text-zinc-500">Tugas yang dibagikan akan muncul disini.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                      {sortedMasterTasks.map(t => {
                        const completedDod = t.checklist?.filter(c => c.checked || c.is_checked).length || 0;
                        const totalDod = t.checklist?.length || 0;
                        const isBlocked = t.status === 'blocked' || t.is_blocked;
                        const isReview = t.status === 'review' || t.status === 'in_review' || t.status === 'UNDER_REVIEW';
                        const isDone = t.status === 'done';
                        const deliverableContent = t.deliverable_link || t.deliverable_url || '';

                        return (
                          <div key={t.id} className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-3 text-xs font-sans hover:border-white/20 transition-colors">
                            {/* Member Header */}
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-xs">{t.profiles?.full_name || 'Member Tim'}</span>
                              <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] text-zinc-400">
                                {t.profiles?.pod || 'Umum'}
                              </span>
                            </div>

                            {/* Task Title */}
                            <div className="font-medium text-zinc-200 text-xs">
                              {t.title}
                            </div>

                            {/* Status Indicator & Specific Action Controls (Modal Triggers) */}
                            {isBlocked ? (
                              <div className="space-y-2 pt-1 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                  <span className="px-2 py-0.5 rounded-md bg-neutral-800 border border-white/15 text-[10px] text-zinc-300 font-semibold flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-zinc-400" />
                                    <span>🚨 Blocker</span>
                                  </span>
                                  <button
                                    onClick={() => t.id && handleOpenResolveBlockerModal(t.id)}
                                    className="px-3 py-1 bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-[11px] rounded-full transition-colors cursor-pointer flex items-center gap-1"
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

                                {/* PREVIEW BOX DELIVERABLE HASIL KIRIMAN MEMBER */}
                                {deliverableContent && (
                                  <div className="p-2.5 bg-neutral-950 border border-white/10 rounded-xl space-y-1">
                                    <span className="text-[10px] text-zinc-400 font-medium block">Hasil Kiriman Member:</span>
                                    {deliverableContent.startsWith('http://') || deliverableContent.startsWith('https://') ? (
                                      <a
                                        href={deliverableContent}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-white font-medium underline truncate flex items-center gap-1 hover:text-zinc-300 transition-colors"
                                      >
                                        <span className="truncate">{deliverableContent}</span>
                                        <ExternalLink className="w-3 h-3 text-zinc-400 shrink-0" />
                                      </a>
                                    ) : (
                                      <p className="text-xs text-zinc-200 truncate">{deliverableContent}</p>
                                    )}
                                  </div>
                                )}

                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => t.id && handleAcceptReview(t.id)}
                                    className="flex-1 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-full transition-colors cursor-pointer text-center text-[11px]"
                                  >
                                    Terima (ACC)
                                  </button>
                                  <button
                                    onClick={() => t.id && handleOpenRevisionModal(t.id)}
                                    className="flex-1 py-1.5 border border-white/20 hover:bg-white/10 text-white font-medium rounded-full transition-colors cursor-pointer text-center text-[11px]"
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
              <div className="space-y-2 pt-2 font-sans">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  Halo, {userName}
                </h1>
                <p className="text-base text-zinc-400 font-sans">
                  Papan kontrol & radar kendala tim hari ini.
                </p>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* KOLOM 2 (TENGAH - PUTIH SOLID - 4 KOLOM): BAGI TUGAS BARU */}
            {/* ========================================================================= */}
            <div className="lg:col-span-4 flex flex-col justify-between">
              
              <div className="rounded-[32px] bg-white text-zinc-950 p-6 shadow-xl flex flex-col justify-between flex-1 min-h-[460px] hover:scale-[1.01] transition-transform font-sans">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-zinc-500">
                    Penugasan Tim
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
                      className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-800 transition-colors font-sans cursor-pointer"
                    >
                      {memberProfiles.length === 0 ? (
                        <option value="">Memuat daftar tim...</option>
                      ) : (
                        memberProfiles.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.full_name || 'Member'} — {m.pod || 'Divisi'}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Task Title Input */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Judul Tugas</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama tugas..."
                      value={newAssignTaskTitle}
                      onChange={e => setNewAssignTaskTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-800 transition-colors font-sans"
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
                          className="text-[10px] font-bold text-zinc-900 hover:text-zinc-600 flex items-center gap-0.5 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Tambah Poin</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {dodPoints.map((point, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            required
                            placeholder={`DoD ${idx + 1}...`}
                            value={point}
                            onChange={e => handleDodPointChange(idx, e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] text-zinc-900 font-sans focus:outline-hidden focus:border-zinc-800"
                          />
                          {dodPoints.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDodPoint(idx)}
                              className="w-6 h-6 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center cursor-pointer transition-colors text-xs font-bold shrink-0"
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
                    className={`w-full py-3 font-bold text-xs rounded-full shadow-md flex items-center justify-center gap-2 transition-colors ${
                      selectedAssigneeId && newAssignTaskTitle.trim()
                        ? 'bg-zinc-950 hover:bg-zinc-800 text-white cursor-pointer'
                        : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Tugas ke Member</span>
                  </button>
                </form>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* KOLOM 3 (KANAN - 3 KOLOM): ASET & PUSAT REFERENSI TIM */}
            {/* ========================================================================= */}
            <div className="lg:col-span-3 flex flex-col justify-between gap-6 font-sans">
              
              <div className="rounded-[36px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between flex-1 min-h-[460px] hover:border-white/20 transition-all font-sans">
                
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

                  {/* Master Quick Links */}
                  <div className="space-y-2.5 pt-2">
                    {/* Link 1: Google Drive */}
                    <a
                      href="https://drive.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center justify-between transition-all group/link"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-zinc-300">
                          <Folder className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-white text-xs">Drive Proyek</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover/link:text-white transition-colors" />
                    </a>

                    {/* Link 2: Figma */}
                    <a
                      href="https://figma.com"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center justify-between transition-all group/link"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-zinc-300">
                          <Figma className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-white text-xs">Figma UI/UX</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover/link:text-white transition-colors" />
                    </a>

                    {/* Link 3: GitHub Repo */}
                    <a
                      href="https://github.com/khafid7006/syncflow-app"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center justify-between transition-all group/link"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-zinc-300">
                          <GitBranch className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-white text-xs">Repository Code</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover/link:text-white transition-colors" />
                    </a>
                  </div>
                </div>

                <div className="text-xs text-zinc-500 text-center pt-2 border-t border-white/5 font-sans">
                  SyncFlow PO Control Center
                </div>

              </div>

            </div>

          </main>
        ) : (
          /* ========================================================================= */
          /* DASHBOARD MEMBER VIEW (STRICT MONOCHROME GLASSMORPHISM) */
          /* ========================================================================= */
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 my-auto font-sans">
            
            {/* GRID KIRI (7 Kolom / 60% Width) */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-6">
              
              {/* TOP ROW KIRI: 2 Kartu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* KARTU KIRI ATAS (Fetch & Render Tugas Aktif Member) */}
                <div className="rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between min-h-[280px] hover:border-white/20 transition-all space-y-3 font-sans">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                      <span>Tugas Aktif</span>
                      {/* Top Right Status Badge on Member Card */}
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-medium ${
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

                  {activeTask?.resolution_note && (
                    <div className="p-3 bg-white/10 border border-white/15 rounded-2xl text-xs text-white font-sans space-y-1">
                      <div className="font-semibold text-white text-[11px] flex items-center gap-1">
                        <span>💡 Solusi Kendala dari PO:</span>
                      </div>
                      <p className="text-zinc-200 text-[11px] leading-relaxed">
                        {activeTask.resolution_note}
                      </p>
                    </div>
                  )}

                  {/* Render Array Checklist (DoD) */}
                  <div className="space-y-2 pt-3 border-t border-white/10 text-xs font-sans">
                    {dodItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleDod(item.id)}
                        className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                          item.checked 
                            ? 'bg-white border-white text-zinc-950' 
                            : 'border-zinc-500 bg-transparent'
                        }`}>
                          {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={`text-xs ${item.checked ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KARTU TENGAH ATAS (Submit Deliverable - LOGIKA REVISI & UNLOCK FORM) */}
                <div className="rounded-[32px] bg-white text-zinc-950 p-6 shadow-xl flex flex-col justify-between min-h-[280px] hover:scale-[1.01] transition-transform font-sans">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-zinc-500">
                      Penyerahan Tugas
                    </span>
                    <h3 className="text-base font-bold text-zinc-950 tracking-tight">
                      {taskStatus === 'Perlu Revisi' ? 'Kirim Hasil Revisi' : 'Kirim Hasil Tugas'}
                    </h3>
                  </div>

                  {/* Form Input Clean & Unlock Logic */}
                  <form onSubmit={handleSubmitDeliverable} className="space-y-3 my-auto py-2 font-sans">
                    {submittedUrl && taskStatus === 'Sedang Ditinjau PO' ? (
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
                        className="w-full px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-800 transition-colors disabled:opacity-50 font-sans"
                      />
                    )}

                    <button
                      type="submit"
                      disabled={taskStatus === 'Sedang Ditinjau PO'}
                      className={`w-full py-2.5 font-medium text-xs rounded-full shadow-md flex items-center justify-center gap-2 transition-colors ${
                        taskStatus === 'Sedang Ditinjau PO'
                          ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                          : 'bg-zinc-950 hover:bg-zinc-800 text-white cursor-pointer'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {taskStatus === 'Sedang Ditinjau PO'
                          ? 'Sedang Ditinjau PO'
                          : taskStatus === 'Perlu Revisi'
                            ? 'Kirim Hasil Revisi'
                            : 'Kirim Hasil Tugas'}
                      </span>
                    </button>
                  </form>

                  {/* Tombol Laporkan Kendala */}
                  <div className="pt-2 border-t border-zinc-100 font-sans">
                    <button
                      onClick={() => setIsBlockerModalOpen(true)}
                      className="w-full py-2 border border-zinc-300 hover:bg-zinc-100 text-zinc-800 font-medium text-xs rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-zinc-600" />
                      <span>🚨 Laporkan Kendala</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* AREA BAWAH KIRI (Header Teks Sapaan Otomatis) */}
              <div className="space-y-2 pt-2 font-sans">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  Halo, {userName}
                </h1>
                <p className="text-base text-zinc-400 font-sans">
                  Target hari ini: Selesaikan halaman pembayaran ya!
                </p>
              </div>

            </div>

            {/* GRID KANAN (5 Kolom / 40% Width - 2 Baris Clean Link Monokrom) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6 font-sans">
              
              {/* KARTU KANAN (Aset Tim) */}
              <div className="rounded-[36px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between flex-1 min-h-[280px] hover:border-white/20 transition-all font-sans">
                
                <div className="space-y-1">
                  <span className="text-xs font-medium text-zinc-400">
                    Aset Tim
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Tautan Utama
                  </h3>
                </div>

                {/* 2 Clean Monokrom Links */}
                <div className="space-y-3 pt-4 flex-1">
                  {/* Link 1: Google Drive */}
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center justify-between transition-all group/link"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-zinc-300">
                        <Folder className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-white">Google Drive Tim</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-500 group-hover/link:text-white transition-colors" />
                  </a>

                  {/* Link 2: Figma */}
                  <a
                    href="https://figma.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center justify-between transition-all group/link"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-zinc-300">
                        <Figma className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-white">Figma UI/UX Tim</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-500 group-hover/link:text-white transition-colors" />
                  </a>
                </div>

                <div className="text-xs text-zinc-500 text-center pt-2 border-t border-white/5 font-sans">
                  SyncFlow Dashboard
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

      {/* MODAL INPUT ARANAN SOLUSI KENDALA (PO VIEW) */}
      {isResolveBlockerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900/95 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs">
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
                  className="px-4 py-2 bg-neutral-800 text-zinc-300 font-medium rounded-full cursor-pointer hover:bg-neutral-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!inputResolutionNote.trim()}
                  className={`px-5 py-2 font-medium rounded-full shadow-md flex items-center gap-1.5 transition-all ${
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900/95 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs">
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
                  className="px-4 py-2 bg-neutral-800 text-zinc-300 font-medium rounded-full cursor-pointer hover:bg-neutral-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!inputRevisionNote.trim()}
                  className={`px-5 py-2 font-medium rounded-full shadow-md flex items-center gap-1.5 transition-all ${
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 font-sans text-xs">
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
                  className="px-4 py-2 bg-neutral-800 text-zinc-300 font-medium rounded-full cursor-pointer hover:bg-neutral-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!blockerReason.trim()}
                  className={`px-5 py-2 font-medium rounded-full shadow-md flex items-center gap-1.5 transition-all ${
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
