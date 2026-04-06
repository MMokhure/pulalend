// Update Admin Email Address
const mysql = require('mysql2/promise');

async function updateAdminEmail() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend',
  });

  try {
    console.log('🔄 Updating admin email address...');
    
    // Check if old admin email exists
    const [oldAdmin] = await connection.execute(
      "SELECT id, email FROM users WHERE email = 'admin@pulalend.com' AND user_type = 'admin'"
    );

    if (oldAdmin.length > 0) {
      // Update to new email
      await connection.execute(
        "UPDATE users SET email = 'admin@pulalend.co.bw' WHERE email = 'admin@pulalend.com' AND user_type = 'admin'"
      );
      console.log('✅ Admin email updated successfully!');
      console.log('   Old: admin@pulalend.com');
      console.log('   New: admin@pulalend.co.bw');
    } else {
      // Check if new email already exists
      const [newAdmin] = await connection.execute(
        "SELECT id, email FROM users WHERE email = 'admin@pulalend.co.bw' AND user_type = 'admin'"
      );
      
      if (newAdmin.length > 0) {
        console.log('✅ Admin account already uses the new email: admin@pulalend.co.bw');
      } else {
        console.log('ℹ️  No existing admin account found with old email.');
        console.log('   Run db-init.js to create admin account with new email.');
      }
    }
    
    console.log('\nAdmin Credentials:');
    console.log('  Email: admin@pulalend.co.bw');
    console.log('  Password: admin123');
    
  } catch (error) {
    console.error('❌ Error updating admin email:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

updateAdminEmail().catch(console.error);
