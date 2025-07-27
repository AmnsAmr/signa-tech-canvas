function runMigration(db) {
  return new Promise((resolve, reject) => {
    // Create email_verifications table
    db.run(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating email_verifications table:', err);
        reject(err);
      } else {
        console.log('✓ Created email_verifications table');
        
        // Add email_verified column to users table
        db.run(`
          ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0
        `, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding email_verified column:', err);
            reject(err);
          } else {
            console.log('✓ Added email_verified column to users table');
            resolve();
          }
        });
      }
    });
  });
}

module.exports = { runMigration };