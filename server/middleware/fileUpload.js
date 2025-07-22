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
    'image/svg+xml',                 // SVG files
    'application/dxf',               // DXF files
    'application/postscript',        // EPS files
    'application/pdf',               // PDF files
    'application/illustrator',       // AI files
    'application/vnd.adobe.illustrator', // AI files alternative
    'text/plain',                   // For .gcode and .nc files
    'application/octet-stream',      // Fallback for various formats
    'application/acad',              // AutoCAD DXF alternative
    'application/x-dxf',             // DXF alternative
    'drawing/x-dxf',                 // DXF alternative
    'image/vnd.dxf',                 // DXF alternative
    'image/x-dxf'                    // DXF alternative
  ];
  
  // Log file information for debugging
  console.log('File upload attempt:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Always accept files with the correct extension regardless of mimetype
  if (allowedExtensions.includes(ext)) {
    console.log('File accepted by extension:', file.originalname);
    cb(null, true);
    return;
  }
  
  // If extension check fails, check mimetype
  if (allowedMimeTypes.includes(file.mimetype)) {
    console.log('File accepted by mimetype:', file.originalname);
    cb(null, true);
    return;
  }
  
  // If both checks fail, reject the file
  console.log('File rejected:', file.originalname, file.mimetype);
  cb(new Error(`Invalid file type. Only these formats are allowed: ${allowedExtensions.join(', ')}`), false);
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