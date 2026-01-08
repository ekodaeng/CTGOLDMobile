import { createClient } from 'npm:@supabase/supabase-js@2';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CreateAdminRequest {
  fullName: string;
  email: string;
  password: string;
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: CreateAdminRequest = await req.json();

    if (body.secretKey !== 'CTGOLD_ADMIN_SETUP_2026') {
      return new Response(
        JSON.stringify({ error: 'Invalid secret key' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!body.fullName || !body.email || !body.password) {
      return new Response(
        JSON.stringify({ error: 'All fields required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: existingAdmin } = await supabase
      .from('members')
      .select('id')
      .eq('role', 'ADMIN')
      .maybeSingle();

    if (existingAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin already exists' }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const passwordHash = await bcrypt.hash(body.password);

    const { data: newAdmin, error: insertError } = await supabase
      .from('members')
      .insert({
        member_code: '',
        full_name: body.fullName,
        email: body.email.toLowerCase(),
        password_hash: passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      })
      .select('id, member_code, full_name, email, role, status')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create admin' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    await supabase.from('member_logs').insert({
      member_id: newAdmin.id,
      action: 'REGISTER',
      metadata: {
        email: newAdmin.email,
        role: 'ADMIN',
        registered_at: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin created successfully',
        data: newAdmin,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Create admin error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});