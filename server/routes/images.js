const express = require('express');
const imageController = require('../controllers/imageController');
const { cacheMiddleware, CACHE_CONFIG } = require('../middleware/cache');

const router = express.Router();

// Public route for frontend to get images with caching
router.get('/', cacheMiddleware(CACHE_CONFIG.IMAGES), imageController.getImages);

module.exports = router;