import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, UserPlus } from 'lucide-react';

export default function ManageAdmins() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Kembali ke Dashboard</span>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="text-amber-500" size={32} />
            <h1 className="text-3xl font-bold">Manage Admins</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg transition-colors">
            <UserPlus size={20} />
            <span>Add Admin</span>
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-400">
            Halaman ini hanya dapat diakses oleh Super Admin untuk mengelola admin lainnya.
          </p>
        </div>
      </div>
    </div>
  );
}
