const mysql = require('mysql2/promise');

async function testCommissionCalculation() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend',
  });

  try {
    console.log('🧪 Testing Commission Calculation Fix\n');
    console.log('=' .repeat(60));

    // Test parameters
    const investAmount = 10000;
    const interestRate = 12;
    const durationMonths = 12;
    const commissionRate = 0.02; // 2%

    console.log('\n📊 Test Scenario:');
    console.log(`Investment Amount: P${investAmount.toLocaleString()}`);
    console.log(`Interest Rate: ${interestRate}% annual`);
    console.log(`Duration: ${durationMonths} months`);
    console.log(`Commission Rate: ${commissionRate * 100}%`);

    // OLD LOGIC (WRONG)
    console.log('\n\n❌ OLD LOGIC (INCORRECT):');
    console.log('-'.repeat(60));
    const oldCommission = investAmount * commissionRate;
    const oldNetInvest = investAmount - oldCommission;
    const oldInterest = oldNetInvest * (interestRate / 100) * (durationMonths / 12);
    const oldExpectedReturn = oldNetInvest + oldInterest;

    console.log(`Lender invests:        P${investAmount.toLocaleString()}`);
    console.log(`Platform commission:   -P${oldCommission.toLocaleString()} (from principal)`);
    console.log(`Net to borrower:       P${oldNetInvest.toLocaleString()}`);
    console.log(`Interest earned:       P${oldInterest.toFixed(2)} (12% of P${oldNetInvest.toLocaleString()})`);
    console.log(`Expected return:       P${oldExpectedReturn.toFixed(2)}`);
    console.log(`Platform earns:        P${oldCommission.toLocaleString()}`);
    console.log(`\n⚠️  Problem: Borrower only gets P${oldNetInvest.toLocaleString()}, not full P${investAmount.toLocaleString()}`);

    // NEW LOGIC (CORRECT)
    console.log('\n\n✅ NEW LOGIC (CORRECT):');
    console.log('-'.repeat(60));
    const newInterestProfit = investAmount * (interestRate / 100) * (durationMonths / 12);
    const newCommission = newInterestProfit * commissionRate;
    const newNetProfit = newInterestProfit - newCommission;
    const newExpectedReturn = investAmount + newNetProfit;

    console.log(`Lender invests:        P${investAmount.toLocaleString()}`);
    console.log(`Net to borrower:       P${investAmount.toLocaleString()} (full amount)`);
    console.log(`Interest earned:       P${newInterestProfit.toFixed(2)} (12% of P${investAmount.toLocaleString()})`);
    console.log(`Platform commission:   -P${newCommission.toFixed(2)} (from interest)`);
    console.log(`Net profit:            P${newNetProfit.toFixed(2)}`);
    console.log(`Expected return:       P${newExpectedReturn.toFixed(2)}`);
    console.log(`Platform earns:        P${newCommission.toFixed(2)} (from profit, not principal)`);
    console.log(`\n✅ Benefit: Borrower gets full P${investAmount.toLocaleString()}`);

    // Comparison
    console.log('\n\n📈 COMPARISON:');
    console.log('='.repeat(60));
    console.log(`Amount to borrower:`);
    console.log(`  Old: P${oldNetInvest.toLocaleString()}`);
    console.log(`  New: P${investAmount.toLocaleString()}`);
    console.log(`  Difference: +P${(investAmount - oldNetInvest).toLocaleString()}`);
    
    console.log(`\nPlatform commission:`);
    console.log(`  Old: P${oldCommission.toLocaleString()} (from principal)`);
    console.log(`  New: P${newCommission.toFixed(2)} (from interest)`);
    console.log(`  Difference: -P${(oldCommission - newCommission).toFixed(2)}`);
    
    console.log(`\nLender expected return (same):`);
    console.log(`  Old: P${oldExpectedReturn.toFixed(2)}`);
    console.log(`  New: P${newExpectedReturn.toFixed(2)}`);
    console.log(`  Difference: P${(newExpectedReturn - oldExpectedReturn).toFixed(2)}`);

    // Check database for commission_rate field
    console.log('\n\n🗄️  DATABASE CHECK:');
    console.log('='.repeat(60));
    
    const [columns] = await connection.execute(
      `SHOW COLUMNS FROM lender_profiles WHERE Field = 'commission_rate'`
    );

    if (columns.length > 0) {
      console.log('✅ commission_rate field exists in lender_profiles table');
      console.log(`   Type: ${columns[0].Type}`);
      console.log(`   Default: ${columns[0].Default}`);
    } else {
      console.log('❌ commission_rate field NOT FOUND in lender_profiles table');
      console.log('   Run: node scripts/run-commission-rate-migration.js');
    }

    // Check for any lenders with custom rates
    const [lenders] = await connection.execute(
      `SELECT user_id, commission_rate FROM lender_profiles WHERE commission_rate IS NOT NULL`
    );

    if (lenders.length > 0) {
      console.log(`\n✅ Found ${lenders.length} lender(s) with commission rates set:`);
      lenders.forEach(l => {
        console.log(`   Lender ${l.user_id}: ${Number(l.commission_rate).toFixed(2)}%`);
      });
    } else {
      console.log('\n⚠️  No lenders have commission rates set yet');
      console.log('   Default 2% will be used for all');
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('✅ Commission calculation test complete!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

testCommissionCalculation();
