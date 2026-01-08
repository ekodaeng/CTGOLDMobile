/*
  # Rollback Public Profile Access

  ## Reason
  The previous policy "Anyone can check if email exists" was too permissive
  and exposed profile data to unauthenticated users.

  ## Solution
  We changed the forgot password flow to not check email existence in the frontend.
  Instead, we rely on Supabase Auth to handle email validation securely.
  
  ## Changes
  1. Drop the overly permissive public SELECT policy
  2. Keep only the necessary authenticated user policies
*/

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can check if email exists" ON profiles;
