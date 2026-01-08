import { useState, useEffect } from 'react';
import { ArrowLeft, KeyRound, AlertCircle, CheckCircle, Mail, Loader2 } from 'lucide-react';
import Card from '../components/Card';

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(10);

  useEffect(() => {
    if (isSuccess) {
      const timer = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = '/admin/login';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email wajib diisi');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Format email tidak valid');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const emailLower = email.toLowerCase().trim();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const apiUrl = `${supabaseUrl}/functions/v1/admin-forgot-password`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email: emailLower }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Terjadi kesalahan. Silakan coba lagi.');
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Terjadi kesalahan saat menghubungi server. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#070A0F] via-[#0A0D15] to-[#0B0F1A] px-4 py-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,197,66,0.08),transparent_60%)]"></div>

        <div className="w-full max-w-[420px] space-y-6 animate-fade-in relative z-10">
          <Card className="bg-black/30 backdrop-blur-xl border border-green-500/30 shadow-2xl shadow-green-500/10">
            <div className="flex flex-col items-center text-center space-y-6 p-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center animate-pulse">
                <CheckCircle className="text-green-400" size={40} />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Link Reset Terkirim</h2>
                <div className="space-y-3">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Jika email terdaftar sebagai admin, link reset password telah dikirim.
                  </p>
                  <p className="text-xs text-gray-400">
                    Silakan cek inbox atau folder spam Anda.
                  </p>

                  <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-xs text-blue-300 leading-relaxed">
                      Link reset berlaku selama <strong>1 jam</strong>. Jika tidak menerima email dalam 5 menit, periksa folder spam atau hubungi administrator.
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full space-y-3">
                <button
                  onClick={() => window.location.href = '/admin/login'}
                  className="w-full bg-gradient-to-r from-[#F5C542] to-[#D6B25E] text-[#0B0F1A] font-bold py-3.5 rounded-xl hover:scale-[1.02] hover:brightness-110 transition-all shadow-lg"
                >
                  Kembali ke Login
                </button>
                <p className="text-xs text-gray-500">
                  Auto redirect dalam {redirectCountdown} detik...
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070A0F] via-[#0A0D15] to-[#0B0F1A] px-4 py-8 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,197,66,0.08),transparent_60%)]"></div>

      <div className="w-full max-w-[420px] space-y-6 animate-fade-in relative z-10">
        <button
          onClick={() => window.location.href = '/admin/login'}
          className="flex items-center space-x-2 text-gray-400 hover:text-[#F5C542] transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Kembali ke Login</span>
        </button>

        <div className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F5C542] to-[#D6B25E] flex items-center justify-center shadow-xl shadow-[#F5C542]/30 animate-pulse">
              <KeyRound size={36} className="text-[#0B0F1A]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Lupa Password Admin</h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
            Masukkan email admin untuk menerima link reset password
          </p>
        </div>

        <Card className="bg-black/30 backdrop-blur-xl border border-[#F5C542]/15 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-6 p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3 animate-fade-in">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-400 text-sm leading-relaxed">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-white">
                Email Admin
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  autoComplete="email"
                  required
                  className="w-full bg-[#0B0F1A]/70 border border-gray-700/50 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C542]/60 focus:ring-2 focus:ring-[#F5C542]/20 transition-all"
                  placeholder="admin@ctgold.io"
                  aria-label="Email Admin"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#F5C542] transition-colors" size={18} />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#F5C542] to-[#D6B25E] text-[#0B0F1A] font-bold py-4 rounded-xl shadow-lg shadow-[#F5C542]/30 hover:shadow-[#F5C542]/50 transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:scale-100 flex items-center justify-center space-x-2"
              aria-label="Kirim Link Reset Password"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Mail size={20} />
                  <span>Kirim Link Reset Password</span>
                </>
              )}
            </button>
          </form>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-slate-900/30 backdrop-blur-xl border border-blue-500/20">
          <div className="text-center space-y-3 p-4">
            <div className="flex items-center justify-center space-x-2 text-blue-400 mb-2">
              <div className="w-1 h-1 rounded-full bg-blue-400"></div>
              <p className="text-xs font-semibold uppercase tracking-wider">Informasi Keamanan</p>
              <div className="w-1 h-1 rounded-full bg-blue-400"></div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-300 leading-relaxed">Link reset akan dikirim ke email admin terdaftar</p>
              <p className="text-xs text-gray-400 leading-relaxed">Link berlaku <strong className="text-gray-300">1 jam</strong> setelah dikirim</p>
              <p className="text-xs text-gray-400 leading-relaxed">Periksa folder spam jika tidak menerima email</p>
            </div>
          </div>
        </Card>

        <div className="text-center pt-3">
          <p className="text-gray-600 text-xs font-medium">
            © 2024 CTGOLD · Admin System
          </p>
        </div>
      </div>
    </div>
  );
}
