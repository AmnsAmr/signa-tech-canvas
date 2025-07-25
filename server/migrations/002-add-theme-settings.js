const db = require('../config/database');

const migration = {
  up: () => {
    console.log('Creating theme_settings table...');
    
    db.prepare(`
      CREATE TABLE IF NOT EXISTS theme_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        colors TEXT NOT NULL,
        dark_mode INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    console.log('Theme settings table created successfully');
  },
  
  down: () => {
    console.log('Dropping theme_settings table...');
    db.prepare('DROP TABLE IF EXISTS theme_settings').run();
    console.log('Theme settings table dropped');
  }
};

module.exports = migration;