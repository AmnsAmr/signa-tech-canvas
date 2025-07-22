/**
 * Script to ensure the email_notifications column exists in the users table
 * and has the correct default value.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Connect to the database
const dbPath = path.join(__dirname, '..', 'signatech.db');
console.log(`Connecting to database at: ${dbPath}`);

if (!fs.existsSync(dbPath)) {
  console.error('Database file not found!');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath);

// Check if the email_notifications column exists
db.get("PRAGMA table_info(users)", (err, rows) => {
  if (err) {
    console.error('Error checking table schema:', err);
    db.close();
    process.exit(1);
  }
  
  console.log('Checking users table schema...');
  
  // Get column info
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error('Error getting table info:', err);
      db.close();
      process.exit(1);
    }
    
    console.log('Current columns in users table:');
    columns.forEach(col => {
      console.log(`- ${col.name} (${col.type}, default: ${col.dflt_value})`);
    });
    
    const hasEmailNotifications = columns.some(col => col.name === 'email_notifications');
    
    if (!hasEmailNotifications) {
      console.log('Adding email_notifications column to users table...');
      
      db.run("ALTER TABLE users ADD COLUMN email_notifications BOOLEAN DEFAULT 1", err => {
        if (err) {
          console.error('Error adding column:', err);
        } else {
          console.log('Column added successfully!');
        }
        
        // Set all existing admins to have notifications enabled
        db.run("UPDATE users SET email_notifications = 1 WHERE role = 'admin'", err => {
          if (err) {
            console.error('Error updating admin notification settings:', err);
          } else {
            console.log('Admin notification settings updated successfully!');
          }
          db.close();
        });
      });
    } else {
      console.log('email_notifications column already exists.');
      
      // Ensure all admins have a value set for email_notifications
      db.run("UPDATE users SET email_notifications = 1 WHERE role = 'admin' AND email_notifications IS NULL", err => {
        if (err) {
          console.error('Error updating admin notification settings:', err);
        } else {
          console.log('Admin notification settings updated successfully!');
        }
        
        // Print current admin notification settings
        db.all("SELECT id, name, email, email_notifications FROM users WHERE role = 'admin'", (err, admins) => {
          if (err) {
            console.error('Error getting admin info:', err);
          } else {
            console.log('\nCurrent admin notification settings:');
            admins.forEach(admin => {
              console.log(`- ${admin.name} (${admin.email}): ${admin.email_notifications === 1 ? 'Enabled' : 'Disabled'}`);
            });
          }
          db.close();
        });
      });
    }
  });
});