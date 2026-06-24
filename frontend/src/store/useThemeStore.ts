import { create } from 'zustand';

export interface AppTheme {
  id: string;
  name: string;
  isDark: boolean;
  accentColor: string; // hex
  fontFamily: string; // 'Geist' | 'Plus Jakarta Sans' | 'Inter' | 'JetBrains Mono' | 'Geist Mono'
  borderRadius: string; // '0px' | '4px' | '8px' | '12px' | '999px'
  sidebarStyle: 'solid' | 'transparent' | 'glass' | 'bordered';
  cardStyle: 'solid' | 'glass' | 'high-contrast' | 'bordered-flat';
  buttonStyle: 'flat' | 'gradient' | 'glass' | 'outline';
  logoIcon: 'Sparkles' | 'Zap' | 'Flame' | 'Shield' | 'Layers' | 'Eye' | 'Inbox' | 'Settings' | 'Heart';
  colors: {
    background: string; // hex
    foreground: string; // hex
    card: string; // hex
    cardForeground: string; // hex
    border: string; // hex
    mutedForeground: string; // hex
  };
}

export const PRESET_THEMES: AppTheme[] = [
  {
    id: 'amber-classic',
    name: 'ForgeFlow Classic (Dark)',
    isDark: true,
    accentColor: '#f59e0b',
    fontFamily: 'Plus Jakarta Sans',
    borderRadius: '10px',
    sidebarStyle: 'glass',
    cardStyle: 'glass',
    buttonStyle: 'gradient',
    logoIcon: 'Sparkles',
    colors: {
      background: '#09090b',
      foreground: '#f4f4f5',
      card: '#0f0f12',
      cardForeground: '#f4f4f5',
      border: '#27272f',
      mutedForeground: '#71717a',
    }
  },
  {
    id: 'neon-cyberpunk',
    name: 'Neon Cyberpunk',
    isDark: true,
    accentColor: '#ff0055',
    fontFamily: 'JetBrains Mono',
    borderRadius: '0px',
    sidebarStyle: 'solid',
    cardStyle: 'high-contrast',
    buttonStyle: 'flat',
    logoIcon: 'Zap',
    colors: {
      background: '#030303',
      foreground: '#00ffcc',
      card: '#0c0c0c',
      cardForeground: '#00ffcc',
      border: '#ff0055',
      mutedForeground: '#888888',
    }
  },
  {
    id: 'emerald-forest',
    name: 'Emerald Forest (Dark)',
    isDark: true,
    accentColor: '#10b981',
    fontFamily: 'Inter',
    borderRadius: '8px',
    sidebarStyle: 'glass',
    cardStyle: 'glass',
    buttonStyle: 'flat',
    logoIcon: 'Flame',
    colors: {
      background: '#061712',
      foreground: '#ecfdf5',
      card: '#0b241b',
      cardForeground: '#ecfdf5',
      border: '#0f382a',
      mutedForeground: '#6ee7b7',
    }
  },
  {
    id: 'midnight-lavender',
    name: 'Midnight Lavender',
    isDark: true,
    accentColor: '#8b5cf6',
    fontFamily: 'Geist',
    borderRadius: '16px',
    sidebarStyle: 'glass',
    cardStyle: 'glass',
    buttonStyle: 'gradient',
    logoIcon: 'Layers',
    colors: {
      background: '#0b0914',
      foreground: '#f3e8ff',
      card: '#120e24',
      cardForeground: '#f3e8ff',
      border: '#221a3f',
      mutedForeground: '#c084fc',
    }
  },
  {
    id: 'crisp-light',
    name: 'Modernist Light',
    isDark: false,
    accentColor: '#2563eb',
    fontFamily: 'Inter',
    borderRadius: '12px',
    sidebarStyle: 'solid',
    cardStyle: 'bordered-flat',
    buttonStyle: 'flat',
    logoIcon: 'Shield',
    colors: {
      background: '#f8fafc',
      foreground: '#0f172a',
      card: '#ffffff',
      cardForeground: '#0f172a',
      border: '#e2e8f0',
      mutedForeground: '#64748b',
    }
  }
];

function hexToHslString(hex: string): string {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `${hDeg} ${sPct}% ${lPct}%`;
}

