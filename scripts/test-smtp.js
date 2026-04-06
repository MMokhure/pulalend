// Test SMTP Connection
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTP() {
  console.log('🧪 Testing SMTP Connection...\n');
  
  console.log('Configuration:');
  console.log(`  Host: ${process.env.SMTP_HOST}`);
  console.log(`  Port: ${process.env.SMTP_PORT}`);
  console.log(`  User: ${process.env.SMTP_USER}`);
  console.log(`  Password: ${process.env.SMTP_PASSWORD ? '***' + process.env.SMTP_PASSWORD.slice(-4) : 'NOT SET'}`);
  console.log('');

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true, // SSL
      auth: {
        user: process.env.SMTP_USER || 'no_reply@pulalend.co.bw',
        pass: process.env.SMTP_PASSWORD || '',
      },
    });

    // Verify connection
    console.log('⏳ Verifying connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    // Send test email
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail({
      from: '"PulaLend" <no_reply@pulalend.co.bw>',
      to: process.env.SMTP_USER, // Send to self
      subject: 'Test Email from PulaLend',
      html: `
        <h2>SMTP Test Successful</h2>
        <p>This is a test email from PulaLend.</p>
        <p>If you received this, your email configuration is working correctly.</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Recipient: ${process.env.SMTP_USER}`);
    console.log('\n🎉 All tests passed! Email is configured correctly.');
    
  } catch (error) {
    console.error('❌ SMTP Test Failed:\n');
    console.error('Error details:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n💡 Authentication failed. Please check:');
      console.error('   - Email username is correct');
      console.error('   - Password is correct');
      console.error('   - Email account is active in Hostinger');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('\n💡 Connection failed. Please check:');
      console.error('   - Internet connection is working');
      console.error('   - SMTP host and port are correct');
      console.error('   - Firewall is not blocking port 465');
    } else {
      console.error('\n💡 Please verify your .env configuration');
    }
    
    process.exit(1);
  }
}

testSMTP();
