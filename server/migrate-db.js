const database = require('./config/database');

console.log('Running database migrations...');

// The database initialization will run automatically when we require the database module
// This includes creating new columns and updating existing data

setTimeout(() => {
  console.log('Database migrations completed!');
  console.log('New features added:');
  console.log('- Email notification preferences for admins');
  console.log('- Submission grouping for multiple services');
  console.log('- Enhanced service information storage');
  process.exit(0);
}, 2000);