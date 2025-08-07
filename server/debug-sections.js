const database = require('./config/database');
const db = database.getDb();

// Check tables and data
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='projects'", (err, row) => {
  console.log('Projects table exists:', !!row);
});

db.all("SELECT * FROM project_sections", (err, rows) => {
  if (err) {
    console.error('Error fetching sections:', err);
  } else {
    console.log('Current sections:', rows);
  }
});

// Test direct delete
const testId = 12; // Use the ID from your test
console.log(`Attempting to delete section ${testId}...`);

db.run("DELETE FROM project_sections WHERE id = ?", [testId], function(err) {
  if (err) {
    console.error('Direct delete error:', err);
  } else {
    console.log('Direct delete changes:', this.changes);
  }
  
  // Check remaining sections
  db.all("SELECT * FROM project_sections", (err, rows) => {
    if (err) {
      console.error('Error fetching sections after delete:', err);
    } else {
      console.log('Sections after delete:', rows);
    }
    process.exit(0);
  });
});