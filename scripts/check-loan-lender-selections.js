const mysql = require('mysql2/promise');

async function checkTable() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend',
  });

  try {
    console.log('Checking loan_lender_selections table...\n');
    
    // Check table structure
    const [columns] = await pool.execute('DESCRIBE loan_lender_selections');
    console.log('Table Structure:');
    console.log(columns);
    console.log('\n');
    
    // Check for data
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM loan_lender_selections');
    console.log('Total records:', rows[0].count);
    
    // Check sample data
    const [sample] = await pool.execute('SELECT * FROM loan_lender_selections LIMIT 3');
    console.log('\nSample data:');
    console.log(JSON.stringify(sample, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

checkTable();
