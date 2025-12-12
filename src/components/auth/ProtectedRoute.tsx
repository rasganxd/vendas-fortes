import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [offlineAllowed, setOfflineAllowed] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const flag = localStorage.getItem('offline_admin_login');
        setOfflineAllowed(!!flag);
      }
    } catch (error) {
      console.error('Erro ao verificar acesso offline:', error);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user && !offlineAllowed) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
