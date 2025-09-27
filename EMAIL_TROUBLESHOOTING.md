# Email Troubleshooting Guide

## Quick Fix Steps

### 1. **Create .env file** (if missing)
Create a file named `.env` in the `backend` folder with:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Database Configuration  
MONGODB_URI=mongodb://localhost:27017/librasy-zen

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 2. **Test Email Connection**
Run this command in the backend folder:
```bash
node test-email.js
```

### 3. **Test Notifications**
Run this command in the backend folder:
```bash
node test-notification.js
```

## Gmail Setup (Step by Step)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click "2-Step Verification"
3. Follow the setup process

### Step 2: Generate App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click "2-Step Verification" 
3. Scroll down to "App passwords"
4. Click "App passwords"
5. Select "Mail" as the app
6. Copy the 16-character password (like: `abcd efgh ijkl mnop`)

### Step 3: Update .env file
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcdefghijklmnop
```

## Common Issues & Solutions

### Issue 1: "Invalid login" Error
**Solution:**
- Use App Password, not your regular Gmail password
- Make sure 2FA is enabled on your Gmail account
- Remove spaces from the app password

### Issue 2: "Less secure app access" Error
**Solution:**
- This is outdated - use App Passwords instead
- Enable 2-Factor Authentication
- Generate a new App Password

### Issue 3: "Connection timeout" Error
**Solution:**
- Check your internet connection
- Try a different email service (Outlook, Yahoo)
- Update the service in `emailService.js`

### Issue 4: Emails not sending during book issue
**Solution:**
- Check server logs for error messages
- Verify the student has an email in their profile
- Test with a simple email first

## Testing Commands

### Test 1: Basic Email Connection
```bash
cd backend
node test-email.js
```

### Test 2: Notification System
```bash
cd backend  
node test-notification.js
```

### Test 3: Manual Book Issue
1. Issue a book to a student with a valid email
2. Check server console for email logs
3. Check student's email inbox

## Alternative Email Services

If Gmail doesn't work, try these in `emailService.js`:

### Outlook/Hotmail
```javascript
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'hotmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};
```

### Yahoo
```javascript
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'yahoo',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};
```

## Debug Steps

1. **Check .env file exists and has correct values**
2. **Run test-email.js to verify basic connection**
3. **Check server logs when issuing a book**
4. **Verify student has email in their profile**
5. **Test with your own email first**

## Server Logs to Check

Look for these messages in your server console:
- `Book issue notification sent to [email]`
- `Error sending book issue notification: [error]`
- `Email connection successful!`

If you see errors, the issue is with email configuration.
If you see no messages, the notification system isn't being triggered.
