import { useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { apiConfig, getAuthHeaders } from '../lib/api';
import { clearAdminSession, isAdminSessionValid, updateLastActivity, isSessionIdle, getAdminSession, getLastActivity } from '../lib/admin-session';
import { logLogout } from '../lib/admin-activity';
import { canPerformAction, isSuperAdmin } from '../lib/admin-permissions';
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface AdminData {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AdminDashboardLayoutProps {
  children: ReactNode;
  currentView: 'dashboard' | 'members' | 'admins' | 'settings';
  onNavigate: (view: 'dashboard' | 'members' | 'admins' | 'settings') => void;
}

export default function AdminDashboardLayout({ children, currentView, onNavigate }: AdminDashboardLayoutProps) {
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [sessionRefreshed, setSessionRefreshed] = useState(false);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [idleCountdown, setIdleCountdown] = useState(60);

  useEffect(() => {
    loadAdminData();

    const IDLE_TIMEOUT = 30 * 60 * 1000;
    const IDLE_WARNING_THRESHOLD = 29 * 60 * 1000;

    const activityEvents = ['mousemove', 'click', 'keypress', 'scroll', 'touchstart'];

    const handleActivity = () => {
      updateLastActivity();
      if (showIdleWarning) {
        setShowIdleWarning(false);
      }
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    const idleCheckInterval = setInterval(async () => {
      const lastActivity = getLastActivity();
      if (!lastActivity) return;

      const idleTime = Date.now() - lastActivity;

      if (idleTime >= IDLE_TIMEOUT) {
        console.log('[AdminDashboard] Session idle for too long, logging out');
        clearInterval(idleCheckInterval);
        clearAdminSession();
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch {}
        window.location.replace('/admin/login?reason=idle');
      } else if (idleTime >= IDLE_WARNING_THRESHOLD && !showIdleWarning) {
        console.log('[AdminDashboard] Session idle warning triggered');
        setShowIdleWarning(true);
        setIdleCountdown(60);
      }
    }, 100000);

    const sessionCheckInterval = setInterval(async () => {
      if (!isAdminSessionValid()) {
        console.log('[AdminDashboard] Admin session expired, redirecting to login');
        clearInterval(sessionCheckInterval);
        clearAdminSession();
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch {}
        window.location.replace('/admin/login?reason=session_expired');
        return;
      }

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        console.log('[AdminDashboard] Session check failed, redirecting to login');
        clearInterval(sessionCheckInterval);
        clearAdminSession();
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch {}
        window.location.replace('/admin/login?reason=session_expired');
        return;
      }

      const tokenExpiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = tokenExpiresAt ? tokenExpiresAt - now : 0;

      if (timeUntilExpiry <= 0) {
        console.log('[AdminDashboard] Token expired, redirecting to login');
        clearInterval(sessionCheckInterval);
        clearAdminSession();
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch {}
        window.location.replace('/admin/login?reason=session_expired');
      } else if (timeUntilExpiry < 180) {
        console.log('[AdminDashboard] Token expiring soon (< 3 min), refreshing...');
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error('[AdminDashboard] Refresh failed:', refreshError);
          if (timeUntilExpiry <= 30) {
            clearInterval(sessionCheckInterval);
            clearAdminSession();
            try {
              await supabase.auth.signOut({ scope: 'global' });
            } catch {}
            window.location.replace('/admin/login?reason=session_expired');
          }
        } else {
          console.log('[AdminDashboard] Session refreshed successfully');
          setSessionRefreshed(true);
          setTimeout(() => setSessionRefreshed(false), 3000);
        }
      }
    }, 60000);

    return () => {
      clearInterval(sessionCheckInterval);
      clearInterval(idleCheckInterval);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, []);

  useEffect(() => {
    if (!showIdleWarning) return;

    const countdownInterval = setInterval(() => {
      setIdleCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          handleIdleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [showIdleWarning]);

  const withTimeout = async <T,>(
    promise: Promise<T>,
    timeoutMs: number = 10000
  ): Promise<T> => {
    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error('REQUEST_TIMEOUT'));
      }, timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]);
  };

  const loadAdminData = async () => {
    try {
      setVerifyError(null);
      console.log('[AdminDashboard] Starting loadAdminData...');

      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        console.log('[AdminDashboard] No session found');
        setVerifyError('Sesi tidak ditemukan. Silakan login ulang.');
        setLoading(false);
        return;
      }

      console.log('[AdminDashboard] Session found for user:', session.user.id);
      console.log('[AdminDashboard] Querying admins table...');

      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('user_id, email, role, is_active, full_name')
        .eq('user_id', session.user.id)
        .maybeSingle();

      console.log('[AdminDashboard] Query result:', { admin, adminError });

      if (adminError) {
        console.error('[AdminDashboard] Admin query error:', adminError);
        setVerifyError(`Database error: ${adminError.message}`);
        setLoading(false);
        return;
      }

      if (!admin) {
        console.error('[AdminDashboard] No admin record found');
        setVerifyError('Akun tidak terdaftar sebagai admin.');
        setLoading(false);
        return;
      }

      if (!admin.is_active) {
        console.log('[AdminDashboard] Admin not active');
        setVerifyError('Akun admin belum diaktifkan. Hubungi super admin.');
        setLoading(false);
        return;
      }

      console.log('[AdminDashboard] Admin verified:', admin.email, admin.role);
      setAdminData({
        user_id: admin.user_id,
        email: admin.email,
        full_name: admin.full_name || admin.email,
        role: admin.role,
      });
      setVerifyError(null);
      console.log('[AdminDashboard] Loading complete!');
    } catch (error: any) {
      console.error('[AdminDashboard] Error loading admin data:', error);
      setVerifyError(`Error: ${error?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleIdleLogout = async () => {
    try {
      console.log('🔓 Logging out due to inactivity...');
      const session = getAdminSession();
      if (session) {
        try {
          await logLogout(session.id || '', session.email);
        } catch (logError) {
          console.warn('Failed to log idle logout activity:', logError);
        }
      }
      clearAdminSession();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (signOutError) {
        console.warn('Supabase sign out warning (idle):', signOutError);
      }
      window.location.replace('/admin/login?reason=idle');
    } catch (error) {
      console.error('Idle logout error:', error);
      clearAdminSession();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch {}
      window.location.replace('/admin/login?reason=idle');
    }
  };

  const handleStayLoggedIn = () => {
    updateLastActivity();
    setShowIdleWarning(false);
    setIdleCountdown(60);
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('Yakin ingin logout dari dashboard admin?');

    if (!confirmed) {
      return;
    }

    try {
      console.log('🔓 Logging out admin...');

      const session = getAdminSession();
      if (session) {
        try {
          await logLogout(session.id || '', session.email);
        } catch (logError) {
          console.warn('Failed to log logout activity:', logError);
        }
      }

      clearAdminSession();

      try {
        await supabase.auth.signOut({ scope: 'global' });
        console.log('✅ Supabase sign out successful');
      } catch (signOutError) {
        console.warn('Supabase sign out warning:', signOutError);
      }

      console.log('✅ Logout successful, redirecting...');
      window.location.replace('/admin/login?reason=logged_out');
    } catch (error) {
      console.error('Logout error:', error);
      clearAdminSession();
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch {}
      window.location.replace('/admin/login?reason=logged_out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#F5C542] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 text-sm">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (verifyError) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <X className="text-yellow-400" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-yellow-400 font-bold text-lg mb-1">Verifikasi Gagal</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{verifyError}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadAdminData}
              className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-semibold py-2 px-4 rounded-lg transition-all"
            >
              Coba Lagi
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-2 px-4 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allMenuItems = [
    { icon: LayoutDashboard, label: 'Overview', view: 'dashboard' as const, requiresPermission: null },
    { icon: Users, label: 'Members', view: 'members' as const, requiresPermission: 'members' as const },
    { icon: Shield, label: 'Admins', view: 'admins' as const, requiresPermission: 'admins' as const },
    { icon: Settings, label: 'Settings', view: 'settings' as const, requiresPermission: 'settings' as const },
  ];

  const menuItems = allMenuItems.filter(item => {
    if (!item.requiresPermission) return true;
    if (!adminData) return false;

    if (item.requiresPermission === 'members') {
      return canPerformAction(adminData.role, 'view', 'members');
    }
    if (item.requiresPermission === 'admins') {
      return canPerformAction(adminData.role, 'view', 'admins');
    }
    if (item.requiresPermission === 'settings') {
      return canPerformAction(adminData.role, 'view', 'settings');
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070A0F] via-[#0A0D15] to-[#0B0F1A] flex">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900/80 backdrop-blur-xl border-r border-gray-800/50 transition-all duration-300 flex flex-col sticky top-0 h-screen`}
      >
        <div className="p-4 border-b border-gray-800/50">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5C542] to-[#D6B25E] flex items-center justify-center shadow-lg shadow-[#F5C542]/25">
                  <Shield size={20} className="text-gray-900" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">CTGOLD</h2>
                  <p className="text-gray-500 text-xs">Admin Panel</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white hover:bg-gray-800/50 p-2 rounded-lg transition-all"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                currentView === item.view
                  ? 'bg-[#F5C542]/10 text-[#F5C542] border border-[#F5C542]/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <item.icon size={20} strokeWidth={2} />
              {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800/50">
          {sidebarOpen ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5C542] to-[#D6B25E] flex items-center justify-center shadow-lg">
                  <span className="text-gray-900 font-bold text-sm">
                    {adminData?.full_name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <p className="text-white text-sm font-semibold truncate">{adminData?.full_name}</p>
                    <CheckCircle className="text-green-400 flex-shrink-0" size={14} />
                  </div>
                  <p className="text-gray-500 text-xs truncate">{adminData?.email}</p>
                </div>
              </div>
              <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-green-400 text-xs font-semibold flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Active Admin
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 transition-all"
              >
                <LogOut size={18} />
                <span className="text-sm font-semibold">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-10 shadow-lg">
          <div className="px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1.5">
                  Welcome back, <span className="text-[#F5C542] font-medium">{adminData?.full_name}</span>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2 rounded-xl bg-[#F5C542]/10 border border-[#F5C542]/20 shadow-lg shadow-[#F5C542]/10">
                  <span className="text-[#F5C542] text-sm font-bold uppercase tracking-wide">
                    {adminData?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>

      {sessionRefreshed && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-6 py-4 flex items-center gap-3 shadow-xl backdrop-blur-sm">
            <CheckCircle className="text-green-400" size={20} />
            <p className="text-green-400 text-sm font-medium">Session refreshed successfully</p>
          </div>
        </div>
      )}

      {showIdleWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border-2 border-yellow-500/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-yellow-500/20 animate-scale-up">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="text-yellow-400" size={32} strokeWidth={2.5} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white text-center mb-3">
              Sesi akan berakhir
            </h2>

            <p className="text-gray-300 text-center mb-6 leading-relaxed">
              Tidak ada aktivitas. Kamu akan logout otomatis dalam{' '}
              <span className="text-yellow-400 font-bold text-lg">{idleCountdown}</span> detik.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleIdleLogout}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-semibold transition-all hover:scale-105"
              >
                Logout Sekarang
              </button>
              <button
                onClick={handleStayLoggedIn}
                className="flex-1 px-6 py-3 rounded-xl bg-[#F5C542] hover:bg-[#D6B25E] text-gray-900 font-bold transition-all hover:scale-105 shadow-lg shadow-[#F5C542]/30"
              >
                Tetap Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
