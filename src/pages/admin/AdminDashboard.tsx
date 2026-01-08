import { useState, useEffect, useRef } from 'react';
import { Users, TrendingUp, Activity, Clock, AlertCircle, RefreshCw, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase, getSessionSafe } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import DashboardSkeleton from '../../components/DashboardSkeleton';

interface Stats {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  suspendedMembers: number;
  totalLogs: number;
}

type ErrorType = 'AUTH_ERROR' | 'ROLE_ERROR' | 'DATA_ERROR' | null;

interface ErrorState {
  type: ErrorType;
  message: string;
  technicalDetails?: string;
}

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const hasLoaded = useRef(false);
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    activeMembers: 0,
    pendingMembers: 0,
    suspendedMembers: 0,
    totalLogs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [showErrorDetail, setShowErrorDetail] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [minLoadingTime, setMinLoadingTime] = useState(true);

  useEffect(() => {
    if (hasLoaded.current) {
      return;
    }
    hasLoaded.current = true;
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    setMinLoadingTime(true);

    const minDelay = new Promise(resolve => setTimeout(resolve, 400));

    try {
      console.log('Dashboard: Loading stats');
      const membersResult = await withTimeout(
        supabase.from('profiles').select('status'),
        8000
      );

      const { data: members, error: membersError } = membersResult;

      if (membersError) {
        throw new Error(`Failed to fetch profiles: ${membersError.message}`);
      }

      if (members && members.length > 0) {
        const active = members.filter((m: any) => m.status === 'ACTIVE').length;
        const pending = members.filter((m: any) => m.status === 'PENDING').length;
        const suspended = members.filter((m: any) => m.status === 'SUSPENDED').length;

        setStats({
          totalMembers: members.length,
          activeMembers: active,
          pendingMembers: pending,
          suspendedMembers: suspended,
          totalLogs: 0,
        });
      }

      console.log('Dashboard: Loading logs count');
      const logsResult = await withTimeout(
        supabase.from('admin_activity_logs').select('*', { count: 'exact', head: true }),
        8000
      );

      const { count, error: logsError } = logsResult;

      if (!logsError && count !== null) {
        setStats(prev => ({ ...prev, totalLogs: count }));
      }

      console.log('Dashboard: Loading recent activity');
      await loadRecentActivity();

      console.log('Dashboard: Data loaded successfully');
      await minDelay;
      setMinLoadingTime(false);
      setLoading(false);
      setError(null);
    } catch (error: any) {
      console.error('Dashboard: Data loading error', error);
      await minDelay;
      setMinLoadingTime(false);

      if (error.message === 'TIMEOUT') {
        setError({
          type: 'DATA_ERROR',
          message: 'Koneksi timeout saat memuat data.',
          technicalDetails: 'Request timeout while fetching dashboard data'
        });
      } else {
        setError({
          type: 'DATA_ERROR',
          message: 'Gagal memuat data dashboard.',
          technicalDetails: error?.message || 'Unknown error occurred'
        });
      }
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const activityResult = await withTimeout(
        supabase
          .from('admin_activity_logs')
          .select('id, action_type, target_user_email, target_user_name, admin_email, created_at')
          .order('created_at', { ascending: false })
          .limit(10),
        8000
      );

      const { data, error: activityError } = activityResult;

      if (activityError) {
        console.error('Error loading activity:', activityError);
        return;
      }

      if (data) {
        setRecentActivity(data);
      }
    } catch (error: any) {
      console.error('Error loading activity:', error);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setError(null);
    await loadDashboardData();
    setIsRetrying(false);
  };

  const handleBackToLogin = async () => {
    console.log('[ADMIN DASHBOARD] Logging out...');
    await supabase.auth.signOut();
    window.location.replace('/admin/login?reason=logged_out');
  };

  const statCards = [
    {
      title: 'Total Member',
      value: stats.totalMembers,
      icon: <Users className="w-8 h-8" />,
      color: 'from-[#F5C542] to-[#D6B25E]',
      bgColor: 'bg-[#F5C542]/10',
      borderColor: 'border-[#F5C542]/30',
    },
    {
      title: 'Member Aktif',
      value: stats.activeMembers,
      icon: <Activity className="w-8 h-8" />,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
    },
    {
      title: 'Pending Approval',
      value: stats.pendingMembers,
      icon: <Clock className="w-8 h-8" />,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
    {
      title: 'Total Aktivitas',
      value: stats.totalLogs,
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-slate-500 to-slate-600',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/30',
    },
  ];

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'MEMBER_APPROVED': 'Member Disetujui',
      'MEMBER_REJECTED': 'Member Ditolak',
      'MEMBER_UPDATED': 'Data Member Diubah',
      'MEMBER_DELETED': 'Member Dihapus',
    };
    return labels[action] || action;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'MEMBER_APPROVED': 'text-emerald-400',
      'MEMBER_REJECTED': 'text-red-400',
      'MEMBER_UPDATED': 'text-yellow-400',
      'MEMBER_DELETED': 'text-orange-400',
    };
    return colors[action] || 'text-slate-400';
  };

  if (loading || minLoadingTime) {
    return <DashboardSkeleton />;
  }

  if (error && error.type === 'DATA_ERROR') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] px-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-lg w-full">
          <div className="flex items-start space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="text-red-400" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-red-400 font-bold text-lg mb-2">Terjadi Kendala</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {error.message}
              </p>
            </div>
          </div>

          {error.technicalDetails && (
            <div className="mb-6">
              <button
                onClick={() => setShowErrorDetail(!showErrorDetail)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-all text-left"
              >
                <span className="text-gray-400 text-sm font-medium">Detail Error</span>
                {showErrorDetail ? (
                  <ChevronUp className="text-gray-500" size={18} />
                ) : (
                  <ChevronDown className="text-gray-500" size={18} />
                )}
              </button>
              {showErrorDetail && (
                <div className="mt-2 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                  <p className="text-red-400 text-xs font-mono break-words">
                    {error.technicalDetails}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full bg-gradient-to-r from-[#F5C542] to-[#D6B25E] text-[#0B0F1A] font-bold py-3 rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isRetrying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0B0F1A] border-t-transparent"></div>
                  <span>Mencoba Lagi...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  <span>Coba Lagi</span>
                </>
              )}
            </button>
            <button
              onClick={handleBackToLogin}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <LogOut size={18} />
              <span>Kembali ke Login</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Dashboard</h1>
        <p className="text-slate-400">Selamat datang di panel admin CTGOLD</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} border ${card.borderColor} rounded-xl p-6 backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-gradient-to-br ${card.color} p-3 rounded-lg text-white`}>
                {card.icon}
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-slate-100">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-6">Aktivitas Terkini</h2>

          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">Belum ada aktivitas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#F5C542] to-[#D6B25E] rounded-full flex items-center justify-center text-[#0B0F1A] font-bold text-sm">
                    {activity.target_user_name?.charAt(0) || activity.admin_email?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {activity.target_user_name || 'Admin Action'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {activity.target_user_email || activity.admin_email}
                    </p>
                    <p className={`text-sm mt-1 ${getActionColor(activity.action_type)}`}>
                      {getActionLabel(activity.action_type)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-slate-500">
                      {new Date(activity.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(activity.created_at).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-4">Status Sistem</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Server</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-emerald-400 font-medium">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-emerald-400 font-medium">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">API</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-emerald-400 font-medium">Operational</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#F5C542]/10 to-[#D6B25E]/10 border border-[#F5C542]/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-[#F5C542] mb-2">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Active Rate</span>
                <span className="text-slate-200 font-semibold">
                  {stats.totalMembers > 0
                    ? ((stats.activeMembers / stats.totalMembers) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pending</span>
                <span className="text-amber-400 font-semibold">{stats.pendingMembers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Suspended</span>
                <span className="text-red-400 font-semibold">{stats.suspendedMembers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
