import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, TrendingUp, Coins, Activity } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const ADMIN_WALLET = 'ADMIN_WALLET_ADDRESS_PLACEHOLDER';

export default function Web3Admin() {
  const { walletAddress, disconnectWallet } = useWallet();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalDistributed: 0,
    totalTransactions: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (walletAddress !== ADMIN_WALLET && walletAddress !== 'MockWalletAddress123456789') {
      navigate('/web3');
    } else {
      loadAdminData();
    }
  }, [walletAddress, navigate]);

  const loadAdminData = async () => {
    setLoading(true);

    const { data: usersData } = await supabase
      .from('web3_users')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: txData } = await supabase
      .from('web3_transactions')
      .select('*')
      .eq('type', 'BONUS');

    if (usersData) {
      setUsers(usersData);
      setStats({
        totalMembers: usersData.length,
        activeMembers: usersData.filter((u) => u.is_active).length,
        totalDistributed: txData?.reduce((sum, tx) => sum + tx.amount, 0) || 0,
        totalTransactions: txData?.length || 0,
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-[#FDB931]/5" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center gap-3">
            <Shield size={32} className="text-[#FFD700]" />
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-gray-400">System overview and management</p>
            </div>
          </div>
          <button
            onClick={() => {
              disconnectWallet();
              navigate('/web3/landing');
            }}
            className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
          >
            Logout
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Users, label: 'Total Members', value: stats.totalMembers, color: 'blue' },
            { icon: Activity, label: 'Active Members', value: stats.activeMembers, color: 'green' },
            { icon: Coins, label: 'Total Distributed', value: stats.totalDistributed.toLocaleString(), color: 'yellow' },
            { icon: TrendingUp, label: 'Transactions', value: stats.totalTransactions, color: 'purple' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6">
                <stat.icon size={32} className="text-[#FFD700] mb-3" />
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold mb-6">All Users</h2>
            {loading ? (
              <p className="text-center text-gray-400 py-8">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Wallet</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Referral Code</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Internal Balance</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Referrals</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-mono text-sm">
                          {user.wallet_address.substring(0, 8)}...{user.wallet_address.substring(user.wallet_address.length - 4)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#FFD700]">{user.referral_code}</td>
                        <td className="py-3 px-4 text-right">{user.internal_balance.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">{user.total_referrals}</td>
                        <td className="py-3 px-4 text-right font-semibold">{user.total_earnings.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
