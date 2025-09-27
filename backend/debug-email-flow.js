const mongoose = require('mongoose');
const Issue = require('./models/Issue');
const User = require('./models/User');
const Book = require('./models/Book');
const { sendBookIssueNotification } = require('./services/emailService');
require('dotenv').config();

const debugEmailFlow = async () => {
  try {
    console.log('🔍 Debugging Email Flow...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/librasy-zen');
    console.log('✅ Connected to database');

    // Check if we have any users with emails
    const usersWithEmail = await User.find({ 
      email: { $exists: true, $ne: null, $ne: '' },
      role: 'student'
    }).select('name email rollNumber');
    
    console.log(`📧 Found ${usersWithEmail.length} students with emails:`);
    usersWithEmail.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Roll: ${user.rollNumber}`);
    });

    if (usersWithEmail.length === 0) {
      console.log('❌ No students with email addresses found!');
      console.log('💡 Students need to have email addresses in their profiles to receive notifications.');
      return;
    }

    // Check if we have any books
    const books = await Book.find({ isActive: true }).select('title author availableCopies');
    console.log(`📚 Found ${books.length} active books`);
    
    if (books.length === 0) {
      console.log('❌ No books found!');
      return;
    }

    // Check recent issues
    const recentIssues = await Issue.find({ isActive: true })
      .populate('student', 'name email rollNumber')
      .populate('book', 'title author')
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`📋 Found ${recentIssues.length} recent issues:`);
    recentIssues.forEach(issue => {
      console.log(`  - ${issue.book.title} → ${issue.student.name} (${issue.student.email || 'NO EMAIL'})`);
    });

    // Test email configuration
    console.log('\n🧪 Testing Email Configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('❌ Email configuration missing in .env file!');
      console.log('💡 Add EMAIL_USER and EMAIL_PASS to your .env file');
      return;
    }

    // Test sending email to first student
    const testStudent = usersWithEmail[0];
    console.log(`\n📧 Testing email to: ${testStudent.name} (${testStudent.email})`);
    
    try {
      await sendBookIssueNotification(
        testStudent.email,
        testStudent.name,
        'Test Book Title',
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      );
      console.log('✅ Test email sent successfully!');
    } catch (emailError) {
      console.log('❌ Email sending failed:', emailError.message);
    }

    // Check if there are any recent issues that should have triggered emails
    console.log('\n🔍 Checking recent issues for email triggers...');
    for (const issue of recentIssues) {
      if (issue.student.email) {
        console.log(`📧 Issue ${issue._id}: ${issue.book.title} → ${issue.student.email}`);
        console.log(`   Status: ${issue.status}, Due: ${issue.dueDate}`);
        
        // Try to send notification for this issue
        try {
          await sendIssueNotification(issue._id);
          console.log(`   ✅ Notification sent successfully`);
        } catch (error) {
          console.log(`   ❌ Notification failed: ${error.message}`);
        }
      } else {
        console.log(`📧 Issue ${issue._id}: ${issue.book.title} → NO EMAIL`);
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
};

// Run the debug
debugEmailFlow();
