import { useState, useEffect } from 'react';
import { Mail, ArrowLeft, Shield } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setMessage({ type: 'error', text: 'Email wajib diisi' });
      return;
    }

    if (cooldownSeconds > 0) {
      setMessage({ type: 'error', text: `Tunggu ${cooldownSeconds} detik sebelum mencoba lagi` });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const emailLower = email.toLowerCase();
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-reset-password`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email: emailLower }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Reset password error:', data);
        setMessage({
          type: 'error',
          text: data.error || 'Terjadi kesalahan. Silakan coba lagi.',
        });
        setLoading(false);
      } else {
        setEmailSent(true);
        setCooldownSeconds(30);
        setMessage({
          type: 'success',
          text: data.message || 'Jika email terdaftar, link reset password akan dikirim.',
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Request reset error:', error);
      setMessage({
        type: 'error',
        text: 'Terjadi kesalahan koneksi. Silakan coba lagi.',
      });
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/member/login';
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <button
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Lupa Password</h1>
          <p className="text-gray-400 text-sm">
            Masukkan email untuk reset password
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">

          <div className="p-6">
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ctgold-gold/50 transition-colors"
                    placeholder="email@contoh.com"
                    required
                    disabled={loading}
                  />
                </div>

                {message && (
                  <div
                    className={`p-4 rounded-xl border ${
                      message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                    } text-sm`}
                  >
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || cooldownSeconds > 0}
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-gray-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-ctgold-glow transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>Mengirim...</span>
                  ) : cooldownSeconds > 0 ? (
                    <span>Tunggu {cooldownSeconds} detik</span>
                  ) : (
                    <>
                      <Mail size={20} />
                      <span>Kirim Link Reset</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Mail className="text-green-400" size={24} />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-green-400 font-bold text-lg">Permintaan Diterima!</h3>
                    <p className="text-green-300 text-sm leading-relaxed">
                      Jika email <span className="font-semibold text-green-400">{email}</span> terdaftar,<br />
                      link reset password akan dikirim ke alamat tersebut.
                    </p>
                    <p className="text-xs text-gray-400 pt-1">
                      Silakan cek inbox atau folder spam Anda
                    </p>

                    <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-left">
                      <p className="text-xs text-yellow-400 leading-relaxed">
                        <strong>Catatan:</strong> Jika email tidak diterima dalam 5 menit, kemungkinan email belum terdaftar atau layanan email belum dikonfigurasi.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBackToLogin}
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-gray-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-ctgold-glow transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                >
                  Kembali ke Login
                </button>

                <button
                  onClick={() => {
                    setEmailSent(false);
                    setMessage(null);
                    setEmail('');
                  }}
                  className="w-full text-gray-400 hover:text-ctgold-gold transition-colors text-sm font-medium py-2"
                >
                  Kirim ulang ke email lain
                </button>
              </div>
            )}
          </div>

          <div className="bg-blue-500/10 border-t border-blue-500/20 p-4">
            <div className="flex items-start space-x-3">
              <Shield className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-xs text-blue-400 leading-relaxed mb-2">
                  <span className="font-semibold">Catatan Keamanan:</span> Kami tidak pernah meminta password melalui chat atau media sosial.
                </p>
                <p className="text-xs text-blue-300/80 leading-relaxed">
                  <span className="font-semibold">Pengaturan Email:</span> Jika email tidak diterima, kemungkinan layanan email Supabase belum dikonfigurasi SMTP. Hubungi administrator untuk setup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
