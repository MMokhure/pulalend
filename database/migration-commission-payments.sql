-- Migration: Create commission_payments table for tracking platform commission withdrawals
-- Date: 2026-04-16

CREATE TABLE IF NOT EXISTS commission_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(15, 2) NOT NULL COMMENT 'Amount of commission paid out',
    payment_method ENUM('bank_transfer', 'mobile_money', 'other') NOT NULL DEFAULT 'bank_transfer',
    payment_reference VARCHAR(100) NULL COMMENT 'Reference number for the payment',
    recipient_details TEXT NULL COMMENT 'Details of who received the payment',
    notes TEXT NULL COMMENT 'Additional notes about the payment',
    processed_by INT NOT NULL COMMENT 'Admin user who processed the payment',
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
    payment_date DATE NOT NULL COMMENT 'Date when payment was made',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (processed_by) REFERENCES users(id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_status (status)
) ENGINE=InnoDB;
