import { ReactNode, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { isAdminSessionValid, clearAdminSession } from '../lib/admin-session';

interface AdminAuthGuardProps {
  children: ReactNode;
}

const PUBLIC_ADMIN_ROUTES = [
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',
  '/admin/reset-success',
  '/admin/setup',
];

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
};

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleAuthFailure = async (reason: string, path?: string) => {
    console.log('[AdminAuthGuard] Auth failed, redirecting to login');

    clearAdminSession();
    await supabase.auth.signOut();

    const nextParam = path && path !== '/admin/login' ? `?next=${encodeURIComponent(path)}` : '';
    window.location.replace(`/admin/login?reason=${reason}${nextParam ? '&' + nextParam.substring(1) : ''}`);
  };

  const checkAuth = async () => {
    const currentPath = window.location.pathname;

    if (PUBLIC_ADMIN_ROUTES.includes(currentPath)) {
      console.log('[AdminAuthGuard] Public route, allowing:', currentPath);
      setIsAuthorized(true);
      setIsChecking(false);
      return true;
    }

    console.log('[AdminAuthGuard] Checking session for protected route:', currentPath);

    if (!isAdminSessionValid()) {
      console.log('[AdminAuthGuard] No valid session in localStorage');
      setIsChecking(false);
      await handleAuthFailure('session_expired', currentPath);
      return false;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        console.log('[AdminAuthGuard] No valid Supabase session, error:', error);
        setIsChecking(false);
        await handleAuthFailure('session_expired', currentPath);
        return false;
      }

      console.log('[AdminAuthGuard] Valid session found for user:', session.user.id);
      setIsAuthorized(true);
      setIsChecking(false);
      return true;
    } catch (error: any) {
      console.error('[AdminAuthGuard] Session check error:', error);
      setIsChecking(false);
      await handleAuthFailure('session_expired', currentPath);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    let checkingComplete = false;
    let failsafeTimeout: NodeJS.Timeout | null = null;

    const performCheck = async () => {
      if (!mounted) return;

      failsafeTimeout = setTimeout(() => {
        if (mounted && !checkingComplete) {
          console.error('[AdminAuthGuard] Failsafe timeout reached (5s)');
          setIsChecking(false);
          handleAuthFailure('timeout');
        }
      }, 5000);

      const success = await checkAuth();
      checkingComplete = true;

      if (failsafeTimeout && mounted) {
        clearTimeout(failsafeTimeout);
        failsafeTimeout = null;
      }
    };

    performCheck();

    return () => {
      mounted = false;
      if (failsafeTimeout) {
        clearTimeout(failsafeTimeout);
      }
    };
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#070A0F] via-[#0A0D15] to-[#0B0F1A] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 border-4 border-[#F5C542] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <p className="text-white text-xl font-semibold">Memverifikasi Akses...</p>
            <p className="text-gray-400 text-sm">Memeriksa autentikasi admin</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
