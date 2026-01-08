import { Home, User, Wallet, History, Users, FileText, Settings, LogOut, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const { member, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/member';
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/member/dashboard' },
    { icon: User, label: 'Profil Saya', path: '/member/profile' },
    { icon: Wallet, label: 'Tabungan CTGOLD', path: '/member/wallet' },
    { icon: History, label: 'Riwayat Transaksi', path: '/member/transactions' },
    { icon: Users, label: 'Referral', path: '/member/referral' },
    { icon: BookOpen, label: 'Edukasi', path: '/member/education' },
    { icon: FileText, label: 'Laporan', path: '/member/laporan' },
    { icon: Settings, label: 'Pengaturan', path: '/member/settings' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-gray-900/50 border-r border-gray-800 h-screen sticky top-0 backdrop-blur-sm">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ctgold-gold to-yellow-600 flex items-center justify-center text-gray-900 font-bold text-sm shadow-lg">
            {member?.full_name ? getInitials(member.full_name) : 'CT'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{member?.full_name}</p>
            <p className="text-xs text-ctgold-gold truncate">{member?.member_code}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <a
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-ctgold-gold/20 to-yellow-600/10 text-ctgold-gold border border-ctgold-gold/30 shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Keluar</span>
        </button>
      </div>

      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 text-center">
          © 2026 CTGOLD Ecosystem
          <br />
          Powered by Solana
        </p>
      </div>
    </aside>
  );
}
