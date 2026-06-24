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
        sans: ['Geist', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': '0.65rem',
        '3xs': '0.55rem',
      },
      colors: {
        // Yellow/Amber primary palette
        brand: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Dark background scale
        surface: {
          950: '#09090b',
          900: '#0f0f12',
          800: '#18181f',
          700: '#1f1f2a',
          600: '#27272f',
          500: '#3f3f46',
          400: '#52525b',
          300: '#71717a',
          200: '#a1a1aa',
          100: '#d4d4d8',
          50:  '#f4f4f5',
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
