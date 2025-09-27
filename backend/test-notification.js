const { sendBookIssueNotification, sendOverdueReminder, sendDueDateReminder } = require('./services/emailService');
require('dotenv').config();

const testNotifications = async () => {
  console.log('🧪 Testing Notification System...');
  
  // Test data
  const testUserEmail = process.env.EMAIL_USER || 'test@example.com';
  const testUserName = 'Test Student';
  const testBookTitle = 'Test Book Title';
  const testDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  try {
    console.log('📧 Testing Book Issue Notification...');
    await sendBookIssueNotification(
      testUserEmail,
      testUserName,
      testBookTitle,
      testDueDate
    );
    console.log('✅ Book issue notification sent successfully!');
    
    console.log('\n📧 Testing Due Date Reminder...');
    await sendDueDateReminder(
      testUserEmail,
      testUserName,
      testBookTitle,
      testDueDate
    );
    console.log('✅ Due date reminder sent successfully!');
    
    console.log('\n📧 Testing Overdue Reminder...');
    await sendOverdueReminder(
      testUserEmail,
      testUserName,
      testBookTitle,
      3, // 3 days overdue
      150 // ₹150 fine
    );
    console.log('✅ Overdue reminder sent successfully!');
    
    console.log('\n🎉 All notification tests completed!');
    console.log('📬 Check your email inbox for the test notifications');
    
  } catch (error) {
    console.error('❌ Notification test failed:', error.message);
    console.log('\n🔍 Troubleshooting steps:');
    console.log('1. Check your .env file has EMAIL_USER and EMAIL_PASS set');
    console.log('2. Make sure EMAIL_PASS is an App Password (not regular password)');
    console.log('3. Verify your Gmail account has 2FA enabled');
    console.log('4. Run: node test-email.js to test basic email connection');
  }
};

// Run the test
testNotifications();
