/*
  # Create Admin Settings Table

  1. New Tables
    - `admin_settings`
      - `id` (uuid, primary key) - Unique identifier
      - `key` (text, unique) - Setting key name
      - `value` (text) - Setting value
      - `description` (text) - Description of the setting
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `admin_settings` table
    - Add policy for authenticated admins to read settings
    - Add policy for authenticated admins to update settings
    - Add policy for authenticated admins to insert settings

  3. Initial Data
    - Insert default exchange rate for IDR (16,500)
*/

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Authenticated users can read settings"
  ON admin_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert settings"
  ON admin_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.email = auth.jwt()->>'email'
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update settings"
  ON admin_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.email = auth.jwt()->>'email'
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.email = auth.jwt()->>'email'
      AND admins.is_active = true
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER set_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();

-- Insert default exchange rate
INSERT INTO admin_settings (key, value, description)
VALUES (
  'exchange_rate_idr',
  '16500',
  'Exchange rate for USD to IDR conversion'
)
ON CONFLICT (key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);
