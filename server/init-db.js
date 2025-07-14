const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('signatech.db');

db.serialize(() => {
  // Create ratings table
  db.run(`CREATE TABLE IF NOT EXISTS ratings (
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
  )`, (err) => {
    if (err) {
      console.error('Error creating ratings table:', err);
    } else {
      console.log('Ratings table created successfully');
    }
  });

  // Add services column to contact_submissions if it doesn't exist
  db.run("ALTER TABLE contact_submissions ADD COLUMN services TEXT", (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding services column:', err);
    } else {
      console.log('Services column added/exists');
    }
  });

  // Insert sample ratings
  db.get("SELECT COUNT(*) as count FROM ratings", (err, row) => {
    if (!err && row.count === 0) {
      const sampleRatings = [
        { name: 'Ahmed Benali', rating: 5, comment: 'Service exceptionnel! Qualité parfaite et livraison rapide.', is_approved: 1, is_featured: 1 },
        { name: 'Fatima Zahra', rating: 5, comment: 'Très professionnel, je recommande vivement SignaTech.', is_approved: 1, is_featured: 1 },
        { name: 'Omar Alami', rating: 4, comment: 'Bon travail, équipe réactive et prix compétitifs.', is_approved: 1, is_featured: 1 }
      ];
      
      sampleRatings.forEach(rating => {
        db.run("INSERT INTO ratings (name, rating, comment, is_approved, is_featured) VALUES (?, ?, ?, ?, ?)",
          [rating.name, rating.rating, rating.comment, rating.is_approved, rating.is_featured || 0]);
      });
      console.log('Sample ratings inserted');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('Database initialization complete');
  }
});