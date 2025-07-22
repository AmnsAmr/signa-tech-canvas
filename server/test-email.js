require('dotenv').config();
const emailService = require('./utils/emailService');

// Log environment variables
console.log('Email configuration:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '******' : 'Not set');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);

// Test sending an email
async function testEmail() {
  try {
    console.log('Attempting to send test email...');
    
    const result = await emailService.sendContactNotification({
      name: 'Test User',
      company: 'Test Company',
      email: 'test@example.com',
      phone: '123456789',
      project: 'Test Project',
      message: 'This is a test message',
      services: [
        {
          serviceType: 'Test Service',
          material: 'Test Material',
          size: '10x10',
          quantity: '1'
        }
      ],
      isGuest: true,
      hasFile: true,
      fileName: 'test-file.pdf'
    });
    
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

testEmail();