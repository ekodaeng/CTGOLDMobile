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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
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

    const body: LoginRequest = await req.json();

    // Validate required fields
    if (!body.email || !body.password) {
      return new Response(
        JSON.stringify({ error: 'Email dan password wajib diisi' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: body.email.toLowerCase(),
      password: body.password,
    });

    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ error: 'Email atau password salah' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, member_code, full_name, email, city, phone, telegram_username, role, status')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profil tidak ditemukan' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if account is active
    if (profile.status !== 'ACTIVE') {
      let message = 'Akun Anda belum aktif';
      if (profile.status === 'PENDING') {
        message = 'Akun Anda menunggu aktivasi dari admin';
      } else if (profile.status === 'SUSPENDED') {
        message = 'Akun Anda telah ditangguhkan';
      }

      return new Response(
        JSON.stringify({ error: message }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update last login timestamp
    await supabaseAdmin
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', profile.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Login berhasil',
        data: {
          id: profile.id,
          member_code: profile.member_code,
          full_name: profile.full_name,
          email: profile.email,
          city: profile.city,
          phone: profile.phone,
          telegram_username: profile.telegram_username,
          role: profile.role,
          status: profile.status,
        },
        session: {
          access_token: authData.session?.access_token,
          refresh_token: authData.session?.refresh_token,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Terjadi kesalahan server. Silakan coba lagi.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});