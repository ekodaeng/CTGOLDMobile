# Email Test Guide - CTGOLD Admin Reset Password

## Quick Test Options

### Option 1: Web-Based Test Tool (Recommended)

1. Open file: `test-email-send.html` di browser
2. Select edge function: `admin-forgot-password-resend`
3. Input test email: `ctgold@gmail.com` (atau admin email lain)
4. Click "Send Test Email"
5. Check inbox

**File Location:** `/test-email-send.html`

---

### Option 2: cURL Command Line

```bash
# Test dengan Resend (NEW)
curl -X POST https://popbrkxeqstwvympjucc.supabase.co/functions/v1/admin-forgot-password-resend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvcGJya3hlcXN0d3Z5bXBqdWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NDgzNDIsImV4cCI6MjA4MzEyNDM0Mn0.teya7h6ZgdfJ1CAb-av2pXL7mrlKpk0wAU1WXl46nbo" \
  -d '{"email": "ctgold@gmail.com"}'

# Test dengan Supabase Auth (Original)
curl -X POST https://popbrkxeqstwvympjucc.supabase.co/functions/v1/admin-forgot-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvcGJya3hlcXN0d3Z5bXBqdWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NDgzNDIsImV4cCI6MjA4MzEyNDM0Mn0.teya7h6ZgdfJ1CAb-av2pXL7mrlKpk0wAU1WXl46nbo" \
  -d '{"email": "ctgold@gmail.com"}'
```

---

### Option 3: Frontend Test (Production-like)

1. Navigate to: `https://your-domain.com/admin/forgot-password`
2. Input email: `ctgold@gmail.com`
3. Click "Kirim Link Reset Password"
4. Check success message
5. Check email inbox

---

## Pre-Deployment Checklist

### ✅ Before Testing

