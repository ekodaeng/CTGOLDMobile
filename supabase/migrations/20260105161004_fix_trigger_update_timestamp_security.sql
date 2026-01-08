/*
  # Fix trigger_update_timestamp function security

  1. Changes
    - Add SECURITY DEFINER to trigger_update_timestamp function
    - Add SET search_path = public to prevent search_path manipulation attacks
  
  2. Security
    - Prevents role mutable search_path vulnerability
    - Ensures function runs with proper security context
  
  3. Notes
    - This fixes the Security Audit warning: "Function Search Path Mutable"
    - Function behavior remains the same, only security is enhanced
*/

-- Recreate trigger_update_timestamp function with proper security settings
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
