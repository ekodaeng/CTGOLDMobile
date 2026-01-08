# Setup Resend untuk Forgot Password Email

## Quick Start (5 Menit) ⚡

Forgot password email sekarang menggunakan Resend untuk deliverability yang lebih baik.

---

## Step 1: Daftar Resend (2 Menit)

### 1.1 Create Account

1. Buka: **https://resend.com/signup**
2. Sign up dengan email atau GitHub
3. Verify email Anda
4. Login ke dashboard

### 1.2 Free Tier (Recommended)

**Gratis Selamanya:**
- ✅ 3,000 emails per bulan
- ✅ 100 emails per hari
- ✅ Cukup untuk production startup
- ✅ No credit card required

**Cost untuk CTGOLD:**
- Forgot password: ~10-50 emails/hari
- Total: ~500-1500 emails/bulan
- **Conclusion: FREE tier cukup!** 🎉

---

## Step 2: Dapatkan API Key (1 Menit)

### 2.1 Create API Key

1. Di Resend Dashboard, klik **API Keys** di sidebar
2. Klik **Create API Key**
3. Nama: `CTGOLD Production`
4. Permission: `Sending access` (default sudah benar)
5. Klik **Add**
6. **COPY API KEY** (format: `re_xxxxxxxxxxxx`)

⚠️ **PENTING:** API Key hanya ditampilkan sekali! Save di tempat aman.

---

## Step 3: Add API Key ke Supabase (2 Menit)

### 3.1 Via Supabase Dashboard

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project: **popbrkxeqstwvympjucc**
3. Klik **Project Settings** (ikon gear di sidebar kiri bawah)
4. Pilih tab **Edge Functions**
5. Scroll ke bagian **Secrets** atau **Environment Variables**
6. Klik **Add new secret**

**Isi form:**
```
Name: RESEND_API_KEY
Value: [paste API key dari Step 2, contoh: re_xxxxxxxxxxxx]
```

7. Klik **Save** atau **Create**

✅ **Done!** API Key sudah configured.

---

## Step 4: Test (1 Menit)

### 4.1 Test Forgot Password Flow

1. Buka https://ctgold.io/member/forgot-password
2. Masukkan email yang terdaftar: `instamakassar@gmail.com`
3. Klik **Kirim Link Reset**
4. Tunggu 10-30 detik
5. **Cek email inbox** (atau folder spam untuk percobaan pertama)
6. Klik link reset password di email
7. Reset password
8. **SUKSES!** ✅

### 4.2 Verify di Resend Dashboard

1. Buka Resend Dashboard → **Emails**
2. Lihat email yang baru terkirim
3. Status: **Delivered** = sukses!
4. Klik untuk lihat preview email

---

## Optional: Custom Domain untuk Production

### Why Custom Domain?

**Before:**
```
From: CTGOLD <onboarding@resend.dev>
```

**After:**
```
From: CTGOLD <noreply@ctgold.io>
```

**Benefits:**
- ✅ Lebih professional
- ✅ Better deliverability (tidak masuk spam)
- ✅ Brand consistency
- ✅ User trust

### Setup Custom Domain

#### A. Add Domain di Resend

1. Resend Dashboard → **Domains**
2. Klik **Add Domain**
3. Masukkan: `ctgold.io`
4. Klik **Add**

#### B. Configure DNS Records

Resend akan memberikan 3 DNS records:

**1. SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
TTL: 3600
```

**2. DKIM Record:**
```
Type: TXT
Name: resend._domainkey
Value: [diberikan oleh Resend, panjang ~200 chars]
TTL: 3600
```

**3. DMARC Record (Optional tapi Recommended):**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@ctgold.io
TTL: 3600
```

**Cara Add DNS Records:**
- Login ke domain registrar (Cloudflare, Namecheap, GoDaddy, dll)
- Buka DNS settings
- Add 3 records di atas
- Save

#### C. Verify Domain

1. Kembali ke Resend Dashboard
2. Klik **Verify** di domain yang baru ditambahkan
3. Tunggu DNS propagation (5 menit - 24 jam, biasanya instant)
4. Status berubah jadi **Verified** ✅

#### D. Update Edge Function

Edit file: `supabase/functions/member-forgot-password/index.ts`

