import { Sparkles } from 'lucide-react';
import { AppLogo } from '@/components/ui/AppLogo';
import { useThemeStore } from '@/store/useThemeStore';

interface BrandingPaneProps {
  isLogin: boolean;
}

export function BrandingPane({ isLogin }: BrandingPaneProps) {
  const activeTheme = useThemeStore((state) => state.activeTheme);
  const accent = activeTheme?.accentColor || '#f59e0b';

  return (
    <div className="flex flex-col items-center mb-8">
      {/* Logo mark */}
      <div className="relative mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${accent}33 0%, ${accent}14 100%)`,
            border: `1px solid ${accent}4d`,
            boxShadow: `0 0 24px ${accent}33`,
          }}
        >
          <AppLogo
            className="w-7 h-7"
            size={28}
            style={{ color: accent, filter: `drop-shadow(0 0 6px ${accent})` }}
          />
        </div>
        {/* Sparkle badge */}
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
            boxShadow: `0 0 10px ${accent}99`,
          }}
        >
          <Sparkles className="w-2.5 h-2.5 text-zinc-950" />
        </div>
      </div>

      {/* Brand name */}
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="text-2xl font-extrabold tracking-tight"
          style={{
            background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #d97706)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ForgeFlow
        </span>
      </div>

      {/* Mode-specific heading */}
      <h1 className="text-xl font-bold text-white mt-2">
        {isLogin ? 'Welcome back' : 'Create your account'}
      </h1>
      <p className="text-sm text-surface-300 mt-1 text-center leading-relaxed">
        {isLogin
          ? 'Sign in to manage your custom form builder.'
          : 'Get started — build and deploy rich, responsive forms.'}
      </p>
    </div>
  );
}
