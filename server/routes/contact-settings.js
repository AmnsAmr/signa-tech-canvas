const express = require('express');
const contactSettingsController = require('../controllers/contactSettingsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { cacheMiddleware, clearCache, CACHE_CONFIG } = require('../middleware/cache');

const router = express.Router();

// Public route to get contact settings with caching
router.get('/', cacheMiddleware(CACHE_CONFIG.SETTINGS), contactSettingsController.getSettings);

// Admin-only route to update contact settings
router.put('/', authenticateToken, requireAdmin, (req, res, next) => {
  // Clear cache after successful update
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode === 200) {
      clearCache('/api/contact-settings');
    }
    return originalSend.call(this, data);
  };
  next();
}, contactSettingsController.updateSettings);

module.exports = router;