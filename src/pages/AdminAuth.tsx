import { useState, useEffect } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, User } from 'lucide-react';
import { adminLogin } from '../lib/admin/functions';
import { supabase } from '@/lib/supabaseClient';
import { getAdminWhitelist } from '../lib/admin/whitelist';

export default function AdminAuth() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    document.title = 'CTGOLD Admin Portal';

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email) {
        const whitelist = getAdminWhitelist();
        if (whitelist.includes(session.user.email.toLowerCase())) {
          window.location.href = '/admin/dashboard';
        }
      }
    };

    checkSession();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const result = await adminLogin(loginData.email, loginData.password);

    if (!result.ok) {
      setErrors({ submit: result.error || 'Login failed' });
      setIsSubmitting(false);
      return;
    }

    window.location.href = '/admin/dashboard';
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!registerData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (registerData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    if (!registerData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      newErrors.email = 'Please enter a valid email';
    } else {
      const normalizedEmail = registerData.email.trim().toLowerCase();
      const whitelistedEmails = getAdminWhitelist();

      if (whitelistedEmails.length === 0) {
        newErrors.email = 'Admin whitelist not configured. Please contact system administrator.';
      } else if (!whitelistedEmails.includes(normalizedEmail)) {
        newErrors.email = 'Email ini tidak terdaftar sebagai admin. Hubungi super admin untuk mendapatkan akses.';
      }
    }

    if (!registerData.password) {
      newErrors.password = 'Password is required';
    } else if (registerData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const normalizedEmail = registerData.email.trim().toLowerCase();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: registerData.password,
        options: {
          data: {
            full_name: registerData.fullName.trim(),
          }
        }
      });

      if (authError) {
        setErrors({ submit: authError.message || 'Registration failed' });
        setIsSubmitting(false);
        return;
      }

      if (!authData.user) {
        setErrors({ submit: 'Registration failed' });
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('Akun berhasil dibuat! Silakan login untuk melanjutkan.');
      setRegisterData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      setIsSubmitting(false);

      setTimeout(() => {
        setActiveTab('login');
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
      setIsSubmitting(false);
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.submit) {
      setErrors(prev => ({ ...prev, submit: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070A0F] via-[#0A0D15] to-[#0B0F1A] px-4 py-8 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.06),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(212,175,55,0.03),transparent_50%)]"></div>

      <div className="w-full max-w-[480px] space-y-6 animate-fade-in relative z-10">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-[#F5C542] to-[#D6B25E] flex items-center justify-center shadow-xl shadow-[#F5C542]/25">
              <Shield size={40} className="text-[#0B0F1A]" strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">CTGOLD Admin</h1>
            <p className="text-gray-400 text-sm">
              Masuk atau daftar untuk mengelola admin dashboard
            </p>
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur-xl border border-[#D6B25E]/15 shadow-2xl shadow-black/40 rounded-[20px] overflow-hidden">
          <div className="flex border-b border-[#D6B25E]/10">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrors({});
                setSuccessMessage('');
              }}
              className={`flex-1 py-4 text-sm font-semibold transition-all duration-200 ${
                activeTab === 'login'
                  ? 'text-[#F5C542] bg-[#F5C542]/5 border-b-2 border-[#F5C542]'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrors({});
                setSuccessMessage('');
              }}
              className={`flex-1 py-4 text-sm font-semibold transition-all duration-200 ${
                activeTab === 'register'
                  ? 'text-[#F5C542] bg-[#F5C542]/5 border-b-2 border-[#F5C542]'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              Register
            </button>
          </div>

          <div className="p-6">
            {successMessage && (
              <div className="mb-5 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start space-x-3">
                <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-green-400 text-sm">{successMessage}</p>
                </div>
              </div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                {errors.submit && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
                    <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <p className="text-red-400 text-sm font-medium">{errors.submit}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">Email Admin</label>
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-gray-500'}`}>
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className={`w-full bg-[#0B0F1A]/60 border rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none transition-all ${
                        errors.email
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-gray-700/50 focus:border-[#F5C542]/60 focus:ring-1 focus:ring-[#F5C542]/30'
                      }`}
                      placeholder="email@ctgold.io"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-xs flex items-center space-x-1">
                      <AlertCircle size={12} />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">Password</label>
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-500'}`}>
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className={`w-full bg-[#0B0F1A]/60 border rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none transition-all ${
                        errors.password
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-gray-700/50 focus:border-[#F5C542]/60 focus:ring-1 focus:ring-[#F5C542]/30'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#F5C542] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-xs flex items-center space-x-1">
                      <AlertCircle size={12} />
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={loginData.rememberMe}
                      onChange={handleLoginChange}
                      className="w-4 h-4 rounded border-gray-700/50 bg-[#0B0F1A]/60 text-[#F5C542] focus:ring-1 focus:ring-[#F5C542]/30 focus:ring-offset-0 transition-all cursor-pointer"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
                  </label>

                  <a
                    href="/admin/forgot-password"
                    className="text-xs text-[#F5C542] hover:text-[#D6B25E] hover:underline transition-all duration-200"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#F5C542] to-[#D6B25E] text-[#0B0F1A] font-bold py-4 rounded-xl shadow-lg hover:shadow-[#F5C542]/40 transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:brightness-100 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-3 border-[#0B0F1A] border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <Shield size={20} strokeWidth={2.5} />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                {errors.submit && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
                    <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <p className="text-red-400 text-sm font-medium">{errors.submit}</p>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start space-x-3">
                  <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
                  <div className="flex-1">
                    <p className="text-yellow-400 text-xs">
                      Pendaftaran admin dibatasi. Hanya email yang terdaftar dalam whitelist yang dapat mendaftar.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">Full Name</label>
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.fullName ? 'text-red-400' : 'text-gray-500'}`}>
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={registerData.fullName}
                      onChange={handleRegisterChange}
                      className={`w-full bg-[#0B0F1A]/60 border rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none transition-all ${
                        errors.fullName
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-gray-700/50 focus:border-[#F5C542]/60 focus:ring-1 focus:ring-[#F5C542]/30'
                      }`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-400 text-xs flex items-center space-x-1">
                      <AlertCircle size={12} />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">Email</label>
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-gray-500'}`}>
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      className={`w-full bg-[#0B0F1A]/60 border rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:outline-none transition-all ${
                        errors.email
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-gray-700/50 focus:border-[#F5C542]/60 focus:ring-1 focus:ring-[#F5C542]/30'
                      }`}
                      placeholder="email@ctgold.io"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-xs flex items-center space-x-1">
                      <AlertCircle size={12} />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">Password</label>
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-500'}`}>
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      className={`w-full bg-[#0B0F1A]/60 border rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none transition-all ${
                        errors.password
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-gray-700/50 focus:border-[#F5C542]/60 focus:ring-1 focus:ring-[#F5C542]/30'
                      }`}
                      placeholder="Minimal 8 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#F5C542] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-xs flex items-center space-x-1">
                      <AlertCircle size={12} />
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-white">Confirm Password</label>
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.confirmPassword ? 'text-red-400' : 'text-gray-500'}`}>
                      <Lock size={18} />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      className={`w-full bg-[#0B0F1A]/60 border rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-500 focus:outline-none transition-all ${
                        errors.confirmPassword
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-gray-700/50 focus:border-[#F5C542]/60 focus:ring-1 focus:ring-[#F5C542]/30'
                      }`}
                      placeholder="Konfirmasi password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#F5C542] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-xs flex items-center space-x-1">
                      <AlertCircle size={12} />
                      <span>{errors.confirmPassword}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#F5C542] to-[#D6B25E] text-[#0B0F1A] font-bold py-4 rounded-xl shadow-lg hover:shadow-[#F5C542]/40 transition-all duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:brightness-100 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-3 border-[#0B0F1A] border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <>
                      <Shield size={20} strokeWidth={2.5} />
                      <span>Create Admin Account</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-xs">
            © CTGOLD. Admin System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
