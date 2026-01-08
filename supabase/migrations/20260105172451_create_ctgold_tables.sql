/*
  # Create CTGOLD System Tables

  1. New Tables
    - `ctgold_balances`
      - `member_id` (uuid, foreign key to profiles.id)
      - `balance` (numeric, default 0)
      - `updated_at` (timestamptz)
      
    - `ctgold_transactions`
      - `id` (uuid, primary key)
      - `member_id` (uuid, foreign key to profiles.id)
      - `type` (text: 'buy', 'reward', 'referral', 'burn_info', 'transfer')
      - `amount` (numeric)
      - `status` (text: 'pending', 'completed', 'failed')
      - `description` (text)
      - `created_at` (timestamptz)
      
    - `referrals`
      - `id` (uuid, primary key)
      - `referrer_id` (uuid, foreign key to profiles.id) - yang mengajak
      - `referred_id` (uuid, foreign key to profiles.id) - yang diajak
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read their own data
*/

-- Create ctgold_balances table
CREATE TABLE IF NOT EXISTS ctgold_balances (
  member_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  balance numeric DEFAULT 0 NOT NULL CHECK (balance >= 0),
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE ctgold_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own balance"
  ON ctgold_balances FOR SELECT
  TO authenticated
  USING (auth.uid() = member_id);

-- Create ctgold_transactions table
CREATE TABLE IF NOT EXISTS ctgold_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('buy', 'reward', 'referral', 'burn_info', 'transfer')),
  amount numeric NOT NULL,
  status text DEFAULT 'completed' NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  description text DEFAULT '' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE ctgold_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON ctgold_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = member_id);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(referred_id)
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ctgold_transactions_member_id ON ctgold_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_ctgold_transactions_created_at ON ctgold_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
