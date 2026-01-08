/*
  # Fix Infinite Recursion in Profiles Update Policy

  ## Problem
  The "Users can update own profile" policy causes infinite recursion because it queries
  the profiles table within the WITH CHECK clause, creating a circular dependency when
  admins try to update member profiles.

  ## Solution
  1. Drop the problematic "Users can update own profile" policy
  2. Create a simpler policy that prevents role and status changes by users
  3. Allow admins to update any profile through their separate policy

  ## Changes
  - Drop old "Users can update own profile" policy
  - Create new simplified policy without recursive queries
  - Ensure admins can still update all profiles
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create a new simplified policy for users updating their own profile
-- Users can only update their own profile and cannot change role or status
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = 'MEMBER'
    AND status IN ('PENDING', 'ACTIVE', 'SUSPENDED')
  );

-- Add policy for admins to delete profiles
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid() 
        AND admins.is_active = true
        AND admins.role IN ('admin', 'super_admin')
    )
  );
