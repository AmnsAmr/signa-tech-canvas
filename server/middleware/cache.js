const crypto = require('crypto');

// In-memory cache for development (use Redis in production)
const cache = new Map();

// Cache configuration
const CACHE_CONFIG = {
  STATIC: 30 * 60, // 30 minutes for static content
  DYNAMIC: 5 * 60, // 5 minutes for dynamic content
  IMAGES: 60 * 60, // 1 hour for images metadata
  SETTINGS: 15 * 60, // 15 minutes for settings
};

// Generate ETag from content
const generateETag = (content) => {
  return crypto.createHash('md5').update(JSON.stringify(content)).digest('hex');
};

// Cache middleware
const cacheMiddleware = (ttl = CACHE_CONFIG.DYNAMIC) => {
  return (req, res, next) => {
    // Skip caching if disabled via environment variable
    if (process.env.ENABLE_CACHE === 'false') {
      console.log(`[Cache] Skipping cache for ${req.originalUrl} - caching disabled`);
      return next();
    }

    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cached = cache.get(key);

    // Check if cached data exists and is still valid
    if (cached && Date.now() - cached.timestamp < ttl * 1000) {
      // Handle conditional requests
      const clientETag = req.headers['if-none-match'];
      if (clientETag && clientETag === cached.etag) {
        return res.status(304).end();
      }

      // Set cache headers
      res.set({
        'Cache-Control': `public, max-age=${ttl}`,
        'ETag': cached.etag,
        'Last-Modified': new Date(cached.timestamp).toUTCString()
      });

      return res.json(cached.data);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      // Generate ETag
      const etag = generateETag(data);
      
      // Cache the response
      cache.set(key, {
        data,
        etag,
        timestamp: Date.now()
      });

      // Set cache headers
      res.set({
        'Cache-Control': `public, max-age=${ttl}`,
        'ETag': etag,
        'Last-Modified': new Date().toUTCString()
      });

      return originalJson.call(this, data);
    };

    next();
  };
};

// Clear cache by pattern
const clearCache = (pattern) => {
  const regex = new RegExp(pattern);
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
};

// Static file caching
const staticCache = (req, res, next) => {
  // Skip caching if disabled via environment variable
  if (process.env.ENABLE_CACHE === 'false') {
    return next();
  }

  // Set long cache for static assets
  if (req.url.match(/\.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$/)) {
    res.set({
      'Cache-Control': 'public, max-age=31536000', // 1 year
      'Expires': new Date(Date.now() + 31536000000).toUTCString()
    });
  }
  next();
};

module.exports = {
  cacheMiddleware,
  clearCache,
  staticCache,
  CACHE_CONFIG
};