const sqlite3 = require('sqlite3').verbose();

// Connect to database
const db = new sqlite3.Database('signatech.db');

// Email of user to promote - CHANGE THIS
const userEmail = 'user@example.com';

function promoteToAdmin() {
  db.run(
    "UPDATE users SET role = 'admin' WHERE email = ?",
    [userEmail],
    function(err) {
      if (err) {
        console.error('❌ Error promoting user:', err);
      } else if (this.changes === 0) {
        console.log('❌ User not found with email:', userEmail);
      } else {
        console.log('✅ User promoted to admin successfully!');
        console.log(`📧 Email: ${userEmail}`);
      }
      db.close();
    }
  );
}

promoteToAdmin();