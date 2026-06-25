import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string | null;
  role?: string;
  isAdmin?: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('forgeflow_token'),
  user: (() => {
    const saved = localStorage.getItem('forgeflow_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {
        return null;
      }
    }
    return null;
  })(),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('forgeflow_token', token);
    } else {
      localStorage.removeItem('forgeflow_token');
    }
    set({ token });
  },
  setUser: (user) => {
    if (user) {
      localStorage.setItem('forgeflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('forgeflow_user');
    }
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('forgeflow_token');
    localStorage.removeItem('forgeflow_user');
    set({ token: null, user: null });
  }
}));
