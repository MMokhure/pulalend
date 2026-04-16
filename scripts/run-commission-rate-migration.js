const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runCommissionRateMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend',
    multipleStatements: true
  });

  try {
    console.log('Running commission rate migration...');
    
    const migrationPath = path.join(__dirname, '..', 'database', 'migration-commission-rates.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await connection.query(sql);
    
    console.log('✅ Commission rate migration completed successfully!');
    console.log('   - Added commission_rate column to lender_profiles');
    console.log('   - Set default rate of 2.00% for existing lenders');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

runCommissionRateMigration();
