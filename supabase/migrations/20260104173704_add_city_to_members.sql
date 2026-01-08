/*
  # Add city column to members table

  1. Changes
    - Add `city` column to `members` table
      - Type: text
      - Not null with default empty string
      - Stores member's city/location (e.g., "Makassar", "Purbalingga")
  
  2. Notes
    - Existing members will have empty string as default value
    - Frontend validation enforces minimum 2 characters for new registrations
*/

-- Add city column to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS city text DEFAULT '' NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN members.city IS 'Member city/location (e.g., Makassar, Purbalingga)';
