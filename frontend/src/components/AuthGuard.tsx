import React from 'react';
import { Navigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const token = localStorage.getItem('forgeflow_token');

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
