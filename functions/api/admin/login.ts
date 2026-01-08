interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ErrorResponse {
  ok: false;
  error: {
    type: string;
    code: string;
    message: string;
    detail?: string;
  };
}

interface SuccessResponse {
  ok: true;
  redirectTo: string;
  session: {
    access_token: string;
    refresh_token: string;
  };
  admin: {
    user_id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
    ),
  ]);
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  console.log('API_LOGIN_HIT - POST request received');

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const supabaseUrl = context.env.SUPABASE_URL;
    const supabaseKey = context.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('ENV_MISSING:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            type: 'UNKNOWN_ERROR',
            code: 'ENV_MISSING',
            message: 'Supabase env missing',
            detail: 'Set SUPABASE_URL & SUPABASE_ANON_KEY in Cloudflare Pages env',
          },
        } as ErrorResponse),
        { status: 500, headers }
      );
    }

    console.log('ENV validated:', { url: supabaseUrl.substring(0, 30) });

    const body = await context.request.json() as LoginRequest;
    const { email, password } = body;

    if (!email || !password) {
      console.log('Validation failed: missing fields');
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            type: 'validation_error',
            code: 'MISSING_FIELDS',
            message: 'Email dan password harus diisi',
          },
        } as ErrorResponse),
        { status: 400, headers }
      );
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      console.log('Validation failed: invalid types');
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            type: 'validation_error',
            code: 'INVALID_TYPE',
            message: 'Email dan password harus berupa string',
          },
        } as ErrorResponse),
        { status: 400, headers }
      );
    }

    console.log('Attempting auth for:', email.toLowerCase().trim());

    let authResponse;
    try {
      authResponse = await withTimeout(
        fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
          },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            password: password,
          }),
        }),
        4000
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'TIMEOUT') {
        console.error('Supabase auth timeout');
        return new Response(
          JSON.stringify({
            ok: false,
            error: {
              type: 'TIMEOUT_ERROR',
              code: 'SUPABASE_TIMEOUT',
              message: 'Supabase timeout',
              detail: 'Authentication request took too long',
            },
          } as ErrorResponse),
          { status: 504, headers }
        );
      }
      throw error;
    }

    if (!authResponse.ok) {
      let errorMessage = 'Email atau password salah';
      try {
        const errorData = await authResponse.json();
        console.log('Auth failed:', errorData.error_description);
        if (errorData.error_description?.includes('Invalid login credentials')) {
          errorMessage = 'Email atau password salah';
        } else if (errorData.error_description?.includes('Email not confirmed')) {
          errorMessage = 'Email belum diverifikasi';
        }
      } catch (e) {
        console.error('Failed to parse auth error:', e);
      }

      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            type: 'authentication_error',
            code: 'AUTH_ERROR',
            message: errorMessage,
          },
        } as ErrorResponse),
        { status: 401, headers }
      );
    }

    const authData = await authResponse.json();
    console.log('Auth successful, user_id:', authData.user?.id);

    if (!authData.user || !authData.access_token) {
      console.error('Auth response missing user or token');
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            type: 'authentication_error',
            code: 'AUTH_ERROR',
            message: 'Login gagal, silakan coba lagi',
          },
        } as ErrorResponse),
        { status: 401, headers }
      );
    }

    console.log('Fetching admin record for user:', authData.user.id);

    let adminResponse;
    try {
      adminResponse = await withTimeout(
        fetch(
          `${supabaseUrl}/rest/v1/admins?user_id=eq.${authData.user.id}&select=user_id,email,role,is_active,full_name`,
          {
            headers: {
              'apikey': supabaseKey,
              'Content-Type': 'application/json',
            },
          }
        ),
        4000
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'TIMEOUT') {
        console.error('Admin fetch timeout');
        return new Response(
          JSON.stringify({
            ok: false,
            error: {
              type: 'TIMEOUT_ERROR',
              code: 'SUPABASE_TIMEOUT',
              message: 'Supabase timeout',
              detail: 'Admin verification took too long',
            },
          } as ErrorResponse),
          { status: 504, headers }
        );
      }
      throw error;
    }

    if (!adminResponse.ok) {
      console.error('Admin fetch failed:', adminResponse.status);
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            type: 'authorization_error',
            code: 'DB_ERROR',
            message: 'Gagal memverifikasi akun admin',
          },
        } as ErrorResponse),
        { status: 500, headers }
      );
    }

    const admins = await adminResponse.json();
    console.log('Admin query result:', admins.length, 'records');

    if (!admins || admins.length === 0) {
      console.log('User is not an admin');
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            type: 'authorization_error',
            code: 'ACCESS_DENIED',
            message: 'Akun bukan admin',
          },
        } as ErrorResponse),
        { status: 403, headers }
      );
    }

    const admin = admins[0];
    console.log('Admin found:', { role: admin.role, active: admin.is_active });

    if (admin.role !== 'admin' && admin.role !== 'super_admin') {
      console.log('Invalid role:', admin.role);
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            type: 'authorization_error',
            code: 'ACCESS_DENIED',
            message: 'Role tidak valid untuk akses admin',
          },
        } as ErrorResponse),
        { status: 403, headers }
      );
    }

    if (!admin.is_active) {
      console.log('Admin account not active');
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            type: 'authorization_error',
            code: 'ACCESS_DENIED',
            message: 'Akun admin belum aktif',
          },
        } as ErrorResponse),
        { status: 403, headers }
      );
    }

    console.log('Login successful for:', admin.email);

    return new Response(
      JSON.stringify({
        ok: true,
        redirectTo: '/admin/members/pending',
        session: {
          access_token: authData.access_token,
          refresh_token: authData.refresh_token,
        },
        admin: {
          user_id: admin.user_id,
          email: admin.email,
          full_name: admin.full_name || admin.email,
          role: admin.role,
        },
      } as SuccessResponse),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Unexpected error in login handler:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: {
          type: 'server_error',
          code: 'INTERNAL_ERROR',
          message: 'Terjadi kesalahan pada server',
          detail: error instanceof Error ? error.message : 'Unknown error',
        },
      } as ErrorResponse),
      { status: 500, headers }
    );
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  console.log('API_LOGIN_HIT - OPTIONS request received');
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  console.log('API_LOGIN_HIT - Method:', context.request.method);

  if (context.request.method === 'POST') {
    return onRequestPost(context);
  }

  if (context.request.method === 'OPTIONS') {
    return onRequestOptions(context);
  }

  console.log('Method not allowed:', context.request.method);
  return new Response(
    JSON.stringify({
      ok: false,
      error: {
        type: 'method_error',
        code: 'METHOD_NOT_ALLOWED',
        message: 'Hanya method POST yang diperbolehkan',
      },
    } as ErrorResponse),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'POST, OPTIONS',
      },
    }
  );
};
