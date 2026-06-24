import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from './components/Toaster';
import { AuthGuard } from './components/AuthGuard';

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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<AuthGuard><DashboardPage /></AuthGuard>} />
            <Route path="/builder/:id" element={<AuthGuard><BuilderPage /></AuthGuard>} />
            <Route path="/insights/:id" element={<AuthGuard><InsightsPage /></AuthGuard>} />
            <Route path="/form/:id" element={<PublicFormPage />} />
            <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
            <Route path="/settings" element={<AuthGuard><SettingsPage /></AuthGuard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
