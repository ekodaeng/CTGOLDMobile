# Panduan Setup Email untuk Reset Password

## Masalah Saat Ini

Email reset password tidak terkirim karena Supabase Email belum dikonfigurasi. Ada dua area yang perlu dikonfigurasi:

1. **Admin Reset Password** - Menggunakan `supabase.auth.resetPasswordForEmail()`
2. **Member Reset Password** - Menggunakan edge function dengan email service

---

## Solusi 1: Konfigurasi Supabase Auth Email (Recommended)

Untuk mengaktifkan email reset password dari Supabase Auth:

### Langkah 1: Buka Supabase Dashboard

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project: `popbrkxeqstwvympjucc`
3. Buka menu **Authentication** → **Email Templates**

### Langkah 2: Konfigurasi SMTP (Custom Email Provider)

Jika ingin menggunakan email custom (Gmail, dll):

1. Di dashboard, buka **Project Settings** → **Auth** → **SMTP Settings**
2. Aktifkan **Enable Custom SMTP**
3. Isi konfigurasi:

#### Untuk Gmail:
```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: [App Password, bukan password biasa]
Sender email: your-email@gmail.com
Sender name: CTGOLD
```

**PENTING untuk Gmail:**
- Jangan gunakan password biasa
- Buat App Password di Google Account Settings → Security → 2-Step Verification → App passwords
- Gunakan App Password tersebut

#### Untuk Email Provider Lain:
Sesuaikan dengan SMTP settings provider Anda.

### Langkah 3: Edit Email Template

1. Di **Email Templates**, pilih **Reset Password**
2. Edit template sesuai brand CTGOLD:

**Subject:**
```
Reset Password Akun CTGOLD Anda
```

**Email Body (HTML):**
```html
<h2>Reset Password CTGOLD</h2>

<p>Halo,</p>

<p>Kami menerima permintaan untuk reset password akun CTGOLD Anda.</p>

<p>Klik tombol di bawah untuk membuat password baru:</p>

<p>
  <a href="{{ .ConfirmationURL }}"
     style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4e5b5 100%); color: #0f172a; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600;">
    Reset Password
  </a>
</p>

<p>Link ini berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.</p>

<p style="color: #666; font-size: 12px;">
  Atau copy link berikut ke browser:<br>
  {{ .ConfirmationURL }}
</p>

<hr style="border: 1px solid #eee; margin: 20px 0;">

<p style="color: #999; font-size: 11px;">
  © 2026 CTGOLD - Community Token Gold<br>
  Email otomatis, jangan balas email ini.
</p>
```

### Langkah 4: Tes Konfigurasi

1. Di dashboard, klik **Send Test Email**
2. Masukkan email Anda
3. Cek inbox/spam
4. Jika berhasil, email sudah dikonfigurasi!

### Langkah 5: Update Redirect URL

Pastikan redirect URL di kode sudah benar:

**Admin:**
```
${window.location.origin}/admin/reset-password
```

**Member:**
```
${window.location.origin}/member/reset-password
```

---

## Solusi 2: Gunakan Email Service (Resend/SendGrid)

Jika tidak ingin menggunakan SMTP atau Supabase Email, gunakan service email modern.

### Menggunakan Resend (Recommended)

#### 1. Daftar Resend

