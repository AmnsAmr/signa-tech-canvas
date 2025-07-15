# Email Notification Setup Guide

## Current Status
✅ **System Implementation**: Complete - All code is ready
❌ **Email Configuration**: Missing - Needs setup

## Quick Setup Steps

### 1. Configure Email Credentials

Create or update your `.env` file in the `server` folder:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_SERVICE=gmail
```

### 2. Gmail App Password Setup

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
   - Use this password in `EMAIL_PASS`

### 3. Test the System

Run the test script:
```bash
cd server
node test-notification.js
```

### 4. Admin Notification Settings

Each admin can toggle their email notifications in the admin panel:
- Go to Admin Panel
- Look for the notification toggle button (🔔/🔕)
- Toggle ON to receive notifications

## How It Works

1. **Contact Form Submission**: When someone submits the contact form
2. **Admin Filter**: System finds all admins with notifications enabled
3. **Email Sent**: Notification email sent to enabled admins
4. **Email Content**: Includes all form data and service details

## Current Admin Status

From the test results:
- **Admin (contact@signatech.ma)**: Notifications OFF
- **mohamed amine (amraniaamine@gmail.com)**: Notifications ON

## Troubleshooting

### No Emails Received?
1. Check `.env` file has correct credentials
2. Verify Gmail app password is correct
3. Check admin has notifications enabled
4. Run test script to verify setup

### Test Email
The system includes a test script that will:
- Show all admins and their notification status
- Verify email configuration
- Send a test notification if everything is configured

## Alternative Email Services

You can use other email services by changing `EMAIL_SERVICE`:
- `gmail` (default)
- `outlook`
- `yahoo`
- Or configure custom SMTP settings in `emailService.js`