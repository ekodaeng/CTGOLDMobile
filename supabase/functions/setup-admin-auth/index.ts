import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SetupAdminRequest {
  email: string;
  password: string;
  fullName: string;
  secretKey: string;
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const body: SetupAdminRequest = await req.json();

    if (body.secretKey !== 'CTGOLD_ADMIN_SETUP_2026') {
      return new Response(
        JSON.stringify({ error: 'Invalid secret key' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!body.email || !body.password || !body.fullName) {
      return new Response(
        JSON.stringify({ error: 'Email, password, and full name are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const emailLower = body.email.toLowerCase();

    const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
      email: emailLower,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.fullName,
      },
    });

    if (createError) {
      console.error('Create auth user error:', createError);
      return new Response(
        JSON.stringify({
          error: createError.message.includes('already registered')
            ? 'User dengan email ini sudah terdaftar'
            : `Gagal membuat auth user: ${createError.message}`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!authUser.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create auth user' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('user_id, email, is_active')
      .eq('email', emailLower)
      .maybeSingle();

    if (existingAdmin) {
      if (existingAdmin.user_id) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Admin sudah ada dan terhubung dengan auth user',
            data: {
              user_id: existingAdmin.user_id,
              email: existingAdmin.email,
              is_active: existingAdmin.is_active,
            }
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { error: updateError } = await supabase
        .from('admins')
        .update({ user_id: authUser.user.id })
        .eq('email', emailLower);

      if (updateError) {
        console.error('Update admin error:', updateError);
        return new Response(
          JSON.stringify({ error: `Gagal update admin record: ${updateError.message}` }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Admin berhasil di-link dengan auth user',
          data: {
            user_id: authUser.user.id,
            email: emailLower,
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: newAdmin, error: insertError } = await supabase
      .from('admins')
      .insert({
        user_id: authUser.user.id,
        email: emailLower,
        role: 'admin',
        is_active: true,
        full_name: body.fullName,
      })
      .select('user_id, email, role, is_active, full_name')
      .single();

    if (insertError) {
      console.error('Insert admin error:', insertError);

      await supabase.auth.admin.deleteUser(authUser.user.id);

      return new Response(
        JSON.stringify({ error: `Gagal membuat admin record: ${insertError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin berhasil dibuat dengan auth user',
        data: newAdmin,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Setup admin auth error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
