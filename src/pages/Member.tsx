import { Shield, Lock, TrendingDown, Flame, TrendingUp, LogIn, UserPlus } from 'lucide-react';
import Card from '../components/Card';

export default function Member() {
  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      <div className="text-center space-y-3 animate-slide-up">
        <div className="inline-flex items-center px-4 py-1.5 bg-ctgold-gold/10 border border-ctgold-gold/30 rounded-full mb-2">
          <span className="text-ctgold-gold text-xs font-semibold">Member Only</span>
        </div>
        <h1 className="text-3xl font-bold text-white">Member Area</h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Akses edukasi & laporan transparansi CTGOLD
        </p>
      </div>

      <div className="space-y-5 animate-slide-up stagger-1">
        <h2 className="text-xl font-bold text-white">Akses Member</h2>

        <div className="grid grid-cols-1 gap-4">
          <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border-gray-700/50 hover:border-blue-400/40 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/15 p-3.5 rounded-2xl border border-blue-500/25">
                  <Shield className="text-blue-400" size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">Edukasi Blockchain & Cryptocurrency</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Materi edukasi blockchain, crypto, manajemen risiko, dan literasi aset digital.
                  </p>
                </div>
              </div>
              <button className="w-full bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl border border-gray-600/50 hover:border-gray-500 transition-all duration-200 flex items-center justify-center space-x-2">
                <Lock size={16} />
                <span>Buka Materi</span>
              </button>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border-gray-700/50 hover:border-green-400/40 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-green-500/15 p-3.5 rounded-2xl border border-green-500/25">
                  <TrendingDown className="text-green-400" size={28} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-bold text-white">Laporan Buyback CTGOLD</h3>
                    <span className="text-xs text-ctgold-gold bg-ctgold-gold/10 px-2 py-0.5 rounded-full border border-ctgold-gold/30">Member Only</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Dokumentasi buyback CTGOLD untuk transparansi komunitas.
                  </p>
                </div>
              </div>
              <button className="w-full bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl border border-gray-600/50 hover:border-gray-500 transition-all duration-200 flex items-center justify-center space-x-2">
                <Lock size={16} />
                <span>Lihat Laporan</span>
              </button>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border-gray-700/50 hover:border-orange-400/40 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-500/15 p-3.5 rounded-2xl border border-orange-500/25">
                  <Flame className="text-orange-400" size={28} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-bold text-white">Laporan Burn CTGOLD</h3>
                    <span className="text-xs text-ctgold-gold bg-ctgold-gold/10 px-2 py-0.5 rounded-full border border-ctgold-gold/30">Member Only</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Catatan burn CTGOLD sebagai kebijakan internal pengelolaan suplai.
                  </p>
                </div>
              </div>
              <button className="w-full bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl border border-gray-600/50 hover:border-gray-500 transition-all duration-200 flex items-center justify-center space-x-2">
                <Lock size={16} />
                <span>Lihat Laporan</span>
              </button>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border-gray-700/50 hover:border-ctgold-gold/40 transition-all duration-300">
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="bg-ctgold-gold/15 p-3.5 rounded-2xl border border-ctgold-gold/25">
                  <TrendingUp className="text-ctgold-gold" size={28} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-bold text-white">Laporan Trading Gold & Bitcoin</h3>
                    <span className="text-xs text-ctgold-gold bg-ctgold-gold/10 px-2 py-0.5 rounded-full border border-ctgold-gold/30">Member Only</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Dokumentasi aktivitas internal tim pada XAUUSD & BTCUSD untuk transparansi.
                  </p>
                </div>
              </div>
              <button className="w-full bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-semibold py-3 rounded-xl border border-gray-600/50 hover:border-gray-500 transition-all duration-200 flex items-center justify-center space-x-2">
                <Lock size={16} />
                <span>Lihat Laporan</span>
              </button>
            </div>
          </Card>
        </div>

      </div>

      <div className="space-y-5 animate-slide-up stagger-2">
        <h2 className="text-xl font-bold text-white">Catatan Penting</h2>

        <Card className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm border-gray-700/40">
          <div className="space-y-3.5 text-sm text-gray-300 leading-relaxed">
            <p className="flex items-start space-x-2">
              <span className="text-gray-500 mt-0.5">•</span>
              <span>Konten ini bersifat edukasi & transparansi komunitas.</span>
            </p>
            <p className="flex items-start space-x-2">
              <span className="text-gray-500 mt-0.5">•</span>
              <span>Bukan layanan investasi, bukan saran keuangan, bukan sinyal trading.</span>
            </p>
            <p className="flex items-start space-x-2">
              <span className="text-gray-500 mt-0.5">•</span>
              <span>Tidak ada keuntungan yang dijanjikan.</span>
            </p>
            <p className="flex items-start space-x-2">
              <span className="text-gray-500 mt-0.5">•</span>
              <span>Aktivitas buyback/burn/trading bersifat internal dan tidak memiliki jadwal tetap atau jaminan.</span>
            </p>
          </div>
        </Card>
      </div>

      <div className="space-y-3 animate-slide-up stagger-3">
        <button
          onClick={() => window.location.href = 'https://ctgold.io/member/register'}
          className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-gray-900 font-bold py-4 rounded-2xl shadow-lg hover:shadow-ctgold-glow transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2"
        >
          <UserPlus size={20} />
          <span>Daftar Sekarang</span>
        </button>

        <button
          onClick={() => window.location.href = 'https://ctgold.io/member/login'}
          className="w-full bg-gray-800/80 text-white font-semibold py-4 rounded-2xl border border-gray-700 hover:bg-gray-700 hover:border-ctgold-gold/50 active:bg-gray-600 transition-all duration-200 active:scale-[0.99] flex items-center justify-center space-x-2"
        >
          <LogIn size={20} />
          <span>Masuk ke Akun</span>
        </button>
      </div>
    </div>
  );
}
