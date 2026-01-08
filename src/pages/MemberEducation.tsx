import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Shield, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';
import Card from '../components/Card';

export default function MemberEducation() {
  const { member, isAuthenticated, isActive, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/member/login';
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ctgold-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return null;
  }

  if (!isActive) {
    return (
      <div className="min-h-screen bg-gray-950 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Kembali</span>
          </button>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-gray-900/90 border-yellow-500/30">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="text-yellow-400 font-bold mb-2 text-lg">Akses Terbatas</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Konten ini memerlukan status ACTIVE. Silakan tunggu aktivasi dari admin.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </button>

        <div className="flex items-center space-x-3">
          <div className="bg-blue-500/15 p-3 rounded-2xl border border-blue-500/25">
            <Shield className="text-blue-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Edukasi Member</h1>
            <p className="text-gray-400 text-sm">Blockchain & Cryptocurrency</p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <BookOpen className="text-blue-400 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="text-white font-bold mb-2">Dasar-Dasar Blockchain</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Blockchain adalah teknologi distributed ledger yang mencatat transaksi secara terdesentralisasi.
                  Setiap blok berisi data transaksi, timestamp, dan hash dari blok sebelumnya, membentuk rantai yang tidak dapat diubah.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <BookOpen className="text-blue-400 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="text-white font-bold mb-2">Cryptocurrency & Token</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">
                  Cryptocurrency adalah aset digital yang menggunakan kriptografi untuk keamanan.
                  Token adalah representasi digital dari nilai atau utilitas pada blockchain.
                </p>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span><strong className="text-white">Bitcoin (BTC):</strong> Cryptocurrency pertama, store of value digital</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span><strong className="text-white">Ethereum (ETH):</strong> Platform smart contract untuk aplikasi terdesentralisasi</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span><strong className="text-white">Token ERC-20:</strong> Standard token pada Ethereum blockchain</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <TrendingUp className="text-green-400 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="text-white font-bold mb-2">Manajemen Risiko</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">
                  Manajemen risiko adalah kunci utama dalam trading dan investasi cryptocurrency.
                </p>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Diversifikasi portofolio untuk mengurangi risiko</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Gunakan stop loss untuk membatasi kerugian</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Investasi hanya dengan dana yang siap hilang</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Lakukan riset mendalam sebelum berinvestasi (DYOR)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Jangan FOMO atau panik saat market volatile</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <BookOpen className="text-blue-400 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="text-white font-bold mb-2">Wallet & Security</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">
                  Keamanan aset digital adalah prioritas utama.
                </p>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">!</span>
                    <span>Jangan pernah share private key atau seed phrase</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">!</span>
                    <span>Gunakan hardware wallet untuk penyimpanan jangka panjang</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">!</span>
                    <span>Enable 2FA pada semua exchange dan wallet</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">!</span>
                    <span>Backup seed phrase secara offline dan aman</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/40">
          <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
            <p className="font-semibold text-gray-300">Disclaimer:</p>
            <p>
              Konten ini bersifat edukasi dan tidak merupakan saran investasi atau keuangan.
              Cryptocurrency adalah aset berisiko tinggi. Selalu lakukan riset sendiri (DYOR) dan konsultasikan dengan advisor keuangan sebelum berinvestasi.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
