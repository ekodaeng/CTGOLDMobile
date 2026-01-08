import { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, Eye, EyeOff, Lock, Check, X, KeyRound } from 'lucide-react';
import Card from '../components/Card';
import { supabase } from '@/lib/supabaseClient';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: 'Minimal 8 karakter', test: (pwd) => pwd.length >= 8 },
  { label: 'Huruf besar (A-Z)', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'Huruf kecil (a-z)', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'Angka (0-9)', test: (pwd) => /[0-9]/.test(pwd) },
];

export default function AdminResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (accessToken && type === 'recovery') {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });

          if (!error) {
            setHasValidToken(true);
          } else {
            console.error('Session error:', error);
            setErrors({ submit: 'Token reset tidak valid atau sudah kadaluarsa' });
          }
        } else {
          setErrors({ submit: 'Link reset password tidak valid' });
        }
      } catch (error) {
        console.error('Token check error:', error);
        setErrors({ submit: 'Terjadi kesalahan saat memverifikasi token' });
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkSession();
  }, []);

  const validatePassword = (password: string): boolean => {
    return PASSWORD_REQUIREMENTS.every(req => req.test(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password harus memenuhi semua kriteria keamanan';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    if (!hasValidToken) {
      newErrors.submit = 'Token reset tidak valid';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        setErrors({ submit: error.message || 'Gagal reset password' });
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: admin } = await supabase
          .from('admins')
          .select('user_id, email, is_active')
          .eq('user_id', user.id)
          .maybeSingle();

        if (admin && admin.is_active) {
          setTimeout(() => {
            window.location.href = '/admin/dashboard';
          }, 2000);
          return;
        }
      }

      await supabase.auth.signOut();

      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 2000);
    } catch (err) {
      setErrors({ submit: 'Terjadi kesalahan. Silakan coba lagi.' });
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
  const allRequirementsMet = validatePassword(formData.password);
  const canSubmit = hasValidToken && allRequirementsMet && passwordsMatch && !isCheckingToken;

  if (!hasValidToken && !isCheckingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#070A0F] via-[#0A0D15] to-[#0B0F1A] px-4 py-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,197,66,0.08),transparent_60%)]"></div>

        <div className="w-full max-w-md space-y-6 animate-fade-in relative z-10">
          <Card className="bg-gradient-to-br from-red-500/10 to-slate-900/40 backdrop-blur-xl border border-red-500/30">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="text-red-400" size={32} />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-white">Link Tidak Valid</h2>
                <p className="text-gray-300 text-sm px-4">
                  {errors.submit || 'Link reset password tidak valid atau sudah kadaluarsa.'}
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/admin/forgot-password'}
                className="w-full bg-gradient-to-r from-[#F5C542] to-[#D6B25E] text-[#0B0F1A] font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-[#F5C542]/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
              >
                Minta Link Reset Baru
              </button>
              <button
                onClick={() => window.location.href = '/admin/login'}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Kembali ke Login
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900 px-4 py-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.1),transparent_50%)]"></div>

        <div className="w-full max-w-md space-y-6 animate-fade-in relative z-10">
          <Card className="bg-gradient-to-br from-green-500/10 to-slate-900/40 backdrop-blur-xl border border-green-500/30">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="text-green-400" size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">Password Berhasil Diubah!</h2>
                <p className="text-gray-300 text-sm">
                  Password Anda telah berhasil diperbarui.
                  <br />
                  <span className="text-xs text-gray-400 mt-2 block">
                    Silakan login menggunakan password baru Anda...
                  </span>
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

      <div className="w-full max-w-md space-y-6 animate-fade-in relative z-10">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5C542] to-[#D6B25E] flex items-center justify-center shadow-lg shadow-[#F5C542]/25">
              <Shield size={32} className="text-gray-900" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Set Password Baru</h1>
          <p className="text-gray-400 text-sm">
            Masukkan password baru untuk akun admin Anda
          </p>
        </div>

        <Card className="bg-black/20 backdrop-blur-xl border border-[#D6B25E]/15 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#0B0F1A]/60 border border-gray-700/50 rounded-xl px-4 py-3 pl-11 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C542]/60 focus:ring-1 focus:ring-[#F5C542]/30 transition-all"
                  placeholder="Masukkan password baru"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}

              {formData.password && (
                <div className="mt-3 space-y-2 bg-[#0B0F1A]/40 border border-gray-700/30 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-400 mb-2">Kriteria Password:</p>
                  {PASSWORD_REQUIREMENTS.map((req, idx) => {
                    const isValid = req.test(formData.password);
                    return (
                      <div key={idx} className="flex items-center space-x-2">
                        {isValid ? (
                          <Check size={14} className="text-green-400 flex-shrink-0" />
                        ) : (
                          <X size={14} className="text-gray-500 flex-shrink-0" />
                        )}
                        <span className={`text-xs ${isValid ? 'text-green-400' : 'text-gray-500'}`}>
                          {req.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-[#0B0F1A]/60 border border-gray-700/50 rounded-xl px-4 py-3 pl-11 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#F5C542]/60 focus:ring-1 focus:ring-[#F5C542]/30 transition-all"
                  placeholder="Ulangi password baru"
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
              )}

              {formData.confirmPassword && (
                <div className="flex items-center space-x-2 mt-2">
                  {passwordsMatch ? (
                    <>
                      <Check size={14} className="text-green-400" />
                      <span className="text-xs text-green-400">Password cocok</span>
                    </>
                  ) : (
                    <>
                      <X size={14} className="text-red-400" />
                      <span className="text-xs text-red-400">Password tidak cocok</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="w-full bg-gradient-to-r from-[#F5C542] to-[#D6B25E] text-[#0B0F1A] font-bold py-4 rounded-xl shadow-lg hover:shadow-[#F5C542]/40 transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              {isCheckingToken ? (
                <span>Memverifikasi token...</span>
              ) : isSubmitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Lock size={20} />
                  <span>Simpan Password Baru</span>
                </>
              )}
            </button>
          </form>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-slate-900/40 backdrop-blur-xl border border-blue-500/30">
          <div className="text-sm text-gray-300 space-y-1 text-center">
            <p className="text-blue-400 font-semibold mb-2">Tips Keamanan</p>
            <p className="text-xs">• Gunakan kombinasi huruf besar, kecil, angka, dan simbol</p>
            <p className="text-xs">• Jangan gunakan password yang sama dengan akun lain</p>
            <p className="text-xs">• Minimal 8 karakter untuk keamanan lebih baik</p>
          </div>
        </Card>

        <div className="text-center pt-2">
          <p className="text-gray-600 text-xs">
            © CTGOLD. Admin System.
          </p>
        </div>
      </div>
    </div>
  );
}
