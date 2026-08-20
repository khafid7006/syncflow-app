import React from 'react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-slate-900 text-white flex items-center justify-center font-mono p-6">
      <div className="text-center space-y-4 max-w-md p-8 bg-slate-800/80 rounded-3xl border border-slate-700 shadow-xl">
        <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center font-bold mx-auto text-xl shadow-md">
          ⚡
        </div>
        <h1 className="text-2xl font-bold text-amber-400">SyncFlow Clean Slate</h1>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Seluruh komponen, modul, view, dan fitur lama telah dibersihkan 100%. Kode siap untuk tahap selanjutnya.
        </p>
      </div>
    </div>
  );
};

export default App;
