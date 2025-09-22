# Email Configuration Setup Guide

This guide will help you configure real email sending for the applicant management system.

## 📧 Email Features

- **Status Updates**: Send emails when applicants are approved/rejected
- **Interview Scheduling**: Send detailed interview confirmation emails
- **Professional Templates**: Beautiful HTML email templates

## 🔧 Configuration Steps

### 1. Choose Your Email Provider

#### Option A: Gmail (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use these settings:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=your-email@gmail.com
   ```

#### Option B: Outlook/Hotmail
```
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=your-email@outlook.com
```

#### Option C: Yahoo
1. Enable 2-Factor Authentication
2. Generate an App Password
3. Use these settings:
   ```
   SMTP_HOST=smtp.mail.yahoo.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@yahoo.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@yahoo.com
   ```

### 2. Create Environment File

Create a `.env` file in the `backend` directory:

```bash
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# JWT Secret
JWT_SECRET=your-jwt-secret-key-here
```

### 3. Test Email Configuration

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Test email configuration:
   ```bash
   curl http://localhost:5001/test-email
   ```

   You should see:
   ```json
   {
     "status": "ok",
     "message": "Email configuration is valid",
     "timestamp": "2025-09-21T10:00:00.000Z"
   }
   ```

## 🧪 Testing Email Functionality

### Test Status Update Email
1. Go to Admin Panel → Applicant Management
2. Select an applicant
3. Change their status to "Approved" or "Rejected"
4. Check the applicant's email inbox

### Test Interview Scheduling Email
1. Go to Admin Panel → Applicant Management
2. Select an approved applicant
3. Click "Schedule Interview"
4. Fill in the interview details
5. Check the applicant's email inbox

## 📧 Email Templates

The system includes professional HTML email templates for:

### Status Update Emails
- **Approved**: Congratulations message with next steps
- **Rejected**: Professional rejection with encouragement
- **Pending**: Status confirmation

### Interview Scheduling Emails
- **Complete Details**: Date, time, location/link
- **Important Reminders**: What to bring, arrival time
- **Professional Formatting**: Clean, responsive design

## 🔍 Troubleshooting

### Common Issues

1. **"Email not configured" error**
   - Check that all SMTP environment variables are set
   - Verify the `.env` file is in the `backend` directory

2. **"Authentication failed" error**
   - For Gmail: Use App Password, not regular password
   - Enable 2-Factor Authentication first
   - Check username/password are correct

3. **"Connection timeout" error**
   - Check SMTP_HOST and SMTP_PORT are correct
   - Verify internet connection
   - Try different SMTP port (465 for SSL)

4. **Emails not received**
   - Check spam/junk folder
   - Verify email address is correct
   - Check SMTP_FROM address

### Debug Mode

Enable detailed logging by setting:
```
NODE_ENV=development
```

This will show detailed email sending logs in the console.

## 🚀 Production Setup

For production deployment:

1. Use environment variables from your hosting platform
2. Consider using a dedicated email service (SendGrid, Mailgun, etc.)
3. Set up proper error monitoring
4. Configure email delivery tracking

## 📞 Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your email provider's SMTP settings
3. Test with a simple email first
4. Check firewall/network restrictions
