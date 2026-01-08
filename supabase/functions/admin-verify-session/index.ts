import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface VerifyResponse {
  success: boolean;
  user_id?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  full_name?: string;
  error?: string;
  error_code?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing authorization header',
          error_code: 'NO_AUTH_HEADER'
        } as VerifyResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error('User verification error:', userError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid session token',
          error_code: 'INVALID_SESSION'
        } as VerifyResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

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

    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('user_id, email, role, is_active, full_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (adminError) {
      console.error('Admin query error:', adminError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Database error: ${adminError.message}`,
          error_code: 'DB_ERROR'
        } as VerifyResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!adminData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Akun ini bukan admin. Hubungi super admin untuk registrasi.',
          error_code: 'NOT_ADMIN'
        } as VerifyResponse),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!adminData.is_active) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Akun admin menunggu aktivasi dari super admin.',
          error_code: 'ADMIN_INACTIVE'
        } as VerifyResponse),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: adminData.user_id,
        email: adminData.email,
        role: adminData.role,
        is_active: adminData.is_active,
        full_name: adminData.full_name || adminData.email,
      } as VerifyResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Verify session error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        error_code: 'SERVER_ERROR'
      } as VerifyResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});