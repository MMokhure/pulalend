-- Password Reset Migration
-- Adds password_reset_tokens table for secure password reset flow

USE pulalend;

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB;

-- Add column to track last password change
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP NULL COMMENT 'Last password change timestamp';

-- Clean up expired tokens (older than 24 hours)
DELETE FROM password_reset_tokens WHERE expires_at < NOW();
