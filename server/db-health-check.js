const database = require('./config/database');

async function checkDatabaseHealth() {
  try {
    console.log('Checking database health...');
    
    // Check if tables exist
    const tables = await database.query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    
    console.log(`Found ${tables.length} tables in database`);
    
    // Get counts for each table
    for (const table of tables) {
      const count = await database.query(`SELECT COUNT(*) as count FROM ${table.name}`);
      console.log(`- ${table.name}: ${count[0].count} records`);
    }
    
    // Check database integrity
    const integrityCheck = await database.query('PRAGMA integrity_check');
    console.log(`Integrity check: ${integrityCheck[0].integrity_check}`);
    
    // Check for foreign key constraints
    const foreignKeyCheck = await database.query('PRAGMA foreign_key_check');
    if (foreignKeyCheck.length === 0) {
      console.log('Foreign key check: OK');
    } else {
      console.log('Foreign key violations found:', foreignKeyCheck);
    }
    
    console.log('Database health check completed');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Run health check if script is executed directly
if (require.main === module) {
  checkDatabaseHealth().then(healthy => {
    console.log(`Database health: ${healthy ? 'GOOD' : 'ISSUES DETECTED'}`);
    process.exit(healthy ? 0 : 1);
  }).catch(err => {
    console.error('Health check script failed:', err);
    process.exit(1);
  });
}

module.exports = { checkDatabaseHealth };