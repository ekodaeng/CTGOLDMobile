/*
  # Create Admin Activity Logs Table

  ## Overview
  Track all admin activities in the system for audit trail and email notifications.

  ## New Tables
  - `admin_activity_logs`
    - `id` (uuid, primary key) - Unique identifier
    - `admin_user_id` (uuid, foreign key to admins.user_id) - Admin who performed the action
    - `admin_email` (text) - Email of the admin (denormalized for quick access)
    - `action_type` (text) - Type of action: 'MEMBER_APPROVED', 'MEMBER_REJECTED', 'MEMBER_UPDATED', 'MEMBER_DELETED'
    - `target_user_id` (uuid) - User who was affected by the action
    - `target_user_email` (text) - Email of affected user (denormalized)
    - `target_user_name` (text) - Name of affected user (denormalized)
    - `changes` (jsonb) - Details of changes made (for updates)
    - `ip_address` (text, nullable) - IP address of the admin
    - `user_agent` (text, nullable) - Browser user agent
    - `created_at` (timestamptz) - When the action occurred

  ## Security
  - Enable RLS on admin_activity_logs table
  - Only admins can view activity logs
  - Logs are append-only (no updates or deletes allowed)
*/

CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES admins(user_id) ON DELETE SET NULL,
  admin_email text NOT NULL,
  action_type text NOT NULL CHECK (action_type IN (
    'MEMBER_APPROVED',
    'MEMBER_REJECTED', 
    'MEMBER_UPDATED',
    'MEMBER_DELETED'
  )),
  target_user_id uuid,
  target_user_email text NOT NULL,
  target_user_name text NOT NULL,
  changes jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_user_id ON admin_activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action_type ON admin_activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_target_user ON admin_activity_logs(target_user_id);

-- Enable RLS
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all activity logs
CREATE POLICY "Admins can view activity logs"
  ON admin_activity_logs
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

-- Service role can insert logs (for edge functions)
CREATE POLICY "Service role can insert activity logs"
  ON admin_activity_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Admins can insert their own activity logs
CREATE POLICY "Admins can insert activity logs"
  ON admin_activity_logs
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
