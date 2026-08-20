import React, { useState } from 'react';
import { 
  Layers, Search, Sparkles, SlidersHorizontal, ArrowUpRight, Zap
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState<number>(0);

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
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-zinc-300 font-normal">
                1.0
              </span>
            </div>
          </div>

          {/* Pill Menu Navigation (Center Placeholders) */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full shadow-lg font-sans text-xs">
            {['Overview', 'Kanban Hub', 'Metrics', 'Governance'].map((nav, idx) => (
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

          {/* Right Controls: Search Bar & Capsule CTA Button */}
          <div className="flex items-center gap-3">
            {/* Search Bar Capsule */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-xs text-zinc-300 shadow-md">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari..."
                className="bg-transparent border-none outline-hidden text-xs text-white placeholder-zinc-400 w-24 md:w-32"
              />
              <span className="text-zinc-600 font-mono">|</span>
              <button className="text-zinc-400 hover:text-white cursor-pointer transition-colors">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Solid Capsule Action Button */}
            <button className="px-5 py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs rounded-full shadow-xl flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Aksi Utama</span>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 2. GRID BENTO LAYOUT (KIRI 7 KOLOM & KANAN 5 KOLOM - EMPTY BOXES) */}
        {/* ========================================================================= */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 my-auto">
          
          {/* ========================================================================= */}
          {/* GRID KIRI (7 Kolom / 60% Width) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            
            {/* TOP ROW KIRI: 2 Kartu (Kartu Atas Glassy & Kartu Tengah Testimonial Putih) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Kartu 1: Frame Kaca Melengkung */}
              <div className="rounded-[32px] bg-gradient-to-br from-white/15 via-white/5 to-white/10 backdrop-blur-2xl border border-white/20 p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[280px] group hover:border-white/35 transition-all">
                {/* Header Badge Placeholder */}
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="w-16 h-4 rounded-full bg-white/10 border border-white/15" />
                </div>

                {/* Center Empty Visual Frame */}
                <div className="my-auto py-6 flex justify-center">
                  <div className="w-40 h-28 rounded-2xl border-2 border-dashed border-white/25 bg-white/5 flex flex-col items-center justify-center gap-2 text-zinc-400 font-mono text-[11px]">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                      📷
                    </div>
                    <span>Area Visual / Preview</span>
                  </div>
                </div>

                {/* Bottom Placeholder Bar */}
                <div className="space-y-1.5 pt-2 border-t border-white/15">
                  <div className="w-3/4 h-3.5 rounded-full bg-white/20" />
                  <div className="w-1/2 h-2.5 rounded-full bg-white/10" />
                </div>
              </div>

              {/* Kartu 2: Box Card Putih / Light Glassy */}
              <div className="rounded-[32px] bg-white text-zinc-950 p-6 shadow-2xl flex flex-col justify-between min-h-[280px] hover:scale-[1.01] transition-transform">
                <div className="space-y-4">
                  {/* Badge & Title Placeholder */}
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-4 rounded-full bg-zinc-200" />
                    <div className="w-6 h-6 rounded-full bg-zinc-100 border border-zinc-200" />
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="w-full h-4 rounded-full bg-zinc-900" />
                    <div className="w-5/6 h-4 rounded-full bg-zinc-300" />
                    <div className="w-2/3 h-4 rounded-full bg-zinc-300" />
                  </div>
                </div>

                {/* Bottom Avatars & Metric Placeholder */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                  <div className="flex items-center -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-300 border-2 border-white" />
                    <div className="w-8 h-8 rounded-full bg-zinc-400 border-2 border-white" />
                    <div className="w-8 h-8 rounded-full bg-zinc-500 border-2 border-white" />
                  </div>

                  <div className="w-16 h-7 rounded-full bg-zinc-100 border border-zinc-200" />
                </div>
              </div>

            </div>

            {/* AREA BAWAH KIRI (Judul Utama & 2 Tombol Kapsul) */}
            <div className="space-y-4 pt-4">
              <div className="w-32 h-3.5 rounded-full bg-white/20 font-mono text-[10px] text-zinc-400 px-3 py-0.5 flex items-center">
                LABEL SUB-HEADER
              </div>

              {/* Main Headline Box Placeholder */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-white tracking-tight leading-none flex items-center gap-3 flex-wrap">
                  <span>Judul Utama Layout</span>
                  <span className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm">⚡</span>
                </h1>
                <p className="text-xs text-zinc-400 font-sans max-w-lg">
                  Deskripsi ringkas kerangka layout bento glassmorphism tanpa konten dummy.
                </p>
              </div>

              {/* 2 Capsule CTA Buttons */}
              <div className="flex items-center gap-3 pt-2 font-sans">
                {/* Button 1 */}
                <button className="px-7 py-3 bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs rounded-full shadow-2xl flex items-center gap-2 transition-all cursor-pointer hover:scale-105">
                  <span>Tombol Kapsul 1</span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-900" />
                </button>

                {/* Button 2 */}
                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-2xl border border-white/20 text-white font-semibold text-xs rounded-full shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105">
                  <span>Tombol Kapsul 2</span>
                </button>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* GRID KANAN (5 Kolom / 40% Width) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* KARTU ATAS KANAN (Banner Frame Gelap) */}
            <div className="rounded-[28px] bg-gradient-to-r from-zinc-900/90 via-zinc-900/70 to-zinc-950/90 border border-white/15 backdrop-blur-xl p-5 shadow-2xl flex items-center justify-between gap-4 relative overflow-hidden">
              <div className="space-y-2.5 relative z-10 flex-1">
                <div className="w-24 h-3 rounded-full bg-amber-400/80 font-mono text-[10px]" />
                <div className="w-3/4 h-4 rounded-full bg-white font-mono" />
                <button className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-[11px] rounded-full transition-colors cursor-pointer">
                  Aksi Banner
                </button>
              </div>

              {/* Banner Graphic Frame Placeholder */}
              <div className="w-20 h-20 rounded-2xl border border-white/20 bg-white/5 flex items-center justify-center shrink-0">
                <span className="text-xl">🖼️</span>
              </div>
            </div>

            {/* KARTU TENGAH KANAN (Box Card + 1 Tombol Kapsul) */}
            <div className="rounded-[28px] bg-white/10 backdrop-blur-2xl border border-white/20 p-6 shadow-2xl space-y-4">
              <div className="w-2/3 h-5 rounded-full bg-white" />
              <div className="space-y-1.5">
                <div className="w-full h-3 rounded-full bg-white/30" />
                <div className="w-4/5 h-3 rounded-full bg-white/20" />
              </div>

              <div className="pt-1">
                <button className="px-6 py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs rounded-full shadow-xl flex items-center gap-2 transition-all cursor-pointer hover:scale-105">
                  <span>Tombol Kapsul</span>
                </button>
              </div>
            </div>

            {/* KARTU BAWAH KANAN (Card Besar - Showcase Placeholder) */}
            <div className="rounded-[36px] bg-gradient-to-b from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[340px] group hover:border-white/35 transition-all">
              
              {/* Card Top Row Badges */}
              <div className="flex items-center justify-between relative z-10">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="w-20 h-6 rounded-full bg-white/20 backdrop-blur-md border border-white/30" />
              </div>

              {/* Center Product Showcase Placeholder Frame */}
              <div className="my-auto py-6 flex justify-center">
                <div className="w-48 h-32 rounded-3xl border-2 border-dashed border-white/30 bg-white/5 flex flex-col items-center justify-center gap-2 text-zinc-400 font-mono text-xs">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white text-lg">
                    📦
                  </div>
                  <span>Showcase Product Area</span>
                </div>
              </div>

              {/* Bottom Content Area */}
              <div className="space-y-3 relative z-10 pt-2 border-t border-white/15">
                <div className="w-16 h-4 rounded-full bg-white/20 border border-white/30" />
                <div className="w-5/6 h-5 rounded-full bg-white font-mono" />

                {/* Bottom Action Pills Row */}
                <div className="flex items-center justify-between pt-2">
                  <div className="w-24 h-4 rounded-full bg-white/30" />

                  <button className="px-5 py-2 bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs rounded-full shadow-lg transition-all cursor-pointer hover:scale-105">
                    Aksi Utama
                  </button>
                </div>
              </div>

            </div>

          </div>

        </main>

        {/* FOOTER */}
        <footer className="w-full text-center py-2 text-[11px] font-mono text-zinc-500">
          SyncFlow • Frutiger Aero Bento Glassmorphism Clean Layout Shell
        </footer>

      </div>
    </div>
  );
};

export default App;