- [ ] **Resend Account Setup**
  - Create account at [resend.com](https://resend.com)
  - Get API key
  - Verify domain (optional for production)

- [ ] **Supabase Environment Variables**
  ```bash
  RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  RESEND_FROM_EMAIL=CTGOLD Security <no-reply@ctgold.io>
  ```

- [ ] **Deploy Edge Function**
  - Function: `admin-forgot-password-resend`
  - Status: Deployed ✅

- [ ] **Database Setup**
  - Table: `admin_reset_tokens` created ✅
  - Table: `admins` has test admin
  - Test email registered in `admins` table

- [ ] **Test Admin Exists**
  ```sql
  SELECT email, full_name, role, is_active
  FROM admins
  WHERE email = 'ctgold@gmail.com';
  ```

---

## Deploy Edge Function

### Via Bolt.new/Supabase Dashboard

1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Deploy `admin-forgot-password-resend`
4. Set environment variables

### Check Deployment Status

```bash
# List all edge functions
curl https://popbrkxeqstwvympjucc.supabase.co/functions/v1/ \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

---

## Expected Response

### Success Response
```json
{
  "success": true,
  "message": "Link reset password telah dikirim ke email Anda."
}
```

### Error Responses

**Missing Email:**
```json
{
  "error": "Email wajib diisi"
}
```

**Invalid Email Format:**
```json
{
  "error": "Format email tidak valid"
}
```

**Server Error:**
```json
{
  "error": "Terjadi kesalahan server"
}
```

---

## Email Verification Checklist

### ✅ When Email Arrives

1. **Delivery Check**
   - [ ] Email received in inbox (not spam)
   - [ ] Subject: "🔐 Reset Password Admin CTGOLD"
   - [ ] From: "CTGOLD Security <no-reply@ctgold.io>"

2. **Design Check**
   - [ ] Dark background (#070A0F)
   - [ ] Gold accent card (#0B0F1A with gold border)
   - [ ] Lock icon 🔐 visible
   - [ ] "Reset Password Admin" heading
   - [ ] Gold gradient button visible
   - [ ] Mobile responsive

3. **Content Check**
   - [ ] Greeting: "Halo Admin CTGOLD"
   - [ ] Reset button present
   - [ ] Fallback link present
   - [ ] Security notice present (15 minutes, 1 time use)
   - [ ] Footer text present
   - [ ] Year displayed correctly

4. **Functionality Check**
   - [ ] Button "Reset Password" clickable
   - [ ] Link redirects to: `/admin/reset-password?token=xxx`
   - [ ] Fallback link works
   - [ ] No broken images
   - [ ] No layout issues

5. **Email Client Compatibility**
   - [ ] Gmail (desktop)
   - [ ] Gmail (mobile)
   - [ ] Outlook (desktop)
   - [ ] Apple Mail
   - [ ] Yahoo Mail

---

## Test Scenarios

### Scenario 1: Valid Admin Email
```bash
Email: ctgold@gmail.com (exists in admins table)
Expected: ✅ Success - Email sent
Result: Link delivered to inbox
```

### Scenario 2: Invalid Email
```bash
Email: notadmin@example.com (not in admins table)
Expected: ✅ Success (security by obscurity)
Result: Same success message, but no email sent
```

### Scenario 3: Inactive Admin
```bash
Email: inactive@ctgold.io (is_active = false)
Expected: ✅ Success (security by obscurity)
Result: Same success message, but no email sent
```

### Scenario 4: Malformed Email
```bash
Email: notanemail
Expected: ❌ Error - "Format email tidak valid"
Result: 400 Bad Request
```

### Scenario 5: Rate Limiting
```bash
Send multiple requests rapidly
Expected: May hit Resend rate limit (100/day free tier)
Result: Check Resend dashboard for delivery status
```

---

## Troubleshooting

### Email Not Received

1. **Check Spam Folder**
   - SPF/DKIM not configured → may land in spam
   - Add sender to contacts

2. **Check Resend Dashboard**
   - Login to resend.com
   - Check "Emails" → Recent sends
   - Status: Sent, Delivered, Bounced, Complained

3. **Check Supabase Logs**
   - Supabase Dashboard → Edge Functions → Logs
   - Look for function execution logs
   - Check for errors

4. **Check Database**
   ```sql
   -- Check if admin exists
   SELECT * FROM admins WHERE email = 'test@example.com';

   -- Check tokens created
   SELECT * FROM admin_reset_tokens
   WHERE admin_id IN (
     SELECT user_id FROM admins WHERE email = 'test@example.com'
   )
   ORDER BY created_at DESC
   LIMIT 5;
   ```

### Function Not Working

1. **Check Environment Variables**
   ```bash
   # Supabase Dashboard → Settings → Edge Functions
   RESEND_API_KEY = re_xxx... (set?)
   RESEND_FROM_EMAIL = ... (set?)
   ```

2. **Check Function Deployment**
   - Function name: `admin-forgot-password-resend`
   - Status: Deployed
   - Latest version deployed

3. **Check CORS**
   - Function should return CORS headers
   - Check browser console for CORS errors

4. **Check API Key**
   - Resend API key valid
   - Not expired
   - Has sending permissions

---

## Success Metrics

### ✅ Test Passed If:

1. Email delivered in < 5 seconds
2. Email not in spam folder
3. Design matches requirements (dark + gold)
4. All content present and readable
5. Button and links functional
6. Mobile responsive
7. Security notice visible
8. Token expires in 15 minutes
9. Token is single-use
10. Consistent response for valid/invalid emails

---

## Next Steps After Testing

1. ✅ Verify email design
2. ✅ Test reset password flow end-to-end
3. ✅ Update frontend to use new endpoint (if needed)
4. ✅ Monitor Resend dashboard
5. ✅ Setup domain verification (production)
6. ✅ Configure SPF/DKIM (production)
7. ✅ Add rate limiting (if needed)
8. ✅ Setup monitoring alerts

---

## Production Checklist

### Before Going Live

- [ ] Domain verified in Resend
- [ ] SPF record configured
- [ ] DKIM record configured
- [ ] Custom from email: `no-reply@ctgold.io`
- [ ] Rate limiting configured
- [ ] Error monitoring setup
- [ ] Email delivery monitoring
- [ ] Backup email provider (optional)

---

## Support

### Need Help?

1. **Resend Support**
   - Docs: https://resend.com/docs
   - Discord: https://resend.com/discord

2. **Check Logs**
   - Supabase Edge Function logs
   - Browser console
   - Resend dashboard

3. **Common Issues**
   - API key not set → Check environment variables
   - Email not delivered → Check Resend dashboard
   - Wrong email design → Clear browser cache
   - Token not working → Check expiry time

---

**Ready to Test!** 🚀

Open `test-email-send.html` atau gunakan cURL command di atas.
