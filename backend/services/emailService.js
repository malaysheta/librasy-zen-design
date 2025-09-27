const nodemailer = require('nodemailer');

// Create transporter for email sending
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to your preferred email service
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS  // Your email password or app password
    }
  });
};

// Send book issue notification
const sendBookIssueNotification = async (userEmail, userName, bookTitle, dueDate) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Book Issued Successfully - Librasy Zen',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">📚 Book Issued Successfully</h2>
          <p>Dear ${userName},</p>
          <p>Your book has been successfully issued from Librasy Zen Library Management System.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Book Details:</h3>
            <p><strong>Book Title:</strong> ${bookTitle}</p>
            <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e;"><strong>⚠️ Important Reminder:</strong></p>
            <p style="margin: 5px 0 0 0; color: #92400e;">Please return the book on or before the due date to avoid penalties.</p>
            <p style="margin: 5px 0 0 0; color: #92400e;">Late returns will incur a penalty of ₹50 per day.</p>
          </div>
          
          <p>Thank you for using Librasy Zen Library Management System!</p>
          <p>Best regards,<br>Librasy Zen Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Book issue notification sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending book issue notification:', error);
    throw error;
  }
};

// Send overdue book reminder
const sendOverdueReminder = async (userEmail, userName, bookTitle, daysOverdue, fineAmount) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '⚠️ Book Overdue - Immediate Action Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">⚠️ Book Overdue Notice</h2>
          <p>Dear ${userName},</p>
          <p>This is to inform you that you have an overdue book that needs to be returned immediately.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #dc2626; margin-top: 0;">Overdue Book Details:</h3>
            <p><strong>Book Title:</strong> ${bookTitle}</p>
            <p><strong>Days Overdue:</strong> ${daysOverdue} day(s)</p>
            <p><strong>Current Fine:</strong> ₹${fineAmount}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e;"><strong>⚠️ Penalty Information:</strong></p>
            <p style="margin: 5px 0 0 0; color: #92400e;">A penalty of ₹50 per day is being applied for each day the book is overdue.</p>
            <p style="margin: 5px 0 0 0; color: #92400e;">Please return the book immediately to stop further penalties.</p>
          </div>
          
          <p style="color: #dc2626; font-weight: bold;">Please return the book as soon as possible to avoid additional charges.</p>
          <p>Thank you for your immediate attention to this matter.</p>
          <p>Best regards,<br>Librasy Zen Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Overdue reminder sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending overdue reminder:', error);
    throw error;
  }
};

// Send due date reminder (1 day before due date)
const sendDueDateReminder = async (userEmail, userName, bookTitle, dueDate) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '📅 Book Due Tomorrow - Return Reminder',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">📅 Book Due Tomorrow</h2>
          <p>Dear ${userName},</p>
          <p>This is a friendly reminder that your borrowed book is due tomorrow.</p>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">Book Details:</h3>
            <p><strong>Book Title:</strong> ${bookTitle}</p>
            <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; color: #374151;"><strong>💡 Reminder:</strong></p>
            <p style="margin: 5px 0 0 0; color: #374151;">Please return the book on or before the due date to avoid penalties.</p>
            <p style="margin: 5px 0 0 0; color: #374151;">Late returns will incur a penalty of ₹50 per day.</p>
          </div>
          
          <p>Thank you for using Librasy Zen Library Management System!</p>
          <p>Best regards,<br>Librasy Zen Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Due date reminder sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending due date reminder:', error);
    throw error;
  }
};

module.exports = {
  sendBookIssueNotification,
  sendOverdueReminder,
  sendDueDateReminder
};
