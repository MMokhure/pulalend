-- Two-Factor Authentication Migration
-- Adds 2FA codes table and user 2FA preferences

USE pulalend;

-- Create 2FA verification codes table
CREATE TABLE IF NOT EXISTS two_factor_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(6) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_code (code),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB;

-- Add 2FA enabled flag to users table (if not exists)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE COMMENT 'Whether 2FA is enabled for this user';

-- Add column to track last 2FA verification
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_2fa_at TIMESTAMP NULL COMMENT 'Last successful 2FA verification';

-- Clean up expired codes (older than 1 hour)
DELETE FROM two_factor_codes WHERE expires_at < NOW();
