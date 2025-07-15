const database = require('./config/database');
const path = require('path');
const fs = require('fs');

// Create backups directory if it doesn't exist
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

async function performMaintenance() {
  try {
    console.log('Starting database maintenance...');
    
    // Create backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `signatech_backup_${timestamp}.db`);
    await database.backup(backupPath);
    
    // Optimize database
    await database.exec('VACUUM');
    await database.exec('PRAGMA optimize');
    
    // Check for orphaned records
    const orphanedSubmissions = await database.query(`
      SELECT id FROM contact_submissions 
      WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users)
    `);
    
    if (orphanedSubmissions.length > 0) {
      console.log(`Found ${orphanedSubmissions.length} orphaned submissions. Fixing...`);
      await database.exec(`
        UPDATE contact_submissions 
        SET user_id = NULL 
        WHERE user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM users)
      `);
    }
    
    console.log('Database maintenance completed successfully');
  } catch (error) {
    console.error('Database maintenance failed:', error);
  }
}

// Run maintenance if script is executed directly
if (require.main === module) {
  performMaintenance().then(() => {
    console.log('Maintenance script completed');
    process.exit(0);
  }).catch(err => {
    console.error('Maintenance script failed:', err);
    process.exit(1);
  });
}

module.exports = { performMaintenance };