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
          
          // Insert sample data
          const sampleCategories = [
            { name: 'Products', parent_id: null, display_order: 1 },
            { name: 'Services', parent_id: null, display_order: 2 },
            { name: 'Banners', parent_id: 1, display_order: 1 },
            { name: 'Business Cards', parent_id: 1, display_order: 2 },
            { name: 'Signage', parent_id: 1, display_order: 3 },
            { name: 'Brochures', parent_id: 1, display_order: 4 },
            { name: 'Design', parent_id: 2, display_order: 1 },
            { name: 'Installation', parent_id: 2, display_order: 2 },
            { name: 'Maintenance', parent_id: 2, display_order: 3 }
          ];
          
          let completed = 0;
          sampleCategories.forEach((category, index) => {
            db.run(
              'INSERT INTO categories (name, parent_id, display_order) VALUES (?, ?, ?)',
              [category.name, category.parent_id, category.display_order],
              (err) => {
                if (err) console.error('Error inserting sample category:', err);
                completed++;
                if (completed === sampleCategories.length) {
                  console.log('Categories migration completed successfully');
                  resolve();
                }
              }
            );
          });
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