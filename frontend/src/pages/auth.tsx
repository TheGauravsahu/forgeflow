import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useToastStore } from '../store/useToastStore';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { BrandingPane } from '@/components/auth/BrandingPane';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';

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

  const toast = useToastStore();

  const loginMutation = api.auth.login.useMutation();
  const registerMutation = api.auth.register.useMutation();

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
        toast.success('Welcome back to ForgeFlow!', 'Logged in successfully');
        setSuccessMsg('Logged in successfully! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        const res = await registerMutation.mutateAsync({ email, password, name });
        localStorage.setItem('forgeflow_token', res.token);
        localStorage.setItem('forgeflow_user', JSON.stringify(res.user));
        toast.success('Your workspace is ready!', 'Account created successfully');
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 800);
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed. Please try again.';
      toast.error(msg, 'Authentication Error');
      setErrorMsg(msg);
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
          <BrandingPane isLogin={isLogin} />

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
          {isLogin ? (
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isLoading={isLoading}
              onSubmit={handleSubmit}
            />
          ) : (
            <RegisterForm
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isLoading={isLoading}
              onSubmit={handleSubmit}
            />
          )}

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
