import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const token = localStorage.getItem('forgeflow_token');
  const userStr = localStorage.getItem('forgeflow_user');

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  try {
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === 'ADMIN' || user.isAdmin) {
        return <>{children}</>;
      }
    }
  } catch (_) {}

  return <Navigate to="/dashboard" replace />;
}
