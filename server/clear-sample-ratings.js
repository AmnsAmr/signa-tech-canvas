const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('signatech.db');

// Clear sample ratings (those without user_id)
db.run("DELETE FROM ratings WHERE user_id IS NULL", function(err) {
  if (err) {
    console.error('Error clearing sample ratings:', err);
  } else {
    console.log(`Cleared ${this.changes} sample ratings`);
  }
  
  db.close();
});