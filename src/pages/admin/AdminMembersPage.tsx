import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, CheckCircle, XCircle, RefreshCw, AlertTriangle, Search, Edit2, Trash2, X } from 'lucide-react';
import Card from '../../components/Card';
import { Button } from '../../components/Button';
import { updateMember, deleteMember, approveMember, rejectMember } from '@/lib/admin-activity';

interface Member {
  id: string;
  member_code: string;
  full_name: string;
  email: string;
  city: string;
  phone?: string;
  telegram_username?: string;
  role: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  created_at: string;
}

type PageStatus = 'loading' | 'ready' | 'error';

interface ConfirmModal {
  show: boolean;
  action: 'approve' | 'reject' | 'delete' | null;
  member: Member | null;
}

interface EditModal {
  show: boolean;
  member: Member | null;
}

export default function AdminMembersPage() {
  const [status, setStatus] = useState<PageStatus>('loading');
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'ACTIVE' | 'SUSPENDED'>('all');
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    show: false,
    action: null,
    member: null,
  });
  const [editModal, setEditModal] = useState<EditModal>({
    show: false,
    member: null,
  });
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    city: '',
    phone: '',
    telegram_username: '',
  });
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [members, searchQuery, filterStatus]);

  const fetchMembers = async () => {
    console.log('AdminMembers: Fetching members from profiles');
    setStatus('loading');
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, member_code, full_name, email, city, phone, telegram_username, role, status, created_at')
        .eq('role', 'MEMBER')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMembers(data || []);
      setStatus('ready');
      console.log('AdminMembers: Fetched', data?.length || 0, 'members');
    } catch (error: any) {
      console.error('AdminMembers: Fetch error:', error);
      setStatus('error');
      setErrorMessage(error?.message || 'Gagal memuat data member');
    }
  };

  const applyFilters = () => {
    let filtered = [...members];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((m) => m.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.full_name.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          m.member_code.toLowerCase().includes(query)
      );
    }

    setFilteredMembers(filtered);
  };

  const handleApprove = (member: Member) => {
    setConfirmModal({ show: true, action: 'approve', member });
  };

  const handleReject = (member: Member) => {
    setConfirmModal({ show: true, action: 'reject', member });
  };

  const handleEdit = (member: Member) => {
    setEditForm({
      full_name: member.full_name,
      email: member.email,
      city: member.city,
      phone: member.phone || '',
      telegram_username: member.telegram_username || '',
    });
    setEditModal({ show: true, member });
  };

  const handleDelete = (member: Member) => {
    setConfirmModal({ show: true, action: 'delete', member });
  };

  const closeModal = () => {
    setConfirmModal({ show: false, action: null, member: null });
  };

  const closeEditModal = () => {
    setEditModal({ show: false, member: null });
  };

  const confirmAction = async () => {
    if (!confirmModal.member || !confirmModal.action) return;

    const { member, action } = confirmModal;
    setProcessingId(member.id);
    closeModal();

    try {
      console.log(`[AdminMembers] Starting ${action} for member:`, member.id);

      let result;
      if (action === 'delete') {
        result = await deleteMember(member.id);
      } else if (action === 'approve') {
        result = await approveMember(member.id);
      } else if (action === 'reject') {
        result = await rejectMember(member.id);
      }

      console.log(`[AdminMembers] Action result:`, result);

      if (result?.ok) {
        console.log(`[AdminMembers] ${action} successful`);
        if (action === 'delete') {
          showToast(`Member ${member.full_name} berhasil dihapus`, 'success');
        } else if (action === 'approve') {
          showToast(`Member ${member.full_name} berhasil diaktifkan`, 'success');
        } else if (action === 'reject') {
          showToast(`Member ${member.full_name} ditolak`, 'success');
        }
        await fetchMembers();
      } else {
        console.error(`[AdminMembers] ${action} failed:`, result?.error);

        if (result?.error_code === 'SESSION_EXPIRED' || result?.error_code === 'NO_TOKEN') {
          showToast('Sesi telah berakhir, silakan login kembali', 'error');
          setTimeout(() => {
            window.location.href = '/admin/login?reason=session_expired';
          }, 2000);
          return;
        }

        showToast(result?.error || 'Terjadi kesalahan', 'error');
      }
    } catch (error: any) {
      console.error('[AdminMembers] Action exception:', error);
      showToast(error?.message || 'Terjadi kesalahan tidak terduga', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateMember = async () => {
    if (!editModal.member) return;

    setProcessingId(editModal.member.id);

    try {
      const updates = {
        full_name: editForm.full_name.trim(),
        email: editForm.email.trim().toLowerCase(),
        city: editForm.city.trim(),
        phone: editForm.phone.trim() || null,
        telegram_username: editForm.telegram_username.trim() || null,
      };

      console.log('[AdminMembers] Starting update for member:', editModal.member.id);
      const result = await updateMember(editModal.member.id, updates);

      console.log('[AdminMembers] Update result:', result);

      if (result.ok) {
        console.log('[AdminMembers] Update successful');
        showToast(`Member ${editForm.full_name} berhasil diupdate`, 'success');
        closeEditModal();
        await fetchMembers();
      } else {
        console.error('[AdminMembers] Update failed:', result.error);

        if (result.error_code === 'SESSION_EXPIRED' || result.error_code === 'NO_TOKEN') {
          closeEditModal();
          showToast('Sesi telah berakhir, silakan login kembali', 'error');
          setTimeout(() => {
            window.location.href = '/admin/login?reason=session_expired';
          }, 2000);
          return;
        }

        showToast(result.error || 'Gagal mengupdate member', 'error');
      }
    } catch (error: any) {
      console.error('[AdminMembers] Update exception:', error);
      showToast(error?.message || 'Terjadi kesalahan tidak terduga', 'error');
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

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      ACTIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
      SUSPENDED: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-500/10 text-gray-400';
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
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
            <Button onClick={fetchMembers} className="w-full">
              <RefreshCw size={18} />
              <span>Coba Lagi</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const pendingCount = members.filter((m) => m.status === 'PENDING').length;
  const activeCount = members.filter((m) => m.status === 'ACTIVE').length;
  const rejectedCount = members.filter((m) => m.status === 'SUSPENDED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Member Management</h1>
          <p className="text-gray-400 text-sm mt-1.5">Kelola dan monitor semua member terdaftar</p>
        </div>
        <Button
          onClick={fetchMembers}
          className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 backdrop-blur-sm"
        >
          <RefreshCw size={18} />
          <span>Refresh Data</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 shadow-xl shadow-amber-500/5 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Pending Approval</p>
              <h3 className="text-4xl font-bold text-white mt-3">{pendingCount}</h3>
              <p className="text-amber-400 text-xs mt-2">Menunggu persetujuan</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center shadow-lg">
              <Users size={26} className="text-amber-400" strokeWidth={2.5} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 shadow-xl shadow-green-500/5 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Active Members</p>
              <h3 className="text-4xl font-bold text-white mt-3">{activeCount}</h3>
              <p className="text-green-400 text-xs mt-2">Member aktif</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center shadow-lg">
              <CheckCircle size={26} className="text-green-400" strokeWidth={2.5} />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 shadow-xl shadow-red-500/5 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Rejected</p>
              <h3 className="text-4xl font-bold text-white mt-3">{rejectedCount}</h3>
              <p className="text-red-400 text-xs mt-2">Member ditolak</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center shadow-lg">
              <XCircle size={26} className="text-red-400" strokeWidth={2.5} />
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
                placeholder="Cari member (nama, email, kode)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C542] transition-colors"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'PENDING', 'ACTIVE', 'SUSPENDED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterStatus(filter)}
                  className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    filterStatus === filter
                      ? 'bg-[#F5C542] text-[#0B0F1A]'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {filter === 'all' ? 'Semua' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                    Kode Member
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                    Nama Lengkap
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                    Kota
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                    Terdaftar
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 text-xs font-semibold uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <p className="text-white text-sm font-mono">{member.member_code}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-white text-sm font-medium">{member.full_name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-400 text-sm">{member.email}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-400 text-sm">{member.city}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(
                          member.status
                        )}`}
                      >
                        {member.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-gray-400 text-sm">
                        {new Date(member.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {processingId === member.id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-[#F5C542] border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-400 text-sm">Processing...</span>
                          </div>
                        ) : (
                          <>
                            {member.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApprove(member)}
                                  className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-all text-xs font-semibold"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(member)}
                                  className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-xs font-semibold"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleEdit(member)}
                              className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all"
                              title="Edit Member"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(member)}
                              className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                              title="Hapus Member"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMembers.length === 0 && (
              <div className="py-12 text-center">
                <Users className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500 text-sm">
                  {searchQuery || filterStatus !== 'all'
                    ? 'Tidak ada member yang sesuai dengan filter'
                    : 'Belum ada member terdaftar'}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {confirmModal.show && confirmModal.member && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900 border border-gray-800 p-6 max-w-md w-full">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    confirmModal.action === 'approve'
                      ? 'bg-green-500/10'
                      : 'bg-red-500/10'
                  }`}
                >
                  {confirmModal.action === 'approve' ? (
                    <CheckCircle className="text-green-400" size={32} />
                  ) : confirmModal.action === 'delete' ? (
                    <Trash2 className="text-red-400" size={32} />
                  ) : (
                    <XCircle className="text-red-400" size={32} />
                  )}
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-white text-xl font-bold">
                  {confirmModal.action === 'approve'
                    ? 'Approve Member?'
                    : confirmModal.action === 'delete'
                    ? 'Hapus Member?'
                    : 'Reject Member?'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {confirmModal.action === 'approve'
                    ? 'Member akan diaktifkan dan dapat mengakses sistem.'
                    : confirmModal.action === 'delete'
                    ? 'Data member akan dihapus permanen dari database. Tindakan ini tidak dapat dibatalkan!'
                    : 'Member akan ditolak dan tidak dapat mengakses sistem.'}
                </p>
                <div className="mt-4 p-4 bg-gray-800/50 rounded-xl text-left">
                  <p className="text-white text-sm font-medium">{confirmModal.member.full_name}</p>
                  <p className="text-gray-400 text-xs">{confirmModal.member.email}</p>
                  <p className="text-gray-500 text-xs mt-1">{confirmModal.member.member_code}</p>
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
                  Ya, {confirmModal.action === 'approve' ? 'Approve' : confirmModal.action === 'delete' ? 'Hapus' : 'Reject'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {editModal.show && editModal.member && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900 border border-gray-800 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-xl font-bold">Edit Member</h3>
                <button
                  onClick={closeEditModal}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Nama Lengkap <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C542] transition-colors"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C542] transition-colors"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Kota <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C542] transition-colors"
                    placeholder="Masukkan nama kota"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C542] transition-colors"
                    placeholder="08xx-xxxx-xxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Username Telegram
                  </label>
                  <input
                    type="text"
                    value={editForm.telegram_username}
                    onChange={(e) => setEditForm({ ...editForm, telegram_username: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C542] transition-colors"
                    placeholder="@username"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeEditModal}
                  disabled={processingId === editModal.member.id}
                  className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateMember}
                  disabled={
                    processingId === editModal.member.id ||
                    !editForm.full_name.trim() ||
                    !editForm.email.trim() ||
                    !editForm.city.trim()
                  }
                  className="flex-1 px-4 py-3 bg-[#F5C542] text-[#0B0F1A] rounded-xl hover:bg-[#D6B25E] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processingId === editModal.member.id ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0B0F1A] border-t-transparent rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
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
