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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: RequestResetRequest = await req.json();

    // Validate email
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

    // Find user by email in profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', body.email.toLowerCase())
      .maybeSingle();

    // Always return success to prevent email enumeration
    if (!profile) {
      console.log(`Reset requested for non-existent email: ${body.email}`);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Jika email terdaftar, link reset password sudah dikirim ke email Anda.',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // For Supabase Auth users, use built-in reset password
    const resetUrl = `${Deno.env.get('SUPABASE_URL')?.replace('//popbrkxeqstwvympjucc', '//ctgold.io') || 'https://ctgold.io'}/member/reset-password`;

    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: body.email.toLowerCase(),
      options: {
        redirectTo: resetUrl,
      }
    });

    if (resetError) {
      console.error('Generate reset link error:', resetError);
      // Still return success to prevent enumeration
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Jika email terdaftar, link reset password sudah dikirim ke email Anda.',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the recovery link
    const { data: linkData } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: body.email.toLowerCase(),
    });

    if (!linkData?.properties?.action_link) {
      console.error('Failed to generate recovery link');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Jika email terdaftar, link reset password sudah dikirim ke email Anda.',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract token from action link and create custom redirect
    const actionLink = linkData.properties.action_link;
    const resetLink = actionLink.replace(
      /\/auth\/v1\/verify.*$/,
      `/member/reset-password${actionLink.includes('?') ? actionLink.substring(actionLink.indexOf('?')) : ''}`
    );

    // Send email
    try {
      await sendResetEmail({
        to: profile.email,
        name: profile.full_name,
        resetLink: resetLink,
        expiresInMinutes: 60,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Jika email terdaftar, link reset password sudah dikirim ke email Anda.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Request reset error:', error);
    return new Response(
      JSON.stringify({ error: 'Terjadi kesalahan server' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Email sending helper
async function sendResetEmail(params: {
  to: string;
  name: string;
  resetLink: string;
  expiresInMinutes: number;
}) {
  const { to, name, resetLink, expiresInMinutes } = params;

  // HTML email template
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password CTGOLD</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a; color: #e2e8f0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #d4af37 0%, #f4e5b5 100%); padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #0f172a; font-size: 28px; font-weight: 700;">CTGOLD</h1>
                  <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 14px;">Community Token Gold</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #f8fafc; font-size: 24px; font-weight: 600;">Reset Password</h2>
                  
                  <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                    Halo <strong style="color: #f8fafc;">${name}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                    Kami menerima permintaan untuk reset password akun CTGOLD Anda. Klik tombol di bawah untuk membuat password baru:
                  </p>
                  
                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4e5b5 100%); color: #0f172a; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);">Reset Password</a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                    Link ini berlaku selama <strong>${expiresInMinutes} menit</strong>. Jika Anda tidak meminta reset password, abaikan email ini.
                  </p>
                  
                  <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                    Atau copy dan paste link berikut ke browser Anda:
                  </p>
                  
                  <p style="margin: 0 0 20px 0; color: #64748b; font-size: 12px; word-break: break-all; background-color: #0f172a; padding: 12px; border-radius: 6px; border: 1px solid #334155;">
                    ${resetLink}
                  </p>
                  
                  <!-- Security Notice -->
                  <div style="margin-top: 30px; padding: 16px; background-color: #0f172a; border-left: 4px solid #d4af37; border-radius: 6px;">
                    <p style="margin: 0; color: #cbd5e1; font-size: 13px; line-height: 1.6;">
                      <strong style="color: #f8fafc;">Catatan Keamanan:</strong><br>
                      Kami tidak pernah meminta password Anda melalui email atau chat. Jangan bagikan password kepada siapapun.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
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

  // Plain text fallback
  const textBody = `
Reset Password CTGOLD

Halo ${name},

Kami menerima permintaan untuk reset password akun CTGOLD Anda.

Klik link berikut untuk membuat password baru:
${resetLink}

Link ini berlaku selama ${expiresInMinutes} menit. Jika Anda tidak meminta reset password, abaikan email ini.

Catatan Keamanan:
Kami tidak pernah meminta password Anda melalui email atau chat. Jangan bagikan password kepada siapapun.

© ${new Date().getFullYear()} CTGOLD - Community Token Gold
  `;

  // Log email content for development
  console.log('='.repeat(80));
  console.log('RESET PASSWORD EMAIL');
  console.log('='.repeat(80));
  console.log(`To: ${to}`);
  console.log(`Subject: Reset Password CTGOLD`);
  console.log(`Reset Link: ${resetLink}`);
  console.log('='.repeat(80));

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  if (!RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY not configured. Email not sent.');
    console.log('To enable email: Add RESEND_API_KEY to Supabase Edge Function secrets');
    return { success: false, error: 'Email service not configured' };
  }

  try {
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
      throw new Error(`Resend API failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Email sent successfully via Resend:', result);
    return { success: true, emailId: result.id };
  } catch (error: any) {
    console.error('Failed to send email via Resend:', error);
    throw error;
  }
}
