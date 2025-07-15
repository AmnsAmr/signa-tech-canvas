const fs = require('fs');
const path = require('path');

/**
 * Migration helper to move images from old location to new uploads directory
 */
class MigrationHelper {
  static async migrateImages() {
    const oldAssetsDir = path.join(__dirname, '../../src/assets');
    const newUploadsDir = path.join(__dirname, '../uploads');
    
    // Ensure new uploads directory exists
    if (!fs.existsSync(newUploadsDir)) {
      fs.mkdirSync(newUploadsDir, { recursive: true });
    }
    
    // Check if old assets directory exists
    if (!fs.existsSync(oldAssetsDir)) {
      console.log('Old assets directory not found, skipping migration');
      return;
    }
    
    try {
      const files = fs.readdirSync(oldAssetsDir);
      let migratedCount = 0;
      
      for (const file of files) {
        const oldPath = path.join(oldAssetsDir, file);
        const newPath = path.join(newUploadsDir, file);
        
        // Skip if file already exists in new location
        if (fs.existsSync(newPath)) {
          continue;
        }
        
        // Copy file to new location
        if (fs.statSync(oldPath).isFile()) {
          fs.copyFileSync(oldPath, newPath);
          migratedCount++;
        }
      }
      
      console.log(`Migration completed: ${migratedCount} files moved to uploads directory`);
    } catch (error) {
      console.error('Migration error:', error);
    }
  }
  
  static getUploadDir() {
    return process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
  }
  
  static ensureUploadDir() {
    const uploadDir = this.getUploadDir();
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`Created upload directory: ${uploadDir}`);
    }
    return uploadDir;
  }
}

module.exports = MigrationHelper;