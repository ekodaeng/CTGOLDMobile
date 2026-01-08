# Quick Test Email - Admin Reset Password

## Status: Ready to Test ✅

Edge function `admin-forgot-password-resend` is deployed and ready for testing.

---

## Setup Checklist

Before testing, ensure these are configured in Supabase:

### 1. Resend API Key (REQUIRED)
```bash
# Get from: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. From Email (Optional)
```bash
# Default: CTGOLD Security <no-reply@resend.dev>
# Custom: CTGOLD Security <no-reply@ctgold.io>
RESEND_FROM_EMAIL=CTGOLD Security <no-reply@resend.dev>
```

---

## How to Test

### Option 1: Web Test Tool (Easiest)

1. Open `test-email-send.html` in browser
2. Select: `admin-forgot-password-resend`
3. Enter email: `ctgold@gmail.com`
4. Click "Send Test Email"
5. Check inbox

### Option 2: cURL (Command Line)

```bash
curl -X POST https://popbrkxeqstwvympjucc.supabase.co/functions/v1/admin-forgot-password-resend \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvcGJya3hlcXN0d3Z5bXBqdWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NDgzNDIsImV4cCI6MjA4MzEyNDM0Mn0.teya7h6ZgdfJ1CAb-av2pXL7mrlKpk0wAU1WXl46nbo" \
  -d '{"email": "ctgold@gmail.com"}'
```

### Option 3: Frontend (Production)

1. Go to: `/admin/forgot-password`
2. Update endpoint to use `admin-forgot-password-resend`
3. Test the flow

---

## What You'll See

### Success Response
```json
{
  "success": true,
  "message": "Link reset password telah dikirim ke email Anda."
}
```

### Email Content
- **Subject:** 🔐 Reset Password Admin CTGOLD
- **From:** CTGOLD Security
- **Design:** Dark + Gold premium theme
- **Button:** Reset Password (gold gradient)
- **Link expires:** 15 minutes
- **Single-use:** Token used only once

---

## Troubleshooting

### "Email service not configured"
→ Set `RESEND_API_KEY` in Supabase environment variables

### Email not received
→ Check Resend dashboard: https://resend.com/emails
→ Check spam folder
→ Verify email is registered in `admins` table

### Wrong domain/design
→ Clear browser cache
→ Re-deploy edge function

---

## Quick Links

- **Test Tool:** `test-email-send.html`
- **Setup Guide:** `RESEND_EMAIL_SETUP.md`
- **Full Test Guide:** `EMAIL_TEST_GUIDE.md`
- **Resend Dashboard:** https://resend.com/emails

---

## Next Steps After Testing

1. Verify email design matches requirements
2. Test reset password link works
3. Confirm token expires after 15 minutes
4. Verify single-use token enforcement
5. Setup custom domain (production)
6. Configure SPF/DKIM (production)

---

**Ready to test! Open `test-email-send.html` or use cURL command above.**
