const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { UPLOAD_LIMITS } = require('../config/constants');
const MigrationHelper = require('../utils/migrationHelper');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = MigrationHelper.ensureUploadDir();
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: UPLOAD_LIMITS.FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// Generate thumbnail after upload
const generateThumbnail = async (req, res, next) => {
  if (!req.file) return next();
  
  try {
    const uploadDir = MigrationHelper.ensureUploadDir();
    const thumbDir = path.join(uploadDir, 'thumbs');
    
    if (!fs.existsSync(thumbDir)) {
      fs.mkdirSync(thumbDir, { recursive: true });
    }
    
    const originalPath = req.file.path;
    const thumbPath = path.join(thumbDir, req.file.filename);
    
    await sharp(originalPath)
      .resize(300, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);
      
    next();
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    next(); // Continue even if thumbnail fails
  }
};

module.exports = {
  uploadMiddleware,
  generateThumbnail
};