/*
  # Add Full Name to Admins Table

  1. Changes
    - Add `full_name` column to `public.admins` table
    - Column is TEXT, NOT NULL with default empty string for existing records

  2. Notes
    - This allows admins to store their full name during registration
    - Existing admin records will have empty string as full_name (can be updated later)
*/

-- Add full_name column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'admins' 
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.admins ADD COLUMN full_name text NOT NULL DEFAULT '';
  END IF;
END $$;
