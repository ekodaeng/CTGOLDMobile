import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  ok: boolean;
  error?: string;
  error_code?: string;
  redirectTo?: string;
  session?: {
    access_token: string;
    refresh_token: string;
  };
  admin?: {
    user_id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: LoginRequest = await req.json();

    if (!body.email || !body.password) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Email dan password wajib diisi',
          error_code: 'VALIDATION_ERROR'
        } as LoginResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
      email: body.email.toLowerCase().trim(),
      password: body.password,
    });

    if (authError) {
      console.error('Auth error:', authError.message);

      let errorMessage = 'Email atau password salah';
      if (authError.message.includes('Invalid login credentials')) {
        errorMessage = 'Email atau password salah';
      } else if (authError.message.includes('Email not confirmed')) {
        errorMessage = 'Email belum diverifikasi';
      } else if (authError.message.includes('network')) {
        errorMessage = 'Koneksi bermasalah, silakan coba lagi';
      }

      return new Response(
        JSON.stringify({
          ok: false,
          error: errorMessage,
          error_code: 'AUTH_ERROR'
        } as LoginResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!authData.user || !authData.session) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Login gagal, silakan coba lagi',
          error_code: 'AUTH_ERROR'
        } as LoginResponse),
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
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (adminError) {
      console.error('Admin query error:', adminError);
      await supabaseClient.auth.signOut();
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Gagal memverifikasi akun admin',
          error_code: 'DB_ERROR'
        } as LoginResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!adminData) {
      console.log('User is not an admin:', authData.user.email);
      await supabaseClient.auth.signOut();
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Akun bukan admin',
          error_code: 'ACCESS_DENIED'
        } as LoginResponse),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (adminData.role !== 'admin' && adminData.role !== 'super_admin') {
      console.log('Invalid admin role:', adminData.role);
      await supabaseClient.auth.signOut();
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Role tidak valid untuk akses admin',
          error_code: 'ACCESS_DENIED'
        } as LoginResponse),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!adminData.is_active) {
      console.log('Admin account is not active:', adminData.email);
      await supabaseClient.auth.signOut();
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Akun admin belum aktif',
          error_code: 'ACCESS_DENIED'
        } as LoginResponse),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Admin login successful:', {
      email: adminData.email,
      role: adminData.role
    });

    return new Response(
      JSON.stringify({
        ok: true,
        redirectTo: '/admin/members/pending',
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
        },
        admin: {
          user_id: adminData.user_id,
          email: adminData.email,
          full_name: adminData.full_name || adminData.email,
          role: adminData.role,
        }
      } as LoginResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Admin login error:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan server',
        error_code: 'SERVER_ERROR'
      } as LoginResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});