Cari line yang berisi:
```typescript
from: 'CTGOLD <onboarding@resend.dev>',
```

Ganti jadi:
```typescript
from: 'CTGOLD <noreply@ctgold.io>',
```

Edge function akan auto-deploy setelah disave.

---

## Troubleshooting

### Email Tidak Terkirim

**Cek 1: RESEND_API_KEY sudah diset?**

1. Supabase Dashboard → Project Settings → Edge Functions
2. Cek bagian Secrets/Environment Variables
3. Pastikan ada `RESEND_API_KEY` dengan value yang benar

**Cek 2: API Key Valid?**

- Login ke Resend Dashboard
- Buka API Keys
- Pastikan key masih aktif (tidak deleted)
- Test dengan create new email via dashboard

**Cek 3: Supabase Edge Function Logs**

1. Supabase Dashboard → Logs → Edge Functions
2. Pilih function: `member-forgot-password`
3. Lihat recent invocations
4. Cari error messages:
   - `RESEND_API_KEY not configured` = Step 3 belum dilakukan
   - `Resend failed: 401` = API key invalid/salah
   - `Resend failed: 422` = Request format error

**Cek 4: Resend Dashboard**

1. Buka Resend → Emails
2. Lihat list emails
3. Jika tidak ada email = API key tidak configured atau request tidak sampai
4. Jika ada email dengan status **Bounced** = email address invalid

---

### Email Masuk ke Spam

**Untuk Testing (onboarding@resend.dev):**
- Normal jika masuk spam di percobaan pertama
- Mark as "Not Spam" dan add sender to contacts

**Untuk Production (custom domain):**

1. ✅ Verify domain di Resend
2. ✅ Add SPF, DKIM, DMARC DNS records
3. ✅ Tunggu DNS propagation (24 jam)
4. ✅ Warm up email sending:
   - Hari 1-3: Kirim 10-50 emails
   - Hari 4-7: Kirim 100-200 emails
   - Hari 8+: Normal volume
5. ✅ Maintain good sender reputation:
   - Low bounce rate (<5%)
   - Low complaint rate (<0.1%)
   - High engagement rate

---

### Rate Limits

**Free Tier:**
- 100 emails per hari
- 3,000 emails per bulan

**Jika Exceed:**
1. Upgrade ke paid plan ($20/month untuk 50,000 emails)
2. Atau tunggu reset (daily reset jam 00:00 UTC, monthly reset tanggal 1)

**Monitor Usage:**
- Resend Dashboard → Usage
- Lihat current usage vs limits

---

## Monitoring & Analytics

### Via Resend Dashboard

**Real-time Monitoring:**
1. Dashboard → **Emails**
2. Filter by date, status, recipient
3. Metrics:
   - ✅ Delivered
   - 🔄 Queued
   - ❌ Bounced
   - 📫 Spam complaints

**Email Details:**
- Click email untuk lihat:
  - HTML preview
  - Delivery status
  - Timestamps
  - Recipients
  - Error messages (jika failed)

### Via Supabase Logs

1. Dashboard → Logs → Edge Functions
2. Select: `member-forgot-password`
3. View invocations and logs
4. Successful email shows:
   ```
   ===================================
   FORGOT PASSWORD EMAIL
   ===================================
   To: user@example.com
   Reset Link: https://ctgold.io/...
   ===================================
   ✅ Email sent via Resend: { id: 're_...' }
   ```

---

## Cost Estimation

### Current Setup (Free Tier)

**Monthly Cost: $0**

**Limits:**
- 3,000 emails/month
- 100 emails/day

**CTGOLD Usage Estimate:**
- Forgot password requests: 20-50/day
- Peak usage: 100/day (weekend/marketing campaign)
- **Average: ~1,000 emails/month**
- **Conclusion: FREE tier cukup untuk 1-2 tahun pertama** ✅

### Paid Plans (Future)

**Jika user base tumbuh:**

| Plan | Cost/Month | Emails | Per Additional 1k | Best For |
|------|------------|--------|-------------------|----------|
| Free | $0 | 3,000 | - | MVP, Testing |
| Pro | $20 | 50,000 | $0.40 | Small-Medium |
| Scale | $80 | 250,000 | $0.16 | Large |

