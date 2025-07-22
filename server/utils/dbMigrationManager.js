/**
 * Database Migration Manager
 * 
 * Handles all database migrations in a centralized way
 */

const fs = require('fs');
const path = require('path');
const database = require('../config/database');

const db = database.getDb();

class DbMigrationManager {
  /**
   * Run all migrations in order
   */
  static async runAllMigrations() {
    console.log('Starting database migrations...');
    
    try {
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();
      
      // Get all completed migrations
      const completedMigrations = await this.getCompletedMigrations();
      
      // Get all migration files
      const migrationsDir = path.join(__dirname, '../migrations');
      if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
      }
      
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.js'))
        .sort(); // Sort to ensure migrations run in order
      
      // Run each migration that hasn't been completed yet
      for (const file of migrationFiles) {
        const migrationName = path.basename(file, '.js');
        
        if (!completedMigrations.includes(migrationName)) {
          console.log(`Running migration: ${migrationName}`);
          
          try {
            // Import and run the migration
            const migration = require(`../migrations/${file}`);
            await migration.runMigration();
            
            // Mark migration as completed
            await this.markMigrationCompleted(migrationName);
            
            console.log(`Migration completed: ${migrationName}`);
          } catch (error) {
            console.error(`Migration failed: ${migrationName}`, error);
            throw error; // Re-throw to stop the migration process
          }
        } else {
          console.log(`Skipping already completed migration: ${migrationName}`);
        }
      }
      
      console.log('All database migrations completed successfully');
      return true;
    } catch (error) {
      console.error('Database migration failed:', error);
      return false;
    }
  }
  
  /**
   * Create migrations table if it doesn't exist
   */
  static async createMigrationsTable() {
    return new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  
  /**
   * Get all completed migrations
   */
  static async getCompletedMigrations() {
    return new Promise((resolve, reject) => {
      db.all('SELECT name FROM migrations', (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.name));
      });
    });
  }
  
  /**
   * Mark a migration as completed
   */
  static async markMigrationCompleted(name) {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO migrations (name) VALUES (?)', [name], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }
  
  /**
   * Run database health checks
   */
  static async runHealthChecks() {
    console.log('Running database health checks...');
    
    try {
      // Check if database is accessible
      await new Promise((resolve, reject) => {
        db.get('SELECT 1', (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      // Check if required tables exist
      const requiredTables = [
        'users', 
        'contact_submissions', 
        'ratings',
        'contact_settings'
      ];
      
      for (const table of requiredTables) {
        try {
          await new Promise((resolve, reject) => {
            db.get(`SELECT 1 FROM ${table} LIMIT 1`, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        } catch (error) {
          console.warn(`Table '${table}' not found or not accessible`);
        }
      }
      
      console.log('Database health checks completed');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
  
  /**
   * Create a database backup
   */
  static async createBackup() {
    const dbPath = path.join(__dirname, '../signatech.db');
    const backupDir = path.join(__dirname, '../backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `signatech-${timestamp}.db`);
    
    try {
      fs.copyFileSync(dbPath, backupPath);
      console.log(`Database backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('Database backup failed:', error);
      return null;
    }
  }
}

module.exports = DbMigrationManager;