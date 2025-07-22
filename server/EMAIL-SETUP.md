# Email Setup Instructions

To enable email notifications for contact form submissions, you need to configure your email credentials in the `.env` file.

## Gmail Setup

1. Create or use an existing Gmail account
2. Enable "Less secure app access" or create an App Password:
   - Go to your Google Account settings
   - Search for "App passwords" or go to Security > App passwords
   - Create a new app password for "Mail" and "Other (Custom name)"
   - Use the generated password in your .env file

## .env Configuration

Add the following to your `.env` file:

```
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-app-password
```

## Testing Email

Run the test script to verify your email configuration:

```
node test-email.js
```

## Troubleshooting

If emails are not being sent:

1. Check server logs for any error messages
2. Verify your Gmail credentials are correct
3. Make sure your Gmail account allows less secure apps or you're using an App Password
4. Check if your Gmail account has any sending limits or restrictions
5. Try using a different email service provider if Gmail doesn't work