import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { apiConfig, getAuthHeaders } from '../lib/api';
import { adminLogin as adminLoginFn, adminSession } from '../lib/admin/functions';

export interface Member {
  id: string;
  member_code: string;
  full_name: string;
  email: string;
  city: string;
  phone?: string;
  telegram_username?: string;
  role: 'MEMBER' | 'ADMIN';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
}

interface AuthContextType {
  member: Member | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password: string, onProgress?: (step: string) => void) => Promise<{ success: boolean; error?: string; errorCode?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string; memberCode?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isActive: boolean;
}

interface RegisterData {
  fullName: string;
  city: string;
  email: string;
  phone?: string;
  telegramUsername?: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const withTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs: number = 30000,
  operationName: string = 'Request'
): Promise<T> => {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`TIMEOUT: ${operationName} melebihi ${timeoutMs / 1000} detik. Periksa koneksi internet Anda.`));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
};

const retryWithBackoff = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (attempt < maxRetries && !error?.message?.includes('Invalid login credentials')) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} setelah ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }

  throw lastError;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          15000,
          'Get session'
        );

        if (session?.user) {
          try {
            const { data: profile } = await withTimeout(
              supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle(),
              15000,
              'Fetch profile'
            );

            if (profile) {
              setMember(profile as Member);
              localStorage.setItem('ctgold_member', JSON.stringify(profile));
            }
          } catch (error) {
            console.error('Profile fetch error during init:', error);
          }
        } else {
          const storedMember = localStorage.getItem('ctgold_member');
          if (storedMember) {
            try {
              setMember(JSON.parse(storedMember));
            } catch (e) {
              localStorage.removeItem('ctgold_member');
            }
          }
        }
      } catch (error) {
        console.error('Session init error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        try {
          if (event === 'SIGNED_OUT') {
            setMember(null);
            localStorage.removeItem('ctgold_member');
          } else if (session?.user) {
            const { data: profile } = await withTimeout(
              supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle(),
              15000,
              'Fetch profile on auth change'
            );

            if (profile) {
              setMember(profile as Member);
              localStorage.setItem('ctgold_member', JSON.stringify(profile));
            }
          }
        } catch (error) {
          console.error('Auth state change error:', error);
        }
      })();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch(
        apiConfig.endpoints.memberRegister(),
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Pendaftaran gagal' };
      }

      return {
        success: true,
        memberCode: result.data?.memberCode
      };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Terjadi kesalahan. Silakan coba lagi.' };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Member login attempt for:', email);

      const { data: authData, error: authError } = await retryWithBackoff(
        async () => {
          return withTimeout(
            supabase.auth.signInWithPassword({ email, password }),
            30000,
            'Login ke Supabase'
          );
        },
        2,
        1500
      );

      if (authError) {
        console.error('Supabase auth error:', authError);
        const errorMsg = authError.message?.includes('Invalid login credentials')
          ? 'Email atau password salah'
          : authError.message || 'Login gagal';
        return { success: false, error: errorMsg };
      }

      if (!authData.user || !authData.session) {
        return { success: false, error: 'Login gagal. Session tidak valid.' };
      }

      console.log('Auth successful, fetching profile...');

      const { data: profile, error: profileError } = await retryWithBackoff(
        async () => {
          return withTimeout(
            supabase
              .from('profiles')
              .select('*')
              .eq('id', authData.user.id)
              .maybeSingle(),
            20000,
            'Ambil data profil'
          );
        },
        2,
        1000
      );

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        await supabase.auth.signOut();
        return { success: false, error: profileError.message || 'Profil tidak ditemukan' };
      }

      if (!profile) {
        await supabase.auth.signOut();
        return { success: false, error: 'Profil tidak ditemukan di database' };
      }

      console.log('Profile fetched:', { role: profile.role, status: profile.status });

      const memberData = profile as Member;
      setMember(memberData);
      localStorage.setItem('ctgold_member', JSON.stringify(memberData));

      console.log('Member login successful');
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);

      if (error?.message?.includes('TIMEOUT')) {
        return {
          success: false,
          error: `${error.message}\n\nSaran:\n- Periksa koneksi internet Anda\n- Coba refresh halaman dan login lagi\n- Jika masalah berlanjut, hubungi support`
        };
      }

      const errorMessage = error?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      return { success: false, error: errorMessage };
    }
  };

  const adminLogin = async (email: string, password: string, onProgress?: (step: string) => void) => {
    try {
      onProgress?.('Step 1: Authenticating admin...');
      console.log('Admin login attempt for:', email);

      const loginResult = await adminLoginFn(email, password);

      if (!loginResult.ok) {
        console.error('Admin login failed:', loginResult.error);
        return {
          success: false,
          error: loginResult.error || 'Login gagal',
          errorCode: loginResult.error_code || 'LOGIN_FAILED'
        };
      }

      if (!loginResult.admin) {
        return {
          success: false,
          error: 'Response tidak valid dari server',
          errorCode: 'INVALID_RESPONSE'
        };
      }

      onProgress?.('Step 2: Admin verified. Setting up session...');
      console.log('Admin verified:', { email: loginResult.admin.email, role: loginResult.admin.role });

      const memberData: Member = {
        id: loginResult.admin.id,
        member_code: '',
        full_name: loginResult.admin.full_name || loginResult.admin.email,
        email: loginResult.admin.email,
        city: '',
        role: 'ADMIN',
        status: 'ACTIVE',
      };

      setMember(memberData);
      localStorage.setItem('ctgold_member', JSON.stringify(memberData));

      onProgress?.('Step 3: Login successful! Redirecting...');
      console.log('Admin login successful');
      return { success: true };
    } catch (error: any) {
      console.error('Admin login error:', error);

      const errorMessage = error?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      return { success: false, error: errorMessage, errorCode: 'UNKNOWN_ERROR' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }

    setMember(null);
    localStorage.removeItem('ctgold_member');
  };

  const value: AuthContextType = {
    member,
    isLoading,
    login,
    adminLogin,
    register,
    logout,
    isAuthenticated: !!member,
    isAdmin: member?.role === 'ADMIN',
    isActive: member?.status === 'ACTIVE',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
