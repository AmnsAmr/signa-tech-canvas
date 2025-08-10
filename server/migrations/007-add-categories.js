const Database = require('../config/database');

const migration = {
  up: async () => {
    const db = Database.getDb();
    
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Create categories table
        db.run(`CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          parent_id INTEGER DEFAULT NULL,
          display_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE CASCADE
        )`, (err) => {
          if (err) {
            console.error('Error creating categories table:', err);
            reject(err);
            return;
          }
          
          console.log('Categories migration completed successfully');
          resolve();
        });
      });
    });
  },

  down: async () => {
    const db = Database.getDb();
    
    return new Promise((resolve, reject) => {
      db.run('DROP TABLE IF EXISTS categories', (err) => {
        if (err) {
          console.error('Error dropping categories table:', err);
          reject(err);
        } else {
          console.log('Categories table dropped successfully');
          resolve();
        }
      });
    });
  }
};

module.exports = migration;