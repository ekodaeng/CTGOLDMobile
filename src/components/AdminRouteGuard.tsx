import { useEffect, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteGuardProps {
  children: ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { member, isAuthenticated, isAdmin, isLoading, logout } = useAuth();

  useEffect(() => {
    const checkAccess = async () => {
      if (isLoading) return;

      if (!isAuthenticated || !member) {
        window.location.href = '/admin/login';
        return;
      }

      if (!isAdmin || member.status !== 'ACTIVE') {
        await logout();
        window.location.href = '/admin/login';
        return;
      }
    };

    checkAccess();
  }, [isAuthenticated, member, isAdmin, isLoading, logout]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !member || !isAdmin || member.status !== 'ACTIVE') {
    return null;
  }

  return <>{children}</>;
}
