# Admin Authentication Implementation

This document describes the secure backend admin authentication system using Supabase Edge Functions with email whitelist validation and Bearer token authentication.

## Architecture Overview

The implementation uses:
- **Email Whitelist**: Only pre-approved emails can access admin area
- **Bearer Token Authentication**: Session tokens stored in localStorage and sent via Authorization header
- **Signed JWT Sessions**: Custom HMAC-SHA256 signed session tokens (7-day expiration)
- **Service Role Security**: All admin operations use SUPABASE_SERVICE_ROLE_KEY server-side only

## Environment Variables

The following environment variables are configured:

### Client-Side (VITE_ prefix)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_ADMIN_EMAIL_WHITELIST` - Comma-separated list of admin emails
- `VITE_SUPER_ADMIN_EMAIL_WHITELIST` - Comma-separated list of super admin emails

### Server-Side (Edge Functions only)
- `ADMIN_EMAIL_WHITELIST` - ctgold@gmail.com,ironxft@gmail.com
- `SUPER_ADMIN_EMAIL_WHITELIST` - ctgold@gmail.com
- `ADMIN_SESSION_SECRET` - Secret key for signing session tokens (min 32 chars)
- `ADMIN_SESSION_COOKIE_NAME` - ctgold_admin_session
- `SUPABASE_URL` - Auto-configured by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-configured by Supabase

## Database Schema

### admins Table
```sql
CREATE TABLE public.admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin' NOT NULL,
  is_active boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  full_name text
);
```

### profiles Table
The profiles table stores member information with status tracking (PENDING, ACTIVE, SUSPENDED).

## API Endpoints

All endpoints are Supabase Edge Functions accessible at:
`https://popbrkxeqstwvympjucc.supabase.co/functions/v1/{function-name}`

### 1. POST /functions/v1/admin-login-v2

Login endpoint with whitelist validation.

**Request:**
```json
{
  "email": "ctgold@gmail.com",
  "password": "your-password"
}
```

**Response (Success):**
```json
{
  "ok": true,
  "token": "eyJlbWFpbCI6ImN0Z29sZEBnbWFpbC5jb20iLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJ1c2VyX2lkIjoidXVpZCIsImlhdCI6MTcwMTIzNDU2Nzg5MCwiZXhwIjoxNzAxODM5MzY3ODkwfQ.c2lnbmF0dXJl",
  "role": "super_admin",
  "email": "ctgold@gmail.com",
  "user_id": "uuid"
}
```

**Response (Error):**
```json
{
  "ok": false,
  "error": "Email not authorized for admin access",
  "error_code": "ACCESS_DENIED"
}
```

**Security:**
- Validates email against whitelist BEFORE authentication
- Returns 403 if email not whitelisted
- Creates/updates admin record in database
- Returns signed session token for localStorage storage
- Never exposes Supabase auth tokens to client

### 2. GET /functions/v1/admin-session-v2

Verify current session.

**Request:**
```
Authorization: Bearer {token}
```

No body required.

**Response (Success):**
```json
{
  "ok": true,
  "email": "ctgold@gmail.com",
  "role": "super_admin",
  "user_id": "uuid"
}
```

**Response (No Token):**
```json
{
  "ok": false,
  "error": "No authorization token found",
  "error_code": "NO_TOKEN"
}
```

### 3. POST /functions/v1/admin-logout-v2

Logout endpoint.

**Request:**
No body required.

**Response:**
```json
{
  "ok": true
}
```

**Note:**
- Client should remove token from localStorage after calling this endpoint

### 4. GET /functions/v1/admin-members-pending

List all pending member registrations.

**Request:**
```
Authorization: Bearer {token}
```

No body required. Requires valid admin token.

**Response (Success):**
```json
{
  "ok": true,
  "members": [
    {
      "id": "uuid",
      "email": "member@example.com",
      "full_name": "John Doe",
      "city": "Jakarta",
      "created_at": "2026-01-05T12:00:00Z"
    }
  ]
}
```

**Security:**
- Requires admin or super_admin role
- Uses SERVICE_ROLE_KEY to bypass RLS

### 5. POST /functions/v1/admin-members-approve

Approve a pending member.

**Request:**
```json
{
  "userId": "uuid"
}
```

**Response (Success):**
```json
{
  "ok": true
}
```

**Security:**
- Requires admin or super_admin role
- Updates profile status to 'ACTIVE'

### 6. POST /functions/v1/admin-members-reject

Reject a pending member.

**Request:**
```json
{
  "userId": "uuid"
}
```

**Response (Success):**
```json
{
  "ok": true
}
```

**Security:**
- Requires admin or super_admin role
- Updates profile status to 'SUSPENDED'

## Security Features

### 1. Email Whitelist
- Hardcoded list of allowed admin emails
- Checked BEFORE password validation
- Prevents unauthorized login attempts

### 2. Bearer Token Authentication
- Session token stored in localStorage
- Sent via Authorization header (Bearer scheme)
- Client manages token lifecycle
- Token is signed and tamper-proof

### 3. Signed Session Tokens
- HMAC-SHA256 signed JWT-like tokens
- Payload includes: email, role, user_id, iat, exp
- 7-day expiration
- Tamper-proof signature verification

### 4. Service Role Key Protection
- SUPABASE_SERVICE_ROLE_KEY never exposed to client
- Used only in edge functions (server-side)
- Bypasses RLS for admin operations

