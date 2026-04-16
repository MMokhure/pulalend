const mysql = require('mysql2/promise');

async function checkLenderBalance() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend',
  });

  try {
    const lenderId = 6; // Bolokang's user ID
    
    console.log('Checking lender profile...\n');
    const [lenderProfile] = await pool.execute(
      'SELECT * FROM lender_profiles WHERE user_id = ?',
      [lenderId]
    );
    console.log('Lender Profile:');
    console.log(JSON.stringify(lenderProfile, null, 2));
    
    console.log('\n\nChecking loan assignments...\n');
    const [assignments] = await pool.execute(
      'SELECT * FROM loan_lender_selections WHERE lender_id = ?',
      [lenderId]
    );
    console.log('Loan Assignments:');
    console.log(JSON.stringify(assignments, null, 2));
    
    // Calculate what the balances SHOULD be
    const totalInvested = assignments.reduce((sum, a) => sum + Number(a.amount_lent || 0), 0);
    const currentAvailable = lenderProfile[0] ? Number(lenderProfile[0].available_balance) : 0;
    const currentInvested = lenderProfile[0] ? Number(lenderProfile[0].total_invested) : 0;
    
    console.log('\n\n=== ANALYSIS ===');
    console.log(`Current Available Balance: P${currentAvailable}`);
    console.log(`Current Total Invested: P${currentInvested}`);
    console.log(`\nActual Amount Lent (from assignments): P${totalInvested}`);
    console.log(`\nDiscrepancy: Available balance should be P${10000 - totalInvested}`);
    console.log(`Discrepancy: Total invested should be P${totalInvested}`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkLenderBalance();
