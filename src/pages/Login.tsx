import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, LogIn, AlertCircle, AlertTriangle } from 'lucide-react';
import Card from '../components/Card';
import { supabase, SUPABASE_ENV_STATUS } from '@/lib/supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const { login, member, isAuthenticated } = useAuth();

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070A0F] px-4">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">
          <h1 className="text-xl font-semibold mb-2">Supabase ENV belum benar</h1>
          <p className="text-sm text-red-100/90 mb-4">
            Login tidak bisa berjalan karena SUPABASE_URL / SUPABASE_ANON_KEY tidak terbaca.
          </p>

          <div className="text-xs bg-black/30 rounded-xl p-3 border border-white/10">
            <div>urlPresent: {String(SUPABASE_ENV_STATUS.urlPresent)}</div>
            <div>anonPresent: {String(SUPABASE_ENV_STATUS.anonPresent)}</div>
            <div>urlPreview: {SUPABASE_ENV_STATUS.urlPreview}</div>
          </div>

          <p className="text-xs text-red-100/80 mt-4">
            Pastikan salah satu pasangan ENV ini terisi benar:
            <br/>- VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
            <br/>atau
            <br/>- NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
          </p>
        </div>
      </div>
    );
  }
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && member) {
      if (member.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/member/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, member, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const result = await login(formData.email, formData.password);

    setIsSubmitting(false);

    if (!result.success) {
      setErrors({ submit: result.error || 'Login gagal' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Masuk ke Akun</h1>
          <p className="text-gray-400 text-sm">
            Akses area member CTGOLD
          </p>
        </div>

        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ctgold-gold/50 transition-colors"
                placeholder="email@contoh.com"
              />
              {errors.email && (
                <p className="text-red-400 text-xs">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-white">
                  Password
                </label>
                <Link
                  to="/member/forgot-password"
                  className="group inline-flex items-center gap-1.5 text-xs font-semibold transition-all duration-200"
                  style={{ color: '#D4AF37' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FFD966'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#D4AF37'}
                >
                  <span className="text-sm transition-transform duration-200 group-hover:translate-x-0.5">🔑</span>
                  <span>Lupa Password?</span>
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ctgold-gold/50 transition-colors"
                placeholder="Masukkan password"
              />
              {errors.password && (
                <p className="text-red-400 text-xs">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-gray-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-ctgold-glow transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-gray-900/90 border-yellow-500/30">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="space-y-2 text-sm">
              <p className="text-yellow-400 font-semibold">Status Akun</p>
              <ul className="text-gray-300 space-y-1 text-xs">
                <li><span className="font-semibold">PENDING:</span> Akun menunggu aktivasi admin</li>
                <li><span className="font-semibold">ACTIVE:</span> Akses penuh ke semua konten</li>
                <li><span className="font-semibold">SUSPENDED:</span> Akun ditangguhkan</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Belum punya akun?{' '}
            <Link to="/member/register" className="text-ctgold-gold hover:underline font-semibold">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
