import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Users, TrendingUp, ChevronRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import BottomNavWeb3 from '../components/BottomNavWeb3';
import { useWallet } from '../contexts/WalletContext';
import { getUserDownlineTree } from '../lib/web3/mlm-system';

export default function Web3Network() {
  const { userData } = useWallet();
  const [networkData, setNetworkData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalNetwork, setTotalNetwork] = useState(0);

  useEffect(() => {
    if (userData) {
      loadNetworkData();
    }
  }, [userData]);

  const loadNetworkData = async () => {
    if (!userData) return;

    setLoading(true);
    const tree = await getUserDownlineTree(userData.id, 10);
    setNetworkData(tree);

    const countNodes = (nodes: any[]): number => {
      return nodes.reduce((acc, node) => {
        return acc + 1 + countNodes(node.children || []);
      }, 0);
    };

    setTotalNetwork(countNodes(tree));
    setLoading(false);
  };

  const renderTreeNode = (node: any, level: number = 1) => {
    return (
      <motion.div
        key={node.userId}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-3"
        style={{ marginLeft: `${level * 16}px` }}
      >
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700]/20 to-[#FDB931]/10 flex items-center justify-center">
                <Users size={20} className="text-[#FFD700]" />
              </div>
              <div>
                <p className="font-mono text-sm">
                  {node.walletAddress.substring(0, 8)}...{node.walletAddress.substring(node.walletAddress.length - 4)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">Level {node.level}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      node.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {node.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </GlassCard>

        {node.children && node.children.length > 0 && (
          <div className="mt-2">
            {node.children.map((child: any) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-32">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-[#FDB931]/5" />

      <div className="relative z-10 max-w-md mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Network size={32} className="text-[#FFD700]" />
            <h1 className="text-3xl font-bold">My Network</h1>
          </div>
          <p className="text-gray-400">View your referral tree</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard className="p-4 text-center">
              <Users size={20} className="text-[#FFD700] mx-auto mb-2" />
              <p className="text-2xl font-bold">{userData?.total_referrals || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Direct</p>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard className="p-4 text-center">
              <Network size={20} className="text-[#FFD700] mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalNetwork}</p>
              <p className="text-xs text-gray-400 mt-1">Total</p>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard className="p-4 text-center">
              <TrendingUp size={20} className="text-[#FFD700] mx-auto mb-2" />
              <p className="text-2xl font-bold">{(userData?.total_earnings || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Earned</p>
            </GlassCard>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-xl font-bold mb-4">Network Tree</h2>
          {loading ? (
            <GlassCard className="p-8 text-center">
              <p className="text-gray-400">Loading network...</p>
            </GlassCard>
          ) : networkData.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Users size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No referrals yet</p>
              <p className="text-sm text-gray-500">Share your referral link to start building your network</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">{networkData.map((node) => renderTreeNode(node))}</div>
          )}
        </motion.div>
      </div>

      <BottomNavWeb3 />
    </div>
  );
}
