const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkStudentEmails = async () => {
  try {
    console.log('👥 Checking Student Email Addresses...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/librasy-zen');
    console.log('✅ Connected to database');

    // Get all students
    const students = await User.find({ role: 'student' }).select('name email rollNumber');
    
    console.log(`\n📊 Found ${students.length} students:`);
    
    const studentsWithEmail = [];
    const studentsWithoutEmail = [];
    
    students.forEach((student, index) => {
      const hasEmail = student.email && student.email.trim() !== '';
      console.log(`${index + 1}. ${student.name} (Roll: ${student.rollNumber})`);
      console.log(`   Email: ${student.email || 'NO EMAIL'}`);
      console.log(`   Status: ${hasEmail ? '✅ HAS EMAIL' : '❌ NO EMAIL'}`);
      console.log('');
      
      if (hasEmail) {
        studentsWithEmail.push(student);
      } else {
        studentsWithoutEmail.push(student);
      }
    });

    console.log(`\n📈 Summary:`);
    console.log(`✅ Students with email: ${studentsWithEmail.length}`);
    console.log(`❌ Students without email: ${studentsWithoutEmail.length}`);

    if (studentsWithoutEmail.length > 0) {
      console.log(`\n💡 Students without email addresses:`);
      studentsWithoutEmail.forEach(student => {
        console.log(`   - ${student.name} (Roll: ${student.rollNumber})`);
      });
      console.log(`\n🔧 To fix: Students need to add email addresses to their profiles`);
      console.log(`   1. Go to Profile page in the frontend`);
      console.log(`   2. Add email address`);
      console.log(`   3. Save profile`);
    }

    if (studentsWithEmail.length > 0) {
      console.log(`\n✅ Students ready for notifications:`);
      studentsWithEmail.forEach(student => {
        console.log(`   - ${student.name} (${student.email})`);
      });
    }

    // Test email configuration
    console.log(`\n📧 Email Configuration Check:`);
    console.log(`EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
    console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '***SET***' : 'NOT SET'}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`\n❌ Email configuration missing!`);
      console.log(`💡 Create .env file in backend folder with:`);
      console.log(`EMAIL_USER=your-email@gmail.com`);
      console.log(`EMAIL_PASS=your-app-password`);
    } else {
      console.log(`\n✅ Email configuration found!`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
};

// Run the check
checkStudentEmails();
