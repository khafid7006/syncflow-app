import React, { useState } from 'react';
import { 
  Flame, Glasses, Smartphone, Search, SlidersHorizontal, 
  Gamepad2, Heart, Play, ShoppingBag, ExternalLink, Sparkles
} from 'lucide-react';

export const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState<'home' | 'glasses' | 'app' | 'deals'>('home');

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-white flex flex-col justify-between font-sans relative overflow-x-hidden selection:bg-amber-400 selection:text-black">
      {/* BACKGROUND 3D DARK METALLIC / STONE LAYER */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity pointer-events-none scale-105 transition-all duration-700"
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
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-all">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <div className="font-bold text-white text-base tracking-tight flex items-center gap-1">
              <span>XBOX</span>
              <span className="text-zinc-400 font-normal text-xs">/ 117</span>
            </div>
          </div>

          {/* Pill Menu Navigation (Center) */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full shadow-lg font-sans text-xs">
            <button
              onClick={() => setActiveNav('home')}
              className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeNav === 'home'
                  ? 'bg-white/25 text-white font-semibold shadow-xs border border-white/30'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveNav('glasses')}
              className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeNav === 'glasses'
                  ? 'bg-white/25 text-white font-semibold shadow-xs border border-white/30'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Glasses className="w-3.5 h-3.5" />
              <span>711 Glasses</span>
            </button>

            <button
              onClick={() => setActiveNav('app')}
              className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeNav === 'app'
                  ? 'bg-white/25 text-white font-semibold shadow-xs border border-white/30'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Application</span>
            </button>

            <button
              onClick={() => setActiveNav('deals')}
              className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeNav === 'deals'
                  ? 'bg-white/25 text-white font-semibold shadow-xs border border-white/30'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Hot Deals</span>
            </button>
          </nav>

          {/* Right Controls: Search Bar & Capsule CTA Button */}
          <div className="flex items-center gap-3">
            {/* Search Bar Capsule */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full text-xs text-zinc-300 focus-within:border-white/40 shadow-md">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Search here ..."
                className="bg-transparent border-none outline-hidden text-xs text-white placeholder-zinc-400 w-28 md:w-36"
              />
              <span className="text-zinc-600 font-mono">|</span>
              <button className="text-zinc-400 hover:text-white cursor-pointer transition-colors">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Solid Capsule Action Button */}
            <button className="px-5 py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs rounded-full shadow-xl flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95">
              <Gamepad2 className="w-4 h-4 text-zinc-900" />
              <span>Get Yours</span>
            </button>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 2. GRID BENTO LAYOUT (KIRI 7 KOLOM & KANAN 5 KOLOM) */}
        {/* ========================================================================= */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 my-auto">
          
          {/* ========================================================================= */}
          {/* GRID KIRI (7 Kolom / 60% Width) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            
            {/* TOP ROW KIRI: 2 Kartu (Kartu Atas Glassy & Kartu Tengah Testimonial Putih) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Kartu Atas (Frame Kaca Melengkung - Phone App Preview) */}
              <div className="rounded-[32px] bg-gradient-to-br from-white/15 via-white/5 to-white/10 backdrop-blur-2xl border border-white/20 p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[280px] group hover:border-white/35 transition-all">
                {/* Floating App Badge */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Center iPhone Showcase Mockup */}
                <div className="absolute inset-x-0 bottom-8 flex justify-center opacity-90 group-hover:scale-105 transition-transform duration-500">
                  <div className="w-36 h-48 rounded-[24px] overflow-hidden border-2 border-white/30 shadow-2xl bg-zinc-900 relative">
                    <img 
                      src="/assets/app_mobile_preview_1787219119651.png" 
                      alt="App Mockup" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Bottom Overlay Label */}
                <div className="relative z-10 pt-32">
                  <p className="text-xs font-medium text-white/90 leading-tight max-w-[150px] drop-shadow-md">
                    Our App is Out, Lets Get Started Now
                  </p>
                </div>
              </div>

              {/* Kartu Tengah (Box Card Putih/Glassy - Testimonial) */}
              <div className="rounded-[32px] bg-white text-zinc-950 p-6 shadow-2xl flex flex-col justify-between min-h-[280px] hover:scale-[1.02] transition-transform">
                <div className="space-y-3">
                  <div className="text-xs font-mono font-bold text-zinc-400 tracking-wide uppercase">
                    +150 <span className="font-normal font-sans text-zinc-400">Testimonials</span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-950 leading-snug tracking-tight font-sans">
                    This thing is built so well! <span className="text-zinc-400 font-normal">Super smooth feel, totally worth it!</span>
                  </h3>
                </div>

                {/* Bottom Avatars Stack & Heart Count Pill */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                  <div className="flex items-center -space-x-2">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Avatar 1" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="Avatar 2" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt="Avatar 3" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                  </div>

                  <div className="px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-mono font-bold text-zinc-800 flex items-center gap-1.5 shadow-2xs">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>50</span>
                  </div>
                </div>
              </div>

            </div>

            {/* AREA BAWAH KIRI (Judul Besar & 2 Tombol Kapsul) */}
            <div className="space-y-4 pt-4">
              <div className="text-xs font-mono text-zinc-400 tracking-wider">
                HR-117 (An Elite Experience)
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-white tracking-tight leading-none flex items-center gap-3 flex-wrap">
                <span>XBOX Hazard</span>
                <span className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm">🎮</span>
                <span>› Controller 117</span>
              </h1>

              {/* 2 Capsule CTA Buttons */}
              <div className="flex items-center gap-3 pt-2 font-sans">
                {/* Button 1: Buy Now */}
                <button className="px-7 py-3 bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs rounded-full shadow-2xl flex items-center gap-2.5 transition-all cursor-pointer hover:scale-105">
                  <ShoppingBag className="w-4 h-4 text-zinc-900" />
                  <span>Buy Now <span className="text-zinc-500 font-normal">($200)</span></span>
                </button>

                {/* Button 2: Watch Promo */}
                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-2xl border border-white/20 text-white font-semibold text-xs rounded-full shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105">
                  <Play className="w-4 h-4 text-white fill-white" />
                  <span>Watch Promo</span>
                </button>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* GRID KANAN (5 Kolom / 40% Width) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            
            {/* KARTU ATAS KANAN (Banner Frame Gelap - HALO INFINITE) */}
            <div className="rounded-[28px] bg-gradient-to-r from-zinc-900/90 via-zinc-900/70 to-zinc-950/90 border border-white/15 backdrop-blur-xl p-5 shadow-2xl flex items-center justify-between gap-4 relative overflow-hidden group">
              <div className="space-y-2 relative z-10">
                <div className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                  HALO INFINITE
                </div>
                <h3 className="text-sm font-mono font-bold text-white">
                  Halo Infinite Is Out Now
                </h3>
                <button className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-[11px] rounded-full transition-colors cursor-pointer">
                  Check The Game
                </button>
              </div>

              {/* Spartan Helmet Preview */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/20 relative z-10 group-hover:scale-105 transition-transform duration-500">
                <img 
                  src="/assets/halo_infinite_banner_1787219091407.png" 
                  alt="Halo Banner" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* KARTU TENGAH KANAN (Box Card + 1 Tombol Kapsul Discord) */}
            <div className="rounded-[28px] bg-white/10 backdrop-blur-2xl border border-white/20 p-6 shadow-2xl space-y-3">
              <h2 className="text-xl font-mono font-bold text-white tracking-tight">
                Want to Join The Elite Experience?
              </h2>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Join our Discord channel and discover more about the controller and its specs.
              </p>

              <div className="pt-1">
                <button className="px-6 py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs rounded-full shadow-xl flex items-center gap-2 transition-all cursor-pointer hover:scale-105">
                  <span className="text-sm">🤖</span>
                  <span>Join Us</span>
                </button>
              </div>
            </div>

            {/* KARTU BAWAH KANAN (Card Besar - Controller Showcase) */}
            <div className="rounded-[36px] bg-gradient-to-b from-white/15 via-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[340px] group hover:border-white/35 transition-all">
              
              {/* Card Top Row Badges */}
              <div className="flex items-center justify-between relative z-10">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-mono text-[11px] font-semibold">
                  Smooth UX
                </span>
              </div>

              {/* Center 3D Controller Image Showcase */}
              <div className="my-auto py-4 flex justify-center group-hover:scale-105 transition-transform duration-500">
                <img 
                  src="/assets/xbox_controller_mockup_1787219072427.png" 
                  alt="Xbox Controller" 
                  className="w-56 h-auto drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] object-contain"
                />
              </div>

              {/* Bottom Content Area */}
              <div className="space-y-3 relative z-10 pt-2 border-t border-white/15">
                <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 text-white font-mono text-[10px] font-semibold border border-white/30">
                  Specs
                </span>

                <h3 className="text-lg font-mono font-bold text-white tracking-tight leading-snug">
                  Smooth Buttons Hit Different, SHOOT
                </h3>

                {/* Bottom Action Pills Row */}
                <div className="flex items-center justify-between pt-1">
                  <a href="#" className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1 font-sans">
                    <span>Join The Cult</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button className="px-5 py-2 bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs rounded-full shadow-lg transition-all cursor-pointer hover:scale-105">
                    Get Yours
                  </button>
                </div>
              </div>

            </div>

          </div>

        </main>

        {/* FOOTER */}
        <footer className="w-full text-center py-2 text-[11px] font-mono text-zinc-500">
          Frutiger Aero Bento Glassmorphism UI Shell • Live Layout Showcase
        </footer>

      </div>
    </div>
  );
};

export default App;
