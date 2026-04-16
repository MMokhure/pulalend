const mysql = require('mysql2/promise');

async function testDashboard() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend',
  });

  try {
    console.log('Testing admin dashboard queries...\n');

    // Test 1: User Stats
    console.log('1. Testing user stats...');
    const [userStats] = await pool.execute(
      `SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN user_type = 'borrower' THEN 1 ELSE 0 END) as totalBorrowers,
        SUM(CASE WHEN user_type = 'lender' THEN 1 ELSE 0 END) as totalLenders,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeUsers,
        SUM(CASE WHEN DATE(created_at) >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as newUsersThisMonth
      FROM users 
      WHERE user_type IN ('borrower', 'lender')`
    );
    console.log('✓ User stats OK:', userStats[0]);

    // Test 2: Loan Stats
    console.log('\n2. Testing loan stats...');
    const [loanStats] = await pool.execute(
      `SELECT 
        COUNT(*) as totalLoans,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingLoans,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedLoans,
        SUM(CASE WHEN status = 'funded' THEN 1 ELSE 0 END) as fundedLoans,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activeLoans,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedLoans,
        SUM(CASE WHEN status = 'defaulted' THEN 1 ELSE 0 END) as defaultedLoans,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedLoans,
        SUM(amount) as totalVolume,
        SUM(CASE WHEN status IN ('funded', 'active', 'completed') THEN amount ELSE 0 END) as activeLoanVolume
      FROM loan_requests`
    );
    console.log('✓ Loan stats OK:', loanStats[0]);

    // Test 3: Investment Stats
    console.log('\n3. Testing investment stats...');
    const [investmentStats] = await pool.execute(
      `SELECT 
        COUNT(*) as totalInvestments,
        SUM(amount) as totalInvestedAmount,
        AVG(amount) as avgInvestmentSize,
        SUM(platform_commission) as totalCommissionEarned
      FROM investments`
    );
    console.log('✓ Investment stats OK:', investmentStats[0]);

    // Test 4: Repayment Stats
    console.log('\n4. Testing repayment stats...');
    const [repaymentStats] = await pool.execute(
      `SELECT 
        COUNT(*) as totalRepayments,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as completedRepayments,
        SUM(CASE WHEN status IN ('pending', 'partial', 'overdue') AND due_date < NOW() THEN 1 ELSE 0 END) as overdueRepayments,
        SUM(COALESCE(paid_amount, 0)) as totalRepaid,
        SUM(CASE WHEN status IN ('pending', 'partial', 'overdue') AND due_date < NOW() THEN (total_amount - COALESCE(paid_amount, 0)) ELSE 0 END) as overdueAmount
      FROM repayment_schedules`
    );
    console.log('✓ Repayment stats OK:', repaymentStats[0]);

    // Test 5: KYC Stats
    console.log('\n5. Testing KYC stats...');
    const [kycStats] = await pool.execute(
      `SELECT 
        COUNT(*) as totalKycSubmissions,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingKyc,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approvedKyc,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejectedKyc
      FROM kyc_requests`
    );
    console.log('✓ KYC stats OK:', kycStats[0]);

    console.log('\n✅ All queries passed!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('SQL State:', error.sqlState);
    console.error('SQL Message:', error.sqlMessage);
  } finally {
    await pool.end();
  }
}

testDashboard();
