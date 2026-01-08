/*
  # Member Authentication & Management System

  1. New Tables
    - `members`
      - `id` (uuid, primary key, auto-generated)
      - `member_code` (text, unique, auto-generated format: CTG-YYYY-####)
      - `full_name` (text, member's full name)
      - `email` (text, unique, for login)
      - `phone` (text, optional contact number)
      - `telegram_username` (text, optional telegram handle)
      - `password_hash` (text, bcrypt hashed password)
      - `role` (text, enum: MEMBER or ADMIN, default MEMBER)
      - `status` (text, enum: PENDING, ACTIVE, SUSPENDED, default PENDING)
      - `created_at` (timestamptz, account creation time)
      - `updated_at` (timestamptz, last profile update)
      - `last_login_at` (timestamptz, nullable, last successful login)

    - `member_logs`
      - `id` (uuid, primary key, auto-generated)
      - `member_id` (uuid, foreign key to members.id)
      - `action` (text, action type: REGISTER, LOGIN, LOGOUT, STATUS_CHANGE, UPDATE_PROFILE)
      - `metadata` (jsonb, optional additional data)
      - `created_at` (timestamptz, when action occurred)

  2. Security
    - Enable RLS on both tables
    - Members can read their own data
    - Members can update their own profile (except role and status)
    - Admins can read and manage all members
    - Member logs are readable by the member themselves and all admins
    
  3. Functions
    - Auto-generate member_code on insert using trigger
    - Auto-update updated_at on profile changes

  4. Important Notes
    - All passwords must be hashed using bcrypt before storing
    - Member codes follow format: CTG-YYYY-#### (e.g., CTG-2026-0001)
    - New registrations default to PENDING status requiring admin approval
    - Only ACTIVE members can access premium content
*/

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_code text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  telegram_username text,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('MEMBER', 'ADMIN')),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login_at timestamptz
);

-- Create member_logs table
CREATE TABLE IF NOT EXISTS member_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('REGISTER', 'LOGIN', 'LOGOUT', 'STATUS_CHANGE', 'UPDATE_PROFILE')),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_member_code ON members(member_code);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);
CREATE INDEX IF NOT EXISTS idx_member_logs_member_id ON member_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_member_logs_created_at ON member_logs(created_at DESC);

-- Function to generate member code
CREATE OR REPLACE FUNCTION generate_member_code()
RETURNS text AS $$
DECLARE
  current_year text;
  next_number int;
  new_code text;
BEGIN
  current_year := to_char(now(), 'YYYY');
  
  -- Get the highest number for current year
  SELECT COALESCE(
    MAX(
      CAST(
        substring(member_code from 'CTG-' || current_year || '-(.*)') 
        AS integer
      )
    ), 0
  ) + 1 INTO next_number
  FROM members
  WHERE member_code LIKE 'CTG-' || current_year || '-%';
  
  -- Format: CTG-YYYY-#### (4 digits, zero-padded)
  new_code := 'CTG-' || current_year || '-' || lpad(next_number::text, 4, '0');
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate member_code on insert
CREATE OR REPLACE FUNCTION set_member_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.member_code IS NULL OR NEW.member_code = '' THEN
    NEW.member_code := generate_member_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_member_code
  BEFORE INSERT ON members
  FOR EACH ROW
  EXECUTE FUNCTION set_member_code();

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for members table

-- Members can read their own data
CREATE POLICY "Members can read own data"
  ON members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM members WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Members can update their own profile (except role and status)
CREATE POLICY "Members can update own profile"
  ON members
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM members WHERE id = auth.uid())
    AND status = (SELECT status FROM members WHERE id = auth.uid())
  );

-- Admins can read all members
CREATE POLICY "Admins can read all members"
  ON members
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM members WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Admins can update all members
CREATE POLICY "Admins can update all members"
  ON members
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM members WHERE id = auth.uid() AND role = 'ADMIN'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM members WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- Admins can delete members
CREATE POLICY "Admins can delete members"
  ON members
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM members WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- RLS Policies for member_logs table

-- Members can read their own logs
CREATE POLICY "Members can read own logs"
  ON member_logs
  FOR SELECT
  TO authenticated
  USING (
    member_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM members WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- System can insert logs (will be done via service role)
CREATE POLICY "Authenticated users can insert logs"
  ON member_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins can read all logs
CREATE POLICY "Admins can read all logs"
  ON member_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM members WHERE id = auth.uid() AND role = 'ADMIN'
  ));