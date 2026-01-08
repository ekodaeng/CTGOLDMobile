/*
  # Fix Infinite Recursion in Profiles RLS Policies

  ## Problem
  The admin policies for profiles table cause infinite recursion because they query
  the profiles table within the policy check, creating a circular dependency.

  ## Solution
  1. Drop the problematic admin policies
  2. Create new policies that check admin status from the `admins` table instead
  3. This breaks the circular dependency and allows proper authorization

  ## Changes
  - Drop old admin policies on profiles
  - Create new policies using admins table for authorization
  - Maintain security while fixing recursion issue
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create new admin policies using admins table instead
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
        AND admins.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
        AND admins.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
        AND admins.role IN ('admin', 'super_admin')
    )
  );

-- Policy for admins to insert new profiles (for manual member creation)
CREATE POLICY "Admins can insert profiles"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
        AND admins.role IN ('admin', 'super_admin')
    )
  );
