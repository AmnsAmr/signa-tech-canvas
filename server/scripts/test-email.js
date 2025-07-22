/**
 * Test script for email service
 * 
 * Usage: node scripts/test-email.js
 */

require('dotenv').config();
const emailService = require('../utils/emailService');

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
      fileName: 'test-file.pdf',
      vectorAnalysis: {
        paperArea: '210x297mm (A4)',
        letterArea: '12.3 cm²',
        pathLength: '45.7 cm',
        shapes: [
          {
            name: 'Shape 1',
            length: '25.2 cm',
            area: '5.8 cm²'
          },
          {
            name: 'Shape 2',
            length: '20.5 cm',
            area: '6.5 cm²'
          }
        ]
      }
    });
    
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

testEmail();