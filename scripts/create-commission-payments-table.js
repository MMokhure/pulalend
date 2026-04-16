const mysql = require('mysql2/promise');

async function createTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pulalend',
      port: parseInt(process.env.DB_PORT || '3306')
    });

    console.log('✓ Connected to database');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS commission_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        amount DECIMAL(15, 2) NOT NULL,
        payment_method ENUM('bank_transfer', 'mobile_money', 'other') NOT NULL DEFAULT 'bank_transfer',
        payment_reference VARCHAR(100) NULL,
        recipient_details TEXT NULL,
        notes TEXT NULL,
        processed_by INT NOT NULL,
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
        payment_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (processed_by) REFERENCES users(id),
        INDEX idx_payment_date (payment_date),
        INDEX idx_status (status)
      ) ENGINE=InnoDB
    `);

    console.log('✓ Table created/verified');

    const [tables] = await connection.execute("SHOW TABLES LIKE 'commission_payments'");
    console.log('✓ Table exists:', tables.length > 0);

  } catch (error) {
    console.error('✗ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTable().catch(console.error);
