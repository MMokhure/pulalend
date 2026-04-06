// Run Notifications Migration
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
    console.log('📊 Running Notifications Migration...');
    
    const migrationPath = path.join(__dirname, '..', 'database', 'migration-notifications.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await connection.query(sql);
    
    console.log('✅ Notifications Migration completed successfully!');
    console.log('');
    console.log('Created/Updated:');
    console.log('  - notifications.action_url column');
    console.log('  - notifications.action_label column');
    console.log('  - Performance indexes');
    console.log('');
    console.log('Features enabled:');
    console.log('  ✓ Interactive notification buttons');
    console.log('  ✓ Mark as read/unread');
    console.log('  ✓ Delete notifications');
    console.log('  ✓ Real-time unread count');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration().catch(console.error);
