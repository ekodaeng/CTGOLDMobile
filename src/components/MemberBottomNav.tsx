import { Home, User, Wallet, FileText } from 'lucide-react';

interface MemberBottomNavProps {
  currentPath: string;
}

export default function MemberBottomNav({ currentPath }: MemberBottomNavProps) {
  const navItems = [
    { path: '/member/dashboard', label: 'Dashboard', icon: Home },
    { path: '/member/wallet', label: 'Wallet', icon: Wallet },
    { path: '/member/laporan', label: 'Laporan', icon: FileText },
    { path: '/member/profile', label: 'Profil', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 z-50 lg:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <a
              key={item.path}
              href={item.path}
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
                <div className="absolute bottom-0 w-12 h-1 bg-ctgold-gold rounded-t-full" />
              )}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
