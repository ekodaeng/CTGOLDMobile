# RESEND Email Setup untuk CTGOLD Admin

## Panduan Lengkap Integrasi Resend untuk Email Reset Password Admin

### 📋 Daftar Isi
1. [Setup Resend Account](#1-setup-resend-account)
2. [Konfigurasi Domain](#2-konfigurasi-domain)
3. [Environment Variables](#3-environment-variables)
4. [Deployment Edge Function](#4-deployment-edge-function)
5. [Testing](#5-testing)

---

## 1. Setup Resend Account

### Step 1: Buat Akun Resend
1. Kunjungi [https://resend.com](https://resend.com)
2. Sign up dengan email Anda
3. Verifikasi email Anda

### Step 2: Dapatkan API Key
1. Login ke Resend Dashboard
2. Navigasi ke **Settings** → **API Keys**
3. Klik **Create API Key**
4. Beri nama: `CTGOLD Admin Production`
5. Permission: **Full Access** (atau minimal **Sending Access**)
6. Copy API Key dan simpan di tempat aman

**Format API Key:**
```
re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 2. Konfigurasi Domain

### Option A: Gunakan Domain Resend (Testing)
Untuk testing, Anda bisa langsung pakai:
```
no-reply@resend.dev
```

### Option B: Custom Domain (Production - Recommended)

#### Step 1: Tambah Domain
1. Di Resend Dashboard → **Domains**
2. Klik **Add Domain**
3. Input domain Anda: `ctgold.io`

#### Step 2: Setup DNS Records
Resend akan memberikan DNS records. Tambahkan ke DNS provider Anda:

**TXT Record (untuk SPF):**
```
@ TXT "v=spf1 include:resend.com ~all"
```

**CNAME Record (untuk DKIM):**
```
resend._domainkey CNAME resend._domainkey.resend.com
```

**CNAME Record (untuk custom tracking domain - optional):**
```
email CNAME track.resend.com
```

#### Step 3: Verifikasi Domain
1. Tunggu DNS propagation (1-48 jam, biasanya < 1 jam)
2. Klik **Verify** di Resend Dashboard
3. Status akan berubah jadi **Verified** ✅

#### Step 4: Set From Email
Setelah domain verified, Anda bisa pakai:
```
no-reply@ctgold.io
CTGOLD Security <no-reply@ctgold.io>
```

---

## 3. Environment Variables

### Local Development (.env.local)
Buat file `.env.local` di root project:
```bash
# Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email Configuration
RESEND_FROM_EMAIL=CTGOLD Security <no-reply@ctgold.io>
RESEND_REPLY_TO=support@ctgold.io
```

### Supabase Edge Functions Environment
Set environment variables di Supabase:

```bash
# Via Supabase Dashboard
1. Buka Supabase Dashboard
2. Pilih Project CTGOLD
3. Settings → Edge Functions → Environment Variables
4. Tambahkan:
   - RESEND_API_KEY: re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   - RESEND_FROM_EMAIL: CTGOLD Security <no-reply@ctgold.io>
```

**ATAU via CLI (jika ada akses):**
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set RESEND_FROM_EMAIL="CTGOLD Security <no-reply@ctgold.io>"
```

---

## 4. Deployment Edge Function

### File yang Tersedia
1. **Email Template:** `/src/emails/admin-reset-password.html`
2. **Email Utility:** `/src/lib/email-templates.ts`
3. **Edge Function:** `/supabase/functions/admin-forgot-password-resend/index.ts` (akan dibuat)

### Deploy Edge Function

#### Option A: Via Supabase Dashboard (Recommended)
Sudah tersedia di system, function akan otomatis ter-deploy.

#### Option B: Manual Test di Local
```bash
# Test function locally (jika punya Supabase CLI)
supabase functions serve admin-forgot-password-resend

# Deploy function
supabase functions deploy admin-forgot-password-resend
```

---

## 5. Testing

### Test Email Sending

#### Via Frontend
1. Buka `/admin/forgot-password`
2. Input email admin yang valid
3. Submit form
4. Cek inbox email

#### Via cURL
```bash
curl -X POST https://popbrkxeqstwvympjucc.supabase.co/functions/v1/admin-forgot-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"email": "admin@ctgold.io"}'
```

### Checklist Testing
- [ ] Email terkirim dalam < 5 detik
- [ ] Email tidak masuk spam
- [ ] Design terlihat bagus di Gmail
- [ ] Design terlihat bagus di Outlook
- [ ] Design terlihat bagus di Apple Mail
- [ ] Mobile responsive
- [ ] Button "Reset Password" berfungsi
- [ ] Link fallback berfungsi
- [ ] Security notice terbaca jelas

---

## 📧 Email Template Specs

### Current Template
- **Location:** `/src/emails/admin-reset-password.html`
- **Design:** Dark + Gold (CTGOLD brand)
- **From:** `CTGOLD Security <no-reply@ctgold.io>`
- **Subject:** `🔐 Reset Password Admin CTGOLD`
- **Token Expiry:** 15 menit
- **Security:** Single-use token

### Placeholder Variables
```typescript
{
  RESET_PASSWORD_URL: string;  // Link reset password dengan token
  YEAR: number;                // Current year (auto)
}
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Store RESEND_API_KEY di environment variables (NEVER commit to git)
- Gunakan domain verified untuk production
- Set SPF dan DKIM records
- Monitor email sending di Resend Dashboard
- Rate limit endpoint forgot password
- Use HTTPS only untuk reset links

### ❌ DON'T:
- Hardcode API key di code
- Expose API key di frontend
- Use unverified domains di production
- Send sensitive data di email body
- Share API key publicly

---

## 📊 Monitoring & Analytics

### Resend Dashboard
Monitor email metrics:
- **Sent:** Total email terkirim
- **Delivered:** Email sampai inbox
- **Bounced:** Email gagal terkirim
- **Complained:** User report spam

### Best Practices
- Check dashboard daily
- Monitor bounce rate (harus < 2%)
- Monitor complaint rate (harus < 0.1%)
- Setup webhooks untuk event tracking (optional)

---

## 🚨 Troubleshooting

### Email Tidak Terkirim
1. Check RESEND_API_KEY valid
2. Check domain verified di Resend
3. Check DNS records correct
4. Check Resend Dashboard logs
5. Check Supabase Edge Function logs

### Email Masuk Spam
1. Verify domain di Resend
2. Setup SPF record
3. Setup DKIM record
4. Setup DMARC record (optional)
5. Warm up domain (kirim email gradually)

### Rate Limit Error
Resend Free Plan:
- **100 emails/day**
- **3,000 emails/month**

Upgrade plan jika perlu.

---

## 📞 Support

### Resend Support
- Documentation: https://resend.com/docs
- Discord: https://resend.com/discord
- Email: support@resend.com

### CTGOLD Support
- Email: support@ctgold.io
- Admin: admin@ctgold.io

---

## 🎯 Next Steps

1. ✅ Setup Resend account
2. ✅ Get API key
3. ✅ Set environment variables
4. ✅ Verify domain (production only)
5. ✅ Deploy edge function
6. ✅ Test email sending
7. ✅ Monitor dashboard

**Status:** Ready for Production 🚀
