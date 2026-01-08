import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestResetRequest {
  email: string;
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

    const body: RequestResetRequest = await req.json();

    if (!body.email) {
      return new Response(
        JSON.stringify({ error: 'Email wajib diisi' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(
        JSON.stringify({ error: 'Format email tidak valid' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: admin } = await supabaseAdmin
      .from('admins')
      .select('user_id, full_name, email, role, is_active')
      .eq('email', body.email.toLowerCase())
      .maybeSingle();

    if (!admin) {
      console.log(`Admin reset requested for non-admin email: ${body.email}`);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Jika email terdaftar sebagai admin, link reset password sudah dikirim ke email Anda.',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!admin.is_active) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Jika email terdaftar sebagai admin, link reset password sudah dikirim ke email Anda.',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://admin.ctgold.io';
    const resetUrl = `${origin}/admin/reset-password`;

    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
      body.email.toLowerCase(),
      {
        redirectTo: resetUrl,
      }
    );

    if (resetError) {
      console.error('Reset password error:', resetError);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Jika email terdaftar sebagai admin, link reset password sudah dikirim ke email Anda.',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('='.repeat(80));
    console.log('ADMIN RESET PASSWORD REQUEST');
    console.log('='.repeat(80));
    console.log(`Email: ${body.email}`);
    console.log(`Admin: ${admin.full_name}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Redirect URL: ${resetUrl}`);
    console.log('='.repeat(80));

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Link reset password sudah dikirim ke email Anda.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Admin request reset error:', error);
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan server' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});