import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../lib/trpc';
import {
  LogIn,
  UserPlus,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Mail,
  Lock,
  User,
  Zap,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Tiny helpers – scoped so they don't pollute the module
───────────────────────────────────────────────────────── */

/** Inline-style focus ring helper (yellow, since Tailwind
 *  arbitrary-value focus rings may not purge correctly). */
const fieldBase =
  'w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-surface-400 ' +
  'bg-surface-800/70 border border-surface-600 ' +
  'transition-all duration-200 outline-none ' +
  'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 focus:bg-surface-800';

const labelBase =
  'block text-2xs font-bold uppercase tracking-widest text-surface-300 mb-2';

/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */
export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('forgeflow_token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const res = await loginMutation.mutateAsync({ email, password });
        localStorage.setItem('forgeflow_token', res.token);
        localStorage.setItem('forgeflow_user', JSON.stringify(res.user));
        setSuccessMsg('Logged in successfully! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        const res = await registerMutation.mutateAsync({ email, password, name });
        localStorage.setItem('forgeflow_token', res.token);
        localStorage.setItem('forgeflow_user', JSON.stringify(res.user));
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 800);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    }
  };

  const isLoading = loginMutation.isLoading || registerMutation.isLoading;

  const switchMode = () => {
    setIsLogin((v) => !v);
    setErrorMsg('');
    setSuccessMsg('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#09090b' }}
    >
      {/* ── Ambient glow blobs ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70vw',
          height: '55vw',
          maxWidth: 900,
          maxHeight: 700,
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.06) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          bottom: '-10%',
          right: '-10%',
          width: '40vw',
          height: '40vw',
          background:
            'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* ── Subtle grid texture ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Glassmorphic Card ── */}
      <div
        className="relative w-full max-w-md mx-4 animate-fade-in"
        style={{ zIndex: 1 }}
      >
        {/* Card glow border effect */}
        <div
          aria-hidden="true"
          className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(245,158,11,0.25) 0%, rgba(245,158,11,0.04) 50%, rgba(245,158,11,0.12) 100%)',
          }}
        />

        <div
          className="relative rounded-2xl border border-surface-700/60 backdrop-blur-2xl p-8 shadow-brand-lg"
          style={{
            backgroundColor: 'rgba(15,15,18,0.80)',
            boxShadow:
              '0 0 0 1px rgba(245,158,11,0.08), 0 4px 32px rgba(0,0,0,0.6), 0 0 80px rgba(245,158,11,0.10)',
          }}
        >

          {/* ── Brand Header ── */}
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

          {/* ── Mode Toggle ── */}
          <div
            className="flex rounded-xl p-1 mb-7"
            style={{
              backgroundColor: 'rgba(24,24,31,0.80)',
              border: '1px solid rgba(63,63,70,0.5)',
            }}
          >
            {(['login', 'register'] as const).map((mode) => {
              const active = mode === 'login' ? isLogin : !isLogin;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    if (mode === 'login' && !isLogin) switchMode();
                    if (mode === 'register' && isLogin) switchMode();
                  }}
                  className="relative flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-250 focus:outline-none"
                  style={
                    active
                      ? {
                          background:
                            'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.08) 100%)',
                          color: '#fbbf24',
                          border: '1px solid rgba(245,158,11,0.25)',
                          boxShadow: '0 0 12px rgba(245,158,11,0.12)',
                        }
                      : { color: '#71717a', border: '1px solid transparent' }
                  }
                >
                  {mode === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              );
            })}
          </div>

          {/* ── Error / Success Banners ── */}
          {errorMsg && (
            <div
              className="flex items-start gap-3 p-3.5 mb-5 rounded-xl text-sm animate-fade-in"
              style={{
                backgroundColor: 'rgba(127,29,29,0.25)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#fca5a5',
              }}
            >
              <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              className="flex items-start gap-3 p-3.5 mb-5 rounded-xl text-sm animate-fade-in"
              style={{
                backgroundColor: 'rgba(6,78,59,0.25)',
                border: '1px solid rgba(52,211,153,0.25)',
                color: '#6ee7b7',
              }}
            >
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name field — register only */}
            {!isLogin && (
              <div className="animate-fade-in">
                <label htmlFor="auth-name" className={labelBase}>
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: '#52525b' }}
                  />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={fieldBase}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="auth-email" className={labelBase}>
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: '#52525b' }}
                />
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@forgeflow.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldBase}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="auth-password" className={labelBase}>
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: '#52525b' }}
                />
                <input
                  id="auth-password"
                  type="password"
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={fieldBase}
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="relative w-full mt-2 py-3 rounded-xl font-bold text-sm tracking-wide text-surface-950 flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group"
              style={{
                background: isLoading
                  ? 'rgba(245,158,11,0.6)'
                  : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                boxShadow: isLoading
                  ? 'none'
                  : '0 0 24px rgba(245,158,11,0.35), 0 2px 8px rgba(0,0,0,0.4)',
              }}
            >
              {/* Hover shimmer layer */}
              <span
                aria-hidden="true"
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
                }}
              />

              {isLoading ? (
                <>
                  <span
                    className="w-4 h-4 rounded-full border-2 border-surface-950/30 border-t-surface-950 animate-spin"
                  />
                  <span>Processing…</span>
                </>
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In to ForgeFlow
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* ── Footer toggle ── */}
          <div
            className="mt-7 pt-6 text-center"
            style={{ borderTop: '1px solid rgba(63,63,70,0.4)' }}
          >
            <p className="text-sm text-surface-300">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                id="auth-mode-toggle"
                type="button"
                onClick={switchMode}
                className="ml-1.5 font-bold focus:outline-none transition-colors duration-200"
                style={{ color: '#fbbf24' }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color = '#f59e0b')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color = '#fbbf24')
                }
              >
                {isLogin ? 'Sign Up free' : 'Sign In instead'}
              </button>
            </p>
          </div>

        </div>
        {/* ── Subtle footer note ── */}
        <p className="text-center text-2xs text-surface-500 mt-5 tracking-wide">
          Secured end-to-end · ForgeFlow © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
