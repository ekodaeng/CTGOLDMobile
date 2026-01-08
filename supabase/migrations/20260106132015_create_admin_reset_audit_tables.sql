/*
  # Admin Password Reset & Audit Tables

  1. New Tables
    - `admin_password_reset_tokens`
      - `id` (bigserial, primary key)
      - `email` (text) - Admin email requesting reset
      - `token_hash` (text, unique) - Hashed reset token
      - `created_at` (timestamptz) - Token creation time
      - `expires_at` (timestamptz) - Token expiration time
      - `used_at` (timestamptz, nullable) - When token was used
      - `request_ip` (text, nullable) - IP address of requester
      - `user_agent` (text, nullable) - Browser user agent
      
    - `admin_audit_logs`
      - `id` (bigserial, primary key)
      - `created_at` (timestamptz) - Log timestamp
      - `action` (text) - Action performed (e.g., 'password_reset', 'login')
      - `actor_email` (text, nullable) - Who performed the action
      - `target_email` (text, nullable) - Who was affected
      - `ip` (text, nullable) - IP address
      - `user_agent` (text, nullable) - Browser user agent
      - `meta` (jsonb, nullable) - Additional metadata

  2. Indexes
    - `idx_admin_prt_email` - Fast lookup by email
    - `idx_admin_prt_expires` - Fast lookup for expired tokens cleanup
    - `idx_admin_audit_action` - Fast filtering by action type
    - `idx_admin_audit_target` - Fast lookup by target email

  3. Security
    - Enable RLS on both tables
    - `admin_password_reset_tokens`: No direct access policies (service role only)
    - `admin_audit_logs`: Read-only for authenticated admins via service

  4. Notes
    - Reset tokens are hashed for security
    - Tokens expire after set duration (managed by application)
    - Audit logs provide complete activity trail
    - Both tables are append-only for security
*/

-- 1) Reset token table
create table if not exists admin_password_reset_tokens (
  id bigserial primary key,
  email text not null,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz null,
  request_ip text null,
  user_agent text null
);

create index if not exists idx_admin_prt_email on admin_password_reset_tokens(email);
create index if not exists idx_admin_prt_expires on admin_password_reset_tokens(expires_at);

-- Enable RLS
alter table admin_password_reset_tokens enable row level security;

-- No public policies - service role only
-- This table is only accessed by edge functions with service role key

-- 2) Simple audit log table
create table if not exists admin_audit_logs (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  action text not null,
  actor_email text null,
  target_email text null,
  ip text null,
  user_agent text null,
  meta jsonb null
);

create index if not exists idx_admin_audit_action on admin_audit_logs(action);
create index if not exists idx_admin_audit_target on admin_audit_logs(target_email);

-- Enable RLS
alter table admin_audit_logs enable row level security;

-- No public policies - service role only
-- This table is only accessed by edge functions and admin dashboard with service role