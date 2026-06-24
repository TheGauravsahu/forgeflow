import React from 'react';
import { Mail, Lock, User, UserPlus } from 'lucide-react';

interface RegisterFormProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const fieldBase =
  'w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-surface-400 ' +
  'bg-surface-800/70 border border-surface-600 ' +
  'transition-all duration-200 outline-none ' +
  'focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25 focus:bg-surface-800';

const labelBase =
  'block text-2xs font-bold uppercase tracking-widest text-surface-300 mb-2';

export function RegisterForm({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  onSubmit,
}: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Full Name */}
      <div>
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
            autoComplete="new-password"
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
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            Create Account
          </>
        )}
      </button>
    </form>
  );
}
