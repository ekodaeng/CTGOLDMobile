import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import Card from '../components/Card';

export default function MemberTrading() {
  const { member, isAuthenticated, isActive, isLoading } = useAuth();
  const [tradingRecords, setTradingRecords] = useState<any[]>([]);

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
          <div className="bg-ctgold-gold/15 p-3 rounded-2xl border border-ctgold-gold/25">
            <TrendingUp className="text-ctgold-gold" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Laporan Trading</h1>
            <p className="text-gray-400 text-sm">Gold & Bitcoin</p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-ctgold-gold/10 to-gray-900/90 border-ctgold-gold/30">
          <div className="space-y-3">
            <h3 className="text-ctgold-gold font-bold">Tentang Trading Report</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Dokumentasi aktivitas trading internal tim pada XAUUSD (Gold) dan BTCUSD (Bitcoin).
              Record ini bertujuan untuk transparansi komunitas dan bukan merupakan sinyal trading atau saran investasi.
            </p>
          </div>
        </Card>

        {tradingRecords.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90">
            <div className="text-center py-8 space-y-3">
              <div className="bg-gray-700/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="text-gray-500" size={32} />
              </div>
              <p className="text-gray-400 text-sm">Belum ada record trading saat ini</p>
              <p className="text-gray-500 text-xs">
                Record akan muncul di sini setelah ada aktivitas trading
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {tradingRecords.map((record, index) => (
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
                    <span className={`text-sm font-semibold ${record.type === 'PROFIT' ? 'text-green-400' : 'text-red-400'}`}>
                      {record.type}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Pair</p>
                      <p className="text-white font-bold">{record.pair}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Result</p>
                      <p className={`font-bold ${record.type === 'PROFIT' ? 'text-green-400' : 'text-red-400'}`}>
                        {record.result}
                      </p>
                    </div>
                  </div>
                  {record.notes && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Catatan</p>
                      <p className="text-gray-400 text-xs">{record.notes}</p>
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
              <li>• Trading adalah aktivitas internal tim dengan risiko tinggi</li>
              <li>• Bukan sinyal trading atau saran investasi</li>
              <li>• Past performance tidak menjamin hasil masa depan</li>
              <li>• Data ini untuk transparansi komunitas</li>
              <li>• Trading crypto & forex memiliki risiko kehilangan modal</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
