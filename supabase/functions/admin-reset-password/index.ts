import { createClient } from 'npm:@supabase/supabase-js@2';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ConfirmResetRequest {
  token: string;
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: ConfirmResetRequest = await req.json();

    if (!body.token || !body.password) {
      return new Response(
        JSON.stringify({ error: 'Token dan password wajib diisi' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (body.password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password minimal 8 karakter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(body.token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const tokenHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const { data: tokenRecord, error: tokenError } = await supabase
      .from('auth_tokens')
      .select('id, member_id, expires_at, used_at')
      .eq('token_hash', tokenHash)
      .eq('type', 'ADMIN_RESET_PASSWORD')
      .maybeSingle();

    if (tokenError || !tokenRecord) {
      return new Response(
        JSON.stringify({ error: 'Link reset tidak valid atau sudah kedaluwarsa' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (tokenRecord.used_at) {
      return new Response(
        JSON.stringify({ error: 'Link reset tidak valid atau sudah kedaluwarsa' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const now = new Date();
    const expiresAt = new Date(tokenRecord.expires_at);
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: 'Link reset tidak valid atau sudah kedaluwarsa' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, email, full_name, role')
      .eq('id', tokenRecord.member_id)
      .maybeSingle();

    if (memberError || !member) {
      return new Response(
        JSON.stringify({ error: 'Admin tidak ditemukan' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (member.role !== 'ADMIN') {
      return new Response(
        JSON.stringify({ error: 'Akses ditolak. Bukan akun admin.' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const newPasswordHash = await bcrypt.hash(body.password);

    const { error: updateError } = await supabase
      .from('members')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', member.id);

    if (updateError) {
      console.error('Password update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Gagal mengubah password. Silakan coba lagi.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    await supabase
      .from('auth_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenRecord.id);

    await supabase.from('member_logs').insert({
      member_id: member.id,
      action: 'ADMIN_RESET_PASSWORD_SUCCESS',
      metadata: {
        email: member.email,
        reset_at: new Date().toISOString(),
        ip: req.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Password admin berhasil diubah. Silakan login dengan password baru.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Admin confirm reset error:', error);
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan server' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});