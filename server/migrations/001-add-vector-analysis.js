/**
 * Migration script to add vector analysis table
 */

const database = require('../config/database');
const db = database.getDb();

async function runMigration() {
  return new Promise((resolve, reject) => {
    console.log('Running vector analysis table migration...');
    
    // Create vector_analysis table
    db.run(`
      CREATE TABLE IF NOT EXISTS vector_analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        submission_id INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        paper_area TEXT,
        letter_area TEXT,
        path_length TEXT,
        shapes_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES contact_submissions(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Error creating vector_analysis table:', err);
        reject(err);
        return;
      }
      
      console.log('Vector analysis table created successfully');
      resolve();
    });
  });
}

module.exports = { runMigration };