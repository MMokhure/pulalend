const mysql = require('mysql2/promise');

async function checkLoanRequests() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend',
  });

  try {
    console.log('Checking loan_requests table...\n');
    
    // Check table structure
    const [columns] = await pool.execute('DESCRIBE loan_requests');
    console.log('Table Structure:');
    columns.forEach(col => console.log(`  ${col.Field}: ${col.Type}`));
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

checkLoanRequests();
