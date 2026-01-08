import { verifySession, extractBearerToken } from './session.ts';
import { corsHeaders, handleCorsOptions } from './cors.ts';

interface SessionResponse {
  ok: boolean;
  email?: string;
  role?: 'admin' | 'super_admin';
  user_id?: string;
  error?: string;
  error_code?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const token = extractBearerToken(authHeader);

    if (!token) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'No authorization token found',
          error_code: 'NO_TOKEN'
        } as SessionResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const payload = await verifySession(token);

    if (!payload) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Invalid or expired token',
          error_code: 'INVALID_TOKEN'
        } as SessionResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        email: payload.email,
        role: payload.role,
        user_id: payload.user_id,
      } as SessionResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Session verification error:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        error_code: 'SERVER_ERROR'
      } as SessionResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});