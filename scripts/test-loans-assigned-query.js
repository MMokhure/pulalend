const mysql = require('mysql2/promise');

async function testQuery() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend',
  });

  try {
    const lenderId = 6;
    console.log(`Testing query for lender_id ${lenderId}...\n`);
    
    const [loanRows] = await pool.execute(
      `SELECT 
        lr.id,
        lr.loan_number,
        lr.amount as total_loan_amount,
        lr.interest_rate,
        lr.duration_months,
        lr.purpose,
        lr.status,
        lr.requested_at,
        lr.approved_at,
        lls.amount_lent,
        lls.interest_amount,
        lls.total_expected_return,
        lls.amount_received,
        lls.status as lender_portion_status,
        u.first_name as borrower_first_name,
        u.last_name as borrower_last_name,
        u.email as borrower_email,
        bp.credit_score
      FROM loan_lender_selections lls
      INNER JOIN loan_requests lr ON lr.id = lls.loan_id
      INNER JOIN users u ON u.id = lr.borrower_id
      LEFT JOIN borrower_profiles bp ON bp.user_id = lr.borrower_id
      WHERE lls.lender_id = ?
      ORDER BY lr.approved_at DESC`,
      [lenderId]
    );

    console.log(`Found ${loanRows.length} loans\n`);
    console.log(JSON.stringify(loanRows, null, 2));
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testQuery();
