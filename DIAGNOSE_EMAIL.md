# Diagnosa: Email Belum Terkirim

## Status Check ✅

### 1. Edge Function: **DEPLOYED** ✅
- Function: `admin-forgot-password-resend`
- Status: ACTIVE

### 2. Database: **READY** ✅
- Admin email: `ctgold@gmail.com`
- Status: Active
- Role: super_admin

### 3. Environment Variable: **PERLU DICEK** ⚠️

---

## Kemungkinan Penyebab

### A. RESEND_API_KEY Belum Dikonfigurasi (PALING MUNGKIN)

**Cek ini dulu:**

1. **Login ke Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/popbrkxeqstwvympjucc

2. **Buka Settings → Edge Functions → Secrets**
   - Lihat apakah ada: `RESEND_API_KEY`
   - Jika TIDAK ADA → Ini penyebabnya!

3. **Setup Resend API Key:**

   **Step 1:** Buat akun di Resend
   ```
   https://resend.com/signup
   ```

   **Step 2:** Get API Key
   ```
   https://resend.com/api-keys
   ```
   Klik "Create API Key" → Copy key (format: `re_xxxxxxxxxxxxx`)

   **Step 3:** Set di Supabase
   - Dashboard → Project Settings → Edge Functions
   - Add Secret:
     - Name: `RESEND_API_KEY`
     - Value: `re_xxxxxxxxxxxxx` (paste key dari Resend)
   - Save

   **Step 4 (Optional):** Set custom from email
   - Name: `RESEND_FROM_EMAIL`
   - Value: `CTGOLD Security <no-reply@resend.dev>`

---

### B. Belum Test Kirim Email

**Sudah coba kirim email belum?** Ada 2 cara:

**Cara 1: Web Test Tool** (Termudah)
```bash
1. Buka file: test-email-send.html di browser
2. Function: pilih "admin-forgot-password-resend"
3. Email: ctgold@gmail.com
4. Klik "Send Test Email"
```

**Cara 2: cURL** (Command line)
```bash
curl -X POST https://popbrkxeqstwvympjucc.supabase.co/functions/v1/admin-forgot-password-resend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvcGJya3hlcXN0d3Z5bXBqdWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NDgzNDIsImV4cCI6MjA4MzEyNDM0Mn0.teya7h6ZgdfJ1CAb-av2pXL7mrlKpk0wAU1WXl46nbo" \
  -d '{"email": "ctgold@gmail.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Link reset password telah dikirim ke email Anda."
}
```

**Jika Error:**
```json
{
  "error": "Email service not configured"
}
```
→ Berarti `RESEND_API_KEY` belum di-set!

---

### C. Email Masuk Spam Folder

Jika sudah kirim tapi belum terima:
1. **Check spam/junk folder**
2. **Check Resend Dashboard:**
   - Login: https://resend.com/emails
   - Lihat status email:
     - ✅ Sent → Email terkirim
     - ⚠️ Bounced → Email invalid
     - ⚠️ Rejected → Ada masalah

---

### D. Admin Email Salah

**Cek admin yang terdaftar:**
```sql
SELECT email, full_name, role, is_active
FROM admins
WHERE is_active = true;
```

Pastikan email yang ditest ada di database.

---

## Quick Fix Steps

### 🚀 Langkah Cepat (5 Menit)

1. **Setup Resend API Key:**
   ```
   - Daftar: https://resend.com/signup
   - Get key: https://resend.com/api-keys
   - Set di Supabase Dashboard
   ```

2. **Test kirim email:**
   ```
   - Buka: test-email-send.html
   - Email: ctgold@gmail.com
   - Klik: Send Test Email
   ```

3. **Check inbox:**
   ```
   - Subject: 🔐 Reset Password Admin CTGOLD
   - From: CTGOLD Security
   - Check spam jika tidak ada di inbox
   ```

4. **Jika masih gagal, check logs:**
   ```
   Supabase Dashboard → Edge Functions → admin-forgot-password-resend → Logs
   ```

---

## Error Messages & Solutions

### Error 1: "Email service not configured"
**Penyebab:** `RESEND_API_KEY` belum di-set
**Solusi:** Set API key di Supabase Dashboard → Settings → Edge Functions → Secrets

### Error 2: "Terjadi kesalahan server"
**Penyebab:** Function error / Resend API error
**Solusi:** Check Supabase function logs untuk detail error

### Error 3: "Format email tidak valid"
**Penyebab:** Email format salah
**Solusi:** Gunakan email valid (contoh: user@domain.com)

### Error 4: Email tidak masuk
**Penyebab:** Masuk spam / Resend rate limit / Domain tidak verified
**Solusi:**
- Check spam folder
- Check Resend dashboard untuk delivery status
- Verify domain di Resend (untuk production)

---

## Testing Checklist

- [ ] RESEND_API_KEY sudah di-set di Supabase
- [ ] Admin email (ctgold@gmail.com) terdaftar di database
- [ ] Edge function deployed dan ACTIVE
- [ ] Sudah coba kirim test email
- [ ] Sudah check inbox + spam folder
- [ ] Sudah check Resend dashboard

---

## Support Links

- **Resend Signup:** https://resend.com/signup
- **Resend API Keys:** https://resend.com/api-keys
- **Resend Dashboard:** https://resend.com/emails
- **Resend Docs:** https://resend.com/docs/send-with-nodejs
- **Supabase Dashboard:** https://supabase.com/dashboard/project/popbrkxeqstwvympjucc

---

## Next: Actual Test

**Setelah setup RESEND_API_KEY, buka test-email-send.html dan test!**

Kalau masih error, share error message yang muncul.
