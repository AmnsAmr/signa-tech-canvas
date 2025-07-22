/**
 * Database Manager Script
 * 
 * Provides CLI commands for database management
 * 
 * Usage:
 *   node scripts/db-manager.js [command]
 * 
 * Commands:
 *   migrate   - Run all pending migrations
 *   backup    - Create a database backup
 *   health    - Run database health checks
 *   init      - Initialize database (create tables)
 */

const DbMigrationManager = require('../utils/dbMigrationManager');
const database = require('../config/database');

// Get command from command line arguments
const command = process.argv[2] || 'help';

async function main() {
  try {
    switch (command) {
      case 'migrate':
        console.log('Running database migrations...');
        await DbMigrationManager.runAllMigrations();
        break;
        
      case 'backup':
        console.log('Creating database backup...');
        const backupPath = await DbMigrationManager.createBackup();
        if (backupPath) {
          console.log(`Backup created: ${backupPath}`);
        } else {
          console.error('Backup failed');
          process.exit(1);
        }
        break;
        
      case 'health':
        console.log('Running database health checks...');
        const healthy = await DbMigrationManager.runHealthChecks();
        if (!healthy) {
          console.error('Database health check failed');
          process.exit(1);
        }
        break;
        
      case 'init':
        console.log('Initializing database...');
        // This will run all migrations which includes table creation
        await DbMigrationManager.runAllMigrations();
        break;
        
      case 'help':
      default:
        console.log(`
Database Manager

Usage:
  node scripts/db-manager.js [command]

Commands:
  migrate   - Run all pending migrations
  backup    - Create a database backup
  health    - Run database health checks
  init      - Initialize database (create tables)
  help      - Show this help message
        `);
        break;
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`Error executing command '${command}':`, error);
    process.exit(1);
  }
}

// Run the main function
main();