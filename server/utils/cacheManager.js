const NodeCache = require('node-cache');
const redis = require('redis');

class CacheManager {
  constructor() {
    // In-memory cache as fallback
    this.memoryCache = new NodeCache({ 
      stdTTL: 300, // 5 minutes default
      checkperiod: 60 // Check for expired keys every minute
    });
    
    this.redisClient = null;
    this.useRedis = false;
    
    this.initRedis();
  }

  async initRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redisClient = redis.createClient({ url: process.env.REDIS_URL });
        await this.redisClient.connect();
        this.useRedis = true;
        console.log('✓ Redis cache connected');
      } else {
        console.log('✓ Using in-memory cache (Redis not configured)');
      }
    } catch (error) {
      console.warn('Redis connection failed, using memory cache:', error.message);
      this.useRedis = false;
    }
  }

  async get(key) {
    try {
      if (this.useRedis && this.redisClient) {
        const value = await this.redisClient.get(key);
        return value ? JSON.parse(value) : null;
      }
      return this.memoryCache.get(key) || null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.setEx(key, ttl, JSON.stringify(value));
      } else {
        this.memoryCache.set(key, value, ttl);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key) {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.del(key);
      } else {
        this.memoryCache.del(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async flush() {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.flushAll();
      } else {
        this.memoryCache.flushAll();
      }
    } catch (error) {
      console.error('Cache flush error:', error);
    }
  }
}

const cacheManager = new CacheManager();

// Cache middleware for Express routes
const cacheMiddleware = (ttl = 300) => {
  return async (req, res, next) => {
    // Skip caching if disabled via environment variable
    if (process.env.ENABLE_CACHE === 'false') {
      console.log(`[CacheManager] Skipping cache for ${req.originalUrl} - caching disabled`);
      return next();
    }

    const key = `route:${req.method}:${req.originalUrl}`;
    
    try {
      const cached = await cacheManager.get(key);
      if (cached) {
        return res.json(cached);
      }
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        cacheManager.set(key, data, ttl);
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

module.exports = { cacheManager, cacheMiddleware };