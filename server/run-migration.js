const DbMigrationManager = require('./utils/dbMigrationManager');

async function runMigration() {
  console.log('Running database migrations...');
  
  try {
    const success = await DbMigrationManager.runAllMigrations();
    if (success) {
      console.log('✅ All migrations completed successfully');
      process.exit(0);
    } else {
      console.error('❌ Migration failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

runMigration();