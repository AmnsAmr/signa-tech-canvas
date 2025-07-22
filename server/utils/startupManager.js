/**
 * Startup Manager
 * 
 * Handles all initialization tasks when the server starts
 */

const fs = require('fs');
const path = require('path');
const MigrationHelper = require('./migrationHelper');
const DbMigrationManager = require('./dbMigrationManager');

class StartupManager {
  /**
   * Run all startup tasks
   */
  static async initialize() {
    console.log('🚀 Initializing server...');
    
    try {
      // Ensure directories exist
      this.ensureDirectories();
      
      // Run database migrations
      await DbMigrationManager.runAllMigrations();
      
      // Run database health checks
      await DbMigrationManager.runHealthChecks();
      
      // Migrate images from old location
      await MigrationHelper.migrateImages();
      
      // Create database backup (weekly)
      this.scheduleBackup();
      
      console.log('✅ Server initialization completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Server initialization failed:', error);
      return false;
    }
  }
  
  /**
   * Ensure all required directories exist
   */
  static ensureDirectories() {
    const dirs = [
      path.join(__dirname, '../uploads'),
      path.join(__dirname, '../uploads/contact-files'),
      path.join(__dirname, '../backups'),
      path.join(__dirname, '../migrations')
    ];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    }
  }
  
  /**
   * Schedule weekly database backups
   */
  static scheduleBackup() {
    // Create initial backup if none exists
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir) || fs.readdirSync(backupDir).length === 0) {
      DbMigrationManager.createBackup();
    }
    
    // Schedule weekly backups
    const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
    setInterval(() => {
      DbMigrationManager.createBackup();
    }, WEEK_IN_MS);
  }
}

module.exports = StartupManager;