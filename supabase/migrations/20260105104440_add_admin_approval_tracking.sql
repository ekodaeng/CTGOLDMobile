/*
  # Add Admin Approval Tracking Fields

  1. Changes
    - Add `approved_by` (uuid, nullable) - references admin who approved this admin
    - Add `approved_at` (timestamptz, nullable) - timestamp of approval
  
  2. Notes
    - These fields track which admin activated another admin account
    - Used for audit trail of admin account activations
*/

-- Add approval tracking fields to admins table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admins' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE public.admins ADD COLUMN approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admins' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE public.admins ADD COLUMN approved_at timestamptz;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_approved_by ON public.admins(approved_by);
