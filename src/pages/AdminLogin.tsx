import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Shield, AlertCircle, AlertTriangle, Eye, EyeOff, Mail, Lock, Key } from 'lucide-react';
import Card from '../components/Card';
import { supabase, isSupabaseConfigured, SUPABASE_ENV_STATUS, getSessionSafe } from '@/lib/supabaseClient';
import { setAdminSession, getSessionDuration } from '@/lib/admin-session';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const navigate = useNavigate();
  const hasCheckedSession = useRef(false);
  const isRedirecting = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<{type: 'info' | 'warning'; message: string} | null>(null);
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    if (hasCheckedSession.current || isRedirecting.current) {
      return;
    }

    hasCheckedSession.current = true;
    document.title = 'CTGOLD Admin Panel';

    (async () => {
      console.log('[ADMIN LOGIN] Checking existing session...');
      const { session } = await getSessionSafe();

      if (session && !isRedirecting.current) {
        console.log('[ADMIN LOGIN] Session exists, ensuring localStorage sync');

        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const rememberMe = false;
          const sessionDuration = getSessionDuration(rememberMe);
          const expiresAt = Date.now() + sessionDuration;

          setAdminSession({
            session: session.access_token,
            email: data.user.email || '',
            role: 'ADMIN',
            expires_at: expiresAt,
            full_name: data.user.user_metadata?.full_name,
            id: data.user.id,
          }, rememberMe);

          console.log('[ADMIN LOGIN] Session synced to storage');
        }

        console.log('[ADMIN LOGIN] Redirecting to dashboard');
        isRedirecting.current = true;
        const urlParams = new URLSearchParams(window.location.search);
        const next = urlParams.get('next') || '/admin/dashboard';
        window.location.replace(next);
        return;
      }

      console.log('[ADMIN LOGIN] No session found, showing login form');
    })();

    if (!isSupabaseConfigured) {
      const errorDetails = [
        'Supabase ENV belum dikonfigurasi!',
        '',
        `URL Present: ${SUPABASE_ENV_STATUS.urlPresent ? '✓' : '✗'}`,
        `URL Value: ${SUPABASE_ENV_STATUS.urlPreview}`,
        '',
        `Anon Key Present: ${SUPABASE_ENV_STATUS.anonPresent ? '✓' : '✗'}`,
        `Anon Key Value: ${SUPABASE_ENV_STATUS.anonPreview}`,
        '',
        'Periksa file .env dan pastikan berisi:',
        '- VITE_SUPABASE_URL=https://xxx.supabase.co',
        '- VITE_SUPABASE_ANON_KEY=eyJhbG...',
        '',
        'Kemudian restart dev server (npm run dev)',
      ].join('\n');

      setConfigError(errorDetails);
      console.error('[ADMIN LOGIN] Supabase ENV NOT CONFIGURED');
    }

    const urlParams = new URLSearchParams(window.location.search);
    const reason = urlParams.get('reason');

    const reasonMessages: Record<string, { type: 'info' | 'warning'; message: string }> = {
      session_expired: {
        type: 'info',
        message: 'Sesi login berakhir, silakan login kembali.'
      },
      logged_out: {
        type: 'info',
        message: 'Anda telah logout. Silakan login kembali untuk mengakses dashboard.'
      }
    };

    if (reason && reasonMessages[reason]) {
      setAuthMessage(reasonMessages[reason]);
      window.history.replaceState({}, '', '/admin/login');
    }
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (configError) {
      setErrors({ submit: configError });
      return;
    }

    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    console.log('[ADMIN LOGIN] Starting login process...');

    const TIMEOUT_MS = 12000;
    let timeoutId: NodeJS.Timeout;

    try {
      const loginPromise = supabase.auth.signInWithPassword({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('TIMEOUT'));
        }, TIMEOUT_MS);
      });

      const { data, error } = await Promise.race([
        loginPromise,
        timeoutPromise,
      ]) as any;

      clearTimeout(timeoutId!);

      if (error) {
        console.error('[ADMIN LOGIN] Error:', error.message);
        let errorMessage = 'Login gagal';

        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Email atau password salah. Silakan coba lagi atau gunakan fitur "Lupa password".';
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Email belum diverifikasi. Cek inbox email Anda.';
        } else if (error.message?.includes('Too many requests')) {
          errorMessage = 'Terlalu banyak percobaan login. Tunggu beberapa menit lalu coba lagi.';
        } else {
          errorMessage = error.message || 'Terjadi kesalahan. Silakan coba lagi.';
        }

        setErrors({ submit: errorMessage });
        setIsLoading(false);
        return;
      }

      console.log('[ADMIN LOGIN] Success, user:', data.user?.email);
      console.log('[ADMIN LOGIN] Session exists:', !!data.session);

      const { session } = await getSessionSafe();
      if (!session) {
        console.error('[ADMIN LOGIN] Session not found after login');
        setErrors({ submit: 'Session tidak ditemukan setelah login. Silakan coba lagi.' });
        setIsLoading(false);
        return;
      }

      const rememberMe = false;
      const sessionDuration = getSessionDuration(rememberMe);
      const expiresAt = Date.now() + sessionDuration;

      setAdminSession({
        session: session.access_token,
        email: data.user.email || '',
        role: 'ADMIN',
        expires_at: expiresAt,
        full_name: data.user.user_metadata?.full_name,
        id: data.user.id,
      }, rememberMe);

      console.log('[ADMIN LOGIN] Session saved to storage');
      console.log('[ADMIN LOGIN] Redirecting to dashboard...');
      isRedirecting.current = true;
      const urlParams = new URLSearchParams(window.location.search);
      const next = urlParams.get('next') || '/admin/dashboard';
      window.location.replace(next);

    } catch (error: any) {
      console.error('[ADMIN LOGIN] Exception:', error);
      let errorMessage = 'Terjadi kesalahan saat login';

      if (error?.message === 'TIMEOUT') {
        errorMessage = 'Login timeout (12 detik). Periksa koneksi internet Anda atau coba lagi.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setErrors({ submit: errorMessage });
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E1A] via-[#0D1117] to-[#070A0F] px-4 py-6 sm:py-8 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,197,66,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(212,175,55,0.08),transparent_60%)]"></div>
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#F5C542]/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#F5C542]/20 to-transparent"></div>

      <div className="absolute top-20 left-10 w-32 h-32 bg-[#F5C542]/5 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#D6B25E]/5 rounded-full blur-3xl opacity-60"></div>

      <div className="w-full max-w-[420px] space-y-5 sm:space-y-6 animate-fade-in relative z-10">
        <button
          onClick={() => window.location.href = '/'}
          className="flex items-center space-x-2 text-gray-500 hover:text-[#F5C542] transition-colors duration-200 mb-2"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Kembali ke CTGOLD</span>
        </button>

        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center mb-1 sm:mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F5C542] to-[#D6B25E] rounded-[20px] blur-xl opacity-30"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[18px] sm:rounded-[20px] bg-gradient-to-br from-[#F5C542] to-[#D6B25E] flex items-center justify-center shadow-2xl">
                <Shield size={36} className="text-[#0B0F1A] sm:w-10 sm:h-10" strokeWidth={2.5} />
              </div>
            </div>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent tracking-tight">
              CTGOLD Admin
            </h1>
            <p className="text-gray-400 text-sm">
              Sign in to manage the admin dashboard
            </p>
          </div>
        </div>

        <Card className="bg-black/40 backdrop-blur-2xl border border-[#D6B25E]/30 shadow-2xl shadow-[#F5C542]/5 rounded-[20px] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F5C542]/5 via-transparent to-[#D6B25E]/5"></div>
          <div className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {authMessage && (
              <div className={`${authMessage.type === 'info' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-amber-500/10 border-amber-500/30'} border rounded-xl p-4`}>
                <div className="flex items-start space-x-3">
                  <AlertCircle className={authMessage.type === 'info' ? 'text-blue-400' : 'text-amber-400'} size={20} />
                  <p className={`${authMessage.type === 'info' ? 'text-blue-400' : 'text-amber-400'} text-sm font-medium`}>
                    {authMessage.message}
                  </p>
                </div>
              </div>
            )}

            {configError && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-yellow-400 text-sm font-semibold mb-2">Konfigurasi ENV Bermasalah</p>
                    <pre className="text-yellow-300/90 text-xs font-mono whitespace-pre-wrap leading-relaxed bg-yellow-900/20 p-3 rounded">
                      {configError}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="flex items-start space-x-3">
                  <div className="bg-red-500/20 p-2 rounded-lg flex-shrink-0">
                    <AlertCircle className="text-red-400" size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-red-400 text-sm font-semibold mb-1">Login Gagal</p>
                    <p className="text-red-300/90 text-sm leading-relaxed">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-blue-400 text-sm font-medium">Memproses login...</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Email Admin
              </label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-[#0B0F1A]/70 border rounded-xl pl-12 pr-4 py-3 sm:py-3.5 text-white placeholder-gray-500 focus:outline-none transition-all text-sm sm:text-base ${
                    errors.email
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-gray-700/50 hover:border-gray-600/50 focus:border-[#F5C542]/70 focus:ring-2 focus:ring-[#F5C542]/20 focus:bg-[#0B0F1A]/90'
                  }`}
                  placeholder="admin@ctgold.io"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center space-x-1">
                  <AlertCircle size={12} />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-white">
                Password
              </label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-500 group-hover:text-gray-400'}`}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-[#0B0F1A]/70 border rounded-xl pl-12 pr-12 py-3 sm:py-3.5 text-white placeholder-gray-500 focus:outline-none transition-all text-sm sm:text-base ${
                    errors.password
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border-gray-700/50 hover:border-gray-600/50 focus:border-[#F5C542]/70 focus:ring-2 focus:ring-[#F5C542]/20 focus:bg-[#0B0F1A]/90'
                  }`}
                  placeholder="••••••••"
                  minLength={8}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#F5C542] transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center space-x-1">
                  <AlertCircle size={12} />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <a
                href="/admin/forgot-password"
                className="flex items-center space-x-1 text-xs text-[#F5C542] hover:text-[#E8B73A] transition-all duration-200 group"
              >
                <Key size={14} className="group-hover:scale-110 transition-transform" />
                <span className="group-hover:underline">Lupa password?</span>
              </a>
            </div>

            <div className="space-y-3 pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="group w-full bg-gradient-to-r from-[#F5C542] via-[#E8B73A] to-[#D6B25E] text-[#0B0F1A] font-bold py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-[#F5C542]/50 transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:brightness-100 flex items-center justify-center space-x-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                {isLoading ? (
                  <div className="flex items-center space-x-2 relative z-10">
                    <div className="w-5 h-5 border-3 border-[#0B0F1A] border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses login...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 relative z-10">
                    <Shield size={20} strokeWidth={2.5} />
                    <span>Masuk ke Admin Panel</span>
                  </div>
                )}
              </button>

              <p className="text-center text-xs text-gray-500">
                Akses terbatas untuk admin terverifikasi
              </p>
            </div>
          </form>
          </div>
        </Card>

        <Card className="bg-amber-500/10 backdrop-blur-xl border border-amber-500/20 rounded-[16px] shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="bg-amber-500/20 p-2 rounded-lg flex-shrink-0">
              <AlertTriangle className="text-amber-400" size={18} />
            </div>
            <div className="space-y-2 flex-1">
              <p className="text-amber-400 font-bold text-sm">Informasi Keamanan</p>
              <ul className="text-gray-300 space-y-1.5 text-xs leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>Akses terbatas untuk administrator resmi CTGOLD</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>Akun harus diaktifkan oleh super admin</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>Jangan bagikan kredensial login ke pihak manapun</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="text-center pt-2 pb-4 sm:pb-0">
          <p className="text-gray-600 text-xs">
            © 2026 CTGOLD Admin System
          </p>
        </div>
      </div>
    </div>
  );
}
