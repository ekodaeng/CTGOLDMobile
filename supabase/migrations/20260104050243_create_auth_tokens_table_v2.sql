/*
  # Create Auth Tokens Table for Password Reset

  1. New Tables
    - `auth_tokens`
      - `id` (uuid, primary key) - Unique token identifier
      - `member_id` (uuid, not null) - References members table
      - `token_hash` (text, not null) - Hashed token (SHA-256)
      - `type` (text, not null) - Token type: APPROVE_MEMBER | RESET_PASSWORD
      - `expires_at` (timestamptz, not null) - Token expiration time
      - `used_at` (timestamptz, nullable) - When token was used
      - `created_at` (timestamptz, not null) - Token creation time
      - `metadata` (jsonb, nullable) - Additional metadata
      
  2. Constraints & Indexes
    - Primary key on `id`
    - Foreign key to `members(id)` with cascade delete
    - Unique constraint on `token_hash`
    - Index on `member_id` for fast lookups
    - Index on `type` for filtering
    - Index on `expires_at` for cleanup queries
    - Index on `member_id, type` for active token queries
    
  3. Members Table Enhancement
    - Add `reset_requested_at` column to track reset requests
    
  4. Security
    - Enable RLS on `auth_tokens` table
    - No public access - only service_role can read/write
    - Tokens are hashed before storage (never plaintext)
    
  5. Important Notes
    - Tokens expire after 30 minutes by default
    - Used tokens cannot be reused (check `used_at`)
    - Expired tokens are automatically invalid
    - Application logic handles one active reset token per member
*/

-- Create auth_tokens table
CREATE TABLE IF NOT EXISTS public.auth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  type text NOT NULL CHECK (type IN ('APPROVE_MEMBER', 'RESET_PASSWORD')),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_tokens_member_id ON public.auth_tokens(member_id);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_type ON public.auth_tokens(type);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON public.auth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_member_type ON public.auth_tokens(member_id, type);

-- Unique constraint on token_hash
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_tokens_token_hash_unique ON public.auth_tokens(token_hash);

-- Add reset_requested_at column to members table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'reset_requested_at'
  ) THEN
    ALTER TABLE public.members ADD COLUMN reset_requested_at timestamptz;
  END IF;
END $$;

-- Enable RLS on auth_tokens
ALTER TABLE public.auth_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only service_role can access
-- No public or authenticated user access to prevent token enumeration

CREATE POLICY "Service role can read all auth tokens"
  ON public.auth_tokens FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert auth tokens"
  ON public.auth_tokens FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update auth tokens"
  ON public.auth_tokens FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete auth tokens"
  ON public.auth_tokens FOR DELETE
  TO service_role
  USING (true);

-- Create function to clean up expired tokens (optional, for maintenance)
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.auth_tokens
  WHERE expires_at < now() - interval '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Grant execute to service_role only
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_tokens() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_tokens() TO service_role;

-- Add comments for documentation
COMMENT ON TABLE public.auth_tokens IS 'Stores hashed authentication tokens for password reset and member approval. Tokens are single-use and time-limited.';
COMMENT ON COLUMN public.auth_tokens.token_hash IS 'SHA-256 hash of the raw token. Never store plaintext tokens.';
COMMENT ON COLUMN public.auth_tokens.type IS 'Token type: APPROVE_MEMBER for member activation, RESET_PASSWORD for password reset';
COMMENT ON COLUMN public.auth_tokens.expires_at IS 'Token expiration timestamp. Typically 30 minutes for reset tokens.';
COMMENT ON COLUMN public.auth_tokens.used_at IS 'Timestamp when token was successfully used. NULL means unused.';
COMMENT ON COLUMN public.auth_tokens.metadata IS 'Additional data: IP address, user agent, etc.';