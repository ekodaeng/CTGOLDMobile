/*
  # Create Admin Reset Password Tokens Table

  1. New Tables
    - `admin_reset_tokens`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, foreign key to admins.user_id)
      - `token` (text, unique, indexed)
      - `expires_at` (timestamptz)
      - `used` (boolean, default false)
      - `used_at` (timestamptz, nullable)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `admin_reset_tokens` table
    - No public access (only service role can access)
    - Secure token storage with expiry
    - Single-use tokens

  3. Indexes
    - Index on `token` for fast lookup
    - Index on `expires_at` for cleanup queries
    - Index on `admin_id` for admin lookups
*/

-- Create admin_reset_tokens table
CREATE TABLE IF NOT EXISTS admin_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES admins(user_id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_reset_tokens_token ON admin_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_admin_reset_tokens_admin_id ON admin_reset_tokens(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_reset_tokens_expires_at ON admin_reset_tokens(expires_at);

-- Enable RLS
ALTER TABLE admin_reset_tokens ENABLE ROW LEVEL SECURITY;

-- No policies needed - only service role should access this table
-- All access will be through edge functions with service role key

-- Function to clean up expired tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_admin_reset_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM admin_reset_tokens
  WHERE expires_at < now() - interval '24 hours';
END;
$$;

-- Add comment
COMMENT ON TABLE admin_reset_tokens IS 'Stores temporary reset password tokens for admin users';
COMMENT ON FUNCTION cleanup_expired_admin_reset_tokens IS 'Cleans up expired reset tokens older than 24 hours';
