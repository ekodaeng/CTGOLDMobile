/*
  # Create profiles table for Supabase Auth integration

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - maps to auth.users.id
      - `member_code` (text, unique) - auto-generated member code (e.g., CTG001)
      - `full_name` (text) - member's full name
      - `email` (text) - member's email
      - `city` (text) - member's city/location
      - `phone` (text, nullable) - member's phone number
      - `telegram_username` (text, nullable) - member's telegram username
      - `role` (text) - MEMBER or ADMIN
      - `status` (text) - PENDING, ACTIVE, or SUSPENDED
      - `created_at` (timestamptz) - account creation timestamp
      - `updated_at` (timestamptz) - last update timestamp
      - `last_login_at` (timestamptz, nullable) - last login timestamp
  
  2. Security
    - Enable RLS on `profiles` table
    - Policy for users to read their own profile
    - Policy for users to update their own profile
    - Admin policies for managing all profiles
  
  3. Triggers
    - Auto-generate member_code on insert
    - Auto-update updated_at on update
  
  4. Functions
    - generate_member_code() - generates unique member code (CTG + sequential number)
  
  5. Notes
    - Integrates with Supabase Auth (auth.users)
    - Default status is PENDING (requires admin activation)
    - Member code format: CTG001, CTG002, etc.
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  member_code text UNIQUE NOT NULL DEFAULT '',
  full_name text NOT NULL,
  email text NOT NULL,
  city text NOT NULL,
  phone text,
  telegram_username text,
  role text NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('MEMBER', 'ADMIN')),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

-- Create index on member_code for faster lookups
CREATE INDEX IF NOT EXISTS profiles_member_code_idx ON profiles(member_code);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS profiles_status_idx ON profiles(status);

-- Function to generate unique member code
CREATE OR REPLACE FUNCTION generate_member_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  max_number integer;
BEGIN
  -- Get the highest member code number
  SELECT COALESCE(MAX(CAST(SUBSTRING(member_code FROM 4) AS INTEGER)), 0)
  INTO max_number
  FROM profiles
  WHERE member_code ~ '^CTG[0-9]+$';
  
  -- Generate new code
  new_code := 'CTG' || LPAD((max_number + 1)::text, 3, '0');
  
  RETURN new_code;
END;
$$;

-- Trigger function to auto-generate member_code
CREATE OR REPLACE FUNCTION trigger_generate_member_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.member_code = '' OR NEW.member_code IS NULL THEN
    NEW.member_code := generate_member_code();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for member_code generation
DROP TRIGGER IF EXISTS set_member_code ON profiles;
CREATE TRIGGER set_member_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_member_code();

-- Trigger function to auto-update updated_at
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_timestamp();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can update their own profile (except role and status)
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM profiles WHERE id = auth.uid()) AND
    status = (SELECT status FROM profiles WHERE id = auth.uid())
  );

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN' AND status = 'ACTIVE'
    )
  );

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN' AND status = 'ACTIVE'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN' AND status = 'ACTIVE'
    )
  );

-- Policy: Service role can insert profiles (for registration)
CREATE POLICY "Service role can insert profiles"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE profiles IS 'User profiles linked to Supabase Auth';
COMMENT ON COLUMN profiles.id IS 'References auth.users.id';
COMMENT ON COLUMN profiles.member_code IS 'Auto-generated unique member code (e.g., CTG001)';
COMMENT ON COLUMN profiles.city IS 'Member city/location (e.g., Makassar, Purbalingga)';
COMMENT ON COLUMN profiles.status IS 'Account status: PENDING (awaiting admin activation), ACTIVE, or SUSPENDED';
