import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, User } from 'lucide-react';

export interface GlassSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  isHeader?: boolean;
}

interface CustomGlassSelectProps {
  options: GlassSelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  theme?: 'dark' | 'light';
}

export const CustomGlassSelect: React.FC<CustomGlassSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Pilih opsi...",
  disabled = false,
  theme = 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value && !o.isHeader);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerClasses = theme === 'light'
    ? 'bg-zinc-100/90 hover:bg-zinc-200/80 border-zinc-200/80 text-zinc-900 focus:border-zinc-400'
    : 'bg-white/5 hover:bg-white/10 border-white/10 text-white focus:border-white/30';

  return (
    <div className="relative w-full font-sans text-xs" ref={containerRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2.5 rounded-xl border backdrop-blur-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${triggerClasses}`}
      >
        <div className="flex items-center gap-2 truncate">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
            theme === 'light' ? 'bg-zinc-300 text-zinc-800' : 'bg-white/10 text-white'
          }`}>
            {selectedOption?.label?.charAt(0).toUpperCase() || <User className="w-3 h-3"/>}
          </div>
          <span className="font-semibold truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium uppercase tracking-wider ${
              theme === 'light' ? 'bg-zinc-200 text-zinc-600' : 'bg-white/10 text-white/60'
            }`}>
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 opacity-50 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* FLOATING FROSTED GLASS MENU (SMOOTH FROSTED BLUR) */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 max-h-56 overflow-y-auto custom-scrollbar rounded-2xl border border-white/20 bg-zinc-950/90 backdrop-blur-2xl p-1.5 shadow-2xl z-50 space-y-0.5 text-white font-sans">
          {options.map((opt, idx) => {
            if (opt.isHeader) {
              return (
                <div key={`header-${idx}`} className="px-2.5 py-1 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                  {opt.label}
                </div>
              );
            }

            const isSelected = opt.value === value;

            return (
              <div
                key={opt.value || `opt-${idx}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-white/15 text-white font-semibold' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0">
                    {opt.label.charAt(0)}
                  </div>
                  <div className="truncate">
                    <span className="block truncate text-xs">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="block text-[10px] text-white/40 truncate">{opt.sublabel}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {opt.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-medium uppercase">
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-white"/>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
