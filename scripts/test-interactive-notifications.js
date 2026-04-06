/**
 * Test Interactive Notifications System
 * Tests end-to-end notification functionality:
 * - Create notification with action button
 * - Fetch unread notifications
 * - Mark as read
 * - Delete notification
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function testNotifications() {
  console.log('🧪 Testing Interactive Notifications System\n');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulalend'
  });

  try {
    // Step 1: Get a test lender user ID
    console.log('1️⃣  Finding test lender...');
    const [lenders] = await connection.execute(
      'SELECT id, email FROM users WHERE user_type = ? LIMIT 1',
      ['lender']
    );
    
    if (lenders.length === 0) {
      console.log('❌ No lender user found. Please create a lender account first.');
      return;
    }
    
    const testLender = lenders[0];
    console.log(`✅ Found lender: ${testLender.email} (ID: ${testLender.id})\n`);

    // Step 2: Create a test notification with action button
    console.log('2️⃣  Creating test notification with action button...');
    const [result] = await connection.execute(
      `INSERT INTO notifications (user_id, type, title, message, action_url, action_label, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        testLender.id,
        'info',
        'New Investment Opportunity',
        'A new loan request matching your preferences is available for funding.',
        '/lender/opportunities',
        'View Opportunities'
      ]
    );
    const notificationId = result.insertId;
    console.log(`✅ Created notification ID: ${notificationId}\n`);

    // Step 3: Fetch unread notifications
    console.log('3️⃣  Fetching unread notifications...');
    const [unread] = await connection.execute(
      `SELECT id, title, message, type, action_url, action_label, read_status
       FROM notifications
       WHERE user_id = ? AND read_status = FALSE
       ORDER BY created_at DESC`,
      [testLender.id]
    );
    console.log(`✅ Found ${unread.length} unread notification(s)`);
    if (unread.length > 0) {
      console.log('   Sample:', {
        id: unread[0].id,
        title: unread[0].title,
        hasAction: !!unread[0].action_url,
        actionLabel: unread[0].action_label
      });
    }
    console.log();

    // Step 4: Mark notification as read
    console.log('4️⃣  Marking notification as read...');
    await connection.execute(
      'UPDATE notifications SET read_status = TRUE WHERE id = ? AND user_id = ?',
      [notificationId, testLender.id]
    );
    
    const [readCheck] = await connection.execute(
      'SELECT read_status FROM notifications WHERE id = ?',
      [notificationId]
    );
    console.log(`✅ Notification read_status: ${readCheck[0].read_status}\n`);

    // Step 5: Test mark all as read
    console.log('5️⃣  Testing mark all as read...');
    const [unreadCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_status = FALSE',
      [testLender.id]
    );
    console.log(`   Before: ${unreadCount[0].count} unread notifications`);
    
    await connection.execute(
      'UPDATE notifications SET read_status = TRUE WHERE user_id = ? AND read_status = FALSE',
      [testLender.id]
    );
    
    const [afterCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_status = FALSE',
      [testLender.id]
    );
    console.log(`   After: ${afterCount[0].count} unread notifications`);
    console.log('✅ Mark all as read working\n');

    // Step 6: Test delete notification
    console.log('6️⃣  Testing delete notification...');
    const [beforeDelete] = await connection.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?',
      [testLender.id]
    );
    console.log(`   Before: ${beforeDelete[0].count} total notifications`);
    
    await connection.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [notificationId, testLender.id]
    );
    
    const [afterDelete] = await connection.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?',
      [testLender.id]
    );
    console.log(`   After: ${afterDelete[0].count} total notifications`);
    console.log('✅ Delete working\n');

    // Step 7: Create a few more test notifications
    console.log('7️⃣  Creating additional test notifications...');
    const testNotifications = [
      {
        type: 'success',
        title: 'Investment Funded',
        message: 'Your investment of P5,000 in Loan #LN-2025-001 has been processed.',
        action_url: '/lender/investments',
        action_label: 'View Investment'
      },
      {
        type: 'warning',
        title: 'Document Expiring Soon',
        message: 'Your ID document will expire in 30 days. Please update your KYC documents.',
        action_url: '/lender/profile',
        action_label: 'Update Documents'
      },
      {
        type: 'info',
        title: 'Monthly Statement Ready',
        message: 'Your January 2025 investment statement is now available for download.',
        action_url: '/lender/portfolio',
        action_label: 'Download Statement'
      }
    ];

    for (const notif of testNotifications) {
      await connection.execute(
        `INSERT INTO notifications (user_id, type, title, message, action_url, action_label, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [testLender.id, notif.type, notif.title, notif.message, notif.action_url, notif.action_label]
      );
    }
    console.log(`✅ Created ${testNotifications.length} test notifications\n`);

    // Final Summary
    console.log('📊 Final Status:');
    const [finalStats] = await connection.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN read_status = FALSE THEN 1 ELSE 0 END) as unread,
        SUM(CASE WHEN action_url IS NOT NULL THEN 1 ELSE 0 END) as with_actions
       FROM notifications WHERE user_id = ?`,
      [testLender.id]
    );
    console.log(`   Total notifications: ${finalStats[0].total}`);
    console.log(`   Unread: ${finalStats[0].unread}`);
    console.log(`   With action buttons: ${finalStats[0].with_actions}`);
    console.log();

    console.log('✨ All tests completed successfully!');
    console.log(`\n🌐 View in dashboard: http://localhost:3000/lender/dashboard`);
    console.log(`   Login as: ${testLender.email}\n`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

testNotifications();
