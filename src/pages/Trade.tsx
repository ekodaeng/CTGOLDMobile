import { TrendingUp, Bitcoin, ExternalLink, AlertTriangle } from 'lucide-react';
import Card from '../components/Card';

export default function Trade() {
  const brokers = [
    {
      name: 'XM',
      url: 'https://clicks.pipaffiliates.com/c?c=703302&l=id&p=0',
      description: 'Platform trading global dengan spread kompetitif dan edukasi lengkap',
    },
    {
      name: 'Ultima Markets',
      url: 'https://www.ultimamarkets.com/id/forex-trading/forex-trading-account/?affid=NzQzNDM=',
      description: 'Broker dengan teknologi trading modern dan eksekusi cepat',
    },
    {
      name: 'FBS',
      url: 'https://fbs.partners?ibl=111638&ibp=148861',
      description: 'Broker internasional dengan berbagai pilihan akun trading',
    },
    {
      name: 'CXM',
      url: 'https://secure.cxmidn.com/links/go/1014',
      description: 'Platform trading dengan layanan pelanggan 24/7',
    },
    {
      name: 'OctaFX',
      url: 'https://octa.click/bRj8G8MT54d?ib=764623',
      description: 'Broker dengan kondisi trading yang menguntungkan untuk scalper',
    },
    {
      name: 'Vantage Markets',
      url: 'https://www.vantagemarkets.com/forex-trading/forex-trading-account/?utm_source=promo&utm_medium=social&utm_campaign=RAF&utm_term=NA&utm_content=NA&c=7Hnte1WjzDxfn9rNqNTDNw==',
      description: 'Platform trading dengan akses ke berbagai instrumen keuangan',
    },
  ];

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="text-center space-y-2 animate-slide-up">
        <h1 className="text-3xl font-bold ctgold-gold">Trade</h1>
        <p className="text-gray-400 text-sm">
          Aktivitas Trading & Broker Partner
        </p>
      </div>

      <div className="space-y-4">
        <Card className="animate-slide-up stagger-1">
          <div className="flex items-start space-x-4">
            <div className="bg-ctgold-gold-soft p-3 rounded-xl flex-shrink-0">
              <TrendingUp className="ctgold-gold" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">
                Gold Trading (XAUUSD)
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Aktivitas trading Gold (XAUUSD) yang dilakukan oleh tim CTGOLD dengan
                fokus pada manajemen risiko dan konsistensi.
              </p>
            </div>
          </div>
        </Card>

        <Card className="animate-slide-up stagger-2">
          <div className="flex items-start space-x-4">
            <div className="bg-orange-500/20 p-3 rounded-xl flex-shrink-0">
              <Bitcoin className="text-orange-400" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">
                Bitcoin Trading (BTCUSD)
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Aktivitas trading Bitcoin (BTCUSD) sebagai bagian dari strategi
                diversifikasi trading CTGOLD.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white animate-slide-up stagger-3">
          Broker yang Digunakan Tim CTGOLD
        </h2>
        <p className="text-gray-400 text-sm -mt-2 animate-slide-up stagger-3">
          Broker partner yang dipercaya oleh tim trading CTGOLD
        </p>

        {brokers.map((broker, index) => (
          <Card key={index} className={`animate-slide-up stagger-${Math.min(index + 4, 6)}`}>
            <div className="space-y-3">
              <h3 className="font-bold text-white text-lg">{broker.name}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {broker.description}
              </p>
              <a
                href={broker.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-ctgold-gold text-gray-900 font-bold px-4 py-2.5 rounded-xl hover:bg-[#B8941E] active:bg-[#D4AF37] transition-all duration-150 hover:scale-105 active:scale-95"
              >
                <span>Buka Broker</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 animate-slide-up stagger-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="text-red-400 flex-shrink-0" size={18} />
          <div>
            <h3 className="font-bold text-red-400 mb-2">Disclaimer Risiko</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Trading memiliki risiko. Informasi pada halaman ini bersifat edukatif,
              dokumentatif, dan tidak menjamin hasil di masa depan.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
