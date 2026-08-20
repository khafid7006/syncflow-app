import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { 
  Layers, Check, Send, AlertTriangle, ExternalLink, 
  Folder, Figma, X, LogOut, User, Lock, Mail, ChevronDown,
  ShieldAlert, ClipboardCheck, PlusCircle, RotateCcw, CheckCircle2
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
  checklist?: { id: number; text: string; checked: boolean }[];
  created_at?: string;
  profiles?: {
    full_name?: string;
    pod?: string;
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
  const [taskStatus, setTaskStatus] = useState<'Dalam Pengerjaan' | 'Sedang Ditinjau PO' | 'Terkendala (Blocker)'>('Dalam Pengerjaan');

  // PO Dashboard states
  const [blockedTasks, setBlockedTasks] = useState<MemberTask[]>([]);
  const [reviewTasks, setReviewTasks] = useState<MemberTask[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<UserProfile[]>([]);

  // PO Quick Assignment Form states
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [newAssignTaskTitle, setNewAssignTaskTitle] = useState<string>('');
  const [dodInput1, setDodInput1] = useState<string>('Buat tampilan tombol dan form pembayaran');
  const [dodInput2, setDodInput2] = useState<string>('Sambungkan tombol ke halaman sukses');
  const [dodInput3, setDodInput3] = useState<string>('Lampirkan link hasil kerjaan');
  
  // Modals & Toasts
  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState<boolean>(false);
  const [blockerReason, setBlockerReason] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // DoD checklist state for Member View
  const [dodItems, setDodItems] = useState([
    { id: 1, text: 'Buat tampilan tombol dan form pembayaran', checked: true },
    { id: 2, text: 'Sambungkan tombol ke halaman sukses', checked: false },
    { id: 3, text: 'Lampirkan link hasil kerjaan', checked: false },
  ]);

  // 1. Fetch Session & Profile on Mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchOrCreateProfile(session.user);
        fetchActiveTask(session.user.id);
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchOrCreateProfile(session.user);
        fetchActiveTask(session.user.id);
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

  // FETCHING ACTIVE TASK FROM SUPABASE FOR MEMBER
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

        const existingLink = data.deliverable_link || data.deliverable_url;
        if (existingLink) {
          setSubmittedUrl(existingLink);
          setTaskStatus('Sedang Ditinjau PO');
        } else if (data.status === 'review' || data.status === 'UNDER_REVIEW') {
          setTaskStatus('Sedang Ditinjau PO');
        } else if (data.status === 'blocked' || data.status === 'BLOCKED' || data.is_blocked) {
          setTaskStatus('Terkendala (Blocker)');
        } else {
          setTaskStatus('Dalam Pengerjaan');
        }

        if (data.blocker_reason) {
          setBlockerReason(data.blocker_reason);
        }

        if (data.checklist && Array.isArray(data.checklist) && data.checklist.length > 0) {
          setDodItems(data.checklist);
        }
      }
    } catch (err: any) {
      console.error('Fetch active task error:', err);
    }
  };

  // FETCH PO DATA (BLOCKED TASKS, REVIEW TASKS, MEMBERS LIST)
  const fetchPOData = async () => {
    try {
      // Fetch blocked tasks
      const { data: blockedData, error: bErr } = await supabase
        .from('tasks')
        .select('*, profiles(full_name, pod)')
        .or('status.eq.blocked,is_blocked.eq.true')
        .order('created_at', { ascending: false });

      if (bErr) console.error("Error fetching blocked tasks:", bErr.message);

      // Fetch review tasks
      const { data: reviewData, error: rErr } = await supabase
        .from('tasks')
        .select('*, profiles(full_name, pod)')
        .or('status.eq.review,status.eq.UNDER_REVIEW')
        .order('created_at', { ascending: false });

      if (rErr) console.error("Error fetching review tasks:", rErr.message);

      // Fetch member profiles
      const { data: membersData, error: mErr } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (mErr) console.error("Error fetching members:", mErr.message);

      if (blockedData) setBlockedTasks(blockedData);
      if (reviewData) setReviewTasks(reviewData);
      if (membersData) {
        setMemberProfiles(membersData as UserProfile[]);
        if (membersData.length > 0 && !selectedAssigneeId) {
          setSelectedAssigneeId(membersData[0].id);
        }
      }
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

  // MEMBER: SUBMIT DELIVERABLE LINK
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
            status: 'review' 
          })
          .eq('id', activeTask.id)
          .select();

        if (error) {
          console.error("Error updating deliverable link:", error.message);
          showToast(`Gagal kirim tugas: ${error.message}`);
          return;
        }

        if (data && data[0]) setActiveTask(data[0]);
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            assignee_id: session.user.id,
            title: taskTitle || 'Buat Halaman Pembayaran Aplikasi',
            deliverable_link: linkInput,
            deliverable_url: linkInput,
            status: 'review'
          })
          .select();

        if (error) {
          console.error("Error inserting deliverable link:", error.message);
          showToast(`Gagal kirim tugas: ${error.message}`);
          return;
        }

        if (data && data[0]) setActiveTask(data[0]);
      }
    } catch (err: any) {
      console.error('Supabase deliverable mutation error:', err);
      showToast(`Gagal kirim tugas: ${err.message || err}`);
      return;
    }

    setSubmittedUrl(linkInput);
    setTaskStatus('Sedang Ditinjau PO');
    setDeliverableUrl('');
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

  // PO DASHBOARD ACTIONS
  const handleResolveBlocker = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'in_progress', is_blocked: false })
        .eq('id', taskId);

      if (error) {
        console.error("Resolve blocker error:", error.message);
        showToast(`Gagal resolve blocker: ${error.message}`);
      } else {
        showToast('Kendala berhasil ditandai Teratasi!');
        fetchPOData();
      }
    } catch (err: any) {
      console.error("Resolve blocker error:", err);
    }
  };

  const handleAcceptReview = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'done' })
        .eq('id', taskId);

      if (error) {
        console.error("Accept review error:", error.message);
        showToast(`Gagal ACC tugas: ${error.message}`);
      } else {
        showToast('Tugas telah di-ACC (Done)!');
        fetchPOData();
      }
    } catch (err: any) {
      console.error("Accept review error:", err);
    }
  };

  const handleRequestRevision = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'in_progress' })
        .eq('id', taskId);

      if (error) {
        console.error("Request revision error:", error.message);
        showToast(`Gagal minta revisi: ${error.message}`);
      } else {
        showToast('Status tugas dikembalikan ke Dalam Pengerjaan.');
        fetchPOData();
      }
    } catch (err: any) {
      console.error("Request revision error:", err);
    }
  };

  const handleCreateNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssigneeId || !newAssignTaskTitle.trim()) return;

    const checklistItems = [
      { id: 1, text: dodInput1.trim() || 'Kerjakan tugas sesuai instruksi', checked: false },
      { id: 2, text: dodInput2.trim() || 'Validasi fungsi dan komponen', checked: false },
      { id: 3, text: dodInput3.trim() || 'Lampirkan link hasil kerjaan', checked: false },
    ];

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          assignee_id: selectedAssigneeId,
          title: newAssignTaskTitle.trim(),
          status: 'in_progress',
          checklist: checklistItems,
        });

      if (error) {
        console.error("Create task error:", error.message);
        showToast(`Gagal penugasan: ${error.message}`);
      } else {
        showToast('Tugas baru berhasil dikirim ke Member!');
        setNewAssignTaskTitle('');
        fetchPOData();
      }
    } catch (err: any) {
      console.error("Create task error:", err);
      showToast(`Gagal penugasan: ${err.message || err}`);
    }
  };

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
                    className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30"
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
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30"
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
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30"
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
          /* PO DASHBOARD VIEW (STRICT MONOCHROME GLASSMORPHISM - CLEAN & MINIMAL) */
          /* ========================================================================= */
          <main className="space-y-8 flex-1 my-auto font-sans">
            
            {/* HEADLINE PAPAN PO */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <ShieldAlert className="w-4 h-4 text-white" />
                <span className="font-semibold text-white">Papan Kontrol Project Owner</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Monitoring Progres & Radar Kendala Tim
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* KARTU 1: RADAR KENDALA (6 KOLOM) */}
              <div className="lg:col-span-6 rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl space-y-4 min-h-[360px] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <AlertTriangle className="w-4 h-4 text-zinc-300" />
                      <span>Radar Kendala</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-sans font-medium text-zinc-300">
                      {blockedTasks.length} Kendala
                    </span>
                  </div>

                  {blockedTasks.length === 0 ? (
                    <div className="p-8 text-center bg-white/5 border border-white/5 rounded-2xl text-xs text-zinc-400 space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-zinc-500 mx-auto" />
                      <p className="font-medium text-white">Tidak ada kendala aktif saat ini.</p>
                      <p className="text-[11px] text-zinc-500">Semua anggota tim berjalan lancar.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                      {blockedTasks.map(t => (
                        <div key={t.id} className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-2 text-xs font-sans">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{t.profiles?.full_name || 'Member'}</span>
                            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] text-zinc-400">
                              {t.profiles?.pod || 'Pod'}
                            </span>
                          </div>
                          {/* Clean Plain Text Blocker Message (No Quotes) */}
                          <p className="text-zinc-300 leading-relaxed font-sans bg-white/5 p-2.5 rounded-xl border border-white/5">
                            {t.blocker_reason || 'Terjadi kendala teknis'}
                          </p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-zinc-400 truncate max-w-[200px]">Tugas: {t.title}</span>
                            <button
                              onClick={() => t.id && handleResolveBlocker(t.id)}
                              className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs rounded-full transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Tandai Teratasi</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* KARTU 2: REVIEW TUGAS (6 KOLOM) */}
              <div className="lg:col-span-6 rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl space-y-4 min-h-[360px] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <ClipboardCheck className="w-4 h-4 text-zinc-300" />
                      <span>Review Tugas</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-sans font-medium text-zinc-300">
                      {reviewTasks.length} Menunggu
                    </span>
                  </div>

                  {reviewTasks.length === 0 ? (
                    <div className="p-8 text-center bg-white/5 border border-white/5 rounded-2xl text-xs text-zinc-400 space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-zinc-500 mx-auto" />
                      <p className="font-medium text-white">Tidak ada tugas dalam antrean review.</p>
                      <p className="text-[11px] text-zinc-500">Deliverable yang dikirim anak SMK akan muncul disini.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                      {reviewTasks.map(t => (
                        <div key={t.id} className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-3 text-xs font-sans">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-white">{t.title}</div>
                              <div className="text-[11px] text-zinc-400">{t.profiles?.full_name || 'Member'} • {t.profiles?.pod || 'Pod'}</div>
                            </div>
                            {(t.deliverable_link || t.deliverable_url) && (
                              <a
                                href={t.deliverable_link || t.deliverable_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-[11px] text-white flex items-center gap-1 transition-colors font-medium"
                              >
                                <span>Buka Link</span>
                                <ExternalLink className="w-3 h-3 text-zinc-400" />
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                            <button
                              onClick={() => t.id && handleAcceptReview(t.id)}
                              className="flex-1 py-2 bg-white hover:bg-zinc-200 text-zinc-950 font-bold rounded-full transition-colors cursor-pointer text-center text-xs"
                            >
                              Terima (Done)
                            </button>
                            <button
                              onClick={() => t.id && handleRequestRevision(t.id)}
                              className="flex-1 py-2 border border-white/20 hover:bg-white/10 text-white font-medium rounded-full transition-colors cursor-pointer text-center text-xs"
                            >
                              Minta Revisi
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* KARTU 3: BAGI TUGAS BARU (12 KOLOM) */}
              <div className="lg:col-span-12 rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <PlusCircle className="w-4 h-4 text-zinc-300" />
                  <span>Bagi Tugas Baru</span>
                </div>

                <form onSubmit={handleCreateNewTask} className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs font-sans">
                  {/* Clean Member Dropdown */}
                  <div className="md:col-span-4 space-y-1">
                    <label className="block text-zinc-400 font-medium">Pilih Member</label>
                    <select
                      value={selectedAssigneeId}
                      onChange={e => setSelectedAssigneeId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-white/10 rounded-2xl text-white text-xs focus:outline-hidden focus:border-white/30 font-sans cursor-pointer"
                    >
                      {memberProfiles.length === 0 ? (
                        <option value="">Tidak ada member terdaftar</option>
                      ) : (
                        memberProfiles.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.full_name} ({m.pod})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Clean Minimal Task Title Input */}
                  <div className="md:col-span-8 space-y-1">
                    <label className="block text-zinc-400 font-medium">Judul Tugas</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama tugas..."
                      value={newAssignTaskTitle}
                      onChange={e => setNewAssignTaskTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-950 border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30 font-sans text-xs"
                    />
                  </div>

                  {/* 3 Input Checklist DoD */}
                  <div className="md:col-span-12 space-y-2 pt-2 border-t border-white/10">
                    <label className="block text-zinc-400 font-medium">Checklist Pekerjaan (DoD)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="DoD 1..."
                        value={dodInput1}
                        onChange={e => setDodInput1(e.target.value)}
                        className="p-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white text-xs placeholder-zinc-500 font-sans"
                      />
                      <input
                        type="text"
                        placeholder="DoD 2..."
                        value={dodInput2}
                        onChange={e => setDodInput2(e.target.value)}
                        className="p-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white text-xs placeholder-zinc-500 font-sans"
                      />
                      <input
                        type="text"
                        placeholder="DoD 3..."
                        value={dodInput3}
                        onChange={e => setDodInput3(e.target.value)}
                        className="p-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white text-xs placeholder-zinc-500 font-sans"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-12 pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={!selectedAssigneeId || !newAssignTaskTitle.trim()}
                      className={`px-6 py-2.5 font-bold text-xs rounded-full shadow-lg flex items-center gap-2 transition-all ${
                        selectedAssigneeId && newAssignTaskTitle.trim()
                          ? 'bg-white hover:bg-zinc-200 text-zinc-950 cursor-pointer'
                          : 'bg-neutral-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Tugas ke Member</span>
                    </button>
                  </div>
                </form>
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
                <div className="rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between min-h-[280px] hover:border-white/20 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                      <span>Tugas Aktif</span>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-medium ${
                        taskStatus === 'Terkendala (Blocker)'
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

                  {/* Render Array Checklist (DoD) */}
                  <div className="space-y-2 pt-4 border-t border-white/10 text-xs font-sans">
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

                {/* KARTU TENGAH ATAS (Submit Deliverable) */}
                <div className="rounded-[32px] bg-white text-zinc-950 p-6 shadow-xl flex flex-col justify-between min-h-[280px] hover:scale-[1.01] transition-transform font-sans">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-zinc-500">
                      Penyerahan Tugas
                    </span>
                    <h3 className="text-base font-bold text-zinc-950 tracking-tight">
                      Kirim Hasil Tugas
                    </h3>
                  </div>

                  {/* Form Input Clean */}
                  <form onSubmit={handleSubmitDeliverable} className="space-y-3 my-auto py-2">
                    {submittedUrl ? (
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
                        className="w-full px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-800 transition-colors disabled:opacity-50"
                      />
                    )}

                    <button
                      type="submit"
                      disabled={taskStatus === 'Sedang Ditinjau PO' || submittedUrl !== null}
                      className={`w-full py-2.5 font-medium text-xs rounded-full shadow-md flex items-center justify-center gap-2 transition-colors ${
                        submittedUrl !== null || taskStatus === 'Sedang Ditinjau PO'
                          ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                          : 'bg-zinc-950 hover:bg-zinc-800 text-white cursor-pointer'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{taskStatus === 'Sedang Ditinjau PO' ? 'Sedang Ditinjau PO' : 'Kirim'}</span>
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

            <form onSubmit={handleReportBlockerSubmit} className="space-y-4">
              <textarea
                rows={3}
                required
                placeholder="Tuliskan kendala Anda..."
                value={blockerReason}
                onChange={e => setBlockerReason(e.target.value)}
                className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30"
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
