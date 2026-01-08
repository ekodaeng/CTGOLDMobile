import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

interface EmailRequest {
  action_type: 'MEMBER_APPROVED' | 'MEMBER_REJECTED' | 'MEMBER_UPDATED' | 'MEMBER_DELETED';
  member_name: string;
  member_email: string;
  admin_email: string;
  admin_name: string;
  changes?: Record<string, any>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const getEmailTemplate = (request: EmailRequest) => {
  const { action_type, member_name, member_email, admin_name, admin_email, changes } = request;
  
  let subject = '';
  let heading = '';
  let message = '';
  let statusColor = '';
  let actionText = '';

  switch (action_type) {
    case 'MEMBER_APPROVED':
      subject = 'Member Diaktifkan - CTGOLD Admin';
      heading = 'Member Berhasil Diaktifkan';
      message = `<strong>${member_name}</strong> telah diaktifkan dan dapat mengakses sistem CTGOLD.`;
      statusColor = '#10b981'; // green
      actionText = 'APPROVED';
      break;
    case 'MEMBER_REJECTED':
      subject = 'Member Ditolak - CTGOLD Admin';
      heading = 'Member Ditolak';
      message = `<strong>${member_name}</strong> telah ditolak dan tidak dapat mengakses sistem.`;
      statusColor = '#ef4444'; // red
      actionText = 'REJECTED';
      break;
    case 'MEMBER_UPDATED':
      subject = 'Data Member Diupdate - CTGOLD Admin';
      heading = 'Data Member Diperbarui';
      message = `<strong>${member_name}</strong> telah diupdate oleh admin.`;
      statusColor = '#3b82f6'; // blue
      actionText = 'UPDATED';
      break;
    case 'MEMBER_DELETED':
      subject = 'Member Dihapus - CTGOLD Admin';
      heading = 'Member Dihapus dari Sistem';
      message = `<strong>${member_name}</strong> telah dihapus dari sistem CTGOLD.`;
      statusColor = '#dc2626'; // dark red
      actionText = 'DELETED';
      break;
  }

  let changesHtml = '';
  if (changes && Object.keys(changes).length > 0) {
    changesHtml = `
      <div style="margin: 20px 0; padding: 20px; background: #1f2937; border-radius: 12px; border: 1px solid #374151;">
        <h3 style="color: #d1d5db; margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">Perubahan Data:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${Object.entries(changes)
            .map(
              ([key, value]) => `
              <tr>
                <td style="padding: 8px 0; color: #9ca3af; font-size: 13px; width: 40%;">${formatFieldName(key)}</td>
                <td style="padding: 8px 0; color: #f3f4f6; font-size: 13px; font-weight: 500;">${value}</td>
              </tr>
            `
            )
            .join('')}
        </table>
      </div>
    `;
  }

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #0f172a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e5b5 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">
        CTGOLD
      </div>
      <p style="color: #64748b; font-size: 14px; margin: 8px 0 0 0;">Community Token Gold - Admin Panel</p>
    </div>

    <!-- Main Card -->
    <div style="background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155;">
      
      <!-- Status Badge -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; padding: 12px 24px; background: ${statusColor}15; border: 2px solid ${statusColor}40; border-radius: 12px;">
          <span style="color: ${statusColor}; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">${actionText}</span>
        </div>
      </div>

      <!-- Heading -->
      <h2 style="color: #f1f5f9; text-align: center; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">
        ${heading}
      </h2>
      
      <!-- Message -->
      <p style="color: #cbd5e1; text-align: center; margin: 0 0 32px 0; font-size: 15px; line-height: 1.6;">
        ${message}
      </p>

      <!-- Member Info -->
      <div style="background: #0f172a; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #1e293b;">
        <div style="margin-bottom: 12px;">
          <div style="color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Member</div>
          <div style="color: #f1f5f9; font-size: 16px; font-weight: 600;">${member_name}</div>
          <div style="color: #94a3b8; font-size: 14px; margin-top: 4px;">${member_email}</div>
        </div>
      </div>

      ${changesHtml}

      <!-- Admin Info -->
      <div style="background: #0f172a; border-radius: 12px; padding: 16px; margin: 24px 0 0 0; border: 1px solid #1e293b;">
        <div style="color: #64748b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Dilakukan Oleh</div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #d4af37 0%, #f4e5b5 100%); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #0f172a; font-size: 16px;">
            ${admin_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="color: #f1f5f9; font-size: 14px; font-weight: 600;">${admin_name}</div>
            <div style="color: #94a3b8; font-size: 13px;">${admin_email}</div>
          </div>
        </div>
      </div>

      <!-- Timestamp -->
      <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #334155;">
        <p style="color: #64748b; font-size: 13px; margin: 0;">
          ${new Date().toLocaleString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta',
          })} WIB
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #475569; font-size: 12px; margin: 0;">
        Email otomatis dari sistem CTGOLD Admin<br>
        Jangan balas email ini
      </p>
      <div style="margin-top: 16px;">
        <p style="color: #334155; font-size: 11px; margin: 0;">
          © ${new Date().getFullYear()} CTGOLD - Community Token Gold
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const textBody = `
${heading}

${message.replace(/<[^>]*>/g, '')}

Member: ${member_name}
Email: ${member_email}

${changes ? `Perubahan:\n${Object.entries(changes).map(([k, v]) => `${formatFieldName(k)}: ${v}`).join('\n')}\n\n` : ''}
Dilakukan oleh: ${admin_name} (${admin_email})
Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB

---
Email otomatis dari sistem CTGOLD Admin
Jangan balas email ini
  `;

  return { subject, htmlBody, textBody };
};

const formatFieldName = (key: string): string => {
  const fieldNames: Record<string, string> = {
    full_name: 'Nama Lengkap',
    email: 'Email',
    city: 'Kota',
    phone: 'Nomor Telepon',
    telegram_username: 'Username Telegram',
    status: 'Status',
  };
  return fieldNames[key] || key;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const emailRequest: EmailRequest = await req.json();

    // Validate request
    if (!emailRequest.action_type || !emailRequest.member_name || !emailRequest.member_email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { subject, htmlBody, textBody } = getEmailTemplate(emailRequest);

    // Get admin emails from environment
    const adminEmails = Deno.env.get('ADMIN_EMAIL_WHITELIST')?.split(',') || [];
    
    if (adminEmails.length === 0) {
      console.warn('No admin emails configured in ADMIN_EMAIL_WHITELIST');
      return new Response(
        JSON.stringify({ ok: true, message: 'No recipients configured' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'CTGOLD Admin <onboarding@resend.dev>',
        to: adminEmails.map(email => email.trim()),
        subject: subject,
        html: htmlBody,
        text: textBody,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    return new Response(
      JSON.stringify({ ok: true, emailId: result.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to send email',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});