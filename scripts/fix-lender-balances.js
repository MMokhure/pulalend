const mysql = require('mysql2/promise');

async function fixLenderBalances() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend',
  });

  try {
    console.log('Fixing lender balances based on existing assignments...\n');
    
    // Get all lenders with assignments
    const [lenders] = await pool.execute(`
      SELECT DISTINCT lender_id 
      FROM loan_lender_selections
    `);
    
    for (const lender of lenders) {
      const lenderId = lender.lender_id;
      
      // Calculate total invested from assignments
      const [assignments] = await pool.execute(
        'SELECT SUM(amount_lent) as total_lent FROM loan_lender_selections WHERE lender_id = ?',
        [lenderId]
      );
      
      const totalInvested = Number(assignments[0]?.total_lent || 0);
      
      // Get current profile
      const [profile] = await pool.execute(
        'SELECT available_balance, total_invested FROM lender_profiles WHERE user_id = ?',
        [lenderId]
      );
      
      if (profile.length > 0) {
        const currentAvailable = Number(profile[0].available_balance);
        const currentInvested = Number(profile[0].total_invested);
        
        // Calculate what available balance should be
        // If total_invested is wrong, we assume the original balance was (current_available + current_invested)
        const originalBalance = currentAvailable + currentInvested;
        const correctAvailable = originalBalance - totalInvested;
        
        console.log(`Lender ${lenderId}:`);
        console.log(`  Current: Available=P${currentAvailable}, Invested=P${currentInvested}`);
        console.log(`  Should be: Available=P${correctAvailable}, Invested=P${totalInvested}`);
        
        // Update the profile
        await pool.execute(
          `UPDATE lender_profiles 
           SET available_balance = ?,
               total_invested = ?
           WHERE user_id = ?`,
          [correctAvailable, totalInvested, lenderId]
        );
        
        console.log(`  ✓ Updated!\n`);
      }
    }
    
    console.log('All lender balances fixed successfully!');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixLenderBalances();
