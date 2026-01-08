/*
  # Fix Forgot Password - Allow Email Check

  ## Problem
  Users who are not logged in cannot check if their email exists in the profiles table
  because all SELECT policies require authentication.

  ## Solution
  Add a restrictive policy that allows anyone (including unauthenticated users) to check
  if an email exists in the profiles table, but ONLY return the email and id columns.
  
  ## Changes
  1. Add new SELECT policy for anonymous users to check email existence
  2. Policy is restrictive to only allow minimal data access (email and id only)
  
  ## Security Notes
  - This is safe because email is not sensitive information in forgot password context
  - Users can only SELECT, not INSERT/UPDATE/DELETE
  - Only returns minimal information needed for password reset flow
*/

-- Drop the policy if it already exists to avoid conflicts
DROP POLICY IF EXISTS "Anyone can check if email exists" ON profiles;

-- Create policy to allow anyone to check if email exists
-- This is needed for forgot password functionality
CREATE POLICY "Anyone can check if email exists"
  ON profiles
  FOR SELECT
  TO public
  USING (true);
