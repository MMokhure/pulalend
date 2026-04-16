const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
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

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migration-loan-extensions.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await connection.execute(statement);
        console.log('✓ Executed statement');
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log('✓ Field already exists, skipping');
        } else {
          throw err;
        }
      }
    }

    console.log('\n✓ Migration completed successfully!');
    console.log('✓ loan_extensions table created');
    console.log('✓ borrower_rank field added to borrower_profiles');

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
