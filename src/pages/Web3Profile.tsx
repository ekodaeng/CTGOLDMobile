import { motion } from 'framer-motion';
import { User, Wallet, Copy, Check, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import GlassCard from '../components/GlassCard';
import GoldButton from '../components/GoldButton';
import BottomNavWeb3 from '../components/BottomNavWeb3';
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';

export default function Web3Profile() {
  const { walletAddress, userData, disconnectWallet, mockMode, toggleMockMode } = useWallet();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    navigate('/web3/landing');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-32">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-[#FDB931]/5" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User size={32} className="text-[#FFD700]" />
            <h1 className="text-3xl font-bold">Profile</h1>
          </div>
          <p className="text-gray-400">Manage your account</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
          <GlassCard className="p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FDB931] flex items-center justify-center mx-auto mb-4">
              <User size={48} className="text-black" />
            </div>
            <h2 className="text-xl font-bold mb-1">
              {walletAddress?.substring(0, 8)}...{walletAddress?.substring(walletAddress.length - 8)}
            </h2>
            <p className="text-sm text-gray-400 mb-4">Referral Code: {userData?.referral_code}</p>
            <div className="flex gap-2 justify-center">
              <span
                className={`
                px-3 py-1 rounded-full text-xs font-semibold
                ${userData?.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
              `}
              >
                {userData?.is_active ? 'Active' : 'Inactive'}
              </span>
              {userData?.is_vip && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFD700]/20 text-[#FFD700]">
                  VIP Member
                </span>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Wallet size={20} className="text-[#FFD700]" />
              Wallet Information
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-gray-300 flex-1 break-all">{walletAddress}</p>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                  >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-[#FFD700]" />}
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings size={20} className="text-[#FFD700]" />
              Settings
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="font-semibold">Mock Mode</p>
                  <p className="text-xs text-gray-400">Test without real wallet</p>
                </div>
                <button
                  onClick={toggleMockMode}
                  className={`
                    relative w-14 h-7 rounded-full transition-colors
                    ${mockMode ? 'bg-green-500' : 'bg-gray-600'}
                  `}
                >
                  <div
                    className={`
                      absolute top-1 w-5 h-5 rounded-full bg-white transition-transform
                      ${mockMode ? 'left-8' : 'left-1'}
                    `}
                  />
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GoldButton onClick={handleDisconnect} variant="secondary" className="w-full">
            <LogOut size={20} />
            Disconnect Wallet
          </GoldButton>
        </motion.div>
      </div>

      <BottomNavWeb3 />
    </div>
  );
}
