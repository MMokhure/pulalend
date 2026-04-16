const mysql = require('mysql2/promise');

async function checkBorrowerProfiles() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend',
  });

  try {
    console.log('Checking borrower_profiles table structure...\n');
    
    const [columns] = await pool.execute(
      'DESCRIBE borrower_profiles'
    );
    
    console.log('Columns in borrower_profiles table:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\nSample data:');
    const [rows] = await pool.execute('SELECT * FROM borrower_profiles LIMIT 3');
    console.log(JSON.stringify(rows, null, 2));
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkBorrowerProfiles();
