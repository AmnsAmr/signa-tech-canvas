const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

module.exports = {
  uploadMiddleware
};