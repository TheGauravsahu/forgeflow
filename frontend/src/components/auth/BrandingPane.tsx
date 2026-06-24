import { Zap, Sparkles } from 'lucide-react';

interface BrandingPaneProps {
  isLogin: boolean;
}

export function BrandingPane({ isLogin }: BrandingPaneProps) {
  return (
    <div className="flex flex-col items-center mb-8">
      {/* Logo mark */}
      <div className="relative mb-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background:
              'linear-gradient(135deg, rgba(245,158,11,0.20) 0%, rgba(245,158,11,0.08) 100%)',
            border: '1px solid rgba(245,158,11,0.30)',
            boxShadow: '0 0 24px rgba(245,158,11,0.20)',
          }}
        >
          <Zap
            className="w-7 h-7"
            style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.6))' }}
          />
        </div>
        {/* Sparkle badge */}
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            boxShadow: '0 0 10px rgba(245,158,11,0.6)',
          }}
        >
          <Sparkles className="w-2.5 h-2.5 text-surface-950" />
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
