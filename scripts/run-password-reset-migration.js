// Run Password Reset Migration Script
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend',
    multipleStatements: true
  });

  try {
    console.log('📊 Running Password Reset Migration...');
    
    const migrationPath = path.join(__dirname, '..', 'database', 'migration-password-reset.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await connection.query(sql);
    
    console.log('✅ Password Reset Migration completed successfully!');
    console.log('');
    console.log('Created/Updated:');
    console.log('  - password_reset_tokens table');
    console.log('  - users.password_changed_at column');
    console.log('');
    console.log('Password Reset Flow:');
    console.log('  1. User requests reset: POST /api/auth/forgot-password');
    console.log('  2. User receives email with reset link');
    console.log('  3. User clicks link (valid for 1 hour)');
    console.log('  4. User enters new password: POST /api/auth/reset-password');
    console.log('  5. User receives confirmation email');
    console.log('');
    console.log('Next steps:');
    console.log('  - Create forgot-password page UI');
    console.log('  - Create reset-password page UI');
    console.log('  - Test the complete flow');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration().catch(console.error);
