import { useState, useEffect } from 'react';
import { Users, Search, CheckCircle, XCircle, Clock, Eye, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Member {
  id: string;
  member_code: string;
  full_name: string;
  email: string;
  phone: string | null;
  telegram_username: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>(() => {
    const path = window.location.pathname;
    if (path === '/admin/members/pending') return 'PENDING';
    if (path === '/admin/members/active') return 'ACTIVE';
    if (path === '/admin/members/rejected') return 'REJECTED';
    return 'PENDING';
  });
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [searchTerm, filterStatus, members]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin/members/pending') setFilterStatus('PENDING');
      else if (path === '/admin/members/active') setFilterStatus('ACTIVE');
      else if (path === '/admin/members/rejected') setFilterStatus('REJECTED');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setMembers(data);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.full_name.toLowerCase().includes(search) ||
          m.email.toLowerCase().includes(search) ||
          m.member_code.toLowerCase().includes(search)
      );
    }

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((m) => m.status === filterStatus);
    }

    setFilteredMembers(filtered);
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setFilterStatus(newStatus);

    let path = '/admin/members';
    if (newStatus === 'PENDING') path = '/admin/members/pending';
    else if (newStatus === 'ACTIVE') path = '/admin/members/active';
    else if (newStatus === 'REJECTED') path = '/admin/members/rejected';

    window.history.pushState({}, '', path);
  };

  const updateMemberStatus = async (memberId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus, updated_at: new Date().toISOString() } as any)
        .eq('id', memberId);

      if (error) throw error;

      const memberData = members.find(m => m.id === memberId);
      if (memberData) {
        await supabase.from('member_logs').insert({
          member_id: memberId,
          action: 'STATUS_CHANGE',
          metadata: {
            old_status: memberData.status,
            new_status: newStatus,
            changed_by: 'admin',
          },
        } as any);
      }

      await loadMembers();
      alert(`Status member berhasil diubah menjadi ${newStatus}`);
    } catch (error) {
      console.error('Error updating member status:', error);
      alert('Gagal mengubah status member');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      SUSPENDED: 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    const icons = {
      ACTIVE: <CheckCircle className="w-3 h-3" />,
      PENDING: <Clock className="w-3 h-3" />,
      SUSPENDED: <XCircle className="w-3 h-3" />,
    };
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || 'bg-slate-500/20 text-slate-400'}`}>
        {icons[status as keyof typeof icons]}
        <span>{status}</span>
      </span>
    );
  };

  const handleViewDetail = (member: Member) => {
    setSelectedMember(member);
    setShowDetail(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Manajemen Member</h1>
          <p className="text-slate-400">Kelola data member CTGOLD</p>
        </div>
        <button
          onClick={loadMembers}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-slate-900 rounded-lg transition-colors font-medium"
        >
          <RefreshCw size={18} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Cari member (nama, email, kode)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Menampilkan {filteredMembers.length} dari {members.length} member
          </p>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">Tidak ada member ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Kode</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Nama</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Terdaftar</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-slate-300">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-yellow-500">{member.member_code}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium text-slate-200">{member.full_name}</p>
                        <p className="text-xs text-slate-500">{member.role}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-400">{member.email}</span>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(member.status)}</td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-400">
                        {new Date(member.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewDetail(member)}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye size={16} />
                        </button>
                        {member.status === 'PENDING' && (
                          <button
                            onClick={() => updateMemberStatus(member.id, 'ACTIVE')}
                            className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Aktifkan"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {member.status === 'ACTIVE' && (
                          <button
                            onClick={() => updateMemberStatus(member.id, 'SUSPENDED')}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Suspend"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        {member.status === 'SUSPENDED' && (
                          <button
                            onClick={() => updateMemberStatus(member.id, 'ACTIVE')}
                            className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Aktifkan Kembali"
                          >
                            <CheckCircle size={16} />
                          </button>
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

      {showDetail && selectedMember && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-100">Detail Member</h3>
              <button
                onClick={() => setShowDetail(false)}
                className="text-slate-400 hover:text-slate-100 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Kode Member</p>
                  <p className="text-sm font-mono text-yellow-500">{selectedMember.member_code}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  {getStatusBadge(selectedMember.status)}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Nama Lengkap</p>
                <p className="text-sm text-slate-200">{selectedMember.full_name}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Email</p>
                <p className="text-sm text-slate-200">{selectedMember.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Telepon</p>
                  <p className="text-sm text-slate-200">{selectedMember.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Telegram</p>
                  <p className="text-sm text-slate-200">
                    {selectedMember.telegram_username ? `@${selectedMember.telegram_username}` : '-'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-1">Role</p>
                <p className="text-sm text-slate-200">{selectedMember.role}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Terdaftar</p>
                  <p className="text-sm text-slate-200">
                    {new Date(selectedMember.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Terakhir Update</p>
                  <p className="text-sm text-slate-200">
                    {new Date(selectedMember.updated_at).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-3">
                {selectedMember.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      updateMemberStatus(selectedMember.id, 'ACTIVE');
                      setShowDetail(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium"
                  >
                    <CheckCircle size={18} />
                    <span>Aktifkan Member</span>
                  </button>
                )}
                {selectedMember.status === 'ACTIVE' && (
                  <button
                    onClick={() => {
                      updateMemberStatus(selectedMember.id, 'SUSPENDED');
                      setShowDetail(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-medium"
                  >
                    <XCircle size={18} />
                    <span>Suspend Member</span>
                  </button>
                )}
                {selectedMember.status === 'SUSPENDED' && (
                  <button
                    onClick={() => {
                      updateMemberStatus(selectedMember.id, 'ACTIVE');
                      setShowDetail(false);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium"
                  >
                    <CheckCircle size={18} />
                    <span>Aktifkan Kembali</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
