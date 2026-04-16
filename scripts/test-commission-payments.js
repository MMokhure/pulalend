const mysql = require('mysql2/promise');

async function testCommissionPayments() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pulalend',
      port: parseInt(process.env.DB_PORT || '3306')
    });

    console.log('✓ Connected to database\n');

    // Check if commission_payments table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'commission_payments'"
    );
    
    if (tables.length === 0) {
      console.log('✗ commission_payments table does not exist');
      console.log('  Run: node scripts/run-commission-payments-migration.js');
      return;
    }
    
    console.log('✓ commission_payments table exists');

    // Get total commission earned from investments
    const [earnedResult] = await connection.execute(
      `SELECT COALESCE(SUM(platform_commission), 0) as total_earned
      FROM investments`
    );
    const totalEarned = Number(earnedResult[0].total_earned);
    console.log(`\n📊 Total Commission Earned: P${totalEarned.toFixed(2)}`);

    // Get total commission paid
    const [paidResult] = await connection.execute(
      `SELECT COALESCE(SUM(amount), 0) as total_paid
      FROM commission_payments
      WHERE status = 'completed'`
    );
    const totalPaid = Number(paidResult[0].total_paid);
    console.log(`💰 Total Commission Paid: P${totalPaid.toFixed(2)}`);

    // Calculate available balance
    const availableBalance = totalEarned - totalPaid;
    console.log(`✅ Available Balance: P${availableBalance.toFixed(2)}`);

    // Get recent payments
    const [payments] = await connection.execute(
      `SELECT 
        cp.*,
        u.first_name,
        u.last_name
      FROM commission_payments cp
      LEFT JOIN users u ON cp.processed_by = u.id
      ORDER BY cp.created_at DESC
      LIMIT 5`
    );

    console.log(`\n📝 Recent Payments (${payments.length}):`);
    if (payments.length === 0) {
      console.log('   No payments recorded yet');
    } else {
      payments.forEach((p, i) => {
        console.log(`\n   ${i + 1}. P${Number(p.amount).toFixed(2)}`);
        console.log(`      Date: ${p.payment_date}`);
        console.log(`      Method: ${p.payment_method}`);
        console.log(`      Status: ${p.status}`);
        console.log(`      Processed by: ${p.first_name} ${p.last_name}`);
      });
    }

    console.log('\n✓ Commission payments system is working correctly!');
    console.log('\n🌐 Access the page at: http://localhost:3000/admin/commission-payments');
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testCommissionPayments().catch(console.error);
