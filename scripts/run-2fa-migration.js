// Run 2FA Migration Script
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
    console.log('📊 Running 2FA Migration...');
    
    const migrationPath = path.join(__dirname, '..', 'database', 'migration-2fa.sql');
    const rawSql = fs.readFileSync(migrationPath, 'utf8');

    // Ensure the migration runs against the configured database name.
    const dbName = process.env.DB_NAME || 'pulalend';
    const sql = rawSql.replace(/USE\s+[^;]+;/gi, `USE \`${dbName}\`;`);

    await connection.query(sql);
    
    console.log('✅ 2FA Migration completed successfully!');
    console.log('');
    console.log('Created/Updated:');
    console.log('  - two_factor_codes table');
    console.log('  - users.two_factor_enabled column');
    console.log('  - users.last_2fa_at column');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Update your .env file with SMTP credentials');
    console.log('  2. Set ENABLE_EMAILS=true in .env');
    console.log('  3. Test the 2FA flow by logging in');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration().catch(console.error);
