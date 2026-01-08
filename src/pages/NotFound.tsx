import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-amber-500 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-2">Halaman Tidak Ditemukan</h2>
          <p className="text-gray-400">Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg transition-colors"
        >
          <Home size={20} />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
