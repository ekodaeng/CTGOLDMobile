import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, handleCorsOptions } from './cors.ts';

interface UpdateRequest {
  userId: string;
  updates: {
    full_name?: string;
    email?: string;
    city?: string;
    phone?: string | null;
    telegram_username?: string | null;
  };
}

interface UpdateResponse {
  ok: boolean;
  error?: string;
  error_code?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'No authorization token found',
          error_code: 'NO_TOKEN'
        } as UpdateResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('[AdminMembersUpdate] Verifying user token...');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError) {
      console.error('[AdminMembersUpdate] Token verification error:', userError);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Token verification failed: ' + userError.message,
          error_code: 'TOKEN_VERIFICATION_FAILED'
        } as UpdateResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!user) {
      console.error('[AdminMembersUpdate] No user found in token');
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'No user found in token',
          error_code: 'INVALID_TOKEN'
        } as UpdateResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[AdminMembersUpdate] User verified:', user.id);

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
      console.error('Admin check error:', adminError);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Failed to verify admin status',
          error_code: 'ADMIN_CHECK_ERROR'
        } as UpdateResponse),
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
          error: 'Not authorized as admin',
          error_code: 'NOT_ADMIN'
        } as UpdateResponse),
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
          error: 'Admin account is inactive',
          error_code: 'ADMIN_INACTIVE'
        } as UpdateResponse),
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
          error: 'Admin access required',
          error_code: 'ACCESS_DENIED'
        } as UpdateResponse),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body: UpdateRequest = await req.json();

    if (!body.userId || !body.updates) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'userId and updates are required',
          error_code: 'VALIDATION_ERROR'
        } as UpdateResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: beforeData, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email, city, phone, telegram_username')
      .eq('id', body.userId)
      .single();

    if (fetchError || !beforeData) {
      console.error('Failed to fetch member data:', fetchError);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Member not found',
          error_code: 'NOT_FOUND'
        } as UpdateResponse),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const updateData = {
      ...body.updates,
      updated_at: new Date().toISOString()
    };

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', body.userId);

    if (updateError) {
      console.error('Database error:', updateError);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Failed to update member',
          error_code: 'DB_ERROR'
        } as UpdateResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const changes: Record<string, string> = {};
    Object.keys(body.updates).forEach((key) => {
      const beforeValue = beforeData[key as keyof typeof beforeData];
      const afterValue = body.updates[key as keyof typeof body.updates];
      if (beforeValue !== afterValue) {
        changes[key] = String(afterValue || '');
      }
    });

    await supabaseAdmin
      .from('admin_activity_logs')
      .insert({
        admin_user_id: adminData.user_id,
        admin_email: adminData.email,
        action_type: 'MEMBER_UPDATED',
        target_user_id: body.userId,
        target_user_email: body.updates.email || beforeData.email,
        target_user_name: body.updates.full_name || beforeData.full_name,
        changes: changes,
      });

    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-admin-activity-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          action_type: 'MEMBER_UPDATED',
          member_name: body.updates.full_name || beforeData.full_name,
          member_email: body.updates.email || beforeData.email,
          admin_email: adminData.email,
          admin_name: adminData.full_name,
          changes: changes,
        }),
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    return new Response(
      JSON.stringify({ ok: true } as UpdateResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error updating member:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        error_code: 'SERVER_ERROR'
      } as UpdateResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});