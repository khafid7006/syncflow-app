import React, { useState } from 'react';
import { 
  Layers, Check, Send, AlertTriangle, ExternalLink, 
  Folder, Figma, X
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState<number>(0);
  
  // Interactive states
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState(false);
  const [blockerReason, setBlockerReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isBlockerReported, setIsBlockerReported] = useState(false);

  // Simplified checklist for SMK students
  const [dodItems, setDodItems] = useState([
    { id: 1, text: 'Buat tampilan tombol dan form pembayaran', checked: true },
    { id: 2, text: 'Sambungkan tombol ke halaman sukses', checked: false },
    { id: 3, text: 'Lampirkan link hasil kerjaan', checked: false },
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
    <div className="min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col justify-between font-sans relative overflow-x-hidden selection:bg-white selection:text-black">
      {/* BACKGROUND 3D DARK METALLIC / STONE LAYER */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-luminosity pointer-events-none scale-105 transition-all duration-700"
        style={{ backgroundImage: `url('/assets/dark_stone_bg_1787219104310.png')` }}
      />

      {/* AMBIENT SOFT GLOW LIGHTS */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-zinc-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-zinc-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* MAIN CONTAINER (CANVAS ULTRACLEAN BENTO GLASS) */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8 flex-1 min-h-screen justify-between font-sans">
        
        {/* ========================================================================= */}
        {/* 1. TOP BAR NAVBAR (WITHOUT SEARCH BAR) */}
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

          {/* Pill Menu Navigation */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-lg text-xs">
            {['Tugas Aktif', 'Dokumen Tim', 'Jadwal Sprint'].map((nav, idx) => (
              <button
                key={idx}
                onClick={() => setActiveNav(idx)}
                className={`px-4 py-2 rounded-full font-medium transition-all cursor-pointer ${
                  activeNav === idx
                    ? 'bg-white/20 text-white font-semibold shadow-xs border border-white/20'
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{nav}</span>
              </button>
            ))}
          </nav>

          {/* Right Controls: User Profile Badge Only (No Search Bar) */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-2xl border border-white/15 rounded-full text-xs flex items-center gap-2 font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-white">Dimas — Product Builder</span>
            </div>
          </div>
        </header>

        {/* NOTIFICATION FEEDBACK BANNERS */}
        {isSubmitted && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl flex items-center justify-between text-xs font-sans backdrop-blur-md shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Hasil tugas berhasil dikirim!</span>
            </div>
          </div>
        )}

        {isBlockerReported && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl flex items-center justify-between text-xs font-sans backdrop-blur-md shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Kendala berhasil dilaporkan ke tim.</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. GRID BENTO LAYOUT (KIRI 7 KOLOM & KANAN 5 KOLOM) */}
        {/* ========================================================================= */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 my-auto font-sans">
          
          {/* ========================================================================= */}
          {/* GRID KIRI (7 Kolom / 60% Width) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            
            {/* TOP ROW KIRI: 2 Kartu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* KARTU KIRI ATAS (Tugas Aktif) */}
              <div className="rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between min-h-[280px] hover:border-white/20 transition-all">
                <div className="space-y-3">
                  <div className="text-xs font-medium text-zinc-400">
                    Tugas Aktif
                  </div>
                  {/* Judul Tugas Singkat & Jelas */}
                  <h2 className="text-base font-bold text-white tracking-tight leading-snug">
                    Buat Halaman Pembayaran Aplikasi
                  </h2>
                </div>

                {/* Checklist Bulat Simpel dengan Teks Pendek */}
                <div className="space-y-2 pt-4 border-t border-white/10 text-xs">
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

              {/* KARTU TENGAH ATAS (PUTIH GLOSSY) */}
              <div className="rounded-[32px] bg-white text-zinc-950 p-6 shadow-xl flex flex-col justify-between min-h-[280px] hover:scale-[1.01] transition-transform">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-zinc-500">
                    Penyerahan Tugas
                  </span>
                  <h3 className="text-base font-bold text-zinc-950 tracking-tight">
                    Kirim Hasil Tugas
                  </h3>
                </div>

                {/* Form Input Clean & Tombol Hitam Solid */}
                <form onSubmit={handleSubmitDeliverable} className="space-y-3 my-auto py-2">
                  <input
                    type="text"
                    required
                    placeholder="Link tugas..."
                    value={deliverableUrl}
                    onChange={e => setDeliverableUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:outline-hidden focus:border-zinc-800 transition-colors"
                  />

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-xs rounded-full shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim</span>
                  </button>
                </form>

                {/* Tombol Outline Merah Minimalis */}
                <div className="pt-2 border-t border-zinc-100">
                  <button
                    onClick={() => setIsBlockerModalOpen(true)}
                    className="w-full py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 font-medium text-xs rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>🚨 Laporkan Kendala</span>
                  </button>
                </div>
              </div>

            </div>

            {/* AREA BAWAH KIRI (Header Teks & Target Ringkas Santai) */}
            <div className="space-y-2 pt-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                Halo, Dimas
              </h1>
              <p className="text-base text-zinc-400 font-sans">
                Target hari ini: Selesaikan halaman pembayaran ya!
              </p>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* GRID KANAN (5 Kolom / 40% Width - 2 Baris Clean Link Monokrom) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6 font-sans">
            
            {/* KARTU KANAN (Cukup 2 Baris Clean Link dengan Icon Monokrom Sederhana) */}
            <div className="rounded-[36px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl flex flex-col justify-between flex-1 min-h-[280px] hover:border-white/20 transition-all">
              
              <div className="space-y-1">
                <span className="text-xs font-medium text-zinc-400">
                  Aset Tim
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Tautan Utama
                </h3>
              </div>

              {/* 2 Clean Monokrom Links */}
              <div className="space-y-3 my-auto py-4">
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

              <div className="text-xs text-zinc-500 text-center pt-2 border-t border-white/5">
                SyncFlow Dashboard
              </div>

            </div>

          </div>

        </main>

        {/* FOOTER */}
        <footer className="w-full text-center py-2 text-xs text-zinc-500">
          SyncFlow • Modern Minimalist Dashboard
        </footer>

      </div>

      {/* MODAL LAPORKAN KENDALA MINIMALIS */}
      {isBlockerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
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
                placeholder="Tuliskan kendala..."
                value={blockerReason}
                onChange={e => setBlockerReason(e.target.value)}
                className="w-full p-3 bg-zinc-950 border border-white/15 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-white/30"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBlockerModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 font-medium rounded-full cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!blockerReason.trim()}
                  className={`px-5 py-2 font-medium rounded-full shadow-md flex items-center gap-1.5 transition-all ${
                    blockerReason.trim()
                      ? 'bg-white text-zinc-950 cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
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
