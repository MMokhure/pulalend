const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pulalend',
      port: parseInt(process.env.DB_PORT || '3306')
    });

    console.log('✓ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migration-commission-payments.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      await connection.execute(statement);
      console.log('✓ Executed statement');
    }

    console.log('\n✓ Migration completed successfully!');
    console.log('✓ commission_payments table created');

  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration().catch(console.error);
