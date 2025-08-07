const database = require('./config/database');
const db = database.getDb();

async function testProjectSections() {
  console.log('Testing project sections...');
  
  // Check if table exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='project_sections'", (err, row) => {
    if (err) {
      console.error('Error checking table:', err);
      return;
    }
    
    if (!row) {
      console.log('❌ project_sections table does not exist');
      console.log('Running migration...');
      
      // Create the table
      db.run(`CREATE TABLE IF NOT EXISTS project_sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) {
          console.error('Error creating table:', err);
          return;
        }
        console.log('✅ project_sections table created');
        testOperations();
      });
    } else {
      console.log('✅ project_sections table exists');
      testOperations();
    }
  });
}

function testOperations() {
  // Test insert
  console.log('Testing insert...');
  db.run("INSERT INTO project_sections (name, display_order) VALUES (?, ?)", 
    ['Test Section', 1], function(err) {
    if (err) {
      console.error('Insert error:', err);
      return;
    }
    console.log('✅ Insert successful, ID:', this.lastID);
    
    const testId = this.lastID;
    
    // Test select
    db.all("SELECT * FROM project_sections", (err, rows) => {
      if (err) {
        console.error('Select error:', err);
        return;
      }
      console.log('✅ Select successful, rows:', rows.length);
      console.log('Data:', rows);
      
      // Test delete
      db.run("DELETE FROM project_sections WHERE id = ?", [testId], function(err) {
        if (err) {
          console.error('Delete error:', err);
          return;
        }
        console.log('✅ Delete successful, changes:', this.changes);
        process.exit(0);
      });
    });
  });
}

testProjectSections();