### 5. Role-Based Access Control
- Two roles: 'admin' and 'super_admin'
- Super admin: emails in SUPER_ADMIN_EMAIL_WHITELIST
- Regular admin: emails in ADMIN_EMAIL_WHITELIST but not in super admin list

## Testing Checklist

### 1. Login Tests
- [ ] Login with whitelisted email succeeds
- [ ] Login with non-whitelisted email returns 403
- [ ] Login with wrong password returns 401
- [ ] Token is returned after successful login
- [ ] Role is correctly determined (admin vs super_admin)

### 2. Session Tests
- [ ] Valid token returns user info
- [ ] Expired token returns 401
- [ ] Tampered token returns 401
- [ ] No Authorization header returns 401

### 3. Logout Tests
- [ ] Logout returns success
- [ ] After logout, client removes token from localStorage
- [ ] After token removal, session verification fails

### 4. Member Management Tests
- [ ] Pending members list shows only PENDING status
- [ ] Approve changes status to ACTIVE
- [ ] Reject changes status to SUSPENDED
- [ ] All operations require valid admin session

### 5. Security Tests
- [ ] Token signature cannot be forged
- [ ] Expired tokens are rejected
- [ ] Whitelist validation prevents unauthorized access
- [ ] Service role key never exposed to client
- [ ] Supabase auth tokens never returned to client

## Frontend Integration Example

```typescript
const PROJECT_REF = "popbrkxeqstwvympjucc";
const FN_BASE = `https://${PROJECT_REF}.supabase.co/functions/v1`;

// Login
const response = await fetch(`${FN_BASE}/admin-login-v2`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'ctgold@gmail.com',
    password: 'your-password'
  })
});

const data = await response.json();
if (data.ok) {
  // Store token in localStorage
  localStorage.setItem('ctgold_admin_token', data.token);
  // Redirect to admin dashboard
  window.location.href = '/admin/dashboard';
} else {
  throw new Error(data.error || 'LOGIN_FAILED');
}

// Verify Session
async function requireAdmin() {
  const token = localStorage.getItem('ctgold_admin_token');
  if (!token) {
    window.location.href = '/admin/login';
    return;
  }

  const response = await fetch(`${FN_BASE}/admin-session-v2`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!data.ok) {
    localStorage.removeItem('ctgold_admin_token');
    window.location.href = '/admin/login';
  }
  return data;
}

// Use in admin pages
requireAdmin();

// Logout
async function logout() {
  const response = await fetch(`${FN_BASE}/admin-logout-v2`, {
    method: 'POST'
  });

  if (response.ok) {
    localStorage.removeItem('ctgold_admin_token');
    window.location.href = '/admin/login';
  }
}

// Fetch pending members
async function getPendingMembers() {
  const token = localStorage.getItem('ctgold_admin_token');
  const response = await fetch(`${FN_BASE}/admin-members-pending`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.error);
  }
  return data.members;
}

// Approve member
async function approveMember(userId: string) {
  const token = localStorage.getItem('ctgold_admin_token');
  const response = await fetch(`${FN_BASE}/admin-members-approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ userId })
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.error);
  }
  return data;
}

// Reject member
async function rejectMember(userId: string) {
  const token = localStorage.getItem('ctgold_admin_token');
  const response = await fetch(`${FN_BASE}/admin-members-reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ userId })
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.error);
  }
  return data;
}
```

## CORS Configuration

All endpoints include proper CORS headers:
```javascript
{
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
  'Access-Control-Allow-Credentials': 'true'
}
```

**IMPORTANT:** Include `Authorization: Bearer {token}` header in all authenticated requests.

## Files Created

### Edge Functions
- `/supabase/functions/admin-login-v2/index.ts`
- `/supabase/functions/admin-session-v2/index.ts`
- `/supabase/functions/admin-logout-v2/index.ts`
- `/supabase/functions/admin-members-pending/index.ts`
- `/supabase/functions/admin-members-approve/index.ts`
- `/supabase/functions/admin-members-reject/index.ts`

### Shared Utilities (included in each function)
- `whitelist.ts` - Email whitelist validation
- `session.ts` - Session token signing/verification
- `cors.ts` - CORS headers configuration

### Database Migration
- `add_admin_approval_tracking.sql` - Adds approved_by and approved_at columns

## Production Deployment Notes

1. **Change ADMIN_SESSION_SECRET** in production to a secure random string (minimum 32 characters)
2. Ensure CORS origin is restricted to your domain in production
3. Enable HTTPS for all endpoints (automatic with Supabase)
4. Regularly audit the email whitelist
5. Monitor edge function logs for suspicious activity

## Troubleshooting

### Token not being returned
- Check that login response contains `token` field
- Verify ADMIN_SESSION_SECRET is configured in Supabase
- Check browser console for errors

### Session verification fails
- Check ADMIN_SESSION_SECRET is set correctly
- Verify token is being sent in Authorization header
- Ensure token hasn't expired (7 days)
- Check token is prefixed with "Bearer "

### Whitelist not working
- Verify email is lowercase and trimmed
- Check ADMIN_EMAIL_WHITELIST format (comma-separated, no spaces)
- Ensure environment variables are set in Supabase dashboard

### Token in localStorage not persisting
- Check browser's localStorage is not disabled
- Verify domain matches between login and dashboard pages
- Check for localStorage clear operations in code
