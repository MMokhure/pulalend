-- Pulalend Database Schema
-- Run this in phpMyAdmin or MySQL command line

CREATE DATABASE IF NOT EXISTS pulalend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE pulalend;

-- Users table (for both borrowers and lenders)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    permanent_address TEXT,
    current_address TEXT,
    user_type ENUM('borrower', 'lender', 'admin') NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type)
) ENGINE=InnoDB;

-- Borrower profiles
CREATE TABLE IF NOT EXISTS borrower_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    business_name VARCHAR(255),
    business_type VARCHAR(100),
    business_registration_number VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    credit_score INT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Lender profiles
CREATE TABLE IF NOT EXISTS lender_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    available_balance DECIMAL(15, 2) DEFAULT 0.00,
    total_invested DECIMAL(15, 2) DEFAULT 0.00,
    total_earned DECIMAL(15, 2) DEFAULT 0.00,
    preferred_interest_rate DECIMAL(5, 2) DEFAULT 12.00,
    min_loan_amount DECIMAL(15, 2) DEFAULT 1000.00,
    max_loan_amount DECIMAL(15, 2) DEFAULT 50000.00,
    commission_rate DECIMAL(5, 2) DEFAULT 2.00 COMMENT 'Platform commission rate as percentage (e.g., 2.00 for 2%)',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Loan requests
CREATE TABLE IF NOT EXISTS loan_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_number VARCHAR(50) UNIQUE,
    borrower_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    duration_months INT NOT NULL,
    purpose TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'funded', 'active', 'completed', 'defaulted', 'cancelled') DEFAULT 'pending',
    risk_grade ENUM('A', 'B', 'C', 'D', 'E') DEFAULT 'C',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    funded_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (borrower_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_borrower (borrower_id)
) ENGINE=InnoDB;

-- Borrower-selected lenders for a loan request
CREATE TABLE IF NOT EXISTS loan_lender_selections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL,
    lender_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loan_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (lender_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uniq_loan_lender (loan_id, lender_id),
    INDEX idx_lender (lender_id)
) ENGINE=InnoDB;

-- Investments
CREATE TABLE IF NOT EXISTS investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lender_id INT NOT NULL,
    loan_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    expected_return DECIMAL(15, 2) NOT NULL,
    actual_return DECIMAL(15, 2) DEFAULT 0.00,
    platform_commission DECIMAL(15, 2) DEFAULT 0.00 COMMENT 'Platform commission taken from interest profit (not principal)',
    status ENUM('active', 'completed', 'defaulted') DEFAULT 'active',
    invested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (lender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (loan_id) REFERENCES loan_requests(id) ON DELETE CASCADE,
    INDEX idx_lender (lender_id),
    INDEX idx_loan (loan_id)
) ENGINE=InnoDB;

-- Repayment schedules
CREATE TABLE IF NOT EXISTS repayment_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    principal_amount DECIMAL(15, 2) NOT NULL,
    interest_amount DECIMAL(15, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) DEFAULT 0.00,
    status ENUM('pending', 'paid', 'overdue', 'partial') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loan_requests(id) ON DELETE CASCADE,
    INDEX idx_loan_due (loan_id, due_date)
) ENGINE=InnoDB;

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_type ENUM('deposit', 'withdrawal', 'investment', 'repayment', 'return') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    reference_id INT NULL,
    reference_type VARCHAR(50) NULL,
    description TEXT,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, created_at)
) ENGINE=InnoDB;

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    document_type ENUM('id_card', 'business_registration', 'bank_statement', 'tax_return', 'other') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- KYC requests
CREATE TABLE IF NOT EXISTS kyc_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    id_type VARCHAR(50) NOT NULL,
    id_number VARCHAR(100) NOT NULL,
    address1 VARCHAR(255) NOT NULL,
    address2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    id_front_path VARCHAR(500) NOT NULL,
    id_back_path VARCHAR(500),
    selfie_path VARCHAR(500) NOT NULL,
    omang_copy_path VARCHAR(500),
    payslip_path VARCHAR(500),
    status ENUM('pending', 'approved', 'rejected', 'verified') DEFAULT 'pending',
    rejection_reason TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewer_id INT NULL,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_kyc_user_status (user_id, status),
    INDEX idx_kyc_submitted (submitted_at)
) ENGINE=InnoDB;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, read_status)
) ENGINE=InnoDB;

-- Platform statistics
CREATE TABLE IF NOT EXISTS platform_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_commission_earned DECIMAL(15, 2) DEFAULT 0.00,
    total_loans_funded DECIMAL(15, 2) DEFAULT 0.00,
    total_active_loans INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert initial platform stats
INSERT IGNORE INTO platform_stats (total_commission_earned, total_loans_funded, total_active_loans) 
VALUES (0.00, 0.00, 0);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (email, password_hash, first_name, last_name, user_type, email_verified) 
VALUES ('admin@pulalend.co.bw', '$2a$10$dffbl3.vpzndovbgoxU5me4XdwMxDs/PfHcmjO93gaCBS7vAcjTOm', 'Admin', 'User', 'admin', TRUE);
