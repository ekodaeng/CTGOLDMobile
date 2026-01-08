import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ForgotPasswordRequest {
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: ForgotPasswordRequest = await req.json();

    if (!body.email) {
      return new Response(
        JSON.stringify({ error: 'Email wajib diisi' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const emailLower = body.email.toLowerCase();

    // Find user in profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', emailLower)
      .maybeSingle();

    // Always return success to prevent email enumeration
    if (!profile) {
      console.log(`Forgot password requested for non-existent email: ${emailLower}`);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Jika email terdaftar, link reset password akan dikirim.',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate reset link using Supabase Auth
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: emailLower,
    });

    if (resetError || !resetData?.properties?.action_link) {
      console.error('Failed to generate reset link:', resetError);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Jika email terdaftar, link reset password akan dikirim.',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract token and create custom reset URL
    const actionLink = resetData.properties.action_link;
    const url = new URL(actionLink);
    const token = url.searchParams.get('token');
    const type = url.searchParams.get('type');

    const resetLink = `https://ctgold.io/member/reset-password?token=${token}&type=${type}`;

    // Send email via Resend
    try {
      await sendResetEmail({
        to: profile.email,
        name: profile.full_name,
        resetLink,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Jika email terdaftar, link reset password akan dikirim.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan server' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function sendResetEmail(params: {
  to: string;
  name: string;
  resetLink: string;
}) {
  const { to, name, resetLink } = params;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #d4af37 0%, #f4e5b5 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #0f172a; font-size: 28px; font-weight: 700;">CTGOLD</h1>
              <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 14px;">Community Token Gold</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #f8fafc; font-size: 24px;">Reset Password</h2>
              <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                Halo <strong style="color: #f8fafc;">${name}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                Kami menerima permintaan untuk reset password akun CTGOLD Anda. Klik tombol di bawah untuk membuat password baru:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4e5b5 100%); color: #0f172a; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                Link ini berlaku selama <strong>1 jam</strong>. Jika Anda tidak meminta reset password, abaikan email ini.
              </p>
              <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 14px;">
                Atau copy link berikut:
              </p>
              <p style="margin: 0 0 20px 0; color: #64748b; font-size: 12px; word-break: break-all; background-color: #0f172a; padding: 12px; border-radius: 6px;">
                ${resetLink}
              </p>
              <div style="margin-top: 30px; padding: 16px; background-color: #0f172a; border-left: 4px solid #d4af37; border-radius: 6px;">
                <p style="margin: 0; color: #cbd5e1; font-size: 13px; line-height: 1.6;">
                  <strong style="color: #f8fafc;">Catatan Keamanan:</strong><br>
                  Kami tidak pernah meminta password melalui email atau chat.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; text-align: center; border-top: 1px solid #334155;">
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">
                CTGOLD - Community Token Gold
              </p>
              <p style="margin: 0; color: #475569; font-size: 12px;">
                © ${new Date().getFullYear()} CTGOLD. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textBody = `
Reset Password CTGOLD

Halo ${name},

Kami menerima permintaan untuk reset password akun CTGOLD Anda.

Klik link berikut untuk membuat password baru:
${resetLink}

Link ini berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.

Catatan Keamanan:
Kami tidak pernah meminta password melalui email atau chat.

© ${new Date().getFullYear()} CTGOLD - Community Token Gold
  `;

  console.log('='.repeat(80));
  console.log('FORGOT PASSWORD EMAIL');
  console.log('='.repeat(80));
  console.log(`To: ${to}`);
  console.log(`Reset Link: ${resetLink}`);
  console.log('='.repeat(80));

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  if (!RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY not configured');
    console.log('→ Email akan dikirim via Supabase Auth Email (jika SMTP configured)');
    throw new Error('RESEND_API_KEY not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'CTGOLD <onboarding@resend.dev>',
      to: [to],
      subject: 'Reset Password CTGOLD',
      html: htmlBody,
      text: textBody,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Resend API error:', errorText);
    throw new Error(`Resend failed: ${response.status}`);
  }

  const result = await response.json();
  console.log('✅ Email sent via Resend:', result);
  return result;
}
