# Notification and Penalty System Setup Guide

## Overview
This guide explains how to set up the notification and penalty system for the Librasy Zen Library Management System. The system includes:

- **Email notifications** when books are issued
- **Due date reminders** sent 1 day before due date
- **Overdue notifications** with penalty calculations
- **Automatic penalty system** (₹50 per day for overdue books)
- **Frontend notifications** showing current status

## Email Configuration

### 1. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Update your `.env` file**:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### 2. Other Email Providers

For other email providers (Outlook, Yahoo, etc.), update the email service configuration in `backend/services/emailService.js`:

```javascript
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'outlook', // or 'yahoo', 'hotmail', etc.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};
```

## Environment Variables

Add these to your `.env` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/librasy-zen

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Features

### 1. Automatic Notifications

The system automatically sends:
- **Book Issue Notification**: When a book is issued to a student
- **Due Date Reminder**: 1 day before the due date (sent at 6 PM daily)
- **Overdue Notifications**: Daily reminders for overdue books (sent at 9 AM daily)

### 2. Penalty System

- **Penalty Rate**: ₹50 per day for overdue books
- **Automatic Calculation**: Fines are calculated and updated hourly
- **Status Updates**: Books automatically marked as "overdue" when past due date

### 3. Frontend Notifications

Students can view:
- **Current notifications** with priority levels
- **Fine amounts** for overdue books
- **Days remaining** until due date
- **Visual indicators** for urgent items

## Manual Testing

### Test Email Notifications

1. **Issue a book** to a student with a valid email
2. **Check email** for the issue notification
3. **Manually trigger reminders**:
   ```bash
   # Trigger overdue check
   curl -X POST http://localhost:5000/api/issues/trigger-overdue-check \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

   # Trigger due date reminders
   curl -X POST http://localhost:5000/api/issues/trigger-due-reminders \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

### Test Penalty Calculation

1. **Create a test issue** with a past due date
2. **Check the fine amount** in the database or frontend
3. **Verify automatic updates** (fines update every hour)

## Cron Job Schedule

The system runs automated tasks:

- **9:00 AM IST**: Check for overdue books and send reminders
- **6:00 PM IST**: Send due date reminders for books due tomorrow
- **Every Hour**: Update fine amounts for overdue books

## API Endpoints

### Student Endpoints
- `GET /api/issues/notifications` - Get student notifications
- `GET /api/issues/my-books` - Get student's books with updated fine info

### Admin Endpoints
- `POST /api/issues/trigger-overdue-check` - Manually trigger overdue check
- `POST /api/issues/trigger-due-reminders` - Manually trigger due reminders

## Troubleshooting

### Email Not Sending
1. **Check email credentials** in `.env` file
2. **Verify app password** is correct (not regular password)
3. **Check console logs** for error messages
4. **Test with a simple email** first

### Notifications Not Showing
1. **Check if student has email** in their profile
2. **Verify API endpoints** are working
3. **Check browser console** for errors
4. **Ensure student is logged in**

### Penalties Not Calculating
1. **Check database** for correct due dates
2. **Verify cron jobs** are running
3. **Check server logs** for errors
4. **Manually trigger** penalty updates

## Security Notes

- **Never commit** `.env` file to version control
- **Use app passwords** instead of regular passwords
- **Rotate credentials** regularly
- **Monitor email usage** to prevent abuse

## Support

If you encounter issues:
1. Check the server logs for error messages
2. Verify all environment variables are set correctly
3. Test email configuration with a simple test
4. Ensure the database is properly connected
5. Check that cron jobs are running (check server startup logs)

The notification system is designed to be robust and will continue working even if individual emails fail to send.
