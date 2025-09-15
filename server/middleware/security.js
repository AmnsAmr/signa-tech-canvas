const { body, validationResult } = require('express-validator');
const crypto = require('crypto');

// Lazy loaded modules
let rateLimit, helmet, DOMPurify, JSDOM, csrf, cookieParser;
let csrfProtection, purify, window;

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) => {
  // Lazy load rate limit
  if (!rateLimit) rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ 
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Create no-op rate limiter for development
const noRateLimit = (req, res, next) => next();

// Different rate limits for different endpoints
const rateLimits = {
  // Disable all rate limiting in development
  auth: process.env.NODE_ENV === 'development' ? noRateLimit : createRateLimit(
    15 * 60 * 1000, // 15 minutes
    15, // 15 attempts per window
    'Too many authentication attempts, please try again later'
  ),
  
  contact: process.env.NODE_ENV === 'development' ? noRateLimit : createRateLimit(
    60 * 60 * 1000, // 1 hour
    10, // 10 submissions per hour
    'Too many contact form submissions, please try again later'
  ),
  
  upload: process.env.NODE_ENV === 'development' ? noRateLimit : createRateLimit(
    15 * 60 * 1000, // 15 minutes
    50, // 50 uploads per window
    'Too many file uploads, please try again later'
  ),
  
  general: process.env.NODE_ENV === 'development' ? noRateLimit : createRateLimit(
    15 * 60 * 1000, // 15 minutes
    1000, // 1000 requests per window
    'Too many requests, please try again later'
  ),
  
  passwordReset: process.env.NODE_ENV === 'development' ? noRateLimit : createRateLimit(
    60 * 60 * 1000, // 1 hour
    10, // 10 attempts per hour
    'Too many password reset attempts, please try again later'
  )
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Skip sanitization for all admin routes and menu operations to prevent data loss
  if (req.path.startsWith('/api/admin/') ||
      req.path.startsWith('/api/menu/') ||
      req.path.startsWith('/api/projects/admin/') ||
      req.path.includes('/admin/') ||
      req.user?.role === 'admin') {
    console.log('SECURITY: Skipping sanitization for admin route:', req.path);
    return next();
  }
  
  // Lazy load DOMPurify
  if (!DOMPurify) {
    DOMPurify = require('dompurify');
    JSDOM = require('jsdom').JSDOM;
    window = new JSDOM('').window;
    purify = DOMPurify(window);
  }
  
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Remove potentially dangerous HTML/script tags
      return purify.sanitize(value, { 
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      }).trim();
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};

// Sanitize user input for logging
const sanitizeForLog = (input) => {
  if (typeof input !== 'string') return String(input);
  return encodeURIComponent(input).substring(0, 100);
};

// Generate cryptographically secure random code
const generateSecureCode = (length = 6) => {
  const digits = '0123456789';
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += digits[randomBytes[i] % 10];
  }
  return result;
};

// CSRF protection middleware
const csrfMiddleware = (req, res, next) => {
  // Skip CSRF if disabled in environment
  if (process.env.CSRF_ENABLED === 'false') {
    return next();
  }
  
  // Skip CSRF for GET requests, admin routes, and specific API endpoints
  if (req.method === 'GET' || 
      req.path.startsWith('/api/auth/google') || 
      req.path.startsWith('/api/admin/') ||
      req.path.startsWith('/api/projects/admin/') ||
      req.path.startsWith('/api/menu/admin/') ||
      req.path.includes('/admin/') ||
      req.path.startsWith('/api/menu/product/') ||
      req.path.startsWith('/api/menu/category/')) {
    return next();
  }

  // Lazy load CSRF
  if (!csrf) {
    csrf = require('csrf');
    csrfProtection = new csrf();
  }

  // Generate CSRF token for new sessions
  if (!req.session?.csrfSecret) {
    if (!req.session) {
      req.session = {};
    }
    req.session.csrfSecret = csrfProtection.secretSync();
  }

  // Verify CSRF token for POST/PUT/DELETE requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.body._csrf;
    
    if (!token || !csrfProtection.verify(req.session.csrfSecret, token)) {
      return res.status(403).json({ 
        error: 'Invalid CSRF token',
        code: 'CSRF_INVALID'
      });
    }
  }

  next();
};

