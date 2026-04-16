const mysql = require('mysql2/promise');

async function populateData() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend',
  });

  try {
    console.log('Populating loan_lender_selections data...\n');
    
    // Get all loan_lender_selections
    const [selections] = await pool.execute(`
      SELECT lls.*, lr.amount as loan_amount, lr.interest_rate, lr.duration_months
      FROM loan_lender_selections lls
      INNER JOIN loan_requests lr ON lr.id = lls.loan_id
    `);

    console.log(`Found ${selections.length} loan lender selections to update\n`);

    for (const sel of selections) {
      console.log(`\nProcessing loan_id ${sel.loan_id}, lender_id ${sel.lender_id}...`);
      
      // Get all lenders for this loan to calculate portions
      const [allLendersForLoan] = await pool.execute(
        'SELECT COUNT(*) as count FROM loan_lender_selections WHERE loan_id = ?',
        [sel.loan_id]
      );
      
      const lenderCount = allLendersForLoan[0].count;
      const loanAmount = Number(sel.loan_amount);
      const interestRate = Number(sel.interest_rate);
      const durationMonths = Number(sel.duration_months);
      
      // For simplicity, assume equal split among lenders
      // In reality, this should come from the admin assignment amounts
      const amountLent = loanAmount / lenderCount;
      const totalInterest = (loanAmount * interestRate * durationMonths) / (12 * 100);
      const interestAmount = totalInterest / lenderCount;
      const totalExpectedReturn = amountLent + interestAmount;
      
      console.log(`  Loan amount: ${loanAmount}, Lenders: ${lenderCount}`);
      console.log(`  Amount lent: ${amountLent.toFixed(2)}`);
      console.log(`  Interest: ${interestAmount.toFixed(2)}`);
      console.log(`  Total expected: ${totalExpectedReturn.toFixed(2)}`);
      
      // Update the record
      await pool.execute(`
        UPDATE loan_lender_selections
        SET amount_lent = ?,
            interest_amount = ?,
            total_expected_return = ?,
            amount_received = 0,
            status = 'active'
        WHERE id = ?
      `, [amountLent, interestAmount, totalExpectedReturn, sel.id]);
      
      console.log('  ✓ Updated');
    }

    console.log('\n✓ All records updated successfully!');
    
    // Show sample
    const [updated] = await pool.execute('SELECT * FROM loan_lender_selections LIMIT 3');
    console.log('\nSample updated records:');
    console.log(JSON.stringify(updated, null, 2));
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

populateData();
