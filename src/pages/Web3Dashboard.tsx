import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Users, Copy, Check, RefreshCw, Coins } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import GoldButton from '../components/GoldButton';
import BottomNavWeb3 from '../components/BottomNavWeb3';
import CTGOLDPriceWidgetPro from '../components/CTGOLDPriceWidgetPro';
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Web3Dashboard() {
  const {
    connected,
    walletAddress,
    walletBalance,
    internalBalance,
    isActive,
    userData,
    disconnectWallet,
    refreshBalances,
  } = useWallet();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!connected) {
      navigate('/web3/landing');
    }
  }, [connected, navigate]);

  useEffect(() => {
    if (userData) {
      loadRecentTransactions();
    }
  }, [userData]);

  const loadRecentTransactions = async () => {
    if (!userData) return;

    const { data, error } = await supabase
      .from('web3_transactions')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setRecentTransactions(data);
    }
  };

  const handleCopyReferral = () => {
    if (userData?.referral_code) {
      const referralLink = `${window.location.origin}/web3/register?ref=${userData.referral_code}`;
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshBalances();
    await loadRecentTransactions();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const canGenerateReferral = internalBalance >= 1000;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-32">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-[#FDB931]/5" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FDB931]/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
            <p className="text-sm text-gray-400">Welcome back!</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <RefreshCw size={20} className={`text-[#FFD700] ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={disconnectWallet}
              className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all text-sm font-medium"
            >
              Disconnect
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet size={20} className="text-[#FFD700]" />
                <span className="text-sm text-gray-400">Wallet Address</span>
              </div>
              <span
                className={`
                px-3 py-1 rounded-full text-xs font-semibold
                ${
                  isActive
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }
              `}
              >
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm font-mono text-gray-300 break-all">
              {walletAddress?.substring(0, 16)}...{walletAddress?.substring(walletAddress.length - 8)}
            </p>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <CTGOLDPriceWidgetPro />
        </motion.div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-[#FFD700]/20">
                  <Coins size={20} className="text-[#FFD700]" />
                </div>
                <span className="text-xs text-gray-400">Internal Balance</span>
              </div>
              <p className="text-2xl font-bold text-[#FFD700]">{internalBalance.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">CTGOLD</p>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-[#FDB931]/20">
                  <Wallet size={20} className="text-[#FDB931]" />
                </div>
                <span className="text-xs text-gray-400">Wallet Balance</span>
              </div>
              <p className="text-2xl font-bold text-[#FDB931]">{walletBalance.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">CTGOLD</p>
            </GlassCard>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-[#FFD700]" />
                <span className="text-xs text-gray-400">Referrals</span>
              </div>
              <p className="text-xl font-bold">{userData?.total_referrals || 0}</p>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-[#FFD700]" />
                <span className="text-xs text-gray-400">Total Earned</span>
              </div>
              <p className="text-xl font-bold">{(userData?.total_earnings || 0).toLocaleString()}</p>
            </GlassCard>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mb-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users size={20} className="text-[#FFD700]" />
              Referral Link
            </h3>

            {!canGenerateReferral ? (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-sm text-red-400 mb-2">
                  You need at least 1,000 CTGOLD internal balance to generate a referral link.
                </p>
                <p className="text-xs text-gray-400">
                  Current balance: {internalBalance.toLocaleString()} CTGOLD
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-3">
                  <p className="text-sm font-mono text-gray-300 break-all">
                    {window.location.origin}/web3/register?ref={userData?.referral_code}
                  </p>
                </div>

                <GoldButton onClick={handleCopyReferral} variant="secondary" className="w-full">
                  {copied ? (
                    <>
                      <Check size={16} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy Referral Link
                    </>
                  )}
                </GoldButton>
              </>
            )}
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-semibold text-[#FFD700]">{tx.type}</span>
                      <span className="text-sm font-bold text-green-400">+{tx.amount.toLocaleString()}</span>
                    </div>
                    {tx.description && <p className="text-xs text-gray-400">{tx.description}</p>}
                    {tx.level_from && <span className="text-xs text-gray-500">Level {tx.level_from}</span>}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>

      <BottomNavWeb3 />
    </div>
  );
}
