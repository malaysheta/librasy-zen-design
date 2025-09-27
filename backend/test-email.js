const nodemailer = require('nodemailer');
require('dotenv').config();

// Test email configuration
const testEmail = async () => {
  console.log('🔧 Testing Email Configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email configuration missing!');
    console.log('Please set EMAIL_USER and EMAIL_PASS in your .env file');
    return;
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('📧 Testing email connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ Email connection successful!');

    // Send test email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: '🧪 Librasy Zen - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">📧 Email Test Successful!</h2>
          <p>This is a test email from Librasy Zen Library Management System.</p>
          <p>If you received this email, your email configuration is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <p>Best regards,<br>Librasy Zen Team</p>
        </div>
      `
    };

    console.log('📤 Sending test email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('📬 Check your inbox for the test email');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n🔑 Possible solutions:');
      console.log('1. Make sure you\'re using an App Password, not your regular password');
      console.log('2. Enable 2-Factor Authentication on your Gmail account');
      console.log('3. Generate a new App Password from Google Account settings');
    } else if (error.message.includes('Less secure app access')) {
      console.log('\n🔑 Enable "Less secure app access" in your Google Account settings');
    } else {
      console.log('\n🔍 Check your email configuration in .env file');
    }
  }
};

// Run the test
testEmail();
