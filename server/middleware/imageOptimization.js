const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { cacheManager } = require('../utils/cacheManager');

const imageOptimization = async (req, res, next) => {
  const imagePath = req.path;
  const fullPath = path.join(__dirname, '../uploads', imagePath);
  
  try {
    // Check if file exists
    await fs.access(fullPath);
    
    // Check if WebP is supported
    const acceptsWebP = req.headers.accept?.includes('image/webp');
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(imagePath);
    
    if (!isImage) {
      return next();
    }
    
    // Generate cache key
    const cacheKey = `image:${imagePath}:${acceptsWebP ? 'webp' : 'original'}`;
    
    // Check cache first
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      res.set({
        'Content-Type': acceptsWebP ? 'image/webp' : 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000', // 1 year
        'ETag': cached.etag
      });
      return res.send(Buffer.from(cached.data, 'base64'));
    }
    
    // Process image
    let processedImage = sharp(fullPath);
    
    if (acceptsWebP) {
      processedImage = processedImage.webp({ quality: 80 });
      res.set('Content-Type', 'image/webp');
    } else {
      processedImage = processedImage.jpeg({ quality: 85 });
      res.set('Content-Type', 'image/jpeg');
    }
    
    const buffer = await processedImage.toBuffer();
    const etag = `"${buffer.length}-${Date.now()}"`;
    
    // Cache the processed image
    await cacheManager.set(cacheKey, {
      data: buffer.toString('base64'),
      etag
    }, 3600); // 1 hour cache
    
    res.set({
      'Cache-Control': 'public, max-age=31536000',
      'ETag': etag
    });
    
    res.send(buffer);
    
  } catch (error) {
    next();
  }
};

module.exports = { imageOptimization };