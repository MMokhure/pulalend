const mysql = require('mysql2/promise');

async function testUpdatedQuery() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend',
  });

  try {
    console.log('Testing updated repayment query with COALESCE...\n');

    const [repaymentStats] = await pool.execute(
      `SELECT 
        COUNT(*) as totalRepayments,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END), 0) as completedRepayments,
        COALESCE(SUM(CASE WHEN status IN ('pending', 'partial', 'overdue') AND due_date < NOW() THEN 1 ELSE 0 END), 0) as overdueRepayments,
        COALESCE(SUM(paid_amount), 0) as totalRepaid,
        COALESCE(SUM(CASE WHEN status IN ('pending', 'partial', 'overdue') AND due_date < NOW() THEN (total_amount - COALESCE(paid_amount, 0)) ELSE 0 END), 0) as overdueAmount
      FROM repayment_schedules`
    );
    console.log('✓ Query succeeded:', repaymentStats[0]);
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('SQL Message:', error.sqlMessage);
  } finally {
    await pool.end();
  }
}

testUpdatedQuery();
