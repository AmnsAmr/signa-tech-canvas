const database = require('./config/database');
const db = database.getDb();

async function clearDatabase() {
  console.log('Starting database cleanup (preserving users table)...');
  
  const tablesToClear = [
    'contact_submissions',
    'password_resets', 
    'site_images',
    'ratings',
    'contact_settings',
    'vector_analysis',
    'projects',
    'project_sections'
  ];

  for (const table of tablesToClear) {
    try {
      await new Promise((resolve, reject) => {
        db.run(`DELETE FROM ${table}`, (err) => {
          if (err) {
            console.error(`Error clearing ${table}:`, err);
            reject(err);
          } else {
            console.log(`✓ Cleared ${table} table`);
            resolve();
          }
        });
      });
    } catch (error) {
      console.error(`Failed to clear ${table}:`, error.message);
    }
  }

  console.log('Database cleanup completed. Users table preserved.');
  process.exit(0);
}

clearDatabase().catch(console.error);