1. Buka [resend.com](https://resend.com)
2. Sign up (gratis 100 email/hari, 3000/bulan)
3. Verify domain atau gunakan resend.dev untuk testing

#### 2. Dapatkan API Key

1. Di dashboard Resend, buka **API Keys**
2. Create API Key
3. Copy API Key (format: `re_xxxxxxxxxxxxx`)

#### 3. Tambahkan ke Supabase Secrets

```bash
# Via Supabase CLI (jika tersedia)
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx

# Atau via Dashboard:
# Project Settings → Edge Functions → Environment Variables
# Add: RESEND_API_KEY = re_xxxxxxxxxxxxx
```

#### 4. Update Edge Function

File sudah siap, tinggal uncomment bagian Resend di:
- `supabase/functions/request-reset-password/index.ts` (line 319-333)

Ganti placeholder dengan:

```typescript
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

if (RESEND_API_KEY) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'CTGOLD <noreply@yourdomain.com>', // Atau onboarding@resend.dev untuk testing
      to: [to],
      subject: 'Reset Password CTGOLD',
      html: htmlBody,
      text: textBody,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }
}
```

#### 5. Deploy Edge Function

Edge function sudah deployed, tapi perlu update jika ada perubahan:

```bash
# Akan otomatis deploy saat save
```

---

## Solusi 3: Menggunakan Gmail Langsung (Development Only)

**⚠️ TIDAK DIREKOMENDASIKAN UNTUK PRODUCTION**

Untuk testing cepat saja:

### Setup Gmail App Password

1. Buka Google Account → Security
2. Enable 2-Step Verification
3. Buka App Passwords
4. Generate password untuk "Mail"
5. Copy 16-digit password

### Konfigurasi di Supabase

Gunakan Solusi 1 di atas dengan settings Gmail.

---

## Troubleshooting

### Email Tidak Terkirim

**Cek 1: SMTP Settings**
- Pastikan SMTP enabled di Supabase Dashboard
- Verify credentials (username, password, host, port)

**Cek 2: Email Provider**
- Gmail: Pastikan App Password digunakan (bukan password biasa)
- Gmail: Pastikan "Less secure app access" OFF (gunakan App Password)
- Email lain: Verify SMTP settings dengan provider

**Cek 3: Spam Filter**
- Cek folder Spam/Junk
- Whitelist email sender

**Cek 4: Supabase Logs**
- Buka Project → Logs → Auth Logs
- Cari error messages

### Email Masuk ke Spam

**Solusi:**
1. Setup SPF record untuk domain
2. Setup DKIM di email provider
3. Setup DMARC record
4. Gunakan verified domain di Resend/SendGrid
5. Hindari spam words di subject/body

### Rate Limiting

Supabase Auth memiliki rate limit untuk prevent abuse:
- Sama email: Max 1 request per 60 seconds
- Sama IP: Max 5 requests per 60 seconds

Jika kena limit, tunggu sebelum retry.

---

## Testing Checklist

- [ ] SMTP configured di Supabase Dashboard
- [ ] Test email berhasil dikirim dari dashboard
- [ ] Email reset password admin terkirim
- [ ] Email reset password member terkirim
- [ ] Link di email berfungsi
- [ ] Password berhasil direset
- [ ] Email tidak masuk spam
- [ ] Template email sesuai brand CTGOLD

---

## FAQ

**Q: Kenapa email tidak terkirim tapi UI bilang sukses?**
A: Untuk keamanan, UI selalu show success message (prevent email enumeration). Cek Supabase logs untuk error sebenarnya.

**Q: Berapa lama link reset valid?**
A: Default Supabase: 1 jam. Bisa diubah di Auth Settings.

**Q: Bisa pakai email gratis seperti Gmail?**
A: Bisa untuk development, tapi tidak recommended untuk production. Gunakan email service atau domain sendiri.

**Q: Email template bisa disesuaikan?**
A: Ya, edit di Supabase Dashboard → Authentication → Email Templates.

**Q: Resend atau SendGrid lebih baik?**
A: Resend lebih simple dan modern. SendGrid lebih enterprise. Untuk startup, Resend recommended.

---

## Recommended Setup untuk Production

1. **Email Service:** Resend
   - Modern, reliable, good deliverability
   - Free tier: 3000 emails/month
   - Easy integration

2. **Domain:** Custom domain (ctgold.io)
   - Professional look
   - Better deliverability
   - Trust dari users

3. **DNS Records:**
   - SPF record configured
   - DKIM configured
   - DMARC configured

4. **Monitoring:**
   - Setup email delivery monitoring
   - Track bounce rate
   - Monitor spam complaints

---

## Next Steps

1. Pilih solusi yang sesuai (Supabase SMTP atau Resend)
2. Ikuti langkah setup
3. Test thoroughly
4. Monitor email deliverability
5. Jika production, setup custom domain + DNS records
