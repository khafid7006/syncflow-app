import React, { useState } from 'react';

interface CalendarProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

export const CustomGlassRangeCalendar: React.FC<CalendarProps> = ({
  startDate,
  endDate,
  onChange,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handleDateClick = (day: number) => {
    const selectedDateStr = new Date(Date.UTC(year, month, day))
      .toISOString()
      .split('T')[0];

    if (!startDate || (startDate && endDate)) {
      // Set start baru
      onChange(selectedDateStr, '');
    } else if (startDate && !endDate) {
      if (selectedDateStr < startDate) {
        onChange(selectedDateStr, '');
      } else {
        onChange(startDate, selectedDateStr);
      }
    }
  };

  const isSelectedStart = (day: number) => {
    const dStr = new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
    return startDate === dStr;
  };

  const isSelectedEnd = (day: number) => {
    const dStr = new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
    return endDate === dStr;
  };

  const isInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const dStr = new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
    return dStr > startDate && dStr < endDate;
  };

  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-neutral-950/80 backdrop-blur-xl space-y-3 select-none font-sans">
      {/* Header Bulan & Navigasi */}
      <div className="flex items-center justify-between text-xs font-bold text-white">
        <span>{monthNames[month]} {year}</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            ›
          </button>
        </div>
      </div>

      {/* Grid Hari */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-zinc-500">
        <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
      </div>

      {/* Grid Tanggal */}
      <div className="grid grid-cols-7 gap-1 text-xs font-sans">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const start = isSelectedStart(day);
          const end = isSelectedEnd(day);
          const range = isInRange(day);

          return (
            <button
              type="button"
              key={day}
              onClick={() => handleDateClick(day)}
              className={`h-8 rounded-lg flex items-center justify-center font-medium transition-all cursor-pointer text-[11px] ${
                start || end
                  ? 'bg-white text-zinc-950 font-extrabold shadow-md scale-105 z-10'
                  : range
                  ? 'bg-white/15 text-white rounded-none'
                  : 'text-zinc-300 hover:bg-white/5'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
