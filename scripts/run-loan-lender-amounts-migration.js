const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pulalend',
      multipleStatements: true
    });

    console.log('✓ Connected to database');

    // Read and execute migration
    const fs = require('fs');
    const path = require('path');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '..', 'database', 'migration-loan-lender-amounts.sql'),
      'utf8'
    );

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await connection.execute(statement);
        console.log('✓ Executed statement successfully');
      } catch (err) {
        // Handle specific errors gracefully
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log('⚠ Column already exists, skipping...');
        } else if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
          console.log('⚠ Index already dropped or does not exist, skipping...');
        } else {
          throw err;
        }
      }
    }

    console.log('\n✓ Migration completed successfully!');
    console.log('✓ loan_lender_selections table updated with amount tracking fields');
    console.log('✓ loan_requests table updated with approval tracking fields');

  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✓ Database connection closed');
    }
  }
}

runMigration();
