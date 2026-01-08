import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import Card from '../components/Card';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    city: '',
    email: '',
    phone: '',
    telegramUsername: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [memberCode, setMemberCode] = useState('');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap wajib diisi';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Kota wajib diisi (min 2 huruf)';
    } else if (formData.city.trim().length < 2) {
      newErrors.city = 'Kota wajib diisi (min 2 huruf)';
    } else if (formData.city.trim().length > 50) {
      newErrors.city = 'Kota maksimal 50 karakter';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak sama';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    const result = await register({
      fullName: formData.fullName,
      city: formData.city,
      email: formData.email,
      phone: formData.phone || undefined,
      telegramUsername: formData.telegramUsername || undefined,
      password: formData.password,
    });

    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setMemberCode(result.memberCode || '');
      setFormData({
        fullName: '',
        city: '',
        email: '',
        phone: '',
        telegramUsername: '',
        password: '',
        confirmPassword: '',
      });
    } else {
      setErrors({ submit: result.error || 'Pendaftaran gagal' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          <Card className="bg-gradient-to-br from-green-500/10 to-gray-900/90 border-green-500/30">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-500/20 p-4 rounded-full">
                  <CheckCircle2 className="text-green-400" size={48} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white">Pendaftaran Berhasil!</h2>
              <div className="space-y-3 text-left">
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Kode Member Anda:</p>
                  <p className="text-xl font-bold text-ctgold-gold">{memberCode}</p>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Akun Anda berhasil dibuat dan sedang menunggu aktivasi dari admin.
                  Anda akan menerima notifikasi setelah akun diaktifkan.
                </p>
              </div>
              <button
                onClick={() => navigate('/member/login')}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-gray-900 font-bold py-3 rounded-xl hover:shadow-ctgold-glow transition-all duration-200"
              >
                Masuk ke Akun
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </button>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Daftar Member CTGOLD</h1>
          <p className="text-gray-400 text-sm">
            Bergabung untuk akses edukasi & laporan transparansi
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
                Nama Lengkap <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ctgold-gold/50 transition-colors"
                placeholder="Masukkan nama lengkap"
              />
              {errors.fullName && (
                <p className="text-red-400 text-xs">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Kota <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ctgold-gold/50 transition-colors"
                placeholder="Contoh: Makassar / Purbalingga"
              />
              {errors.city && (
                <p className="text-red-400 text-xs">{errors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Email <span className="text-red-400">*</span>
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
              <label className="block text-sm font-semibold text-white">
                No. HP <span className="text-gray-500 text-xs">(opsional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ctgold-gold/50 transition-colors"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Username Telegram <span className="text-gray-500 text-xs">(opsional)</span>
              </label>
              <input
                type="text"
                name="telegramUsername"
                value={formData.telegramUsername}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ctgold-gold/50 transition-colors"
                placeholder="@username"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ctgold-gold/50 transition-colors"
                placeholder="Minimal 8 karakter"
              />
              {errors.password && (
                <p className="text-red-400 text-xs">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Konfirmasi Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-ctgold-gold/50 transition-colors"
                placeholder="Ulangi password"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs">{errors.confirmPassword}</p>
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
                  <UserPlus size={20} />
                  <span>Daftar Sekarang</span>
                </>
              )}
            </button>
          </form>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50">
          <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
            <p className="font-semibold text-gray-300">Catatan Penting:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Akun baru berstatus PENDING dan memerlukan aktivasi admin</li>
              <li>Konten member bersifat edukasi & transparansi komunitas</li>
              <li>Bukan layanan investasi, bukan sinyal trading, tidak menjanjikan profit</li>
            </ul>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Sudah punya akun?{' '}
            <a href="/member/login" className="text-ctgold-gold hover:underline font-semibold">
              Masuk di sini
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