// Generate CSRF token endpoint
const generateCSRFToken = (req, res) => {
  if (process.env.CSRF_ENABLED === 'false') {
    return res.json({ csrfToken: 'disabled-in-dev' });
  }
  
  // Lazy load CSRF
  if (!csrf) {
    csrf = require('csrf');
    csrfProtection = new csrf();
  }
  
  if (!req.session?.csrfSecret) {
    if (!req.session) {
      req.session = {};
    }
    req.session.csrfSecret = csrfProtection.secretSync();
  }
  
  const token = csrfProtection.create(req.session.csrfSecret);
  res.json({ csrfToken: token });
};

// File upload security validation
const validateFileUpload = (allowedTypes = [], maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files ? Object.values(req.files).flat() : [req.file];
    
    for (const file of files) {
      if (!file) continue;

      // Check file size
      if (file.size > maxSize) {
        return res.status(400).json({
          error: `File size exceeds limit of ${Math.round(maxSize / (1024 * 1024))}MB`,
          code: 'FILE_TOO_LARGE'
        });
      }

      // Check file type by extension and MIME type
      const fileExtension = file.originalname?.split('.').pop()?.toLowerCase();
      const mimeType = file.mimetype?.toLowerCase();

      if (allowedTypes.length > 0) {
        const isValidExtension = allowedTypes.some(type => 
          type.toLowerCase() === fileExtension
        );
        
        const allowedMimeTypes = {
          'svg': ['image/svg+xml', 'text/xml', 'application/xml'],
          'dxf': ['application/dxf', 'image/vnd.dxf', 'text/plain'],
          'pdf': ['application/pdf'],
          'eps': ['application/postscript'],
          'jpg': ['image/jpeg'],
          'jpeg': ['image/jpeg'],
          'png': ['image/png'],
          'gif': ['image/gif'],
          'webp': ['image/webp']
        };

        const isValidMimeType = allowedMimeTypes[fileExtension]?.includes(mimeType);

        if (!isValidExtension || !isValidMimeType) {
          return res.status(400).json({
            error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
            code: 'INVALID_FILE_TYPE'
          });
        }
      }

      // Additional security checks
      if (file.originalname) {
        // Check for dangerous file names
        const dangerousPatterns = [
          /\.\./,  // Directory traversal
          /[<>:"|?*]/,  // Invalid filename characters
          /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i  // Windows reserved names
        ];

        if (dangerousPatterns.some(pattern => pattern.test(file.originalname))) {
          return res.status(400).json({
            error: 'Invalid filename',
            code: 'INVALID_FILENAME'
          });
        }
      }
    }

    next();
  };
};

// Security headers middleware
const getSecurityHeaders = () => {
  // Lazy load helmet
  if (!helmet) helmet = require('helmet');
  
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "http://localhost:*", "https://accounts.google.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false, // Disable for development
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  });
};

const securityHeaders = (req, res, next) => {
  return getSecurityHeaders()(req, res, next);
};



// Input validation schemas
const validationSchemas = {
  contact: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      .withMessage('Name contains invalid characters'),
    
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    
    body('phone')
      .optional()
      .trim()
      .matches(/^[\+]?[0-9\s\-\(\)]{10,20}$/)
      .withMessage('Invalid phone number format'),
    
    body('company')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Company name too long'),
    
    body('message')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Message must be between 10 and 2000 characters'),
    
    body('project')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Project type too long')
  ],

  auth: [
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    
    body('password')
      .isLength({ min: 6, max: 128 })
      .withMessage('Password must be between 6 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      .withMessage('Name contains invalid characters')
  ]
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

module.exports = {
  rateLimits,
  sanitizeInput,
  csrfMiddleware,
  generateCSRFToken,
  validateFileUpload,
  securityHeaders,
  validationSchemas,
  handleValidationErrors,
  sanitizeForLog,
  generateSecureCode
};