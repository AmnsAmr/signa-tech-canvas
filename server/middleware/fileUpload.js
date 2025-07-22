const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/contact-files');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  }
});

// File filter for vector formats
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.svg', '.dxf', '.ai', '.pdf', '.eps', '.gcode', '.nc'];
  const allowedMimeTypes = [
    'image/svg+xml',
    'application/dxf',
    'application/postscript',
    'application/pdf',
    'application/illustrator',
    'text/plain', // For .gcode and .nc files
    'application/octet-stream' // Fallback for some vector formats
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only vector files are allowed: ${allowedExtensions.join(', ')}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = {
  uploadContactFile: upload.single('vectorFile'),
  uploadsDir
};