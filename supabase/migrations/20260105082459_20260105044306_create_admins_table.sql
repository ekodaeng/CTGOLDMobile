/*
  # Create Admins Table with Security

  1. New Tables
    - `public.admins`
      - `user_id` (uuid, primary key) - references auth.users(id)
      - `email` (text, unique, not null) - admin email address
      - `role` (text, default 'admin') - admin role type
      - `is_active` (boolean, default false) - activation status
      - `created_at` (timestamp with time zone) - account creation time

  2. Security
    - Enable RLS on `admins` table
    - Policy: Authenticated users can SELECT only their own record
    - Policy: Authenticated users can INSERT only their own record (during registration)
    - UPDATE operations restricted (manual activation via dashboard only)

  3. Notes
    - Admin accounts require activation (is_active=true) before they can access the dashboard
    - Only whitelisted emails can register as admins (validated in application layer)
    - Super admin must manually activate new admin accounts via dashboard
*/

-- Create admins table if not exists
CREATE TABLE IF NOT EXISTS public.admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin' NOT NULL,
  is_active boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to ensure clean state)
DROP POLICY IF EXISTS "Users can view own admin record" ON public.admins;
DROP POLICY IF EXISTS "Users can insert own admin record" ON public.admins;

-- Policy: Allow authenticated users to SELECT only their own record
CREATE POLICY "Users can view own admin record"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Allow authenticated users to INSERT only their own record
CREATE POLICY "Users can insert own admin record"
  ON public.admins
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Note: UPDATE is intentionally not allowed for regular users
-- Super admin must activate accounts manually via Supabase Dashboard using service_role
-- or create a separate admin function with elevated privileges

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_is_active ON public.admins(is_active);