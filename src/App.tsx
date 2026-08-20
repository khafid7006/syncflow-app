import React, { useState } from 'react';
import { 
  Layers, Search, Sparkles, SlidersHorizontal, ArrowUpRight, Zap,
  CheckSquare, Send, AlertTriangle, ExternalLink, Folder, Figma,
  CheckCircle2, Info, User, Check, X
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState<number>(0);
  
  // Interactive states
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState(false);
  const [blockerReason, setBlockerReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isBlockerReported, setIsBlockerReported] = useState(false);

  // Interactive DoD checklist state
  const [dodItems, setDodItems] = useState([
    { id: 1, text: 'Slicing UI Komponen Checkout selesai & responsif', checked: true },
    { id: 2, text: 'Validasi payload request API BI-FAST berfungsi 100%', checked: false },
    { id: 3, text: 'Melampirkan link PR GitHub & file Figma terkait', checked: false },
  ]);

  const toggleDod = (id: number) => {
    setDodItems(dodItems.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const handleSubmitDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableUrl.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  const handleReportBlockerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockerReason.trim()) return;
    setIsBlockerReported(true);
    setIsBlockerModalOpen(false);
    setTimeout(() => setIsBlockerReported(false), 5000);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col justify-between font-sans relative overflow-x-hidden selection:bg-amber-400 selection:text-black">
      {/* BACKGROUND 3D DARK METALLIC / STONE LAYER */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-35 mix-blend-luminosity pointer-events-none scale-105 transition-all duration-700"
        style={{ backgroundImage: `url('/assets/dark_stone_bg_1787219104310.png')` }}
      />

      {/* AMBIENT FRUTIGER AERO GLOW LIGHTS */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed top-[30%] right-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* MAIN CONTAINER (CANVAS ULTRACLEAN BENTO GLASS) */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 flex-1 min-h-screen justify-between">
        
        {/* ========================================================================= */}
        {/* 1. TOP BAR NAVBAR */}
        {/* ========================================================================= */}
        <header className="w-full flex items-center justify-between gap-4 font-mono text-xs">
          
          {/* Logo Brand: SyncFlow */}
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-all">
              <Layers className="w-5 h-5 text-amber-400" />
            </div>
            <div className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
              <span>SyncFlow</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-normal">
                Bento Member
              </span>
            </div>
          </div>

          {/* Pill Menu Navigation */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full shadow-lg font-sans text-xs">
            {['Tugas Aktif (/do)', 'Dokumen Tim', 'Jadwal Sprint', 'Profil Pod'].map((nav, idx) => (
              <button
                key={idx}
                onClick={() => setActiveNav(idx)}
                className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 cursor-pointer ${
                  activeNav === idx
                    ? 'bg-white/25 text-white font-semibold shadow-xs border border-white/30'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {idx === 0 && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                <span>{nav}</span>
              </button>
            ))}
          </nav>

          {/* Right Controls: Search Bar & User Profile Badge */}
          <div className="flex items-center gap-3">
            {/* Search Bar Capsule */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-xs text-zinc-300 shadow-md">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari tugas..."
                className="bg-transparent border-none outline-hidden text-xs text-white placeholder-zinc-400 w-24 md:w-32"
              />
              <span className="text-zinc-600 font-mono">|</span>
              <button className="text-zinc-400 hover:text-white cursor-pointer transition-colors">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* User Avatar Badge Button */}
            <div className="px-4 py-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full shadow-xl flex items-center gap-2 text-xs font-mono">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-zinc-950 font-bold flex items-center justify-center text-[10px]">
                PB
              </div>
              <span className="font-semibold text-white">Dimas (Pod PB)</span>
            </div>
          </div>
        </header>

        {/* NOTIFICATION FEEDBACK BANNERS */}
        {isSubmitted && (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 rounded-2xl flex items-center justify-between text-xs font-mono backdrop-blur-md shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Link deliverable berhasil dikirim ke Project Owner untuk ditinjau!</span>
            </div>
          </div>
        )}

        {isBlockerReported && (
          <div className="p-4 bg-rose-500/20 border border-rose-500/40 text-rose-200 rounded-2xl flex items-center justify-between text-xs font-mono backdrop-blur-md shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>🚨 Blocker berhasil dilaporkan ke PO & Lead. Tugas otomatis berpindah ke status BLOCKED.</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. GRID BENTO LAYOUT (KIRI 7 KOLOM & KANAN 5 KOLOM) */}
        {/* ========================================================================= */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 my-auto">
          
          {/* ========================================================================= */}
          {/* GRID KIRI (7 Kolom / 60% Width) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            
            {/* TOP ROW KIRI: 2 Kartu (Kartu 1 Tugas Aktif & Kartu 2 Aksi Utama Putih) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* 1. KARTU KIRI ATAS (Tugas Aktif & DoD Checklist) */}
              <div className="rounded-[32px] bg-gradient-to-br from-white/15 via-white/5 to-white/10 backdrop-blur-2xl border border-white/20 p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px] group hover:border-white/35 transition-all">
                {/* Header Badge */}
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="font-bold text-amber-300 uppercase tracking-wider">📌 Tugas Aktif</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-zinc-300 text-[10px]">
                    PB-101
                  </span>
                </div>

                {/* Judul Tugas Hari Ini */}
                <div className="space-y-2 my-auto py-2">
                  <h2 className="text-base font-mono font-bold text-white leading-snug tracking-tight">
                    Slicing UI Checkout & Integrasi Payment Gateway BI-FAST
                  </h2>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Membangun UI checkout responsif dan memvalidasi payload request BI-FAST.
                  </p>
                </div>

                {/* Checklist DoD Singkat Interaktif */}
                <div className="space-y-2 pt-3 border-t border-white/15 font-sans text-xs">
                  <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 uppercase font-bold">
                    <span>Checklist DoD</span>
                    <span>{dodItems.filter(i => i.checked).length}/{dodItems.length}</span>
                  </div>

                  <div className="space-y-1.5">
                    {dodItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => toggleDod(item.id)}
                        className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                      >
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                          item.checked 
                            ? 'bg-amber-400 border-amber-400 text-zinc-950 font-bold' 
                            : 'border-white/30 bg-white/5'
                        }`}>
                          {item.checked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={`text-[11px] leading-tight ${item.checked ? 'line-through text-zinc-400' : 'text-zinc-200 font-medium'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. KARTU TENGAH ATAS (Aksi Utama - Warna Putih Glossy) */}
              <div className="rounded-[32px] bg-white text-zinc-950 p-6 shadow-2xl flex flex-col justify-between min-h-[300px] hover:scale-[1.01] transition-transform">
                <div className="space-y-3">
                  {/* Badge & Title */}
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-zinc-500 uppercase tracking-wider text-[10px]">
                      🚀 Aksi Penyerahan
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-[10px] font-mono font-bold">
                      Pod PB
                    </span>
                  </div>

                  <h3 className="text-base font-mono font-bold text-zinc-950 leading-snug">
                    Submit Deliverable & Sinyal
                  </h3>
                </div>

                {/* Form Input Link & Buttons */}
                <form onSubmit={handleSubmitDeliverable} className="space-y-3 my-auto py-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                      Link Tautan Deliverable *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tempel Link Tugas (Drive / Figma / Docs)"
                      value={deliverableUrl}
                      onChange={e => setDeliverableUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs font-mono text-zinc-900 focus:outline-hidden focus:border-zinc-800 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-white font-mono font-bold text-xs rounded-full shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kirim Hasil Kerja</span>
                  </button>
                </form>

                {/* Tombol Merah: Laporkan Blocker */}
                <div className="pt-2 border-t border-zinc-100">
                  <button
                    onClick={() => setIsBlockerModalOpen(true)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs rounded-full shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <AlertTriangle className="w-4 h-4 text-white" />
                    <span>🚨 Laporkan Blocker / Hambatan</span>
                  </button>
                </div>
              </div>

            </div>

            {/* 3. AREA BAWAH KIRI (Header Teks & Target Sprint) */}
            <div className="space-y-3 pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 font-mono text-[11px] text-amber-300 font-bold">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Halo Dimas — Product Builder (Pod PB)</span>
              </div>

              {/* Main Headline & Sprint Sentence */}
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-white tracking-tight leading-none flex items-center gap-2 flex-wrap">
                  <span>Target Sprint Hari Ini</span>
                  <span className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs">⚡</span>
                </h1>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed max-w-xl">
                  "Menyelesaikan 100% slicing komponen checkout dan validasi payload pembayaran BI-FAST sebelum pukul 17.00 WIB."
                </p>
              </div>

              {/* 2 Capsule Buttons */}
              <div className="flex items-center gap-3 pt-1 font-sans">
                <button
                  onClick={() => alert("Checklist DoD dapat dicentang langsung pada kartu kiri atas!")}
                  className="px-6 py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs rounded-full shadow-xl flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
                >
                  <CheckSquare className="w-4 h-4 text-zinc-900" />
                  <span>Lihat Detail DoD</span>
                </button>

                <button
                  onClick={() => setIsBlockerModalOpen(true)}
                  className="px-5 py-2.5 bg-rose-600/80 hover:bg-rose-600 backdrop-blur-2xl border border-rose-500/50 text-white font-semibold text-xs rounded-full shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
                >
                  <AlertTriangle className="w-4 h-4 text-white" />
                  <span>🚨 Sinyal Hambatan</span>
                </button>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* GRID KANAN (5 Kolom / 40% Width - Aset & Catatan) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* 4A. KARTU ATAS KANAN (Catatan / Pengumuman PO) */}
            <div className="rounded-[28px] bg-gradient-to-r from-zinc-900/90 via-zinc-900/80 to-zinc-950/90 border border-white/15 backdrop-blur-xl p-5 shadow-2xl flex flex-col justify-between gap-3 relative overflow-hidden group">
              <div className="flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Info className="w-4 h-4" />
                  <span className="uppercase tracking-wider text-[11px]">📢 Pengumuman PO</span>
                </div>
                <span className="text-[10px] text-zinc-400">Project Owner</span>
              </div>

              <p className="text-xs text-zinc-200 font-sans leading-relaxed italic">
                "Pastikan semua URL PR GitHub & Dokumen Figma dilampirkan sebelum mengirim tugas ke tahap review. Semangat tim!"
              </p>
            </div>

            {/* 4B. KARTU TENGAH KANAN (Status Overview Ringkas) */}
            <div className="rounded-[28px] bg-white/10 backdrop-blur-2xl border border-white/20 p-5 shadow-2xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-400">Status Tugas Dimas</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                  In Progress
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="text-[10px] text-zinc-400">Tugas Aktif</div>
                  <div className="text-xl font-bold text-white">1</div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="text-[10px] text-zinc-400">Progres DoD</div>
                  <div className="text-xl font-bold text-amber-400">
                    {Math.round((dodItems.filter(i => i.checked).length / dodItems.length) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* 4C. KARTU BAWAH KANAN (2 Tombol Quick Link: Google Drive & Figma) */}
            <div className="rounded-[36px] bg-gradient-to-b from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[260px] group hover:border-white/35 transition-all">
              
              <div className="space-y-1 relative z-10 font-mono">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Aset & Quick Links Tim</span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Akses Cepat Repositori Tim
                </h3>
              </div>

              {/* 2 Quick Link Buttons */}
              <div className="space-y-3 relative z-10 my-auto py-3">
                {/* Quick Link 1: Folder Google Drive */}
                <a
                  href="https://drive.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono font-bold text-xs flex items-center justify-between transition-all group/link"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
                      <Folder className="w-4 h-4" />
                    </div>
                    <span>Folder Google Drive Tim</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400 group-hover/link:text-white transition-colors" />
                </a>

                {/* Quick Link 2: File Figma Tim */}
                <a
                  href="https://figma.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono font-bold text-xs flex items-center justify-between transition-all group/link"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400">
                      <Figma className="w-4 h-4" />
                    </div>
                    <span>File Figma UI/UX Tim</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400 group-hover/link:text-white transition-colors" />
                </a>
              </div>

              <div className="text-[10px] text-zinc-400 font-mono text-center pt-2 border-t border-white/10">
                SyncFlow Bento Hub • Ready for Sprint
              </div>

            </div>

          </div>

        </main>

        {/* FOOTER */}
        <footer className="w-full text-center py-2 text-[11px] font-mono text-zinc-500">
          SyncFlow • Bento Dashboard Anggota Tim (Pod PB)
        </footer>

      </div>

      {/* ========================================================================= */}
      {/* MODAL LAPORKAN BLOCKER / HAMBATAN */}
      {/* ========================================================================= */}
      {isBlockerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4 font-sans text-xs animate-scale-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 font-mono text-rose-400 font-bold">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>🚨 Laporkan Blocker / Hambatan</span>
              </div>
              <button
                onClick={() => setIsBlockerModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-zinc-300 leading-relaxed font-sans">
              Masukkan 1 kalimat penjelasan kendala teknis atau hambatan yang dialami agar PO dan Lead dapat segera membantu:
            </p>

            <form onSubmit={handleReportBlockerSubmit} className="space-y-4 font-mono">
              <textarea
                rows={3}
                required
                placeholder="Contoh: Mengalami kendala kredensial API BI-FAST yang belum diberikan oleh tim backend..."
                value={blockerReason}
                onChange={e => setBlockerReason(e.target.value)}
                className="w-full p-3 bg-zinc-950 border border-rose-500/30 rounded-2xl text-xs text-white focus:outline-hidden focus:border-rose-500 font-sans"
              />

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBlockerModalOpen(false)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-full cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!blockerReason.trim()}
                  className={`flex-1 py-2.5 font-bold rounded-full shadow-lg flex items-center justify-center gap-2 transition-all ${
                    blockerReason.trim()
                      ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Kirim Laporan Blocker</span>
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
