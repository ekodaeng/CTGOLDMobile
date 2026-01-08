import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Network, User, ArrowDownCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNavWeb3() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: '/web3', label: 'Home', icon: Home },
    { id: '/web3/deposit', label: 'Deposit', icon: ArrowDownCircle },
    { id: '/web3/vip', label: 'VIP', icon: Users },
    { id: '/web3/network', label: 'Network', icon: Network },
    { id: '/web3/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="max-w-md mx-auto px-4 pb-4">
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50"
        >
          <div className="flex justify-around items-center px-2 py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.id;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  whileTap={{ scale: 0.9 }}
                  className="relative flex flex-col items-center justify-center flex-1 py-2 px-3"
                >
                  <div
                    className={`
                    relative p-3 rounded-2xl transition-all duration-300
                    ${isActive ? 'bg-gradient-to-br from-[#FFD700]/20 to-[#FDB931]/10' : 'bg-transparent'}
                  `}
                  >
                    <Icon
                      size={24}
                      className={`transition-all duration-300 ${
                        isActive ? 'text-[#FFD700]' : 'text-gray-400'
                      }`}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/20 to-[#FDB931]/10 rounded-2xl"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                  <span
                    className={`
                    text-xs font-medium mt-1 transition-colors duration-300
                    ${isActive ? 'text-[#FFD700]' : 'text-gray-500'}
                  `}
                  >
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </nav>
  );
}
