// Test Complete Login Flow
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLoginFlow() {
  console.log('🧪 Testing Complete Login Flow\n');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend',
  });

  try {
    // Test 1: Check admin user exists
    console.log('1️⃣ Checking admin user...');
    const [users] = await connection.execute(
      "SELECT * FROM users WHERE email = 'admin@pulalend.co.bw' AND status = 'active'"
    );
    
    if (users.length === 0) {
      console.log('   ❌ Admin user not found');
      return;
    }
    
    const user = users[0];
    console.log('   ✅ Admin user found');
    console.log('   - Email:', user.email);
    console.log('   - Name:', user.first_name, user.last_name);
    console.log('   - 2FA Enabled:', user.two_factor_enabled === 1 ? 'Yes' : 'No');
    
    // Test 2: Verify password
    console.log('\n2️⃣ Testing password verification...');
    const testPassword = 'admin123';
    const isValidPassword = await bcrypt.compare(testPassword, user.password_hash);
    
    if (!isValidPassword) {
      console.log('   ❌ Password verification failed');
      return;
    }
    console.log('   ✅ Password verification successful');
    
    // Test 3: Check 2FA table
    console.log('\n3️⃣ Checking two_factor_codes table...');
    const [codes] = await connection.execute(
      'SELECT COUNT(*) as count FROM two_factor_codes WHERE user_id = ?',
      [user.id]
    );
    console.log(`   ✅ Found ${codes[0].count} 2FA codes for this user`);
    
    // Test 4: Check environment variables
    console.log('\n4️⃣ Checking environment configuration...');
    console.log('   - ENABLE_EMAILS:', process.env.ENABLE_EMAILS || 'NOT SET');
    console.log('   - EMAIL_FROM:', process.env.EMAIL_FROM || 'NOT SET');
    console.log('   - SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
    console.log('   - SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
    console.log('   - SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
    console.log('   - SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***' + process.env.SMTP_PASSWORD.slice(-4) : 'NOT SET');
    console.log('   - NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET (length: ' + process.env.NEXTAUTH_SECRET.length + ')' : 'NOT SET');
    
    // Test 5: Simulate email sending
    console.log('\n5️⃣ Testing email service...');
    const { EmailService } = require('../lib/emailService.ts');
    
    if (process.env.ENABLE_EMAILS === 'true') {
      console.log('   ✅ Email service is enabled');
      console.log('   💡 To test 2FA, try logging in and check your email');
    } else {
      console.log('   ⚠️  Email service is disabled');
      console.log('   💡 Set ENABLE_EMAILS=true in .env to enable');
    }
    
    console.log('\n✅ All checks passed!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Make sure your dev server is running: npm run dev');
    console.log('   2. If server is running, RESTART IT to load new .env values');
    console.log('   3. Try logging in with:');
    console.log('      - Email: admin@pulalend.co.bw');
    console.log('      - Password: admin123');
    console.log('   4. Check your email inbox for the 2FA code');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await connection.end();
  }
}

testLoginFlow();
