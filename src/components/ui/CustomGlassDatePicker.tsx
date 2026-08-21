import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomGlassDatePickerProps {
  value: string; // ISO / YYYY-MM-DDTHH:mm string
  onChange: (val: string) => void;
  presetButtons?: React.ReactNode;
  theme?: 'dark' | 'light';
}

export const CustomGlassDatePicker: React.FC<CustomGlassDatePickerProps> = ({
  value,
  onChange,
  presetButtons,
  theme = 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parsing tanggal aktif atau default hari ini
  const initialDate = value ? new Date(value) : new Date();
  const validDate = isNaN(initialDate.getTime()) ? new Date() : initialDate;

  const [viewYear, setViewYear] = useState(validDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(validDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(validDate.getDate());
  const [selectedHours, setSelectedHours] = useState(
    value && !isNaN(initialDate.getTime()) ? String(initialDate.getHours()).padStart(2, '0') : '17'
  );
  const [selectedMinutes, setSelectedMinutes] = useState(
    value && !isNaN(initialDate.getTime()) ? String(initialDate.getMinutes()).padStart(2, '0') : '00'
  );

  // Sync internal states when value prop changes externally (e.g. Preset buttons click)
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const emitChange = (day: number, hours: string, minutes: string) => {
    const year = viewYear;
    const month = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const formatted = `${year}-${month}-${d}T${hours}:${minutes}`;
    onChange(formatted);
  };

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    emitChange(day, selectedHours, selectedMinutes);
  };

  const handleTimeChange = (hours: string, minutes: string) => {
    setSelectedHours(hours);
    setSelectedMinutes(minutes);
    emitChange(selectedDay, hours, minutes);
  };

  const formatDisplayValue = () => {
    if (!value) return 'Tentukan tenggat waktu...';
    const d = new Date(value);
    if (isNaN(d.getTime())) return 'Tentukan tenggat waktu...';
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  const triggerBgClasses = theme === 'dark'
    ? 'bg-neutral-950 border-white/10 hover:bg-neutral-900 text-white'
    : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-900';

  return (
    <div className="relative w-full font-sans text-xs" ref={containerRef}>
      {/* TRIGGER BUTTON (PRESET & INPUT FIELD) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className={`block text-[10px] font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Tenggat Waktu (Deadline)
          </label>
          {presetButtons}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer text-xs font-medium ${triggerBgClasses}`}
        >
          <div className="flex items-center gap-2 truncate">
            <Calendar className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}/>
            <span className={value ? (theme === 'dark' ? 'text-white font-semibold' : 'text-zinc-900 font-semibold') : 'text-zinc-400'}>
              {formatDisplayValue()}
            </span>
          </div>
          <Clock className="w-3.5 h-3.5 text-zinc-400"/>
        </button>
      </div>

      {/* FLOATING DARK FROSTED GLASS CALENDAR POPOVER */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 mt-2 w-72 rounded-2xl border border-white/15 bg-zinc-950/95 backdrop-blur-2xl p-4 shadow-2xl z-50 text-white space-y-3.5 font-sans">
          {/* Header Bulan & Navigasi */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 0) {
                    setViewMonth(11);
                    setViewYear(v => v - 1);
                  } else {
                    setViewMonth(v => v - 1);
                  }
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4"/>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 11) {
                    setViewMonth(0);
                    setViewYear(v => v + 1);
                  } else {
                    setViewMonth(v => v + 1);
                  }
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4"/>
              </button>
            </div>
          </div>

          {/* Grid Nama Hari */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-zinc-500">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          {/* Grid Tanggal */}
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
                  onClick={() => handleDayClick(dayNum)}
                  className={`w-7 h-7 mx-auto rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-zinc-950 font-bold shadow-md'
                      : 'hover:bg-white/10 text-zinc-300 hover:text-white'
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Quick Time Selector */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase">Jam:</span>
            <div className="flex items-center gap-1.5">
              <select
                value={selectedHours}
                onChange={(e) => handleTimeChange(e.target.value, selectedMinutes)}
                className="bg-neutral-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono outline-hidden cursor-pointer"
              >
                {Array.from({ length: 24 }).map((_, i) => {
                  const h = String(i).padStart(2, '0');
                  return <option key={h} value={h}>{h}</option>;
                })}
              </select>
              <span className="text-zinc-500 font-bold">:</span>
              <select
                value={selectedMinutes}
                onChange={(e) => handleTimeChange(selectedHours, e.target.value)}
                className="bg-neutral-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono outline-hidden cursor-pointer"
              >
                {['00', '15', '30', '45', '59'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-white transition-all cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
