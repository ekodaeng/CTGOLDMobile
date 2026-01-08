import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Wallet,
  CheckCircle2,
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  DollarSign,
  Activity,
  Info
} from 'lucide-react';
import Card from '../components/Card';
import Sidebar from '../components/Sidebar';
import MemberBottomNav from '../components/MemberBottomNav';
import CTGOLDPriceWidgetPro from '../components/CTGOLDPriceWidgetPro';
import { supabase } from '@/lib/supabaseClient';

interface CTGoldBalance {
  balance: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
}

export default function Dashboard() {
  const { member, isAuthenticated, isActive, isLoading } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referralCount, setReferralCount] = useState<number>(0);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/member/login';
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (member && supabase) {
      fetchDashboardData();
    }
  }, [member]);

  const fetchDashboardData = async () => {
    if (!member) return;

    try {
      const [balanceRes, transactionsRes, referralRes] = await Promise.all([
        supabase.from('ctgold_balances').select('balance').eq('member_id', member.id).maybeSingle(),
        supabase.from('ctgold_transactions').select('*').eq('member_id', member.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('referrals').select('id', { count: 'exact', head: true }).eq('referrer_id', member.id)
      ]);

      if (balanceRes.data) {
        setBalance(Number(balanceRes.data.balance));
      }

      if (transactionsRes.data) {
        setTransactions(transactionsRes.data);
      }

      if (referralRes.count !== null) {
        setReferralCount(referralRes.count);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (isLoading || !member) {
    return (
      <div className="min-h-screen bg-[#070A0F] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ctgold-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (member.status) {
      case 'ACTIVE':
        return (
          <div className="flex items-center space-x-2 bg-green-500/10 border border-green-500/30 px-3 py-1.5 rounded-full">
            <CheckCircle2 size={16} className="text-green-400" />
            <span className="text-green-400 text-sm font-semibold">Aktif</span>
          </div>
        );
      case 'PENDING':
        return (
          <div className="flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1.5 rounded-full">
            <Clock size={16} className="text-yellow-400" />
            <span className="text-yellow-400 text-sm font-semibold">Pending</span>
          </div>
        );
      case 'SUSPENDED':
        return (
          <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-red-400 text-sm font-semibold">Suspended</span>
          </div>
        );
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      buy: 'Pembelian',
      reward: 'Reward',
      referral: 'Referral',
      burn_info: 'Burn Info',
      transfer: 'Transfer'
    };
    return types[type] || type;
  };

  const getTransactionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      buy: 'text-blue-400',
      reward: 'text-green-400',
      referral: 'text-purple-400',
      burn_info: 'text-orange-400',
      transfer: 'text-gray-400'
    };
    return colors[type] || 'text-gray-400';
  };

  const estimatedUSD = (balance * 0.5).toFixed(2);

  return (
    <div className="flex min-h-screen bg-[#070A0F]">
      <Sidebar currentPath="/member/dashboard" />

      <main className="flex-1 lg:ml-0">
        <div className="max-w-7xl mx-auto px-4 py-6 pb-24 lg:pb-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Selamat datang, {member.full_name?.split(' ')[0]}
                </h1>
                <p className="text-gray-400 text-sm">Member ID: <span className="text-ctgold-gold font-semibold">{member.member_code}</span></p>
              </div>
              <div className="hidden sm:block">
                {getStatusBadge()}
              </div>
            </div>
            <div className="sm:hidden mt-3">
              {getStatusBadge()}
            </div>
          </div>

          {member.status === 'PENDING' && (
            <Card className="bg-gradient-to-br from-yellow-500/10 to-gray-900/90 border-yellow-500/30 mb-6">
              <div className="flex items-start space-x-3">
                <Clock className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-yellow-400 font-bold mb-1">Akun Menunggu Aktivasi</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Akun Anda sedang dalam proses verifikasi oleh admin. Fitur akan tersedia setelah diaktifkan.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {member.status === 'SUSPENDED' && (
            <Card className="bg-gradient-to-br from-red-500/10 to-gray-900/90 border-red-500/30 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-red-400 font-bold mb-1">Akun Ditangguhkan</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Akun Anda saat ini ditangguhkan. Silakan hubungi admin untuk informasi lebih lanjut.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-ctgold-gold/20 to-gray-900/90 border-ctgold-gold/30 hover:border-ctgold-gold/50 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Saldo CTGOLD</p>
                  <p className="text-3xl font-bold text-white mb-1">
                    {loadingData ? '...' : balance.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500">≈ ${estimatedUSD} USD</p>
                </div>
                <div className="bg-ctgold-gold/20 p-3 rounded-xl">
                  <Wallet className="text-ctgold-gold" size={24} />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-gray-900/90 border-green-500/30 hover:border-green-500/50 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Status Akun</p>
                  <p className="text-2xl font-bold text-white mb-1">
                    {member.status === 'ACTIVE' ? 'Aktif' : member.status === 'PENDING' ? 'Pending' : 'Suspended'}
                  </p>
                  <p className="text-xs text-gray-500">Status keanggotaan</p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-xl">
                  {member.status === 'ACTIVE' ? (
                    <CheckCircle2 className="text-green-400" size={24} />
                  ) : member.status === 'PENDING' ? (
                    <Clock className="text-yellow-400" size={24} />
                  ) : (
                    <AlertTriangle className="text-red-400" size={24} />
                  )}
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/20 to-gray-900/90 border-blue-500/30 hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Aktivitas</p>
                  <p className="text-3xl font-bold text-white mb-1">
                    {loadingData ? '...' : transactions.length}
                  </p>
                  <p className="text-xs text-gray-500">Transaksi tercatat</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-xl">
                  <Activity className="text-blue-400" size={24} />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/20 to-gray-900/90 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Referral</p>
                  <p className="text-3xl font-bold text-white mb-1">
                    {loadingData ? '...' : referralCount}
                  </p>
                  <p className="text-xs text-gray-500">Member direferensikan</p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-xl">
                  <Users className="text-purple-400" size={24} />
                </div>
              </div>
            </Card>
          </div>

          <div className="mb-8">
            <CTGOLDPriceWidgetPro />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Tabungan CTGOLD</h2>
                  <DollarSign className="text-ctgold-gold" size={24} />
                </div>

                <div className="bg-gradient-to-br from-ctgold-gold/10 to-transparent border border-ctgold-gold/20 rounded-2xl p-6 mb-4">
                  <p className="text-gray-400 text-sm mb-2">Total CTGOLD Ditabung</p>
                  <p className="text-4xl font-bold text-ctgold-gold mb-4">
                    {balance.toLocaleString('id-ID')} CTGOLD
                  </p>
                  <div className="h-32 flex items-center justify-center border border-gray-700/50 rounded-xl bg-gray-800/30">
                    <p className="text-gray-500 text-sm">Grafik pertumbuhan akan muncul di sini</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-gradient-to-r from-ctgold-gold to-yellow-600 text-gray-900 font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-ctgold-gold/20 transition-all duration-200">
                    Tambah Tabungan
                  </button>
                  <button className="flex-1 bg-gray-800/50 border border-gray-700 text-white font-semibold py-3 rounded-xl hover:bg-gray-700/50 transition-all duration-200">
                    Lihat Riwayat
                  </button>
                </div>
              </Card>
            </div>

            <div>
              <Card className="bg-gradient-to-br from-blue-500/10 to-gray-900/90 border-blue-500/30">
                <div className="flex items-start space-x-3 mb-4">
                  <Info className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                  <h3 className="text-blue-400 font-bold">Informasi CTGOLD</h3>
                </div>
                <div className="space-y-3 text-sm text-gray-300 leading-relaxed">
                  <p>CTGOLD adalah aset digital berbasis ekosistem Solana.</p>
                  <p>Tabungan CTGOLD bukan produk investasi dan tidak menjanjikan keuntungan.</p>
                  <p>Seluruh aktivitas tercatat secara transparan di blockchain.</p>
                </div>
              </Card>
            </div>
          </div>

          <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Aktivitas Terakhir</h2>
              <TrendingUp className="text-ctgold-gold" size={24} />
            </div>

            {loadingData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ctgold-gold mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Memuat aktivitas...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 border border-gray-700/50 rounded-xl bg-gray-800/30">
                <Activity className="text-gray-600 mx-auto mb-3" size={48} />
                <p className="text-gray-400 font-medium">Belum ada aktivitas</p>
                <p className="text-gray-500 text-sm mt-1">Transaksi Anda akan muncul di sini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700/50">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Tanggal</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold text-sm">Jenis</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-semibold text-sm">Jumlah CTGOLD</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {new Date(tx.created_at).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-sm font-medium ${getTransactionTypeColor(tx.type)}`}>
                            {getTransactionTypeLabel(tx.type)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-white font-semibold">
                            {Number(tx.amount).toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center">
                            {tx.status === 'completed' && (
                              <span className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                                Selesai
                              </span>
                            )}
                            {tx.status === 'pending' && (
                              <span className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs px-2 py-1 rounded-full font-medium">
                                Pending
                              </span>
                            )}
                            {tx.status === 'failed' && (
                              <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-2 py-1 rounded-full font-medium">
                                Gagal
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>

      <MemberBottomNav currentPath="/member/dashboard" />
    </div>
  );
}
