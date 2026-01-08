import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Flame, AlertCircle, Calendar } from 'lucide-react';
import Card from '../components/Card';

export default function MemberBurn() {
  const { member, isAuthenticated, isActive, isLoading } = useAuth();
  const [burnRecords, setBurnRecords] = useState<any[]>([]);

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
          <div className="bg-orange-500/15 p-3 rounded-2xl border border-orange-500/25">
            <Flame className="text-orange-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Laporan Burn</h1>
            <p className="text-gray-400 text-sm">CTGOLD Token</p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-orange-500/10 to-gray-900/90 border-orange-500/30">
          <div className="space-y-3">
            <h3 className="text-orange-400 font-bold">Tentang Burn CTGOLD</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Burn adalah proses pemusnahan token CTGOLD secara permanen sebagai kebijakan pengelolaan suplai.
              Aktivitas burn dilakukan tanpa jadwal tetap dan bertujuan untuk transparansi komunitas.
            </p>
          </div>
        </Card>

        {burnRecords.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90">
            <div className="text-center py-8 space-y-3">
              <div className="bg-gray-700/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="text-gray-500" size={32} />
              </div>
              <p className="text-gray-400 text-sm">Belum ada record burn saat ini</p>
              <p className="text-gray-500 text-xs">
                Record akan muncul di sini setelah ada aktivitas burn
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {burnRecords.map((record, index) => (
              <Card key={index} className="bg-gradient-to-br from-gray-800/90 to-gray-900/90">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">
                      {new Date(record.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="text-orange-400 text-sm font-semibold">Burn</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Jumlah Token</p>
                      <p className="text-white font-bold">{record.amount} CTGOLD</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Total Burned</p>
                      <p className="text-white font-bold">{record.totalBurned} CTGOLD</p>
                    </div>
                  </div>
                  {record.txHash && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">TX Hash</p>
                      <p className="text-gray-400 text-xs font-mono truncate">{record.txHash}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="bg-gray-800/50 border-gray-700/40">
          <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
            <p className="font-semibold text-gray-300">Disclaimer:</p>
            <ul className="space-y-1">
              <li>• Burn adalah aktivitas internal tim tanpa jadwal tetap</li>
              <li>• Tidak ada jaminan keuntungan atau burn berkelanjutan</li>
              <li>• Data ini untuk transparansi komunitas</li>
              <li>• Bukan promosi investasi atau saran keuangan</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
