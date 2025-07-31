const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'signatech.db');
const db = new sqlite3.Database(dbPath);

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE role = 'admin' LIMIT 1", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      console.log('ID:', existingAdmin.id);
      return;
    }

    // Create admin user
    const adminEmail = 'admin@signatech.com';
    const adminPassword = 'admin123';
    const adminName = 'Admin User';

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const adminId = await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
        [adminName, adminEmail, hashedPassword, 'admin'],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('ID:', adminId);
    console.log('\n⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    db.close();
  }
}

// Check if users table exists first
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
  if (err) {
    console.error('Database error:', err);
    db.close();
    return;
  }
  
  if (!row) {
    console.log('❌ Users table does not exist. Please run database initialization first.');
    db.close();
    return;
  }
  
  createAdmin();
});