**Break-even Analysis:**
- Di user count 5,000-10,000 baru perlu upgrade
- Early startup: Free tier cukup

---

## Email Template Customization

### Current Template

Email template sudah professional dengan:
- ✅ CTGOLD branding (gold gradient header)
- ✅ Responsive design
- ✅ Clear CTA button
- ✅ Security notice
- ✅ Plain text fallback

### Edit Template

**File:** `supabase/functions/member-forgot-password/index.ts`

**Section:** `sendResetEmail()` function (line ~130)

**Variables:**
- `htmlBody` - HTML email content
- `textBody` - Plain text fallback
- `from` - Sender email
- `subject` - Email subject (line ~320)

**Customize:**
1. Edit HTML/text content
2. Change colors, fonts, layout
3. Add/remove sections
4. Update branding

Edge function will auto-redeploy on save.

---

## Production Checklist

Before going live:

- [ ] ✅ Resend account created
- [ ] ✅ API key generated
- [ ] ✅ API key added to Supabase secrets
- [ ] ✅ Edge function deployed
- [ ] ✅ Test email sent successfully
- [ ] ✅ Email received in inbox
- [ ] ✅ Reset password link works
- [ ] 🎯 Custom domain verified (optional but recommended)
- [ ] 🎯 DNS records configured (optional but recommended)
- [ ] 🎯 Email template reviewed
- [ ] 🎯 Monitoring setup

---

## FAQ

**Q: Berapa lama setup Resend?**
A: 5 menit untuk basic setup. 1-2 hari untuk custom domain (DNS propagation).

**Q: Apakah Resend gratis selamanya?**
A: Ya! Free tier (3,000 emails/bulan) gratis selamanya, no credit card required.

**Q: Kenapa tidak pakai Supabase Auth Email saja?**
A: Supabase Auth Email perlu SMTP setup dan kurang flexible. Resend lebih modern dan better deliverability.

**Q: Email template bisa disesuaikan?**
A: Ya! Edit di `supabase/functions/member-forgot-password/index.ts`

**Q: Bagaimana cara monitoring email deliverability?**
A: Via Resend Dashboard → Emails. Lihat delivered/bounced/spam rate.

**Q: Apakah aman untuk production?**
A: Ya! Resend adalah email service provider modern yang digunakan banyak startup dan companies.

**Q: Bagaimana jika exceed 3,000 emails/bulan?**
A: Upgrade ke paid plan ($20/month untuk 50,000 emails) atau optimasi usage.

**Q: Custom domain wajib?**
A: Tidak wajib untuk testing/MVP. Tapi sangat recommended untuk production (better deliverability).

---

## Support & Resources

**Resend:**
- Website: https://resend.com
- Docs: https://resend.com/docs
- API Ref: https://resend.com/docs/api-reference
- Status: https://status.resend.com
- Support: support@resend.com

**Supabase:**
- Dashboard: https://supabase.com/dashboard
- Edge Functions: https://supabase.com/docs/guides/functions

**CTGOLD:**
- Edge Function: `supabase/functions/member-forgot-password/index.ts`
- Frontend: `src/pages/ForgotPassword.tsx`
- Profiles table: `profiles`

---

## Summary

### What You Need to Do:

1. **Sign up Resend** (2 min) → https://resend.com/signup
2. **Create API Key** (1 min) → Dashboard → API Keys → Create
3. **Add to Supabase** (2 min) → Project Settings → Edge Functions → Secrets
4. **Test** (1 min) → Send forgot password email

**Total Time: 5-10 minutes** ⚡

### What Happens After:

- ✅ Forgot password emails sent via Resend
- ✅ Professional email template with CTGOLD branding
- ✅ Better deliverability (tidak masuk spam)
- ✅ Real-time monitoring via Resend dashboard
- ✅ Scalable (3,000 emails/bulan gratis)

### Optional Next Steps:

- 🎯 Setup custom domain (noreply@ctgold.io)
- 🎯 Configure DNS records for better deliverability
- 🎯 Customize email template
- 🎯 Setup monitoring/alerting

---

**Status:** Ready to deploy ✅
**Last Updated:** 2026-01-05
**Version:** 2.0 (with profiles table & new edge function)
