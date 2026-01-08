interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
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
  role: string;
  status: string;
  email: string;
  fullName: string;
  userId: string;
}

function getCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

function getAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const cookieHeader = request.headers.get('Cookie');
  const sbAccessToken = getCookie(cookieHeader, 'sb-access-token');
  if (sbAccessToken) {
    return sbAccessToken;
  }

  return getCookie(cookieHeader, 'admin_session');
}

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
    ),
  ]);
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  console.log('API_ME_HIT - GET request received');

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const token = getAuthToken(context.request);

    if (!token) {
      console.log('No session token found');
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            type: 'authentication_error',
            code: 'NO_SESSION',
            message: 'Tidak ada sesi aktif',
          },
        } as ErrorResponse),
        { status: 401, headers }
      );
    }

    console.log('Token found, length:', token.length);

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

    console.log('ENV validated, verifying user session');

    let userResponse;
    try {
      userResponse = await withTimeout(
        fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${token}`,
          },
        }),
        4000
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'TIMEOUT') {
        console.error('User verification timeout');
        return new Response(
          JSON.stringify({
            ok: false,
            error: {
              type: 'TIMEOUT_ERROR',
              code: 'SUPABASE_TIMEOUT',
              message: 'Supabase timeout',
              detail: 'User verification took too long',
            },
          } as ErrorResponse),
          { status: 504, headers }
        );
      }
      throw error;
    }

    if (!userResponse.ok) {
      console.log('User session invalid, status:', userResponse.status);
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            type: 'authentication_error',
            code: 'SESSION_INVALID',
            message: 'Sesi tidak valid atau sudah kadaluarsa',
          },
        } as ErrorResponse),
        { status: 401, headers }
      );
    }

    const user = await userResponse.json();
    console.log('User verified, id:', user.id);

    if (!user || !user.id) {
      console.error('User response missing id');
      return new Response(
        JSON.stringify({
          ok: false,
          error: {
            type: 'authentication_error',
            code: 'SESSION_INVALID',
            message: 'Sesi tidak valid',
          },
        } as ErrorResponse),
        { status: 401, headers }
      );
    }

    console.log('Fetching admin record for user:', user.id);

    let adminResponse;
    try {
      adminResponse = await withTimeout(
        fetch(
          `${supabaseUrl}/rest/v1/admins?user_id=eq.${user.id}&select=*`,
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
            code: 'NOT_ADMIN',
            message: 'Pengguna bukan admin',
          },
        } as ErrorResponse),
        { status: 403, headers }
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
            code: 'NOT_ADMIN',
            message: 'Pengguna bukan admin',
          },
        } as ErrorResponse),
        { status: 403, headers }
      );
    }

    const admin = admins[0];
    console.log('Admin found:', { role: admin.role, status: admin.status });

    return new Response(
      JSON.stringify({
        ok: true,
        role: admin.role,
        status: admin.status || 'active',
        email: admin.email,
        fullName: admin.full_name,
        userId: admin.user_id,
      } as SuccessResponse),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Unexpected error in me handler:', error);
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
  console.log('API_ME_HIT - OPTIONS request received');
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};

export const onRequest: PagesFunction<Env> = async (context) => {
  console.log('API_ME_HIT - Method:', context.request.method);

  if (context.request.method === 'GET') {
    return onRequestGet(context);
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
        message: 'Hanya method GET yang diperbolehkan',
      },
    } as ErrorResponse),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'GET, OPTIONS',
      },
    }
  );
};
