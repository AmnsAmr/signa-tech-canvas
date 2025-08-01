/**
 * Migration: Add contact settings table
 */

const fs = require('fs');
const path = require('path');

async function up(db) {
  return new Promise((resolve, reject) => {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../config/contact-settings.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL statements and execute them
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    let completed = 0;
    const total = statements.length;
    
    if (total === 0) {
      resolve();
      return;
    }
    
    statements.forEach((statement, index) => {
      db.run(statement.trim(), function(err) {
        if (err) {
          console.error(`Error executing statement ${index + 1}:`, err);
          reject(err);
          return;
        }
        
        completed++;
        if (completed === total) {
          console.log('Contact settings table created and populated with default values');
          resolve();
        }
      });
    });
  });
}

async function down(db) {
  return new Promise((resolve, reject) => {
    db.run('DROP TABLE IF EXISTS contact_settings', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = { up, down };