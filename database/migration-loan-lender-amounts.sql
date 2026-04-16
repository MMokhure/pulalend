-- Migration: Add amount tracking fields to loan_lender_selections table
-- This allows tracking individual lender portions when loans are split across multiple lenders

ALTER TABLE loan_lender_selections
ADD COLUMN amount_lent DECIMAL(15, 2) DEFAULT 0 COMMENT 'Amount this lender contributed to the loan',
ADD COLUMN interest_amount DECIMAL(15, 2) DEFAULT 0 COMMENT 'Interest earned by this lender',
ADD COLUMN total_expected_return DECIMAL(15, 2) DEFAULT 0 COMMENT 'Total expected return (principal + interest)',
ADD COLUMN amount_received DECIMAL(15, 2) DEFAULT 0 COMMENT 'Amount received back so far',
ADD COLUMN status ENUM('active', 'fully_paid', 'defaulted') DEFAULT 'active' COMMENT 'Status of this lender portion';

-- Also add approved_by and approved_at fields to loan_requests if they don't exist
ALTER TABLE loan_requests
ADD COLUMN IF NOT EXISTS approved_by INT NULL COMMENT 'Admin who approved the loan',
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL COMMENT 'When the loan was approved',
ADD FOREIGN KEY IF NOT EXISTS (approved_by) REFERENCES users(id);

-- Remove unique constraint on loan_lender_selections to allow multiple lenders per loan
-- (The old unique constraint prevented splitting loans across multiple lenders)
ALTER TABLE loan_lender_selections DROP INDEX IF EXISTS uniq_loan_lender;
