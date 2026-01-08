import { Shield, Target, Users, FileText, Eye, Coins, BarChart, AlertCircle, Map } from 'lucide-react';
import Card from '../components/Card';

export default function About() {
  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="text-center space-y-2 animate-slide-up">
        <h1 className="text-3xl font-bold ctgold-gold">Tentang CTGOLD</h1>
        <p className="text-gray-400 text-sm">
          Komunitas Trading Profesional
        </p>
      </div>

      <Card className="animate-slide-up stagger-1">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="bg-ctgold-gold-soft p-2 rounded-lg flex-shrink-0">
              <Target className="ctgold-gold" size={18} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">Apa itu CTGOLD?</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                CTGOLD adalah ekosistem komunitas berbasis trading Gold (XAUUSD) dan
                Bitcoin (BTCUSD) dengan mekanisme buyback dan burn untuk meningkatkan
                nilai token secara berkelanjutan.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="animate-slide-up stagger-2">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0">
              <Eye className="text-blue-400" size={18} />
            </div>
            <h3 className="font-bold text-white">Visi & Misi</h3>
          </div>
          <div className="space-y-3 pl-11">
            <div>
              <h4 className="font-bold text-gray-300 text-sm mb-1">Visi</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Menjadi ekosistem trading berbasis komunitas yang transparan, berkelanjutan,
                dan memberikan edukasi berkualitas kepada para trader.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-300 text-sm mb-1">Misi</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Membangun komunitas trader profesional yang saling mendukung, menerapkan
                prinsip transparansi dalam setiap aktivitas, dan mengintegrasikan mekanisme
                buyback-burn untuk menjaga disiplin suplai token.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="animate-slide-up stagger-3">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-ctgold-gold-soft p-2 rounded-lg flex-shrink-0">
              <FileText className="ctgold-gold" size={20} />
            </div>
            <h2 className="font-bold text-white text-lg">Whitepaper CTGOLD</h2>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed">
            Dokumen resmi yang menjelaskan konsep, utilitas, tokenomics, transparansi,
            dan arah pengembangan CTGOLD.
          </p>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
            <p className="text-yellow-400 text-xs leading-relaxed">
              <span className="font-semibold">Catatan:</span> Dokumen ini bersifat informatif
              dan bukan ajakan investasi.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs ctgold-gold">1</div>
                <span>Pendahuluan</span>
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed pl-8">
                CTGOLD adalah token utilitas berbasis komunitas yang mengintegrasikan
                aktivitas trading Gold (XAUUSD) dan Bitcoin (BTCUSD). Fokus utama adalah
                transparansi, edukasi, dan keberlanjutan ekosistem.
              </p>
            </div>

            <div className="h-px bg-gray-700"></div>

            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs ctgold-gold">2</div>
                <span>Utilitas Token</span>
              </h4>
              <div className="pl-8 space-y-2">
                <div className="flex items-start space-x-2">
                  <Coins className="text-gray-500 flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Akses ke sinyal trading premium dan analisis pasar harian
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <Coins className="text-gray-500 flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Partisipasi dalam program edukasi dan mentoring trading
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <Coins className="text-gray-500 flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Prioritas dalam mekanisme buyback token CTGOLD
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-700"></div>

            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs ctgold-gold">3</div>
                <span>Tokenomics</span>
              </h4>
              <div className="pl-8 space-y-2">
                <div className="flex items-start space-x-2">
                  <BarChart className="text-gray-500 flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Supply dinamis dengan mekanisme buyback dan burn berkala
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <BarChart className="text-gray-500 flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Sebagian profit trading dialokasikan untuk buyback token dari pasar
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <BarChart className="text-gray-500 flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Token yang di-buyback kemudian dibakar untuk mengurangi supply
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-700"></div>

            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs ctgold-gold">4</div>
                <span>Transparansi</span>
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed pl-8">
                Semua aktivitas trading, buyback, dan burn dilaporkan secara berkala di
                halaman Laporan. Komunitas dapat memantau setiap transaksi yang dilakukan
                oleh tim CTGOLD.
              </p>
            </div>

            <div className="h-px bg-gray-700"></div>

            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs ctgold-gold">5</div>
                <span>Peringatan Risiko</span>
              </h4>
              <div className="pl-8 space-y-2">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Trading cryptocurrency dan forex mengandung risiko tinggi
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Tidak ada jaminan keuntungan atau hasil di masa depan
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Keputusan investasi sepenuhnya tanggung jawab masing-masing individu
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-700"></div>

            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs ctgold-gold">6</div>
                <span>Roadmap</span>
              </h4>
              <div className="pl-8 space-y-2">
                <div className="flex items-start space-x-2">
                  <Map className="text-gray-500 flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Pengembangan platform trading terintegrasi
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <Map className="text-gray-500 flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Ekspansi program edukasi dan mentoring
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <Map className="text-gray-500 flex-shrink-0 mt-0.5" size={14} />
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Peningkatan frekuensi buyback-burn seiring pertumbuhan profit
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-700"></div>

            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs ctgold-gold">7</div>
                <span>Penutup</span>
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed pl-8">
                CTGOLD berkomitmen untuk membangun ekosistem yang transparan, berkelanjutan,
                dan memberikan nilai nyata kepada komunitas. Dengan prinsip edukasi dan
                disiplin manajemen risiko, kami terus berkembang bersama komunitas.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="animate-slide-up stagger-4">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="bg-green-500/20 p-2 rounded-lg flex-shrink-0">
              <Users className="text-green-400" size={18} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">Transparansi</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Semua aktivitas trading dan buyback-burn kami laporkan secara transparan
                di halaman Laporan. Anda dapat memantau setiap transaksi yang dilakukan
                oleh tim.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 animate-slide-up stagger-5">
        <div className="space-y-2">
          <h3 className="font-bold text-red-400 flex items-center space-x-2">
            <Shield size={18} />
            <span>Disclaimer Penting</span>
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            CTGOLD bukan ajakan investasi. Trading cryptocurrency dan forex mengandung
            risiko tinggi dan mungkin tidak cocok untuk semua investor. Pastikan Anda
            memahami risiko yang ada dan hanya menggunakan dana yang siap Anda rugikan.
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Keputusan investasi sepenuhnya merupakan tanggung jawab Anda. Lakukan riset
            mandiri sebelum membuat keputusan investasi.
          </p>
        </div>
      </Card>
    </div>
  );
}
