-- Migration: Create loan_extensions table for managing payment extension requests
-- Date: 2026-04-17

CREATE TABLE IF NOT EXISTS loan_extensions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL,
    borrower_id INT NOT NULL,
    original_due_date DATE NOT NULL,
    extension_days INT NOT NULL,
    new_due_date DATE NOT NULL,
    penalty_percentage DECIMAL(5, 2) NOT NULL COMMENT 'Additional interest penalty for extension',
    penalty_amount DECIMAL(15, 2) NOT NULL,
    reason TEXT NULL,
    borrower_rank ENUM('excellent', 'good', 'average', 'poor') DEFAULT 'average' COMMENT 'Borrower ranking affects penalty rate',
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by INT NULL,
    admin_notes TEXT NULL,
    FOREIGN KEY (loan_id) REFERENCES loan_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (borrower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_loan (loan_id),
    INDEX idx_borrower (borrower_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Add borrower_rank field to borrower_profiles if it doesn't exist
ALTER TABLE borrower_profiles 
ADD COLUMN IF NOT EXISTS borrower_rank ENUM('excellent', 'good', 'average', 'poor') DEFAULT 'average' 
COMMENT 'Credit ranking: excellent (1% penalty), good (2%), average (3%), poor (5%)';
