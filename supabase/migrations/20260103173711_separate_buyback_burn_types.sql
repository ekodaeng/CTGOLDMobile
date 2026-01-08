/*
  # Separate Buyback and Burn Report Types

  1. Changes
    - Remove existing buyback_burn reports
    - Update type constraint to support 'buyback', 'burn', 'trading'
    - Insert separate buyback and burn sample reports
  
  2. New Report Types
    - buyback: Market buyback activity
    - burn: Token supply reduction activity
    - trading: Trading activity reports
*/

-- Delete existing buyback_burn reports
DELETE FROM reports WHERE type = 'buyback_burn';

-- Drop and recreate constraint with new types
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_type_check;

ALTER TABLE reports 
ADD CONSTRAINT reports_type_check 
CHECK (type = ANY (ARRAY['buyback'::text, 'burn'::text, 'trading'::text]));

-- Insert new separate buyback and burn reports
INSERT INTO reports (title, description, type, date) VALUES
('Buyback CTGOLD Januari 2026', 'Total 50,000 CTGOLD telah dibeli kembali dari pasar', 'buyback', '2026-01-15'),
('Burn CTGOLD Januari 2026', 'Total 50,000 CTGOLD telah dibakar untuk mengurangi supply', 'burn', '2026-01-16'),
('Buyback CTGOLD Desember 2025', 'Total 45,000 CTGOLD telah dibeli kembali dari pasar', 'buyback', '2025-12-15'),
('Burn CTGOLD Desember 2025', 'Total 45,000 CTGOLD telah dibakar untuk mengurangi supply', 'burn', '2025-12-16');