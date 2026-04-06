// Check Users Table Schema
const mysql = require('mysql2/promise');

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend',
  });

  try {
    console.log('📊 Checking users table schema...\n');
    
    const [columns] = await connection.execute('DESCRIBE users');
    
    console.log('Users table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `Default: ${col.Default}` : ''}`);
    });
    
    console.log('\n🔍 Checking for 2FA-related columns:');
    const has2FAEnabled = columns.find(c => c.Field === 'two_factor_enabled');
    const hasLast2FA = columns.find(c => c.Field === 'last_2fa_at');
    
    if (has2FAEnabled) {
      console.log('  ✅ two_factor_enabled column exists');
    } else {
      console.log('  ❌ two_factor_enabled column is MISSING');
    }
    
    if (hasLast2FA) {
      console.log('  ✅ last_2fa_at column exists');
    } else {
      console.log('  ⚠️  last_2fa_at column is MISSING');
    }
    
    // Check two_factor_codes table
    console.log('\n🔍 Checking two_factor_codes table:');
    try {
      const [tables] = await connection.execute(
        "SHOW TABLES LIKE 'two_factor_codes'"
      );
      
      if (tables.length > 0) {
        console.log('  ✅ two_factor_codes table exists');
        const [tfaCols] = await connection.execute('DESCRIBE two_factor_codes');
        console.log('\n  Columns:');
        tfaCols.forEach(col => {
          console.log(`    - ${col.Field} (${col.Type})`);
        });
      } else {
        console.log('  ❌ two_factor_codes table is MISSING');
      }
    } catch (err) {
      console.log('  ❌ Error checking two_factor_codes table:', err.message);
    }
    
    // Check admin user
    console.log('\n👤 Checking admin user:');
    const [adminRows] = await connection.execute(
      "SELECT id, email, user_type, two_factor_enabled FROM users WHERE user_type = 'admin' LIMIT 1"
    );
    
    if (adminRows.length > 0) {
      const admin = adminRows[0];
      console.log(`  Email: ${admin.email}`);
      console.log(`  2FA Enabled: ${admin.two_factor_enabled !== undefined ? admin.two_factor_enabled : 'Column not found'}`);
    } else {
      console.log('  ⚠️  No admin user found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkSchema();
