const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    this.db = new sqlite3.Database('signatech.db', (err) => {
      if (err) console.error('Database connection error:', err);
      else console.log('Connected to SQLite database');
    });
    
    this.createTables();
  }

  createTables() {
    this.db.serialize(() => {
      // Users table
      this.db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        company TEXT,
        phone TEXT,
        role TEXT DEFAULT 'client',
        oauth_provider TEXT,
        email_notifications BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Contact submissions table
      this.db.run(`CREATE TABLE IF NOT EXISTS contact_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        company TEXT,
        email TEXT,
        phone TEXT,
        project TEXT,
        message TEXT NOT NULL,
        services TEXT,
        status TEXT DEFAULT 'pending',
        submission_group TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Add new columns for existing tables
      this.db.run("ALTER TABLE users ADD COLUMN email_notifications BOOLEAN DEFAULT 1", (err) => {
        // Ignore error if column already exists
      });
      
      this.db.run("ALTER TABLE contact_submissions ADD COLUMN services TEXT", (err) => {
        // Ignore error if column already exists
      });
      
      this.db.run("ALTER TABLE contact_submissions ADD COLUMN submission_group TEXT", (err) => {
        // Ignore error if column already exists
      });

      // Password resets table
      this.db.run(`CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Site images table
      this.db.run(`CREATE TABLE IF NOT EXISTS site_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        path TEXT NOT NULL,
        size INTEGER,
        mime_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Ratings table
      this.db.run(`CREATE TABLE IF NOT EXISTS ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        email TEXT,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT 0,
        is_featured BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Contact settings table
      this.db.run(`CREATE TABLE IF NOT EXISTS contact_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      this.seedDefaultData();
    });
  }

  seedDefaultData() {
    // Create admin user
    this.db.get("SELECT * FROM users WHERE email = 'contact@signatech.ma'", (err, row) => {
      if (!row) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        this.db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", 
          ['Admin', 'contact@signatech.ma', hashedPassword, 'admin']);
      }
    });

    // Insert default contact settings
    this.db.get("SELECT COUNT(*) as count FROM contact_settings", (err, row) => {
      if (!err && row.count === 0) {
        const defaultSettings = [
          ['company_name', 'Signa Tech'],
          ['company_tagline', 'Solutions PLV & Signalétique'],
          ['email', 'contact@signatech.ma'],
          ['phone', '+212 5 39 40 31 33'],
          ['whatsapp', '+212623537445'],
          ['address_fr', 'Zone Industrielle Gzenaya, lot 376, Tanger, Morocco'],
          ['address_en', 'Industrial Zone Gzenaya, lot 376, Tangier, Morocco'],
          ['hours_fr', 'Lun-Ven: 8h-18h | Sam: 8h-13h'],
          ['hours_en', 'Mon-Fri: 8am-6pm | Sat: 8am-1pm'],
          ['hours_detailed_fr', 'Lun - Ven: 8h00 - 18h00|Samedi: 8h00 - 13h00|Dimanche: Fermé'],
          ['hours_detailed_en', 'Mon - Fri: 8:00 AM - 6:00 PM|Saturday: 8:00 AM - 1:00 PM|Sunday: Closed']
        ];
        
        defaultSettings.forEach(([key, value]) => {
          this.db.run("INSERT INTO contact_settings (setting_key, setting_value) VALUES (?, ?)", [key, value]);
        });
        console.log('Default contact settings inserted');
      }
    });

    // Initialize default images
    this.db.get("SELECT COUNT(*) as count FROM site_images", (err, row) => {
      if (!err && row.count === 0) {
        const defaultImages = [
          { category: 'logo', filename: 'Logo.png', original_name: 'Logo.png', path: '/src/assets/Logo.png' },
          { category: 'hero', filename: 'main_pic.jpg', original_name: 'main_pic.jpg', path: '/src/assets/main_pic.jpg' },
          { category: 'about', filename: 'hero-workshop.jpg', original_name: 'hero-workshop.jpg', path: '/src/assets/hero-workshop.jpg' },
          { category: 'about', filename: 'team-work.jpg', original_name: 'team-work.jpg', path: '/src/assets/team-work.jpg' },
          { category: 'services', filename: 'facade-project.jpg', original_name: 'facade-project.jpg', path: '/src/assets/facade-project.jpg' },
          { category: 'services', filename: 'plv-displays.jpg', original_name: 'plv-displays.jpg', path: '/src/assets/plv-displays.jpg' }
        ];
        
        for (let i = 1; i <= 16; i++) {
          defaultImages.push({
            category: 'portfolio',
            filename: `${i}.jpg`,
            original_name: `${i}.jpg`,
            path: `/src/assets/${i}.jpg`
          });
        }
        
        defaultImages.forEach(img => {
          this.db.run("INSERT INTO site_images (category, filename, original_name, path) VALUES (?, ?, ?, ?)",
            [img.category, img.filename, img.original_name, img.path]);
        });
      }
    });

    // No sample ratings - only real user ratings will be displayed

    // Migrate existing contact submissions to new format
    this.db.all("SELECT * FROM contact_submissions WHERE services IS NULL", (err, rows) => {
      if (!err && rows && rows.length > 0) {
        rows.forEach(row => {
          const services = [];
          if (row.service_type) {
            const service = {
              serviceType: row.service_type,
              material: row.material || '',
              size: row.size || '',
              quantity: row.quantity || '',
              thickness: row.thickness || '',
              colors: row.colors || '',
              finishing: row.finishing || '',
              cuttingApplication: row.cutting_application || ''
            };
            services.push(service);
          }
          
          this.db.run("UPDATE contact_submissions SET services = ?, submission_group = ? WHERE id = ?",
            [JSON.stringify(services), `group_${row.id}`, row.id]);
        });
      }
    });
    
    // Update existing submissions without submission_group
    setTimeout(() => {
      this.db.all("SELECT * FROM contact_submissions WHERE submission_group IS NULL", (err, rows) => {
        if (!err && rows && rows.length > 0) {
          rows.forEach(row => {
            this.db.run("UPDATE contact_submissions SET submission_group = ? WHERE id = ?",
              [`group_${row.id}`, row.id]);
          });
        }
      });
    }, 1000);
  }

  getDb() {
    return this.db;
  }
  
  async backup(backupPath) {
    return new Promise((resolve, reject) => {
      const backupDb = new sqlite3.Database(backupPath || `signatech_backup_${Date.now()}.db`);
      
      this.db.backup(backupDb)
        .then(() => {
          console.log(`Backup completed to ${backupPath || `signatech_backup_${Date.now()}.db`}`);
          backupDb.close();
          resolve(true);
        })
        .catch(err => {
          console.error('Backup failed:', err);
          backupDb.close();
          reject(err);
        });
    });
  }
  
  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
  
  async exec(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
}

module.exports = new Database();