import { useState, useEffect } from 'react';
import { TrendingUp, Search, Filter, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Transaction {
  id: string;
  member_id: string;
  action: string;
  metadata: any;
  created_at: string;
  member: {
    full_name: string;
    email: string;
    member_code: string;
  };
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, filterAction, transactions]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('member_logs')
        .select(`
          *,
          member:members(full_name, email, member_code)
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      if (data) {
        setTransactions(data as any);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.member?.full_name?.toLowerCase().includes(search) ||
          t.member?.email?.toLowerCase().includes(search) ||
          t.member?.member_code?.toLowerCase().includes(search) ||
          t.action.toLowerCase().includes(search)
      );
    }

    if (filterAction !== 'ALL') {
      filtered = filtered.filter((t) => t.action === filterAction);
    }

    setFilteredTransactions(filtered);
  };

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      REGISTER: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      LOGIN: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      LOGOUT: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
      UPDATE_PROFILE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      RESET_PASSWORD_REQUEST: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      RESET_PASSWORD_SUCCESS: 'bg-green-500/20 text-green-400 border-green-500/50',
      STATUS_CHANGE: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    };

    const labels: Record<string, string> = {
      REGISTER: 'Registrasi',
      LOGIN: 'Login',
      LOGOUT: 'Logout',
      UPDATE_PROFILE: 'Update Profil',
      RESET_PASSWORD_REQUEST: 'Request Reset Password',
      RESET_PASSWORD_SUCCESS: 'Reset Password',
      STATUS_CHANGE: 'Perubahan Status',
    };

    return (
      <span
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
          styles[action] || 'bg-slate-500/20 text-slate-400 border-slate-500/50'
        }`}
      >
        {labels[action] || action}
      </span>
    );
  };

  const uniqueActions = Array.from(new Set(transactions.map((t) => t.action)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Data Transaksi & Aktivitas</h1>
        <p className="text-slate-400">Monitor semua aktivitas member CTGOLD</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Cari member atau aktivitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-slate-500" size={20} />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
            >
              <option value="ALL">Semua Aktivitas</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Menampilkan {filteredTransactions.length} dari {transactions.length} aktivitas
          </p>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">Tidak ada aktivitas ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                    Tanggal & Waktu
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Member</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">
                    Aktivitas
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Detail</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <Calendar size={14} />
                        <div>
                          <p className="text-sm">
                            {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-xs">
                            {new Date(transaction.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          {transaction.member?.full_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-500">{transaction.member?.email || '-'}</p>
                        <p className="text-xs text-yellow-600 font-mono">
                          {transaction.member?.member_code || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">{getActionBadge(transaction.action)}</td>
                    <td className="py-4 px-4">
                      <div className="text-xs text-slate-400 max-w-xs">
                        {transaction.metadata && typeof transaction.metadata === 'object' ? (
                          <div className="space-y-1">
                            {Object.entries(transaction.metadata).map(([key, value]) => (
                              <div key={key} className="flex items-start">
                                <span className="text-slate-500 mr-2">{key}:</span>
                                <span className="text-slate-400 truncate">
                                  {typeof value === 'object'
                                    ? JSON.stringify(value)
                                    : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-blue-400">Total Aktivitas</h3>
            <TrendingUp className="text-blue-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-slate-100">{transactions.length}</p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-emerald-400">Login Hari Ini</h3>
            <TrendingUp className="text-emerald-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-slate-100">
            {
              transactions.filter(
                (t) =>
                  t.action === 'LOGIN' &&
                  new Date(t.created_at).toDateString() === new Date().toDateString()
              ).length
            }
          </p>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-yellow-400">Registrasi Baru</h3>
            <TrendingUp className="text-yellow-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-slate-100">
            {
              transactions.filter(
                (t) =>
                  t.action === 'REGISTER' &&
                  new Date(t.created_at).toDateString() === new Date().toDateString()
              ).length
            }
          </p>
        </div>
      </div>
    </div>
  );
}
