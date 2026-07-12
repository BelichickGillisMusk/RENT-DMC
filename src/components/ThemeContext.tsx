import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Palette {
  id: string;
  name: string;
  description: string;
  year: string;
  category: 'dark' | 'light';
  chips: string[]; // visual previews for color selection chips
  colors: {
    '--app-bg': string;
    '--app-text': string;
    '--app-border': string;
    '--app-card': string;
    '--app-accent': string;
    '--ruby': string;
    '--ruby-light': string;
    '--ruby-dark': string;
    '--body-gradient-1': string;
    '--body-gradient-2': string;
  };
}

export const PALETTES: Palette[] = [
  {
    id: 'ruby-sensation',
    name: 'Ruby Sensation',
    description: 'Deep velvet espresso chocolate background with elegant line-art dusty rose pink and warm glowing coral accents.',
    year: '2026 Trend',
    category: 'dark',
    chips: ['#231515', '#EC7286', '#EE5937', '#FFF1EC'],
    colors: {
      '--app-bg': '#231515',
      '--app-card': '#2E1D1D',
      '--app-text': '#FFF1EC',
      '--app-accent': '#EC7286',
      '--app-border': 'rgba(236, 114, 134, 0.22)',
      '--ruby': '#EE5937',
      '--ruby-light': '#FFA18C',
      '--ruby-dark': '#8B2B16',
      '--body-gradient-1': '#4D2A2A',
      '--body-gradient-2': '#190E0E',
    }
  },
  {
    id: 'future-dusk',
    name: 'Future Dusk',
    description: 'Celestial deep indigo & cybernetic violet. WGSN\'s 2026 Color of the Year.',
    year: '2026 Trend',
    category: 'dark',
    chips: ['#0F101E', '#191A30', '#8F00FF', '#8B82FF'],
    colors: {
      '--app-bg': '#0F101E',
      '--app-card': '#191A30',
      '--app-text': '#F0F1FA',
      '--app-accent': '#8F00FF',
      '--app-border': 'rgba(143, 0, 255, 0.16)',
      '--ruby': '#8B82FF',
      '--ruby-light': '#B8B5FF',
      '--ruby-dark': '#4C3B91',
      '--body-gradient-1': '#231F3F',
      '--body-gradient-2': '#121124',
    }
  },
  {
    id: 'cherry-lacquer',
    name: 'Cherry Lacquer',
    description: 'Black-cherry depth with creme parchment highlights. High-fashion couture runway trend.',
    year: '2026 Trend',
    category: 'dark',
    chips: ['#120205', '#1E060C', '#D12C49', '#FFFBF7'],
    colors: {
      '--app-bg': '#120205',
      '--app-card': '#1E060C',
      '--app-text': '#FFFBF7',
      '--app-accent': '#D12C49',
      '--app-border': 'rgba(209, 44, 73, 0.18)',
      '--ruby': '#D12C49',
      '--ruby-light': '#F7637D',
      '--ruby-dark': '#751223',
      '--body-gradient-1': '#3D0B14',
      '--body-gradient-2': '#0B0002',
    }
  },
  {
    id: 'aquatic-awe',
    name: 'Aquatic Awe',
    description: 'Bioluminescent deep ocean teal and radiant neon turquoise. Tech-nature design.',
    year: '2026 Trend',
    category: 'dark',
    chips: ['#040E12', '#091E26', '#00F2FE', '#ECF8FF'],
    colors: {
      '--app-bg': '#040E12',
      '--app-card': '#091E26',
      '--app-text': '#ECF8FF',
      '--app-accent': '#00F2FE',
      '--app-border': 'rgba(0, 242, 254, 0.15)',
      '--ruby': '#00F2FE',
      '--ruby-light': '#7FFFFE',
      '--ruby-dark': '#00737C',
      '--body-gradient-1': '#0F3A40',
      '--body-gradient-2': '#020A0D',
    }
  },
  {
    id: 'apricot-sage',
    name: 'Apricot Wellness',
    description: 'Earthy calming sage green, mineral sand, and restoration peach-apricot pops.',
    year: '2026 Trend',
    category: 'light',
    chips: ['#FAF5F0', '#FFFFFF', '#E27E57', '#8BAE96'],
    colors: {
      '--app-bg': '#FAF5F0',
      '--app-card': '#FFFFFF',
      '--app-text': '#2B2522',
      '--app-accent': '#E27E57',
      '--app-border': 'rgba(139, 174, 150, 0.25)',
      '--ruby': '#E27E57',
      '--ruby-light': '#FFA17A',
      '--ruby-dark': '#A44C27',
      '--body-gradient-1': '#E6F0E9',
      '--body-gradient-2': '#FAF5F0',
    }
  },
  {
    id: 'giants-orange',
    name: 'Classic Legacy',
    description: 'A polished, high-end navy slate and sunset orange. The original iconic Rent-Ruby look.',
    year: 'Rent-Ruby Original',
    category: 'dark',
    chips: ['#0B1A2D', '#14253D', '#FF5F1F', '#F9F7F5'],
    colors: {
      '--app-bg': '#0B1A2D',
      '--app-card': '#14253D',
      '--app-text': '#F9F7F5',
      '--app-accent': '#FF5F1F',
      '--app-border': 'rgba(253, 90, 30, 0.12)',
      '--ruby': '#A64B4B',
      '--ruby-light': '#D18E8E',
      '--ruby-dark': '#7A3333',
      '--body-gradient-1': '#1c2e47',
      '--body-gradient-2': '#07101C',
    }
  }
];

interface ThemeContextType {
  theme: 'light' | 'dark';
  activePalette: string;
  setPalette: (id: string) => void;
  palettes: Palette[];
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activePalette, setPaletteState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-palette');
      if (saved && PALETTES.some(p => p.id === saved)) return saved;
    }
    return 'ruby-sensation'; // Set the new 2026 Ruby Sensation as the gorgeous default
  });

  const currentPalette = PALETTES.find(p => p.id === activePalette) || PALETTES[0];
  const theme = currentPalette.category;

  const setPalette = (id: string) => {
    if (PALETTES.some(p => p.id === id)) {
      setPaletteState(id);
      localStorage.setItem('app-palette', id);
    }
  };

  const toggleTheme = () => {
    // Standard Moon/Sun toggle cycles between Dark (Future Dusk) and Light (Apricot Sage)
    if (theme === 'dark') {
      setPalette('apricot-sage');
    } else {
      setPalette('future-dusk');
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Clear old tailwind classes
    root.classList.remove('light', 'dark');
    // Add current palette category class for built-in styling supports
    root.classList.add(theme);

    // Apply all color variable overrides dynamically to root
    Object.entries(currentPalette.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [activePalette, theme]);

  return (
    <ThemeContext.Provider value={{ theme, activePalette, setPalette, palettes: PALETTES, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
