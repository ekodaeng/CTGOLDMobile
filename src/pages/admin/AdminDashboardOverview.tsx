import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import {
  Users,
  UserCheck,
  Activity,
  Shield,
  TrendingUp,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import Card from '../../components/Card';
import DashboardSkeleton from '../../components/DashboardSkeleton';

interface KPIData {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  suspendedMembers: number;
}

export default function AdminDashboardOverview() {
  const navigate = useNavigate();
  const [kpiData, setKPIData] = useState<KPIData>({
    totalMembers: 0,
    activeMembers: 0,
    pendingMembers: 0,
    suspendedMembers: 0,
  });
  const [latestMembers, setLatestMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [minLoadingTime, setMinLoadingTime] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setMinLoadingTime(true);

    const minDelay = new Promise(resolve => setTimeout(resolve, 400));

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, city, role, status, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching dashboard data:', error);
        return;
      }

      if (profiles && profiles.length > 0) {
        const total = profiles.length;
        const active = profiles.filter((p: any) => p.status === 'ACTIVE').length;
        const pending = profiles.filter((p: any) => p.status === 'PENDING').length;
        const suspended = profiles.filter((p: any) => p.status === 'SUSPENDED').length;

        setKPIData({
          totalMembers: total,
          activeMembers: active,
          pendingMembers: pending,
          suspendedMembers: suspended,
        });

        setLatestMembers(profiles.slice(0, 10));
      }

      await minDelay;
      setMinLoadingTime(false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      await minDelay;
      setMinLoadingTime(false);
      setLoading(false);
    }
  };

  if (loading || minLoadingTime) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 text-sm mt-1.5">Ringkasan statistik dan aktivitas sistem</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 shadow-xl shadow-blue-500/5 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Total Members</p>
              <h3 className="text-4xl font-bold text-white mt-3">
                {kpiData.totalMembers}
              </h3>
              <p className="text-blue-400 text-xs mt-2">Semua pengguna terdaftar</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center shadow-lg">
              <Users size={26} className="text-blue-400" strokeWidth={2.5} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 shadow-xl shadow-green-500/5 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Active Members</p>
              <h3 className="text-4xl font-bold text-white mt-3">
                {kpiData.activeMembers}
              </h3>
              <p className="text-green-400 text-xs mt-2">Akun terverifikasi</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center shadow-lg">
              <UserCheck size={26} className="text-green-400" strokeWidth={2.5} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 shadow-xl shadow-amber-500/5 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Pending Approval</p>
              <h3 className="text-4xl font-bold text-white mt-3">
                {kpiData.pendingMembers}
              </h3>
              <p className="text-amber-400 text-xs mt-2">Menunggu aktivasi</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center shadow-lg">
              <Activity size={26} className="text-amber-400" strokeWidth={2.5} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 shadow-xl shadow-red-500/5 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Suspended</p>
              <h3 className="text-4xl font-bold text-white mt-3">
                {kpiData.suspendedMembers}
              </h3>
              <p className="text-red-400 text-xs mt-2">Akses dibatasi</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center shadow-lg">
              <Shield size={26} className="text-red-400" strokeWidth={2.5} />
            </div>
          </div>
        </Card>
      </div>

      <Card
        className="bg-gradient-to-br from-[#F5C542]/10 to-transparent border border-[#F5C542]/30 hover:border-[#F5C542]/50 shadow-xl shadow-[#F5C542]/5 backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.02]"
        onClick={() => navigate('/admin/analytics')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F5C542] to-[#D6B25E] flex items-center justify-center shadow-lg shadow-[#F5C542]/25">
              <BarChart3 size={28} className="text-gray-900" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">CTGOLD Analytics Panel</h3>
              <p className="text-gray-400 text-sm">Real-time price monitoring, charts, KPIs & CSV export</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#F5C542]">
            <span className="text-sm font-semibold">View Analytics</span>
            <ArrowRight size={20} />
          </div>
        </div>
      </Card>

      <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Latest Members</h2>
            <p className="text-gray-400 text-sm mt-1">Recently registered users</p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-[#F5C542]/10 text-[#F5C542] hover:bg-[#F5C542]/20 transition-all text-sm font-semibold">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                  Member
                </th>
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                  City
                </th>
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {latestMembers.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <p className="text-white text-sm font-medium">{member.full_name}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-400 text-sm">{member.email}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-400 text-sm">{member.city || '-'}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        member.role === 'ADMIN'
                          ? 'bg-[#F5C542]/10 text-[#F5C542]'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {member.role}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        member.status === 'ACTIVE'
                          ? 'bg-green-500/10 text-green-400'
                          : member.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {member.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-gray-400 text-sm">
                      {new Date(member.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </td>
                </tr>
              ))}
              {latestMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <p className="text-gray-500 text-sm">No members found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
