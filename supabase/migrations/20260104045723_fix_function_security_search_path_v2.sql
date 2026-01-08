/*
  # Fix Function Security - Mutable Search Path

  1. Security Hardening
    - Recreate all functions with explicit search_path = public
    - Add SECURITY DEFINER where appropriate
    - Prevent search_path injection attacks
    
  2. Functions Updated
    - `generate_member_code` - Auto-generate member codes (CTG-YYYY-####)
    - `set_member_code` - Trigger function to set member code on insert
    - `update_updated_at` - Trigger function to update timestamp
    
  3. Important Notes
    - No business logic changes
    - Only security hardening
    - All existing functionality preserved
    - Fixes "Function Search Path Mutable" warnings
*/

-- Drop existing functions with CASCADE to handle trigger dependencies
DROP FUNCTION IF EXISTS public.generate_member_code() CASCADE;
DROP FUNCTION IF EXISTS public.set_member_code() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;

-- Recreate generate_member_code with secure search_path
CREATE OR REPLACE FUNCTION public.generate_member_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  FROM public.members
  WHERE member_code LIKE 'CTG-' || current_year || '-%';
  
  -- Format: CTG-YYYY-#### (4 digits, zero-padded)
  new_code := 'CTG-' || current_year || '-' || lpad(next_number::text, 4, '0');
  
  RETURN new_code;
END;
$$;

-- Recreate set_member_code trigger function with secure search_path
CREATE OR REPLACE FUNCTION public.set_member_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.member_code IS NULL OR NEW.member_code = '' THEN
    NEW.member_code := public.generate_member_code();
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate update_updated_at trigger function with secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Recreate triggers that were dropped with CASCADE
CREATE TRIGGER trigger_set_member_code
  BEFORE INSERT ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_member_code();

CREATE TRIGGER trigger_update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Grant appropriate permissions
-- Revoke direct execute from public for security
REVOKE EXECUTE ON FUNCTION public.generate_member_code() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_member_code() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC;

-- Grant execute to authenticated role (needed for triggers to work)
GRANT EXECUTE ON FUNCTION public.generate_member_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_member_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at() TO authenticated;

-- Also grant to service_role for admin operations
GRANT EXECUTE ON FUNCTION public.generate_member_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.set_member_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.update_updated_at() TO service_role;