export function applyThemeToDOM(theme: AppTheme) {
  const root = document.documentElement;

  // Set font
  root.style.setProperty('--theme-font', theme.fontFamily + ', sans-serif');

  // Set radius
  root.style.setProperty('--theme-radius', theme.borderRadius);

  // Set colors
  root.style.setProperty('--theme-background', hexToHslString(theme.colors.background));
  root.style.setProperty('--theme-foreground', hexToHslString(theme.colors.foreground));
  root.style.setProperty('--theme-card', hexToHslString(theme.colors.card));
  root.style.setProperty('--theme-card-foreground', hexToHslString(theme.colors.cardForeground));
  root.style.setProperty('--theme-border', hexToHslString(theme.colors.border));
  root.style.setProperty('--theme-muted-foreground', hexToHslString(theme.colors.mutedForeground));

  // Accent primary colors
  root.style.setProperty('--theme-primary', hexToHslString(theme.accentColor));
  root.style.setProperty('--theme-primary-foreground', theme.isDark ? '240 10% 4%' : '240 10% 96%');

  // Surface variables for Tailwind overrides
  root.style.setProperty('--theme-surface-950', theme.colors.background);
  root.style.setProperty('--theme-surface-900', theme.colors.card);
  root.style.setProperty('--theme-surface-800', theme.isDark ? '#18181f' : '#f1f5f9');
  root.style.setProperty('--theme-surface-700', theme.isDark ? '#1f1f2a' : '#e2e8f0');
  root.style.setProperty('--theme-surface-600', theme.isDark ? '#27272f' : '#cbd5e1');
  root.style.setProperty('--theme-surface-500', theme.isDark ? '#3f3f46' : '#94a3b8');
  root.style.setProperty('--theme-surface-400', theme.isDark ? '#52525b' : '#64748b');
  root.style.setProperty('--theme-surface-300', theme.isDark ? '#71717a' : '#475569');
  root.style.setProperty('--theme-surface-200', theme.isDark ? '#a1a1aa' : '#334155');
  root.style.setProperty('--theme-surface-100', theme.isDark ? '#d4d4d8' : '#1e293b');
  root.style.setProperty('--theme-surface-50', theme.isDark ? '#f4f4f5' : '#0f172a');

  // Accent scale overrides
  root.style.setProperty('--theme-brand-50', theme.accentColor + '0d'); // 5% opacity
  root.style.setProperty('--theme-brand-100', theme.accentColor + '1a'); // 10% opacity
  root.style.setProperty('--theme-brand-200', theme.accentColor + '33'); // 20% opacity
  root.style.setProperty('--theme-brand-300', theme.accentColor + '4d'); // 30% opacity
  root.style.setProperty('--theme-brand-400', theme.accentColor + '80'); // 50% opacity
  root.style.setProperty('--theme-brand-500', theme.accentColor);
  root.style.setProperty('--theme-brand-600', theme.accentColor);
  root.style.setProperty('--theme-brand-700', theme.accentColor);
  root.style.setProperty('--theme-brand-800', theme.accentColor);
  root.style.setProperty('--theme-brand-900', theme.accentColor);
  root.style.setProperty('--theme-brand-950', theme.accentColor);
}

interface ThemeState {
  activeTheme: AppTheme;
  customThemes: AppTheme[];
  setActiveTheme: (theme: AppTheme) => void;
  saveTheme: (theme: AppTheme) => void;
  deleteTheme: (id: string) => void;
  importTheme: (json: string) => { success: boolean; error?: string };
}

// Load initial theme state from localStorage
const getSavedState = () => {
  try {
    const savedActive = localStorage.getItem('forgeflow_active_theme');
    const savedCustoms = localStorage.getItem('forgeflow_custom_themes');
    const parsedActive = savedActive ? JSON.parse(savedActive) : PRESET_THEMES[0];
    const parsedCustoms = savedCustoms ? JSON.parse(savedCustoms) : [];

    // Apply the active theme
    applyThemeToDOM(parsedActive);

    return {
      activeTheme: parsedActive,
      customThemes: parsedCustoms
    };
  } catch (_) {
    applyThemeToDOM(PRESET_THEMES[0]);
    return {
      activeTheme: PRESET_THEMES[0],
      customThemes: []
    };
  }
};

const initialState = getSavedState();

export const useThemeStore = create<ThemeState>((set, get) => ({
  activeTheme: initialState.activeTheme,
  customThemes: initialState.customThemes,

  setActiveTheme: (theme: AppTheme) => {
    applyThemeToDOM(theme);
    localStorage.setItem('forgeflow_active_theme', JSON.stringify(theme));
    set({ activeTheme: theme });
  },

  saveTheme: (theme: AppTheme) => {
    const { customThemes } = get();
    // remove duplicate if exists
    const filtered = customThemes.filter((t) => t.id !== theme.id);
    const updated = [...filtered, theme];
    localStorage.setItem('forgeflow_custom_themes', JSON.stringify(updated));
    localStorage.setItem('forgeflow_active_theme', JSON.stringify(theme));
    applyThemeToDOM(theme);
    set({ customThemes: updated, activeTheme: theme });
  },

  deleteTheme: (id: string) => {
    const { customThemes, activeTheme } = get();
    const updated = customThemes.filter((t) => t.id !== id);
    localStorage.setItem('forgeflow_custom_themes', JSON.stringify(updated));
    set({ customThemes: updated });

    // Fallback if deleted the active one
    if (activeTheme.id === id) {
      const fallback = PRESET_THEMES[0];
      applyThemeToDOM(fallback);
      localStorage.setItem('forgeflow_active_theme', JSON.stringify(fallback));
      set({ activeTheme: fallback });
    }
  },

  importTheme: (json: string) => {
    try {
      const parsed = JSON.parse(json);
      // Validate schema minimally
      if (
        !parsed.id ||
        !parsed.name ||
        typeof parsed.isDark !== 'boolean' ||
        !parsed.accentColor ||
        !parsed.colors ||
        !parsed.colors.background ||
        !parsed.colors.card ||
        !parsed.colors.border
      ) {
        return { success: false, error: 'Invalid theme schema structure.' };
      }

      // Format defaults
      const imported: AppTheme = {
        id: parsed.id || `custom-${Date.now()}`,
        name: parsed.name || 'Imported Theme',
        isDark: parsed.isDark,
        accentColor: parsed.accentColor,
        fontFamily: parsed.fontFamily || 'Inter',
        borderRadius: parsed.borderRadius || '10px',
        sidebarStyle: parsed.sidebarStyle || 'glass',
        cardStyle: parsed.cardStyle || 'glass',
        buttonStyle: parsed.buttonStyle || 'flat',
        logoIcon: parsed.logoIcon || 'Sparkles',
        colors: {
          background: parsed.colors.background,
          foreground: parsed.colors.foreground || (parsed.isDark ? '#f4f4f5' : '#0f172a'),
          card: parsed.colors.card,
          cardForeground: parsed.colors.cardForeground || (parsed.isDark ? '#f4f4f5' : '#0f172a'),
          border: parsed.colors.border,
          mutedForeground: parsed.colors.mutedForeground || (parsed.isDark ? '#a1a1aa' : '#64748b'),
        }
      };

      get().saveTheme(imported);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'JSON parsing failed.' };
    }
  }
}));
