import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AdminMeResponse {
  ok: boolean;
  role?: string;
  status?: string;
  user_id?: string;
  email?: string;
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
          ok: false,
          error: 'Missing authorization header',
          error_code: 'AUTH_ERROR'
        } as AdminMeResponse),
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
      console.error('User auth verification failed:', userError);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Invalid or expired session',
          error_code: 'AUTH_ERROR'
        } as AdminMeResponse),
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
          ok: false,
          error: `Database error: ${adminError.message}`,
          error_code: 'DB_ERROR'
        } as AdminMeResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!adminData) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Akun bukan admin',
          error_code: 'ACCESS_DENIED'
        } as AdminMeResponse),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (adminData.role !== 'admin' && adminData.role !== 'super_admin') {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Role tidak valid untuk akses admin',
          error_code: 'ACCESS_DENIED'
        } as AdminMeResponse),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!adminData.is_active) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Akun admin belum aktif',
          error_code: 'ACCESS_DENIED'
        } as AdminMeResponse),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        role: adminData.role,
        status: adminData.is_active ? 'active' : 'inactive',
        user_id: adminData.user_id,
        email: adminData.email,
        full_name: adminData.full_name || adminData.email,
      } as AdminMeResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Admin verify error:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        error_code: 'SERVER_ERROR'
      } as AdminMeResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});