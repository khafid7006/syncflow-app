import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

interface CustomGlassDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  presetButtons?: React.ReactNode;
  theme?: 'dark' | 'light';
  maxDate?: string;
}

export const CustomGlassDatePicker: React.FC<CustomGlassDatePickerProps> = ({
  value,
  onChange,
  presetButtons,
  theme = 'light',
  maxDate
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Parsing initial date
  const parseInitialDate = () => {
    if (!value) return new Date();
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const initialDate = parseInitialDate();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());
  const [selectedHours, setSelectedHours] = useState(
    value && !isNaN(initialDate.getTime()) ? String(initialDate.getHours()).padStart(2, '0') : '17'
  );
  const [selectedMinutes, setSelectedMinutes] = useState(
    value && !isNaN(initialDate.getTime()) ? String(initialDate.getMinutes()).padStart(2, '0') : '00'
  );

  // Sync internal modal states when value prop changes externally (e.g. Preset buttons click)
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
        setSelectedDay(d.getDate());
        setSelectedHours(String(d.getHours()).padStart(2, '0'));
        setSelectedMinutes(String(d.getMinutes()).padStart(2, '0'));
      }
    }
  }, [value]);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const handleApplySelection = () => {
    const year = viewYear;
    const month = String(viewMonth + 1).padStart(2, '0');
    const d = String(selectedDay).padStart(2, '0');
    onChange(`${year}-${month}-${d}T${selectedHours}:${selectedMinutes}`);
    setIsModalOpen(false);
  };

  const inputThemeClasses = theme === 'dark'
    ? 'bg-neutral-950 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/30'
    : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white';

  const iconThemeClasses = theme === 'dark'
    ? 'text-zinc-400 hover:text-white hover:bg-white/10'
    : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60';

  return (
    <div className="w-full font-sans text-xs space-y-1.5">
      <div className="flex items-center justify-between">
        <label className={`block text-[10px] font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Tenggat Waktu (Deadline)
        </label>
        {presetButtons}
      </div>

      {/* INPUT HYBRID (BISA DIKETIK MANUAL & ADA TOMBOL MODAL KALENDER) */}
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="YYYY-MM-DD HH:mm (Contoh: 2026-08-25 17:00)"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border pl-3 pr-10 py-2.5 text-xs font-mono outline-hidden transition-all ${inputThemeClasses}`}
        />
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`absolute right-2 p-1.5 rounded-lg transition-colors cursor-pointer ${iconThemeClasses}`}
          title="Buka Kalender Visual"
        >
          <Calendar className="w-4 h-4"/>
        </button>
      </div>

      {/* MODAL KALENDER ZEN (FIXED CENTER OVERLAY) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-neutral-900/95 border border-white/15 rounded-3xl p-5 shadow-2xl space-y-4 text-white font-sans animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Calendar className="w-4 h-4 text-zinc-300"/>
                <span>Pilih Tenggat Waktu</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>

            {/* Navigasi Bulan & Tahun */}
            <div className="flex items-center justify-between px-1">
              <span className="font-bold text-xs text-white">
                {monthNames[viewMonth]} {viewYear}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 0) {
                      setViewMonth(11);
                      setViewYear(y => y - 1);
                    } else {
                      setViewMonth(m => m - 1);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4"/>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (viewMonth === 11) {
                      setViewMonth(0);
                      setViewYear(y => y + 1);
                    } else {
                      setViewMonth(m => m + 1);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-300 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4"/>
                </button>
              </div>
            </div>

            {/* Nama Hari */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-500">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            {/* Tanggal Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = selectedDay === dayNum;
                return (
                  <button
                    type="button"
                    key={dayNum}
                    onClick={() => setSelectedDay(dayNum)}
                    className={`w-8 h-8 mx-auto rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-zinc-950 shadow-md font-bold'
                        : 'hover:bg-white/10 text-zinc-300 hover:text-white'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Time Picker Bar */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400"/>
                <span className="text-[10px] uppercase font-bold text-zinc-400">Jam:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedHours}
                  onChange={(e) => setSelectedHours(e.target.value)}
                  className="bg-neutral-950 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono outline-hidden cursor-pointer"
                >
                  {Array.from({ length: 24 }).map((_, i) => {
                    const h = String(i).padStart(2, '0');
                    return <option key={h} value={h}>{h}</option>;
                  })}
                </select>
                <span className="text-zinc-500 font-bold">:</span>
                <select
                  value={selectedMinutes}
                  onChange={(e) => setSelectedMinutes(e.target.value)}
                  className="bg-neutral-950 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono outline-hidden cursor-pointer"
                >
                  {['00', '15', '30', '45', '59'].map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer Action */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplySelection}
                className="px-4 py-1.5 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5"/>
                <span>Terapkan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
