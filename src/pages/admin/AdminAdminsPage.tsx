import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { isSuperAdmin } from '../../lib/auth-utils';
import { Shield, CheckCircle, XCircle, RefreshCw, AlertTriangle, Search, Lock } from 'lucide-react';
import Card from '../../components/Card';
import { Button } from '../../components/Button';

interface Admin {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

type PageStatus = 'loading' | 'ready' | 'error';

interface ConfirmModal {
  show: boolean;
  action: 'approve' | 'reject' | null;
  admin: Admin | null;
}

export default function AdminAdminsPage() {
  const [status, setStatus] = useState<PageStatus>('loading');
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending'>('all');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    show: false,
    action: null,
    admin: null,
  });
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    initPage();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [admins, searchQuery, filterStatus]);

  const initPage = async () => {
    console.log('AdminAdmins: Initializing');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
        const isSA = isSuperAdmin(session.user.email);
        setIsSuperAdminUser(isSA);
        console.log('AdminAdmins: Super admin status:', isSA);
      }

      await fetchAdmins();
    } catch (error) {
      console.error('AdminAdmins: Init error:', error);
    }
  };

  const fetchAdmins = async () => {
    console.log('AdminAdmins: Fetching admins');
    setStatus('loading');
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAdmins(data || []);
      setStatus('ready');
      console.log('AdminAdmins: Fetched', data?.length || 0, 'admins');
    } catch (error: any) {
      console.error('AdminAdmins: Fetch error:', error);
      setStatus('error');
      setErrorMessage(error?.message || 'Gagal memuat data admin');
    }
  };

  const applyFilters = () => {
    let filtered = [...admins];

    if (filterStatus === 'active') {
      filtered = filtered.filter((a) => a.is_active);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter((a) => !a.is_active);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.full_name.toLowerCase().includes(query) ||
          a.email.toLowerCase().includes(query)
      );
    }

    setFilteredAdmins(filtered);
  };

  const handleApprove = (admin: Admin) => {
    if (!isSuperAdminUser) {
      showToast('Hanya Super Admin yang dapat approve admin', 'error');
      return;
    }
    setConfirmModal({ show: true, action: 'approve', admin });
  };

  const handleReject = (admin: Admin) => {
    if (!isSuperAdminUser) {
      showToast('Hanya Super Admin yang dapat reject admin', 'error');
      return;
    }
    setConfirmModal({ show: true, action: 'reject', admin });
  };

  const closeModal = () => {
    setConfirmModal({ show: false, action: null, admin: null });
  };

  const confirmAction = async () => {
    if (!confirmModal.admin || !confirmModal.action || !isSuperAdminUser) return;

    const { admin, action } = confirmModal;
    setProcessingId(admin.user_id);
    closeModal();

    try {
      const updates = action === 'approve' ? { is_active: true } : { is_active: false };

      const { error } = await supabase
        .from('admins')
        .update(updates)
        .eq('user_id', admin.user_id);

      if (error) throw error;

      showToast(
        action === 'approve'
          ? `Admin ${admin.full_name} berhasil diaktifkan`
          : `Admin ${admin.full_name} dinonaktifkan`,
        'success'
      );

      await fetchAdmins();
    } catch (error: any) {
      console.error('AdminAdmins: Action error:', error);
      showToast(error?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  if (status === 'loading') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-800 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse"></div>
          ))}
        </div>

        <Card className="bg-gray-900/50 border border-gray-800 p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-800 rounded animate-pulse"></div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="bg-gray-900/50 border border-red-500/20 p-8 max-w-md">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="text-red-400" size={32} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-white text-xl font-bold">Gagal Memuat Data</h3>
              <p className="text-gray-400 text-sm">{errorMessage}</p>
            </div>
            <Button onClick={fetchAdmins} className="w-full">
              <RefreshCw size={18} />
              <span>Coba Lagi</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const activeCount = admins.filter((a) => a.is_active).length;
  const pendingCount = admins.filter((a) => !a.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Admin Management</h1>
          <p className="text-gray-400 text-sm mt-1.5">
            {isSuperAdminUser
              ? 'Kelola administrator sistem (Super Admin Only)'
              : 'Lihat daftar administrator (View Only)'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSuperAdminUser && (
            <div className="px-4 py-2 bg-[#F5C542]/10 border border-[#F5C542]/20 rounded-xl shadow-lg shadow-[#F5C542]/10">
              <p className="text-[#F5C542] text-xs font-bold uppercase tracking-wide">SUPER ADMIN</p>
            </div>
          )}
          <Button onClick={fetchAdmins} className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 backdrop-blur-sm">
            <RefreshCw size={18} />
            <span>Refresh Data</span>
          </Button>
        </div>
      </div>

      {!isSuperAdminUser && (
        <Card className="bg-blue-500/10 border border-blue-500/20 p-4 backdrop-blur-sm shadow-lg">
          <div className="flex items-start gap-3">
            <Lock className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-blue-400 text-sm font-bold">View Only Mode</p>
              <p className="text-gray-400 text-xs mt-1.5">
                Anda hanya dapat melihat daftar admin. Hanya Super Admin yang dapat approve/reject admin baru.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 shadow-xl shadow-green-500/5 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Active Admins</p>
              <h3 className="text-4xl font-bold text-white mt-3">{activeCount}</h3>
              <p className="text-green-400 text-xs mt-2">Administrator aktif</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center shadow-lg">
              <CheckCircle size={26} className="text-green-400" strokeWidth={2.5} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 shadow-xl shadow-amber-500/5 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Pending Approval</p>
              <h3 className="text-4xl font-bold text-white mt-3">{pendingCount}</h3>
              <p className="text-amber-400 text-xs mt-2">Menunggu persetujuan</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center shadow-lg">
              <Shield size={26} className="text-amber-400" strokeWidth={2.5} />
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 shadow-xl">
        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Cari admin (nama, email)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C542] transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'pending'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterStatus(filter)}
                  className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    filterStatus === filter
                      ? 'bg-[#F5C542] text-[#0B0F1A]'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {filter === 'all' ? 'Semua' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                    Nama Lengkap
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                    Terdaftar
                  </th>
                  {isSuperAdminUser && (
                    <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin) => {
                  const isCurrentSuperAdmin = isSuperAdmin(admin.email);
                  return (
                    <tr
                      key={admin.user_id}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium">{admin.full_name}</p>
                          {isCurrentSuperAdmin && (
                            <span className="px-2 py-0.5 bg-[#F5C542]/10 text-[#F5C542] text-xs font-bold rounded border border-[#F5C542]/20">
                              SUPER
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-400 text-sm">{admin.email}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F5C542]/10 text-[#F5C542] border border-[#F5C542]/20">
                          {admin.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            admin.is_active
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {admin.is_active ? 'ACTIVE' : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-400 text-sm">
                          {new Date(admin.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </td>
                      {isSuperAdminUser && (
                        <td className="py-4 px-4">
                          {!admin.is_active ? (
                            <div className="flex gap-2">
                              {processingId === admin.user_id ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 border-2 border-[#F5C542] border-t-transparent rounded-full animate-spin"></div>
                                  <span className="text-gray-400 text-sm">Processing...</span>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleApprove(admin)}
                                    className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-all text-xs font-semibold"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(admin)}
                                    className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-xs font-semibold"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-600 text-xs">-</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredAdmins.length === 0 && (
              <div className="py-12 text-center">
                <Shield className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500 text-sm">
                  {searchQuery || filterStatus !== 'all'
                    ? 'Tidak ada admin yang sesuai dengan filter'
                    : 'Belum ada admin terdaftar'}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {confirmModal.show && confirmModal.admin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900 border border-gray-800 p-6 max-w-md w-full">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    confirmModal.action === 'approve' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}
                >
                  {confirmModal.action === 'approve' ? (
                    <CheckCircle className="text-green-400" size={32} />
                  ) : (
                    <XCircle className="text-red-400" size={32} />
                  )}
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-white text-xl font-bold">
                  {confirmModal.action === 'approve' ? 'Approve Admin?' : 'Reject Admin?'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {confirmModal.action === 'approve'
                    ? 'Admin akan diaktifkan dan dapat mengakses admin panel.'
                    : 'Admin akan ditolak dan tidak dapat mengakses admin panel.'}
                </p>
                <div className="mt-4 p-4 bg-gray-800/50 rounded-xl text-left">
                  <p className="text-white text-sm font-medium">{confirmModal.admin.full_name}</p>
                  <p className="text-gray-400 text-xs">{confirmModal.admin.email}</p>
                  <p className="text-gray-500 text-xs mt-1">{confirmModal.admin.role}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all font-semibold"
                >
                  Batal
                </button>
                <button
                  onClick={confirmAction}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                    confirmModal.action === 'approve'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  Ya, {confirmModal.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {toast.show && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <Card
            className={`border px-6 py-4 flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="text-green-400" size={20} />
            ) : (
              <AlertTriangle className="text-red-400" size={20} />
            )}
            <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {toast.message}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
