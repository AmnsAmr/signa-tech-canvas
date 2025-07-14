const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('signatech.db');

db.serialize(() => {
  // First, let's see what ratings exist
  db.all("SELECT * FROM ratings", (err, rows) => {
    if (err) {
      console.error('Error fetching ratings:', err);
      return;
    }
    
    console.log('Current ratings:');
    rows.forEach(row => {
      console.log(`ID: ${row.id}, User: ${row.user_id}, Name: ${row.name}, Approved: ${row.is_approved}`);
    });
    
    // Remove duplicate ratings (keep only the first one per user)
    db.run(`DELETE FROM ratings WHERE id NOT IN (
      SELECT MIN(id) FROM ratings WHERE user_id IS NOT NULL GROUP BY user_id
    ) AND user_id IS NOT NULL`, function(err) {
      if (err) {
        console.error('Error removing duplicates:', err);
      } else {
        console.log(`Removed ${this.changes} duplicate ratings`);
      }
      
      // Auto-approve all remaining ratings for testing
      db.run("UPDATE ratings SET is_approved = 1", function(err) {
        if (err) {
          console.error('Error approving ratings:', err);
        } else {
          console.log(`Approved ${this.changes} ratings`);
        }
        
        db.close();
      });
    });
  });
});