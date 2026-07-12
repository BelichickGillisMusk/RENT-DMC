import React, { useState, useRef, useEffect } from 'react';
import { Paintbrush, Check, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme, PALETTES } from './ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

export function ThemeToggle() {
  const { theme, activePalette, setPalette, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const activePaletteObj = PALETTES.find(p => p.id === activePalette) || PALETTES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <div className="flex items-center gap-1.5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(!isOpen)}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 dark:bg-[#191A30]/50 dark:hover:bg-[#191A30]/80 border border-app-border backdrop-blur-md text-app-text hover:text-app-accent flex items-center gap-2 transition-all duration-300 shadow-sm cursor-pointer"
          title="Switch 2026 Fashion Color Scheme"
        >
          <Paintbrush className="w-4 h-4 text-app-accent animate-pulse" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider hidden sm:inline">
            Style: <span className="text-app-accent font-extrabold">{activePaletteObj.name}</span>
          </span>
        </motion.button>

        {/* Quick sun/moon cycle toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 dark:bg-[#191A30]/50 dark:hover:bg-[#191A30]/80 border border-app-border text-app-text hover:text-app-accent transition-all cursor-pointer"
          aria-label="Cycle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-app-card border-2 border-app-border rounded-3xl shadow-2xl p-4 z-[9999] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-app-border mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-app-accent" />
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-[#FF5F1F] font-mono">
                    2026 DIGITAL & FASHION LAB
                  </h4>
                  <p className="text-[13px] font-bold text-app-text/90">
                    High-End Color Curations
                  </p>
                </div>
              </div>
              <span className="text-[8px] font-black bg-app-accent/15 border border-app-accent/25 text-app-accent px-2 py-0.5 rounded-full font-mono">
                TRENDS HOT IN '26
              </span>
            </div>

            {/* List of palettes */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {PALETTES.map((palette) => {
                const isSelected = activePalette === palette.id;
                return (
                  <button
                    key={palette.id}
                    onClick={() => {
                      setPalette(palette.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all duration-300 flex flex-col gap-2 cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-app-accent/10 border-app-accent/50 shadow-inner'
                        : 'bg-app-bg/50 hover:bg-app-bg border-app-border hover:border-app-accent/30'
                    }`}
                  >
                    {/* Hover Glow effect for trendiest 2026 palettes */}
                    {palette.year.includes('21') || palette.year.includes('26') ? (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-app-accent/5 rounded-full blur-xl group-hover:bg-app-accent/10 transition-colors" />
                    ) : null}

                    <div className="flex items-start justify-between relative z-10 w-full">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-black text-sm text-app-text">
                            {palette.name}
                          </span>
                          <span className={`text-[8px] font-bold font-mono px-2 py-0.2 rounded-full uppercase z-10 ${
                            palette.category === 'dark' 
                              ? 'bg-neutral-900 text-neutral-100 border border-neutral-800' 
                              : 'bg-neutral-100 text-neutral-900 border border-neutral-200'
                          }`}>
                            {palette.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-app-text/60 line-clamp-2 leading-relaxed">
                          {palette.description}
                        </p>
                      </div>

                      {/* Accent selected indicator */}
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-app-accent text-white flex items-center justify-center shadow-md shadow-app-accent/30">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <span className="text-[8px] font-black font-mono text-app-text/30 group-hover:text-app-accent transition-colors">
                          {palette.year}
                        </span>
                      )}
                    </div>

                    {/* Color Chips Preview Bar */}
                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-app-border/30 w-full">
                      <div className="flex items-center gap-1.5">
                        {palette.chips.map((chipColor, chipIdx) => (
                          <div
                            key={chipIdx}
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: chipColor }}
                            title={`Palette Hex: ${chipColor}`}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono font-bold text-app-text/40 group-hover:text-app-text/70 transition-colors uppercase">
                        Select Schema
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer details about 2026 digital styles */}
            <div className="mt-3 pt-2.5 border-t border-app-border/50 text-[9px] font-mono text-app-text/50 text-center leading-relaxed">
              Ditches the old orange-and-black Halloween style. Inspired by high-fashion couture runway glosses, digital bioluminescence, and earthy wellness.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
