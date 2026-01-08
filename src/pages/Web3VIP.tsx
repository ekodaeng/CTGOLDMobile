import { motion } from 'framer-motion';
import { Crown, Lock, CheckCircle, XCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import BottomNavWeb3 from '../components/BottomNavWeb3';
import { useWallet } from '../contexts/WalletContext';

const MIN_BALANCE_REQUIREMENT = 1000000;

export default function Web3VIP() {
  const { walletBalance, internalBalance, isVIP } = useWallet();

  const internalMet = internalBalance >= MIN_BALANCE_REQUIREMENT;
  const walletMet = walletBalance >= MIN_BALANCE_REQUIREMENT;
  const canAccessVIP = internalMet && walletMet;

  const internalProgress = Math.min((internalBalance / MIN_BALANCE_REQUIREMENT) * 100, 100);
  const walletProgress = Math.min((walletBalance / MIN_BALANCE_REQUIREMENT) * 100, 100);

  if (!canAccessVIP) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-[#FDB931]/5" />

        <div className="relative z-10 max-w-md mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Crown size={32} className="text-[#FFD700]" />
              <h1 className="text-3xl font-bold">VIP Area</h1>
            </div>
            <p className="text-gray-400">Exclusive access for elite members</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
            <GlassCard className="p-8 text-center">
              <div className="mb-6">
                <Lock size={64} className="text-[#FFD700] mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">VIP Access Locked</h2>
                <p className="text-gray-400 text-sm">
                  Meet both requirements below to unlock exclusive VIP features
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">Internal Balance</span>
                    {internalMet ? (
                      <CheckCircle size={20} className="text-green-400" />
                    ) : (
                      <XCircle size={20} className="text-red-400" />
                    )}
                  </div>
                  <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${internalProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FFD700] to-[#FDB931] rounded-full"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-gray-400">{internalBalance.toLocaleString()} CTGOLD</span>
                    <span className="text-gray-400">{MIN_BALANCE_REQUIREMENT.toLocaleString()} CTGOLD</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">Wallet Balance</span>
                    {walletMet ? (
                      <CheckCircle size={20} className="text-green-400" />
                    ) : (
                      <XCircle size={20} className="text-red-400" />
                    )}
                  </div>
                  <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${walletProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#FDB931] to-[#FFD700] rounded-full"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-gray-400">{walletBalance.toLocaleString()} CTGOLD</span>
                    <span className="text-gray-400">{MIN_BALANCE_REQUIREMENT.toLocaleString()} CTGOLD</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Crown size={20} className="text-[#FFD700]" />
                VIP Benefits
              </h3>
              <ul className="space-y-3">
                {[
                  'Priority customer support',
                  'Advanced analytics dashboard',
                  'Exclusive trading signals',
                  'Higher withdrawal limits',
                  'Early access to new features',
                  'VIP community access',
                ].map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3 text-sm text-gray-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
        </div>

        <BottomNavWeb3 />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-32">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 via-transparent to-[#FDB931]/10" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Crown size={32} className="text-[#FFD700]" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FDB931] bg-clip-text text-transparent">
              VIP Area
            </h1>
          </div>
          <p className="text-gray-400">Welcome to the elite zone</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <GlassCard className="p-8 text-center bg-gradient-to-br from-[#FFD700]/10 to-[#FDB931]/5">
            <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">VIP Access Granted</h2>
            <p className="text-gray-300">You have full access to all VIP features</p>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 gap-4">
          {[
            { title: 'Priority Support', desc: '24/7 VIP customer service' },
            { title: 'Advanced Analytics', desc: 'Real-time data and insights' },
            { title: 'Trading Signals', desc: 'Expert market analysis' },
            { title: 'High Limits', desc: 'Increased transaction limits' },
            { title: 'Early Access', desc: 'Beta features and updates' },
            { title: 'VIP Community', desc: 'Exclusive networking group' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6 hover:scale-105" hover>
                <h3 className="text-lg font-bold text-[#FFD700] mb-1">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNavWeb3 />
    </div>
  );
}
