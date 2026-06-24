/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--theme-font)', 'Geist', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': '0.65rem',
        '3xs': '0.55rem',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Yellow/Amber primary palette
        brand: {
          50:  'var(--theme-brand-50, #fffbeb)',
          100: 'var(--theme-brand-100, #fef3c7)',
          200: 'var(--theme-brand-200, #fde68a)',
          300: 'var(--theme-brand-300, #fcd34d)',
          400: 'var(--theme-brand-400, #fbbf24)',
          500: 'var(--theme-brand-500, #f59e0b)',
          600: 'var(--theme-brand-600, #d97706)',
          700: 'var(--theme-brand-700, #b45309)',
          800: 'var(--theme-brand-800, #92400e)',
          900: 'var(--theme-brand-900, #78350f)',
          950: 'var(--theme-brand-950, #451a03)',
        },
        // Dark background scale
        surface: {
          950: 'var(--theme-surface-950, #09090b)',
          900: 'var(--theme-surface-900, #0f0f12)',
          800: 'var(--theme-surface-800, #18181f)',
          700: 'var(--theme-surface-700, #1f1f2a)',
          600: 'var(--theme-surface-600, #27272f)',
          500: 'var(--theme-surface-500, #3f3f46)',
          400: 'var(--theme-surface-400, #52525b)',
          300: 'var(--theme-surface-300, #71717a)',
          200: 'var(--theme-surface-200, #a1a1aa)',
          100: 'var(--theme-surface-100, #d4d4d8)',
          50:  'var(--theme-surface-50, #f4f4f5)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'brand-glow': 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
        'brand-glow-sm': 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.08) 0%, transparent 60%)',
      },
      boxShadow: {
        'brand': '0 0 40px rgba(245, 158, 11, 0.15)',
        'brand-sm': '0 0 20px rgba(245, 158, 11, 0.1)',
        'brand-lg': '0 0 80px rgba(245, 158, 11, 0.2)',
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 4px 20px rgba(0,0,0,0.3)',
      },
      borderColor: {
        'brand': 'rgba(245, 158, 11, 0.4)',
        'brand-dim': 'rgba(245, 158, 11, 0.15)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
