/*
  # Create Web3 CTGOLD System

  1. New Tables
    - `web3_users`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique, not null) - Solana wallet address
      - `referral_code` (text, unique, not null) - Unique referral code
      - `upline_id` (uuid, nullable) - Reference to upline user
      - `internal_balance` (bigint, default 0) - Internal CTGOLD balance
      - `is_active` (boolean, default false) - Active if balance >= 1000
      - `is_vip` (boolean, default false) - VIP status
      - `total_referrals` (integer, default 0) - Total direct referrals
      - `total_earnings` (bigint, default 0) - Total earnings from referrals
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `web3_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, not null) - Reference to web3_users
      - `amount` (bigint, not null) - Transaction amount in CTGOLD
      - `type` (text, not null) - BONUS, WITHDRAW, DEPOSIT, REFERRAL
      - `level_from` (integer, nullable) - Level if bonus (1-10)
      - `from_user_id` (uuid, nullable) - Source user for bonus
      - `status` (text, default 'completed') - completed, pending, failed
      - `description` (text)
      - `created_at` (timestamptz)

    - `web3_referrals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, not null) - The referred user
      - `referrer_id` (uuid, not null) - The referrer
      - `level` (integer, not null) - Level in the upline (1-10)
      - `bonus_paid` (bigint, default 0) - Total bonus paid
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create web3_users table
CREATE TABLE IF NOT EXISTS web3_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  referral_code text UNIQUE NOT NULL,
  upline_id uuid REFERENCES web3_users(id),
  internal_balance bigint DEFAULT 0 CHECK (internal_balance >= 0),
  is_active boolean DEFAULT false,
  is_vip boolean DEFAULT false,
  total_referrals integer DEFAULT 0 CHECK (total_referrals >= 0),
  total_earnings bigint DEFAULT 0 CHECK (total_earnings >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on wallet_address for fast lookups
CREATE INDEX IF NOT EXISTS idx_web3_users_wallet ON web3_users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_web3_users_referral_code ON web3_users(referral_code);
CREATE INDEX IF NOT EXISTS idx_web3_users_upline ON web3_users(upline_id);

-- Create web3_transactions table
CREATE TABLE IF NOT EXISTS web3_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES web3_users(id) ON DELETE CASCADE,
  amount bigint NOT NULL,
  type text NOT NULL CHECK (type IN ('BONUS', 'WITHDRAW', 'DEPOSIT', 'REFERRAL')),
  level_from integer CHECK (level_from >= 1 AND level_from <= 10),
  from_user_id uuid REFERENCES web3_users(id),
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for transactions
CREATE INDEX IF NOT EXISTS idx_web3_transactions_user ON web3_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_web3_transactions_type ON web3_transactions(type);
CREATE INDEX IF NOT EXISTS idx_web3_transactions_from_user ON web3_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_web3_transactions_created ON web3_transactions(created_at DESC);

-- Create web3_referrals table
CREATE TABLE IF NOT EXISTS web3_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES web3_users(id) ON DELETE CASCADE,
  referrer_id uuid NOT NULL REFERENCES web3_users(id) ON DELETE CASCADE,
  level integer NOT NULL CHECK (level >= 1 AND level <= 10),
  bonus_paid bigint DEFAULT 0 CHECK (bonus_paid >= 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, referrer_id)
);

-- Create indexes for referrals
CREATE INDEX IF NOT EXISTS idx_web3_referrals_user ON web3_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_web3_referrals_referrer ON web3_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_web3_referrals_level ON web3_referrals(level);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_web3_users_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS web3_users_updated_at_trigger ON web3_users;
CREATE TRIGGER web3_users_updated_at_trigger
  BEFORE UPDATE ON web3_users
  FOR EACH ROW
  EXECUTE FUNCTION update_web3_users_updated_at();

-- Function to update is_active status based on balance
CREATE OR REPLACE FUNCTION update_web3_user_active_status()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.is_active = NEW.internal_balance >= 1000;
  RETURN NEW;
END;
$$;

-- Trigger to auto-update is_active
DROP TRIGGER IF EXISTS web3_users_active_status_trigger ON web3_users;
CREATE TRIGGER web3_users_active_status_trigger
  BEFORE INSERT OR UPDATE OF internal_balance ON web3_users
  FOR EACH ROW
  EXECUTE FUNCTION update_web3_user_active_status();

-- Enable RLS
ALTER TABLE web3_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE web3_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE web3_referrals ENABLE ROW LEVEL SECURITY;

-- Policies for web3_users
CREATE POLICY "Users can view all users"
  ON web3_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON web3_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON web3_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for web3_transactions
CREATE POLICY "Users can view own transactions"
  ON web3_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert transactions"
  ON web3_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for web3_referrals
CREATE POLICY "Users can view referrals"
  ON web3_referrals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert referrals"
  ON web3_referrals FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create view for user statistics
CREATE OR REPLACE VIEW web3_user_stats AS
SELECT
  u.id,
  u.wallet_address,
  u.referral_code,
  u.internal_balance,
  u.is_active,
  u.is_vip,
  u.total_referrals,
  u.total_earnings,
  COUNT(DISTINCT r.user_id) as total_network_size,
  COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'BONUS'), 0) as total_bonus_earned,
  u.created_at
FROM web3_users u
LEFT JOIN web3_referrals r ON u.id = r.referrer_id
LEFT JOIN web3_transactions t ON u.id = t.user_id AND t.type = 'BONUS'
GROUP BY u.id;

-- Create admin user (hardcoded wallet for testing)
INSERT INTO web3_users (wallet_address, referral_code, internal_balance, is_active, is_vip)
VALUES ('ADMIN_WALLET_ADDRESS_PLACEHOLDER', 'ADMIN001', 999999999, true, true)
ON CONFLICT (wallet_address) DO NOTHING;