import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ShoppingCart, ShieldCheck, Users, GraduationCap, TrendingUp, FileText, AlertTriangle, X, Check, ChevronDown, Mail } from 'lucide-react';
import Card from '../components/Card';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleJoinTelegram = () => {
    window.open('https://t.me/ctgold_community', '_blank', 'noopener,noreferrer');
  };

  const handleBuyCTGOLD = () => {
    navigate('/web3/deposit');
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setSubscribeMessage({ type: 'error', text: 'Mohon masukkan alamat email yang valid' });
      return;
    }

    setIsSubscribing(true);
    setSubscribeMessage(null);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          setSubscribeMessage({ type: 'error', text: 'Email sudah terdaftar' });
        } else {
          setSubscribeMessage({ type: 'error', text: 'Terjadi kesalahan, coba lagi' });
        }
      } else {
        setSubscribeMessage({ type: 'success', text: 'Berhasil! Terima kasih sudah mendaftar' });
        setEmail('');
      }
    } catch (error) {
      setSubscribeMessage({ type: 'error', text: 'Terjadi kesalahan, coba lagi' });
    } finally {
      setIsSubscribing(false);
    }
  };

  const faqItems = [
    {
      question: "Apa itu CTGOLD?",
      answer: "CTGOLD adalah token utilitas berbasis komunitas yang digunakan untuk mendukung edukasi, kolaborasi, transparansi, dan aktivitas nyata dalam ekosistem CTGOLD."
    },
    {
      question: "Ini investasi atau bukan?",
      answer: "Bukan. CTGOLD bukan produk investasi, bukan layanan trading, dan tidak menjanjikan keuntungan."
    },
    {
      question: "Bisa dipakai untuk apa?",
      answer: "CTGOLD digunakan dalam ekosistem komunitas, seperti akses program, partisipasi aktivitas, dan dukungan pengembangan ekosistem."
    },
    {
      question: "Gimana sistem transparansinya?",
      answer: "Aktivitas ekosistem, laporan, dan dokumentasi dibagikan secara terbuka untuk menjaga transparansi kepada komunitas."
    },
    {
      question: "Buyback & burn itu apa?",
      answer: "Buyback & burn adalah kebijakan internal tim untuk membeli kembali dan mengurangi suplai token jika memungkinkan. Tidak bersifat wajib atau terjadwal."
    },
    {
      question: "Cara gabung gimana?",
      answer: "Kamu bisa bergabung dengan komunitas CTGOLD melalui Telegram dan berpartisipasi secara sukarela."
    },
    {
      question: "Ada risikonya tidak?",
      answer: "Ya. Aset kripto memiliki risiko. Setiap partisipasi dilakukan secara sadar dan bertanggung jawab oleh masing-masing individu."
    },
    {
      question: "Siapa yang kelola CTGOLD?",
      answer: "CTGOLD dikelola oleh tim inti bersama komunitas dengan prinsip keterbukaan dan kolaborasi."
    }
  ];

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      <div className="text-center space-y-8 animate-slide-up">
        <div className="space-y-4 pt-4">
          <h1 className="text-6xl font-bold ctgold-gold tracking-tight drop-shadow-lg">
            CTGOLD
          </h1>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">
              Ekosistem untuk Komunitas
            </h2>
            <p className="text-gray-400 text-base font-medium max-w-md mx-auto">
              Belajar, berkolaborasi, dan tumbuh bersama.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 shadow-xl">
          <p className="text-gray-300 text-base leading-relaxed max-w-2xl mx-auto">
            Token utilitas yang fokus pada edukasi dan aktivitas nyata. Tanpa janji muluk,
            hanya aksi dan transparansi.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <button
            onClick={handleJoinTelegram}
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-gray-900 font-bold py-5 px-6 rounded-2xl shadow-lg hover:shadow-ctgold-glow transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3"
          >
            <Send size={22} className="flex-shrink-0" />
            <span className="text-lg">Gabung Sekarang</span>
          </button>

          <button
            onClick={handleBuyCTGOLD}
            className="w-full bg-gray-800/50 backdrop-blur-sm text-white font-bold py-5 px-6 rounded-2xl border-2 border-gray-700 hover:border-ctgold-gold hover:bg-gray-800 transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-3 shadow-lg"
          >
            <ShoppingCart size={22} className="flex-shrink-0" />
            <span className="text-lg">Beli CTGOLD</span>
          </button>
        </div>
      </div>

      <div className="space-y-6 animate-slide-up stagger-1">
        <div className="grid grid-cols-2 gap-4">
          <Card className="text-center space-y-3 py-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-gray-700/50 animate-slide-up stagger-2 hover:border-green-500/30 transition-all duration-200">
            <div className="flex justify-center">
              <div className="bg-green-500/20 p-4 rounded-2xl border border-green-500/30">
                <ShieldCheck className="text-green-400" size={28} />
              </div>
            </div>
            <div>
              <h4 className="text-3xl font-bold ctgold-gold">100%</h4>
              <p className="text-gray-300 text-sm font-medium mt-1">Transparan</p>
            </div>
          </Card>

          <Card className="text-center space-y-3 py-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-gray-700/50 animate-slide-up stagger-2 hover:border-blue-500/30 transition-all duration-200">
            <div className="flex justify-center">
              <div className="bg-blue-500/20 p-4 rounded-2xl border border-blue-500/30">
                <Users className="text-blue-400" size={28} />
              </div>
            </div>
            <div>
              <h4 className="text-3xl font-bold ctgold-gold">10K+</h4>
              <p className="text-gray-300 text-sm font-medium mt-1">Anggota</p>
            </div>
          </Card>

          <Card className="text-center space-y-3 py-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-gray-700/50 animate-slide-up stagger-3 hover:border-[#D4AF37]/30 transition-all duration-200">
            <div className="flex justify-center">
              <div className="bg-[#D4AF37]/20 p-4 rounded-2xl border border-[#D4AF37]/30">
                <GraduationCap className="text-[#D4AF37]" size={28} />
              </div>
            </div>
            <div>
              <h4 className="text-3xl font-bold ctgold-gold">Gratis</h4>
              <p className="text-gray-300 text-sm font-medium mt-1">Edukasi</p>
            </div>
          </Card>

          <Card className="text-center space-y-3 py-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-gray-700/50 animate-slide-up stagger-3 hover:border-orange-500/30 transition-all duration-200">
            <div className="flex justify-center">
              <div className="bg-orange-500/20 p-4 rounded-2xl border border-orange-500/30">
                <TrendingUp className="text-orange-400" size={28} />
              </div>
            </div>
            <div>
              <h4 className="text-3xl font-bold ctgold-gold">Nyata</h4>
              <p className="text-gray-300 text-sm font-medium mt-1">Aktivitas</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-6 animate-slide-up stagger-1">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white">Apa yang Kami Lakukan?</h3>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">
            Dokumentasi aktivitas tim CTGOLD. Semua terbuka, tidak ada yang disembunyikan.
          </p>
        </div>

        <Card className="bg-gradient-to-br from-red-900/20 to-gray-800/80 border-red-500/30 backdrop-blur-sm shadow-xl">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-red-500/20 p-2 rounded-xl border border-red-500/30">
                <AlertTriangle className="text-red-400" size={24} />
              </div>
              <h4 className="text-lg font-bold ctgold-gold">Wajib Dibaca!</h4>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-start space-x-2">
                <X className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-gray-300">BUKAN layanan investasi atau trading</p>
              </div>
              <div className="flex items-start space-x-2">
                <X className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-gray-300">Tidak ada profit yang dijanjikan</p>
              </div>
              <div className="flex items-start space-x-2">
                <X className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-gray-300">Tidak ada sinyal trading</p>
              </div>
              <div className="flex items-start space-x-2">
                <X className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-gray-300">Aktivitas bersifat internal dan opsional</p>
              </div>
              <div className="flex items-start space-x-2">
                <X className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-gray-300">Buyback & burn berdasarkan kebijakan tim</p>
              </div>
              <div className="flex items-start space-x-2">
                <X className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-gray-300">Tidak ada jadwal tetap atau jaminan</p>
              </div>
              <div className="flex items-start space-x-2">
                <X className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-gray-300">Partisipasi 100% sukarela</p>
              </div>
              <div className="flex items-start space-x-2">
                <X className="text-red-400 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-gray-300">Hasil masa lalu ≠ jaminan masa depan</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-gray-700/50">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-xl border border-blue-500/30">
                  <TrendingUp className="text-blue-400" size={20} />
                </div>
                <h4 className="text-base font-bold ctgold-gold">Instrumen Trading</h4>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded-full text-[#D4AF37] text-sm font-semibold">
                  XAUUSD
                </span>
                <span className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-sm font-semibold">
                  BTCUSD
                </span>
              </div>

              <p className="text-gray-400 text-xs">
                Digunakan sebagai bagian dari aktivitas dan dokumentasi internal.
              </p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-gray-700/50">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-500/20 p-2 rounded-xl border border-green-500/30">
                  <Check className="text-green-400" size={20} />
                </div>
                <h4 className="text-base font-bold ctgold-gold">Untuk Apa?</h4>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] flex-shrink-0 mt-2"></div>
                  <p className="text-gray-300">Mendukung operasional ekosistem</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] flex-shrink-0 mt-2"></div>
                  <p className="text-gray-300">Pengembangan komunitas</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] flex-shrink-0 mt-2"></div>
                  <p className="text-gray-300">Buyback & burn (jika memungkinkan)</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-gray-700/50">
          <div className="space-y-3">
            <h4 className="text-base font-bold ctgold-gold">Disclaimer</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              Aset kripto berisiko tinggi. Konten ini bersifat edukasi dan bukan nasihat keuangan.
              Screenshot dan laporan dibagikan hanya untuk transparansi.
            </p>
          </div>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-ctgold-gold-soft to-gray-800/50 border-ctgold-gold-soft animate-slide-up stagger-4 shadow-xl hover:shadow-ctgold-glow transition-all duration-200">
        <button
          onClick={() => navigate('/about')}
          className="w-full flex items-center space-x-4 group py-2"
        >
          <div className="bg-ctgold-gold-soft p-3 rounded-xl group-hover:bg-ctgold-gold/30 transition-all duration-200 flex-shrink-0">
            <FileText className="ctgold-gold" size={22} />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-white font-bold text-base group-hover:ctgold-gold transition-colors duration-200">
              Baca Whitepaper
            </h3>
            <p className="text-gray-400 text-sm mt-0.5">
              Dokumen resmi CTGOLD
            </p>
          </div>
        </button>
      </Card>

      <div className="space-y-6 animate-slide-up stagger-4">
        <div className="text-center space-y-2">
          <div className="inline-block px-4 py-1.5 bg-ctgold-gold/20 border border-ctgold-gold/30 rounded-full mb-2">
            <span className="text-xs font-bold ctgold-gold uppercase tracking-wider">FAQ</span>
          </div>
          <h3 className="text-2xl font-bold text-white">Tanya Jawab Seputar CTGOLD</h3>
          <p className="text-gray-400 text-sm max-w-lg mx-auto">
            Jawaban singkat dan jelas untuk pertanyaan yang sering muncul.
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <Card
              key={index}
              className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border-gray-700/50 hover:border-ctgold-gold/30 transition-all duration-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between text-left group"
              >
                <span className={`font-semibold text-sm ${openFaqIndex === index ? 'ctgold-gold' : 'text-white group-hover:ctgold-gold'} transition-colors duration-200`}>
                  {item.question}
                </span>
                <ChevronDown
                  size={20}
                  className={`flex-shrink-0 ml-3 transition-all duration-300 ${
                    openFaqIndex === index ? 'ctgold-gold rotate-180' : 'text-gray-400 group-hover:text-white'
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openFaqIndex === index ? 'grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t border-gray-700/50' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-ctgold-gold-soft to-gray-800/50 border-ctgold-gold-soft shadow-lg">
          <button
            onClick={handleJoinTelegram}
            className="w-full text-center space-y-2 group py-2"
          >
            <p className="text-white font-semibold text-sm group-hover:ctgold-gold transition-colors duration-200">
              Masih ada pertanyaan?
            </p>
            <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-200 flex items-center justify-center space-x-2">
              <span>Tanya langsung di Telegram</span>
              <Send size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </p>
          </button>
        </Card>
      </div>

      <div className="space-y-6 animate-slide-up stagger-5">
        <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-gray-700/50">
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="bg-ctgold-gold/20 p-4 rounded-2xl border border-ctgold-gold/30">
                  <Mail className="ctgold-gold" size={28} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white">Jangan Ketinggalan Info Terbaru</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                Daftar newsletter untuk update ekosistem, materi edukasi, dan kabar komunitas. Gratis, tanpa spam.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubscribe} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Alamat email Anda"
                  className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-ctgold-gold transition-colors duration-200"
                  disabled={isSubscribing}
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-gray-900 font-bold rounded-xl hover:shadow-ctgold-glow transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubscribing ? 'Mendaftar...' : 'Daftar'}
                </button>
              </div>

              {subscribeMessage && (
                <div className={`p-3 rounded-xl border ${
                  subscribeMessage.type === 'success'
                    ? 'bg-green-500/20 border-green-500/30 text-green-400'
                    : 'bg-red-500/20 border-red-500/30 text-red-400'
                } text-sm text-center`}>
                  {subscribeMessage.text}
                </div>
              )}

              <p className="text-xs text-gray-500 text-center">
                Email Anda aman. Kami tidak akan spam atau membagikan data Anda ke pihak lain.
              </p>
            </form>
          </div>
        </Card>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border border-gray-700/50 space-y-6">
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-bold text-white">Siap Bergabung dengan CTGOLD?</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Akses edukasi gratis, diskusi aktif, dan komunitas yang saling mendukung.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-900/20 to-gray-800/80 border-blue-500/30 hover:border-blue-500/50 transition-all duration-200">
              <button
                onClick={handleJoinTelegram}
                className="w-full text-center space-y-3 group"
              >
                <div className="flex justify-center">
                  <div className="bg-blue-500/20 p-4 rounded-2xl border border-blue-500/30 group-hover:bg-blue-500/30 transition-all duration-200">
                    <Send className="text-blue-400" size={24} />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors duration-200">
                    Telegram
                  </h4>
                  <p className="text-gray-400 text-sm mt-1">Gabung diskusi & update</p>
                </div>
              </button>
            </Card>

            <Card className="bg-gradient-to-br from-ctgold-gold-soft to-gray-800/80 border-ctgold-gold/30 hover:border-ctgold-gold/50 transition-all duration-200">
              <a
                href="mailto:ctgold@gmail.com"
                className="w-full text-center space-y-3 group block"
              >
                <div className="flex justify-center">
                  <div className="bg-ctgold-gold/20 p-4 rounded-2xl border border-ctgold-gold/30 group-hover:bg-ctgold-gold/30 transition-all duration-200">
                    <Mail className="ctgold-gold" size={24} />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:ctgold-gold transition-colors duration-200">
                    Email
                  </h4>
                  <p className="text-gray-400 text-sm mt-1">Hubungi kami langsung</p>
                </div>
              </a>
            </Card>
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-ctgold-gold/30 hover:border-ctgold-gold/40 transition-all duration-200 animate-slide-up stagger-6">
        <a
          href="mailto:ctgold@gmail.com"
          className="block group"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-ctgold-gold/20 p-3 rounded-xl border border-ctgold-gold/30 group-hover:bg-ctgold-gold/30 transition-all duration-200 flex-shrink-0">
                <Mail className="ctgold-gold" size={24} />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:ctgold-gold transition-colors duration-200">
                    Email Resmi CTGOLD
                  </h4>
                  <p className="text-ctgold-gold/80 text-sm font-medium mt-1 group-hover:text-ctgold-gold transition-colors duration-200">
                    ctgold@gmail.com
                  </p>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Untuk pertanyaan umum, kolaborasi komunitas, edukasi, atau klarifikasi informasi seputar ekosistem CTGOLD.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-700/50">
              <p className="text-xs text-gray-500 leading-relaxed">
                Email ini digunakan untuk komunikasi resmi dan edukasi. Bukan layanan trading.
              </p>
            </div>
          </div>
        </a>
      </Card>

      <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border-ctgold-gold-soft/30 animate-slide-up stagger-4">
        <div className="space-y-2">
          <h4 className="text-sm font-bold ctgold-gold text-center">Catatan Edukasi</h4>
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            CTGOLD adalah token utilitas berbasis komunitas. Konten yang ditampilkan bersifat edukasi dan dokumentasi aktivitas. Bukan layanan investasi, bukan nasihat keuangan, dan tidak menjanjikan keuntungan. Partisipasi bersifat sukarela dan setiap individu bertanggung jawab atas keputusannya sendiri.
          </p>
        </div>
      </Card>

      <div className="text-center py-6 border-t border-gray-800">
        <p className="text-gray-500 text-xs">
          © 2026 CTGOLD. Hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
