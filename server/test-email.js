require('dotenv').config();
const emailService = require('./utils/emailService');

async function testEmailService() {
  console.log('Testing email service...');
  console.log('Email credentials:');
  console.log('- User:', process.env.EMAIL_USER);
  console.log('- Pass:', process.env.EMAIL_PASS ? '******' : 'Not set');
  console.log('- Service:', process.env.EMAIL_SERVICE || 'gmail');
  
  try {
    // Get admin emails from database
    const database = require('./config/database');
    const db = database.getDb();
    
    const adminEmails = await new Promise((resolve, reject) => {
      db.all("SELECT email FROM users WHERE role = 'admin'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.email));
      });
    });
    
    console.log('Admin emails found:', adminEmails);
    
    if (adminEmails.length === 0) {
      console.log('No admin emails found. Creating a test notification...');
      
      // Send a test email to the EMAIL_USER
      await emailService.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: 'Test Email from SignaTech',
        html: `
          <h2>This is a test email</h2>
          <p>If you're seeing this, the email service is working correctly.</p>
          <p>Time: ${new Date().toISOString()}</p>
        `
      });
      
      console.log('Test email sent to:', process.env.EMAIL_USER);
    } else {
      // Send a test notification
      await emailService.sendContactNotification({
        name: 'Test User',
        company: 'Test Company',
        email: 'test@example.com',
        phone: '123456789',
        project: 'Test Project',
        message: 'This is a test message to verify the email notification system.',
        services: [
          {
            serviceType: 'Test Service',
            material: 'Test Material',
            size: '10x10cm'
          }
        ],
        isGuest: true
      });
      
      console.log('Test notification sent to admins:', adminEmails);
    }
    
    console.log('Email test completed successfully!');
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

testEmailService().then(() => {
  console.log('Test script completed');
  process.exit(0);
}).catch(err => {
  console.error('Test script failed:', err);
  process.exit(1);
});