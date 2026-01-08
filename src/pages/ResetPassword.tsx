import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle, Check, X, KeyRound } from 'lucide-react';
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

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

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
            setTokenValid(true);
          } else {
            setTokenValid(false);
            setMessage({ type: 'error', text: 'Link reset tidak valid atau sudah kedaluwarsa.' });
          }
        } else {
          setTokenValid(false);
          setMessage({ type: 'error', text: 'Link reset password tidak valid.' });
        }
      } catch (error) {
        setTokenValid(false);
        setMessage({ type: 'error', text: 'Terjadi kesalahan saat memverifikasi link.' });
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setTokenValid(true);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const validatePassword = (password: string): boolean => {
    return PASSWORD_REQUIREMENTS.every(req => req.test(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Semua field wajib diisi' });
      return;
    }

    if (!validatePassword(newPassword)) {
      setMessage({ type: 'error', text: 'Password harus memenuhi semua kriteria keamanan' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Password tidak sama' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setMessage({
          type: 'error',
          text: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
        });
      } else {
        setPasswordResetSuccess(true);
        setMessage({
          type: 'success',
          text: 'Password berhasil diubah. Silakan login dengan password baru.',
        });

        setTimeout(() => {
          window.location.href = '/member/login';
        }, 2000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage({
        type: 'error',
        text: 'Terjadi kesalahan koneksi. Silakan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    window.location.href = '/member/login';
  };

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const allRequirementsMet = validatePassword(newPassword);
  const canSubmit = tokenValid && allRequirementsMet && passwordsMatch;

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 py-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.08),transparent_60%)]"></div>

        <div className="w-full max-w-md space-y-6 animate-fade-in relative z-10">
          <div className="bg-gradient-to-br from-red-500/10 to-gray-900/90 rounded-2xl shadow-2xl border border-red-500/30 p-8 text-center backdrop-blur-xl">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Link Tidak Valid</h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-8">
              {message?.text || 'Link reset password tidak valid atau sudah kedaluwarsa.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => (window.location.href = '/member/forgot-password')}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-gray-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-[#D4AF37]/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
              >
                Minta Link Reset Baru
              </button>
              <button
                onClick={() => (window.location.href = '/member/login')}
                className="w-full text-gray-400 hover:text-white text-sm transition-colors py-2"
              >
                Kembali ke Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ctgold-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 py-8 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.08),transparent_60%)]"></div>

      <div className="w-full max-w-md space-y-6 animate-fade-in relative z-10">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8941E] flex items-center justify-center shadow-lg shadow-[#D4AF37]/25">
              <Lock size={28} className="text-gray-900" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Buat Password Baru</h1>
          <p className="text-gray-400 text-sm">
            Masukkan password baru untuk akun Anda
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/90 rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden backdrop-blur-xl">
          <div className="p-6">
            {!passwordResetSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 pl-11 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                      placeholder="Masukkan password baru"
                      required
                      disabled={loading}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="mt-3 space-y-2 bg-gray-800/30 border border-gray-700/30 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-400 mb-2">Kriteria Password:</p>
                      {PASSWORD_REQUIREMENTS.map((req, idx) => {
                        const isValid = req.test(newPassword);
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
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 pl-11 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/30 transition-all"
                      placeholder="Ulangi password baru"
                      required
                      disabled={loading}
                    />
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {confirmPassword && (
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

                {message && (
                  <div
                    className={`p-4 rounded-xl border flex items-start space-x-3 ${
                      message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <CheckCircle2 className="flex-shrink-0 text-green-400 mt-0.5" size={18} />
                    ) : (
                      <AlertCircle className="flex-shrink-0 text-red-400 mt-0.5" size={18} />
                    )}
                    <p className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {message.text}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-gray-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-[#D4AF37]/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <>
                      <Lock size={20} />
                      <span>Simpan Password Baru</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">Password Berhasil Diubah!</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
                  Password Anda telah berhasil diperbarui.
                  <br />
                  <span className="text-xs text-gray-400 mt-2 block">
                    Silakan login menggunakan password baru Anda...
                  </span>
                </p>

                <button
                  onClick={handleGoToLogin}
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8941E] text-gray-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-[#D4AF37]/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
                >
                  Ke Halaman Login
                </button>
              </div>
            )}
          </div>

          {!passwordResetSuccess && (
            <div className="bg-blue-500/10 border-t border-blue-500/20 p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-blue-400 leading-relaxed">
                  <span className="font-semibold">Tips Password Aman:</span> Gunakan kombinasi huruf besar, huruf kecil, angka untuk password yang lebih kuat.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
