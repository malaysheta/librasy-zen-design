const mongoose = require('mongoose');
const Issue = require('./models/Issue');
const User = require('./models/User');
const Book = require('./models/Book');
require('dotenv').config();

const fixEmailIssue = async () => {
  console.log('🔧 Fixing Email Issues...');
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/librasy-zen');
    console.log('✅ Connected to database');

    // Step 1: Check email configuration
    console.log('\n📧 Step 1: Checking Email Configuration');
    console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('❌ Email configuration missing!');
      console.log('💡 Create a .env file in backend folder with:');
      console.log('EMAIL_USER=your-email@gmail.com');
      console.log('EMAIL_PASS=your-app-password');
      return;
    }

    // Step 2: Check students with emails
    console.log('\n👥 Step 2: Checking Students with Emails');
    const studentsWithEmail = await User.find({ 
      email: { $exists: true, $ne: null, $ne: '' },
      role: 'student'
    }).select('name email rollNumber');
    
    console.log(`Found ${studentsWithEmail.length} students with emails:`);
    studentsWithEmail.forEach(student => {
      console.log(`  - ${student.name} (${student.email}) - Roll: ${student.rollNumber}`);
    });

    if (studentsWithEmail.length === 0) {
      console.log('❌ No students have email addresses!');
      console.log('💡 Students need to add email addresses to their profiles');
      console.log('   Go to Profile page and add email address');
      return;
    }

    // Step 3: Check recent issues
    console.log('\n📋 Step 3: Checking Recent Issues');
    const recentIssues = await Issue.find({ isActive: true })
      .populate('student', 'name email rollNumber')
      .populate('book', 'title author')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`Found ${recentIssues.length} recent issues:`);
    recentIssues.forEach((issue, index) => {
      const hasEmail = issue.student.email && issue.student.email.trim() !== '';
      console.log(`  ${index + 1}. ${issue.book.title} → ${issue.student.name}`);
      console.log(`     Email: ${issue.student.email || 'NO EMAIL'}`);
      console.log(`     Status: ${issue.status}, Due: ${issue.dueDate}`);
      console.log(`     Email Available: ${hasEmail ? '✅' : '❌'}`);
    });

    // Step 4: Test email sending
    console.log('\n📧 Step 4: Testing Email Sending');
    const testStudent = studentsWithEmail[0];
    console.log(`Testing with: ${testStudent.name} (${testStudent.email})`);

    try {
      // Import and test email service
      const { sendBookIssueNotification } = require('./services/emailService');
      
      await sendBookIssueNotification(
        testStudent.email,
        testStudent.name,
        'Test Book Title',
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      console.log('✅ Test email sent successfully!');
      console.log('📬 Check your inbox for the test email');
    } catch (emailError) {
      console.log('❌ Email test failed:', emailError.message);
      
      if (emailError.message.includes('Invalid login')) {
        console.log('💡 Solution: Use App Password instead of regular password');
        console.log('   1. Enable 2FA on Gmail');
        console.log('   2. Generate App Password');
        console.log('   3. Use App Password in .env file');
      } else if (emailError.message.includes('Less secure')) {
        console.log('💡 Solution: Use App Password (not "less secure app access")');
      } else {
        console.log('💡 Check your email configuration in .env file');
      }
    }

    // Step 5: Check if notifications are being triggered
    console.log('\n🔔 Step 5: Checking Notification Triggers');
    const issuesWithEmail = recentIssues.filter(issue => 
      issue.student.email && issue.student.email.trim() !== ''
    );
    
    console.log(`${issuesWithEmail.length} issues have student emails`);
    
    if (issuesWithEmail.length > 0) {
      console.log('💡 To test notifications:');
      console.log('   1. Issue a new book to a student with email');
      console.log('   2. Check server console for email logs');
      console.log('   3. Check student\'s email inbox');
    }

    // Step 6: Manual notification test
    console.log('\n🧪 Step 6: Manual Notification Test');
    if (issuesWithEmail.length > 0) {
      const testIssue = issuesWithEmail[0];
      console.log(`Testing notification for: ${testIssue.book.title} → ${testIssue.student.email}`);
      
      try {
        const { sendIssueNotification } = require('./services/notificationService');
        await sendIssueNotification(testIssue._id);
        console.log('✅ Manual notification sent!');
      } catch (error) {
        console.log('❌ Manual notification failed:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
};

// Run the fix
fixEmailIssue();
