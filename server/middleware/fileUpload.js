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
    // Enhanced filename sanitization
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext);
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${sanitizedBaseName}${ext}`);
  }
});

// Enhanced file filter with security checks
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.svg', '.dxf', '.pdf', '.eps'];
  const allowedMimeTypes = {
    '.svg': ['image/svg+xml', 'text/xml', 'application/xml'],
    '.dxf': ['application/dxf', 'application/x-dxf', 'text/plain', 'application/octet-stream'],
    '.pdf': ['application/pdf'],
    '.eps': ['application/postscript']
  };
  
  // Security checks
  if (!file.originalname || file.originalname.length > 255) {
    return cb(new Error('Invalid filename'), false);
  }
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    /\.\./, // Directory traversal
    /[<>:"|?*]/, // Invalid filename characters
    /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i // Windows reserved names
  ];
  
  if (dangerousPatterns.some(pattern => pattern.test(file.originalname))) {
    return cb(new Error('Invalid filename'), false);
  }
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check if extension is allowed
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error(`File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`), false);
  }
  
  // Check MIME type matches extension
  const validMimeTypes = allowedMimeTypes[ext];
  if (!validMimeTypes.includes(file.mimetype)) {
    console.log(`MIME type mismatch for ${file.originalname}: expected ${validMimeTypes.join(' or ')}, got ${file.mimetype}`);
    // Allow with warning for now, as MIME types can be inconsistent
  }
  
  console.log('File accepted:', file.originalname, file.mimetype);
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1, // Only one file at a time
    fields: 20, // Limit form fields
    fieldNameSize: 100, // Limit field name size
    fieldSize: 1024 * 1024 // 1MB limit for field values
  }
});

module.exports = {
  uploadContactFile: upload.single('vectorFile'),
  uploadsDir
};