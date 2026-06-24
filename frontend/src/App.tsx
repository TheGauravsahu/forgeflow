import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './lib/trpc';
import { TooltipProvider } from '@/components/ui/tooltip';

// Page imports
import LandingPage from './pages/landing';
import AuthPage from './pages/auth';
import DashboardPage from './pages/dashboard';
import BuilderPage from './pages/builder';
import InsightsPage from './pages/insights';
import PublicFormPage from './pages/form';
import ProfilePage from './pages/profile';
import SettingsPage from './pages/settings';

export default function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false
      }
    }
  }));

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001/trpc',
          headers() {
            const token = localStorage.getItem('forgeflow_token');
            return token ? { Authorization: `Bearer ${token}` } : {};
          }
        })
      ]
    } as any)
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/builder/:id" element={<BuilderPage />} />
              <Route path="/insights/:id" element={<InsightsPage />} />
              <Route path="/form/:id" element={<PublicFormPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
