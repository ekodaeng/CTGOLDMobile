import { supabase, isSupabaseConfigured, SUPABASE_ENV_STATUS } from '@/lib/supabaseClient';

interface AdminLoginResponse {
  ok: boolean;
  admin?: {
    id: string;
    email: string;
    role: 'admin' | 'super_admin';
    full_name: string;
  };
  error?: string;
  error_code?: string;
}

interface AdminSessionResponse {
  ok: boolean;
  admin?: {
    id: string;
    email: string;
    role: 'admin' | 'super_admin';
  };
  error?: string;
  error_code?: string;
}

function withTimeout<T>(promise: Promise<T>, ms = 30000, operationName = 'Request'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`TIMEOUT: ${operationName} melebihi ${ms / 1000} detik. Koneksi internet lambat atau Supabase sedang sibuk. Coba lagi.`));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  baseDelay = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  try {
    if (!isSupabaseConfigured) {
      console.error('ENV STATUS:', SUPABASE_ENV_STATUS);
      return {
        ok: false,
        error: `Supabase ENV belum dikonfigurasi!\n\nURL: ${SUPABASE_ENV_STATUS.urlPreview}\nANON_KEY: ${SUPABASE_ENV_STATUS.anonPreview}\n\nPeriksa file .env dan restart dev server.`,
        error_code: "ENV_NOT_CONFIGURED",
      };
    }

    if (!supabase) {
      return {
        ok: false,
        error: "Supabase client tidak tersedia. Periksa konfigurasi ENV.",
        error_code: "CLIENT_NOT_INITIALIZED",
      };
    }

    const { data, error } = await retryWithBackoff(
      async () => {
        const authPromise = supabase.auth.signInWithPassword({
          email,
          password,
        });
        return withTimeout(authPromise, 30000, 'Login ke Supabase Auth');
      },
      2,
      1500
    );

    if (error) {
      return {
        ok: false,
        error: error.message === 'Invalid login credentials'
          ? 'Email atau password salah'
          : error.message,
        error_code: "AUTH_ERROR",
      };
    }

    if (!data.user) {
      return {
        ok: false,
        error: "Login gagal",
        error_code: "NO_USER",
      };
    }

    const { data: adminData, error: adminError } = await retryWithBackoff(
      async () => {
        const adminQueryPromise = supabase
          .from('admins')
          .select('user_id, email, role, is_active, full_name')
          .eq('user_id', data.user.id)
          .maybeSingle();
        return withTimeout(adminQueryPromise, 20000, 'Query admin data');
      },
      2,
      1000
    );

    if (adminError) {
      console.error('Admin check error:', adminError);
      await supabase.auth.signOut();
      return {
        ok: false,
        error: "Gagal memverifikasi admin",
        error_code: "ADMIN_CHECK_ERROR",
      };
    }

    if (!adminData) {
      await supabase.auth.signOut();
      return {
        ok: false,
        error: "Email tidak terdaftar sebagai admin",
        error_code: "NOT_ADMIN",
      };
    }

    if (!adminData.is_active) {
      await supabase.auth.signOut();
      return {
        ok: false,
        error: "Akun admin belum diaktifkan. Hubungi super admin.",
        error_code: "ADMIN_INACTIVE",
      };
    }

    return {
      ok: true,
      admin: {
        id: adminData.user_id,
        email: adminData.email,
        role: adminData.role as 'admin' | 'super_admin',
        full_name: adminData.full_name,
      },
    };
  } catch (error: any) {
    console.error('Admin login error:', error);

    if (error?.message?.includes('TIMEOUT')) {
      return {
        ok: false,
        error: `${error.message}\n\nSaran:\n- Periksa koneksi internet Anda\n- Coba refresh halaman dan login lagi\n- Jika masalah berlanjut, Supabase mungkin sedang maintenance`,
        error_code: "TIMEOUT",
      };
    }

    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      return {
        ok: false,
        error: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
        error_code: "NETWORK_ERROR",
      };
    }

    return {
      ok: false,
      error: error?.message || "Terjadi kesalahan tidak terduga. Coba lagi.",
      error_code: "UNKNOWN_ERROR",
    };
  }
}

async function checkSupabaseHealth(): Promise<{ ok: boolean; message: string }> {
  try {
    const healthCheck = supabase.from('admins').select('count').limit(1);
    await withTimeout(healthCheck, 10000, 'Health check');
    return { ok: true, message: 'Supabase connected' };
  } catch (error: any) {
    return {
      ok: false,
      message: error?.message?.includes('TIMEOUT')
        ? 'Koneksi ke Supabase timeout. Periksa koneksi internet.'
        : 'Tidak dapat terhubung ke Supabase.'
    };
  }
}

export async function adminSession(): Promise<AdminSessionResponse> {
  try {
    const { data: { session }, error } = await withTimeout(
      supabase.auth.getSession(),
      15000,
      'Get session'
    );

    if (error || !session) {
      return {
        ok: false,
        error: "No active session",
        error_code: "NO_SESSION",
      };
    }

    const { data: adminData, error: adminError } = await retryWithBackoff(
      async () => {
        const query = supabase
          .from('admins')
          .select('user_id, email, role, is_active')
          .eq('user_id', session.user.id)
          .maybeSingle();
        return withTimeout(query, 15000, 'Query admin session');
      },
      2,
      1000
    );

    if (adminError) {
      console.error('Admin session check error:', adminError);
      return {
        ok: false,
        error: "Gagal memverifikasi admin",
        error_code: "ADMIN_CHECK_ERROR",
      };
    }

    if (!adminData) {
      await supabase.auth.signOut();
      return {
        ok: false,
        error: "Not authorized as admin",
        error_code: "NOT_ADMIN",
      };
    }

    if (!adminData.is_active) {
      await supabase.auth.signOut();
      return {
        ok: false,
        error: "Admin account inactive",
        error_code: "ADMIN_INACTIVE",
      };
    }

    return {
      ok: true,
      admin: {
        id: adminData.user_id,
        email: adminData.email,
        role: adminData.role as 'admin' | 'super_admin',
      },
    };
  } catch (error: any) {
    console.error('Admin session error:', error);
    return {
      ok: false,
      error: error?.message?.includes('TIMEOUT')
        ? 'Session check timeout. Periksa koneksi internet.'
        : error?.message || "Session check failed",
      error_code: "SESSION_ERROR",
    };
  }
}

export async function adminLogout(): Promise<{ ok: boolean }> {
  try {
    await withTimeout(supabase.auth.signOut(), 10000, 'Logout');
    return { ok: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { ok: true };
  }
}

export { checkSupabaseHealth };
