import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Info, TrendingUp, FileText, Users } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: '/', label: 'Home', icon: Home },
    { id: '/about', label: 'About', icon: Info },
    { id: '/trade', label: 'Trade', icon: TrendingUp },
    { id: '/laporan', label: 'Laporan', icon: FileText },
    { id: '/web3/landing', label: 'Member', icon: Users },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    navigate(item.id);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 z-50 safe-bottom">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-ctgold-gold'
                  : 'text-gray-400 hover:text-gray-200 active:text-gray-300'
              }`}
            >
              <Icon
                size={20}
                className={`transition-all duration-150 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
              />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-1 bg-ctgold-gold rounded-t-full animate-scale-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
