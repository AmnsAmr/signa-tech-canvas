require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { PORT } = require('./config/constants');
const MigrationHelper = require('./utils/migrationHelper');
const StartupManager = require('./utils/startupManager');
const { ensureThemeFile } = require('./utils/themeLoader');
const { staticCache } = require('./middleware/cache');
const { cacheManager, cacheMiddleware } = require('./utils/cacheManager');
const { imageOptimization } = require('./middleware/imageOptimization');
const { 
  rateLimits, 
  sanitizeInput, 
  csrfMiddleware, 
  securityHeaders,
  generateCSRFToken 
} = require('./middleware/security');

// Import database to initialize
require('./config/database');

// Run all startup tasks
StartupManager.initialize().catch(err => {
  console.error('Startup initialization error:', err);
});

// Ensure theme file exists
ensureThemeFile();

// Import routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const imageRoutes = require('./routes/images');
const ratingRoutes = require('./routes/ratings');
const userRoutes = require('./routes/user');
const themeRoutes = require('./routes/theme');
const projectRoutes = require('./routes/projects');

const app = express();

// Security middleware - apply first
app.use(securityHeaders);
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost and local network IPs
    const allowedOrigins = [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/,
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:\d+$/
    ];
    
    const isAllowed = allowedOrigins.some(pattern => pattern.test(origin));
    callback(null, isAllowed);
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiting to all routes
app.use(rateLimits.general);

// Input sanitization - apply to all routes
app.use(sanitizeInput);

// CSRF protection - apply to all routes except GET and specific endpoints
app.use(csrfMiddleware);

// CSRF token endpoint
app.get('/api/csrf-token', generateCSRFToken);

// Routes with specific rate limiting and caching
app.use('/api/auth', rateLimits.auth, authRoutes);
app.use('/api/contact', rateLimits.contact, contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', rateLimits.upload, cacheMiddleware(3600), imageRoutes);
app.use('/api/ratings', cacheMiddleware(300), ratingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/theme', cacheMiddleware(1800), themeRoutes);
app.use('/api/projects', rateLimits.upload, cacheMiddleware(600), projectRoutes);
app.use('/api/contact-settings', require('./routes/contact-settings'));

// Serve uploaded images with optimization and caching
const uploadDir = MigrationHelper.ensureUploadDir();
app.use('/uploads', imageOptimization, staticCache, express.static(uploadDir, {
  maxAge: '1y', // Cache for 1 year
  etag: true,
  lastModified: true
}));

// Static files - serve only for non-API routes with caching
app.use(staticCache, express.static(path.join(__dirname, '../dist'), {
  maxAge: '1d', // Cache for 1 day
  etag: true,
  lastModified: true
}));
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/uploads/')) {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  } else if (req.path.startsWith('/api/')) {
    res.status(404).json({ message: 'API endpoint not found' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Network access: http://192.168.1.4:${PORT}`);
});

module.exports = app;