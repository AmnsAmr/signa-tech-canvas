const sqlite3 = require('sqlite3').verbose();

const migration = {
  up: (db) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Create project_sections table
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
            return;
          }
        });

        // Create projects table
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
            return;
          }
        });

        // Insert default sections
        db.get("SELECT COUNT(*) as count FROM project_sections", (err, row) => {
          if (!err && row.count === 0) {
            const defaultSections = [
              { name: 'Projets Web', display_order: 1 },
              { name: 'Applications Mobiles', display_order: 2 },
              { name: 'Identité Visuelle', display_order: 3 }
            ];
            
            defaultSections.forEach((section, index) => {
              db.run("INSERT INTO project_sections (name, display_order) VALUES (?, ?)",
                [section.name, section.display_order], (err) => {
                  if (err) {
                    console.error('Error inserting default section:', err);
                  }
                  if (index === defaultSections.length - 1) {
                    resolve();
                  }
                });
            });
          } else {
            resolve();
          }
        });
      });
    });
  },

  down: (db) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("DROP TABLE IF EXISTS projects", (err) => {
          if (err) reject(err);
        });
        db.run("DROP TABLE IF EXISTS project_sections", (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }
};

module.exports = migration;