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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

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

      this.seedDefaultData();
    });
  }

  seedDefaultData() {
    // Create admin user
    this.db.get("SELECT * FROM users WHERE email = 'admin@signatech.com'", (err, row) => {
      if (!row) {
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        this.db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", 
          ['Admin', 'admin@signatech.com', hashedPassword, 'admin']);
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

    // Seed sample ratings
    this.db.get("SELECT COUNT(*) as count FROM ratings", (err, row) => {
      if (!err && row.count === 0) {
        const sampleRatings = [
          { name: 'Ahmed Benali', rating: 5, comment: 'Service exceptionnel! Qualité parfaite et livraison rapide.', is_approved: 1, is_featured: 1 },
          { name: 'Fatima Zahra', rating: 5, comment: 'Très professionnel, je recommande vivement SignaTech.', is_approved: 1, is_featured: 1 },
          { name: 'Omar Alami', rating: 4, comment: 'Bon travail, équipe réactive et prix compétitifs.', is_approved: 1, is_featured: 1 },
          { name: 'Laila Mansouri', rating: 5, comment: 'Excellent service client et résultats impeccables.', is_approved: 1 },
          { name: 'Youssef Tazi', rating: 4, comment: 'Très satisfait du résultat final, merci!', is_approved: 1 }
        ];
        
        sampleRatings.forEach(rating => {
          this.db.run("INSERT INTO ratings (name, rating, comment, is_approved, is_featured) VALUES (?, ?, ?, ?, ?)",
            [rating.name, rating.rating, rating.comment, rating.is_approved, rating.is_featured || 0]);
        });
      }
    });
  }

  getDb() {
    return this.db;
  }
}

module.exports = new Database();