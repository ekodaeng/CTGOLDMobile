import { createClient } from 'npm:@supabase/supabase-js@2';
import { isAllowedAdmin, determineRole } from './whitelist.ts';
import { signSession } from './session.ts';
import { corsHeaders, handleCorsOptions } from './cors.ts';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  ok: boolean;
  token?: string;
  role?: 'admin' | 'super_admin';
  email?: string;
  user_id?: string;
  error?: string;
  error_code?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const body: LoginRequest = await req.json();

    if (!body.email || !body.password) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Email and password are required',
          error_code: 'VALIDATION_ERROR'
        } as LoginResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const normalizedEmail = body.email.toLowerCase().trim();

    if (!isAllowedAdmin(normalizedEmail)) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Email not authorized for admin access',
          error_code: 'ACCESS_DENIED'
        } as LoginResponse),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email: normalizedEmail,
      password: body.password,
    });

    if (authError || !authData.user) {
      console.error('Auth error:', authError?.message);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Invalid email or password',
          error_code: 'INVALID_CREDENTIALS'
        } as LoginResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const role = determineRole(normalizedEmail);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { error: upsertError } = await supabaseAdmin
      .from('admins')
      .upsert({
        user_id: authData.user.id,
        email: normalizedEmail,
        role: role,
        is_active: true,
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Failed to upsert admin record:', upsertError);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Failed to create admin session',
          error_code: 'DB_ERROR'
        } as LoginResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const sessionToken = await signSession({
      email: normalizedEmail,
      role: role,
      user_id: authData.user.id,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        token: sessionToken,
        role: role,
        email: normalizedEmail,
        user_id: authData.user.id,
      } as LoginResponse),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        error_code: 'SERVER_ERROR'
      } as LoginResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});