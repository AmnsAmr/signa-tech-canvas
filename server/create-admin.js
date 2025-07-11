const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Connect to database
const db = new sqlite3.Database('signatech.db');

// Admin user details - CHANGE THESE
const adminData = {
  name: 'Your Admin Name',
  email: 'your-admin@email.com',
  password: 'your-secure-password',
  company: 'Signa Tech',
  phone: '+212 6 XX XX XX XX'
};

async function createAdmin() {
  try {
    // Check if user already exists
    db.get("SELECT * FROM users WHERE email = ?", [adminData.email], async (err, row) => {
      if (row) {
        console.log('❌ User with this email already exists');
        db.close();
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      // Insert admin user
      db.run(
        "INSERT INTO users (name, email, password, company, phone, role) VALUES (?, ?, ?, ?, ?, ?)",
        [adminData.name, adminData.email, hashedPassword, adminData.company, adminData.phone, 'admin'],
        function(err) {
          if (err) {
            console.error('❌ Error creating admin:', err);
          } else {
            console.log('✅ Admin user created successfully!');
            console.log(`📧 Email: ${adminData.email}`);
            console.log(`🔑 Password: ${adminData.password}`);
          }
          db.close();
        }
      );
    });
  } catch (error) {
    console.error('❌ Error:', error);
    db.close();
  }
}

createAdmin();