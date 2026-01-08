/*
  # Create newsletter subscribers table

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `subscribed_at` (timestamptz, default now())
      - `is_active` (boolean, default true)
  
  2. Security
    - Enable RLS on `newsletter_subscribers` table
    - Add policy for public insert (anyone can subscribe)
    - Admin users need to read/update (not implemented in this migration)
  
  3. Notes
    - Email validation handled at application level
    - Stores newsletter subscription data for CTGOLD community updates
*/

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);