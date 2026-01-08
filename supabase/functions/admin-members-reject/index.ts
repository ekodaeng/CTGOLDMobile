import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, handleCorsOptions } from './cors.ts';

interface RejectRequest {
  userId: string;
}

interface RejectResponse {
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
        } as RejectResponse),
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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Invalid or expired token',
          error_code: 'INVALID_TOKEN'
        } as RejectResponse),
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

    if (adminError || !adminData || !adminData.is_active) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Not authorized as admin',
          error_code: 'NOT_ADMIN'
        } as RejectResponse),
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
        } as RejectResponse),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body: RejectRequest = await req.json();

    if (!body.userId) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'userId is required',
          error_code: 'VALIDATION_ERROR'
        } as RejectResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: memberData, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('id', body.userId)
      .single();

    if (fetchError || !memberData) {
      console.error('Failed to fetch member data:', fetchError);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Member not found',
          error_code: 'NOT_FOUND'
        } as RejectResponse),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ status: 'SUSPENDED' })
      .eq('id', body.userId);

    if (updateError) {
      console.error('Database error:', updateError);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Failed to reject member',
          error_code: 'DB_ERROR'
        } as RejectResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    await supabaseAdmin
      .from('admin_activity_logs')
      .insert({
        admin_user_id: adminData.user_id,
        admin_email: adminData.email,
        action_type: 'MEMBER_REJECTED',
        target_user_id: body.userId,
        target_user_email: memberData.email,
        target_user_name: memberData.full_name,
      });

    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-admin-activity-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          action_type: 'MEMBER_REJECTED',
          member_name: memberData.full_name,
          member_email: memberData.email,
          admin_email: adminData.email,
          admin_name: adminData.full_name,
        }),
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    return new Response(
      JSON.stringify({ ok: true } as RejectResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error rejecting member:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        error_code: 'SERVER_ERROR'
      } as RejectResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});