import { ReactNode, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  path: string;
}

export default function AdminLayout({ children, currentPage, onNavigate }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { id: 'members', label: 'Manajemen Member', icon: <Users size={20} />, path: '/admin/members' },
    { id: 'transactions', label: 'Data Transaksi', icon: <TrendingUp size={20} />, path: '/admin/transactions' },
    { id: 'content', label: 'Konten Website', icon: <FileText size={20} />, path: '/admin/content' },
    { id: 'settings', label: 'Pengaturan', icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('member');
    window.location.href = '/member/login';
  };

  const handleMenuClick = (item: MenuItem) => {
    onNavigate(item.id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 px-4 py-3 border-b border-yellow-700 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-900 hover:text-slate-700 transition-colors"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Shield className="text-slate-900" size={24} />
            <div>
              <h1 className="text-xl font-bold text-slate-900">CTGOLD Admin</h1>
              <p className="text-xs text-slate-800">Panel Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-yellow-500 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex">
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 lg:transform-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        >
          <div className="h-full flex flex-col pt-20 lg:pt-4">
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-slate-900 font-semibold shadow-lg'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="px-4 py-6 border-t border-slate-800">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-2">System Status</p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-emerald-400 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-h-screen">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
