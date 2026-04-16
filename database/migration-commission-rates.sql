-- Migration: Add commission_rate to lender_profiles
-- This allows setting custom commission rates per lender

-- Add commission_rate column if it doesn't exist
ALTER TABLE lender_profiles 
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 2.00 
COMMENT 'Platform commission rate as percentage (e.g., 2.00 for 2%)';

-- Set default commission rate for existing lenders
UPDATE lender_profiles SET commission_rate = 2.00 WHERE commission_rate IS NULL;
