const database = require('./config/database');
const db = database.getDb();

console.log('Ensuring project tables exist...\n');

// Create project_sections table if it doesn't exist
const createProjectSectionsTable = () => {
  return new Promise((resolve, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS project_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating project_sections table:', err);
        reject(err);
      } else {
        console.log('✓ project_sections table created/verified');
        resolve();
      }
    });
  });
};

// Create projects table if it doesn't exist
const createProjectsTable = () => {
  return new Promise((resolve, reject) => {
    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      image_filename TEXT,
      display_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (section_id) REFERENCES project_sections (id) ON DELETE CASCADE
    )`, (err) => {
      if (err) {
        console.error('Error creating projects table:', err);
        reject(err);
      } else {
        console.log('✓ projects table created/verified');
        resolve();
      }
    });
  });
};

// Insert default sections if none exist
const insertDefaultSections = () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) as count FROM project_sections", (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (row.count === 0) {
        const defaultSections = [
          { name: 'Web Projects', display_order: 1 },
          { name: 'Mobile Applications', display_order: 2 },
          { name: 'Brand Identity', display_order: 3 }
        ];
        
        let completed = 0;
        defaultSections.forEach((section, index) => {
          db.run("INSERT INTO project_sections (name, display_order) VALUES (?, ?)",
            [section.name, section.display_order], (err) => {
              if (err) {
                console.error('Error inserting default section:', err);
                reject(err);
                return;
              }
              completed++;
              if (completed === defaultSections.length) {
                console.log('✓ Default project sections inserted');
                resolve();
              }
            });
        });
      } else {
        console.log('✓ Project sections already exist');
        resolve();
      }
    });
  });
};

// Run the setup
async function setupProjectTables() {
  try {
    await createProjectSectionsTable();
    await createProjectsTable();
    await insertDefaultSections();
    
    console.log('\n✅ Project tables setup completed successfully!');
    
    // Verify the setup
    db.all("SELECT * FROM project_sections", (err, sections) => {
      if (err) {
        console.error('Error verifying sections:', err);
        return;
      }
      console.log(`\nFound ${sections.length} project sections:`);
      sections.forEach(section => {
        console.log(`  - ${section.name} (ID: ${section.id}, Order: ${section.display_order})`);
      });
      
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupProjectTables();