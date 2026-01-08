import { motion } from 'framer-motion';
import { Wallet, Shield, Users, Zap, Lock, TrendingUp, CheckCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import GoldButton from '../components/GoldButton';
import { useWallet } from '../contexts/WalletContext';
import { useNavigate } from 'react-router-dom';

export default function Web3Landing() {
  const { connectWallet, connecting, mockMode, toggleMockMode } = useWallet();
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'Blockchain-powered security with complete transparency',
    },
    {
      icon: Users,
      title: '10-Level MLM System',
      description: 'Earn from up to 10 levels of your network',
    },
    {
      icon: Zap,
      title: 'Instant Rewards',
      description: 'Get bonus immediately when your referrals join',
    },
    {
      icon: TrendingUp,
      title: 'VIP Benefits',
      description: 'Exclusive access for 1M+ CTGOLD holders',
    },
  ];

  const benefits = [
    'Level 1 Direct Referral: 100 CTGOLD',
    'Level 2-3: 10 CTGOLD each',
    'Level 4-10: 100 CTGOLD each',
    'Unlimited earning potential',
    'Real-time balance tracking',
    'Secure wallet integration',
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-[#FFD700]/5" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FFD700]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FDB931]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-16"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FDB931] flex items-center justify-center"
            >
              <Wallet size={24} className="text-black" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FDB931] bg-clip-text text-transparent">
              CTGOLD
            </h1>
          </div>

          <button
            onClick={toggleMockMode}
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${
                mockMode
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700'
              }
            `}
          >
            {mockMode ? '🎮 Mock Mode ON' : '🔒 Live Mode'}
          </button>
        </motion.div>

        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700] bg-clip-text text-transparent">
                The Future of
              </span>
              <br />
              <span className="text-white">Network Marketing</span>
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join the most advanced Web3 MLM ecosystem. Earn passive income through a revolutionary 10-level referral system.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <GoldButton
                onClick={async () => {
                  await connectWallet();
                  navigate('/web3');
                }}
                disabled={connecting}
              >
                <Wallet size={20} />
                {connecting ? 'Connecting...' : 'Connect Wallet'}
              </GoldButton>

              <GoldButton variant="ghost" onClick={() => navigate('/about')}>
                Learn More
              </GoldButton>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6 h-full">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD700]/20 to-[#FDB931]/10 flex items-center justify-center">
                    <feature.icon size={32} className="text-[#FFD700]" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Lock size={32} className="text-[#FFD700]" />
                <h3 className="text-2xl font-bold">Access Requirements</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-[#FFD700]/10 to-transparent rounded-xl border-l-4 border-[#FFD700]">
                  <p className="font-semibold text-[#FFD700] mb-1">Minimum Holding</p>
                  <p className="text-2xl font-bold">1,000,000 CTGOLD</p>
                  <p className="text-sm text-gray-400 mt-2">Required to access member area</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-[#FDB931]/10 to-transparent rounded-xl border-l-4 border-[#FDB931]">
                  <p className="font-semibold text-[#FDB931] mb-1">VIP Access</p>
                  <p className="text-2xl font-bold">1,000,000 CTGOLD</p>
                  <p className="text-sm text-gray-400 mt-2">Internal + Wallet balance required</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={32} className="text-[#FFD700]" />
                <h3 className="text-2xl font-bold">Earning Potential</h3>
              </div>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle size={20} className="text-[#FFD700] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <GlassCard className="p-12 max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Ready to Start Earning?</h3>
            <p className="text-gray-400 mb-8">
              Connect your Phantom wallet and join thousands of members already earning passive income.
            </p>
            <GoldButton
              onClick={async () => {
                await connectWallet();
                navigate('/web3');
              }}
              disabled={connecting}
              className="text-lg px-12 py-5"
            >
              <Wallet size={24} />
              {connecting ? 'Connecting...' : 'Get Started Now'}
            </GoldButton>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
