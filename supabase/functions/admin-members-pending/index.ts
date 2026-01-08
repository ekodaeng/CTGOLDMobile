import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifySession, extractBearerToken } from './session.ts';
import { corsHeaders, handleCorsOptions } from './cors.ts';

interface PendingMember {
  id: string;
  email: string;
  full_name: string;
  city: string;
  created_at: string;
}

interface PendingMembersResponse {
  ok: boolean;
  members?: PendingMember[];
  error?: string;
  error_code?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const token = extractBearerToken(authHeader);

    if (!token) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'No authorization token found',
          error_code: 'NO_TOKEN'
        } as PendingMembersResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const payload = await verifySession(token);

    if (!payload) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Invalid or expired token',
          error_code: 'INVALID_TOKEN'
        } as PendingMembersResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (payload.role !== 'admin' && payload.role !== 'super_admin') {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Admin access required',
          error_code: 'ACCESS_DENIED'
        } as PendingMembersResponse),
        {
          status: 403,
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

    const { data: members, error: dbError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, city, created_at')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Failed to fetch pending members',
          error_code: 'DB_ERROR'
        } as PendingMembersResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        members: members || [],
      } as PendingMembersResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching pending members:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        error_code: 'SERVER_ERROR'
      } as PendingMembersResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});