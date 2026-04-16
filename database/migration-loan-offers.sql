CREATE TABLE IF NOT EXISTS loan_offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_application_id INT NOT NULL,
    lender_id INT NOT NULL,
    offered_rate DECIMAL(5,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    tenure_months INT NOT NULL,
    status ENUM('pending','accepted','declined','expired') DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_application_id) REFERENCES loan_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (lender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_loan (loan_application_id),
    INDEX idx_lender (lender_id)
) ENGINE=InnoDB;
