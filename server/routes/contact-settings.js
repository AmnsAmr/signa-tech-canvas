const express = require('express');
const contactSettingsController = require('../controllers/contactSettingsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { cacheMiddleware, clearCache, CACHE_CONFIG } = require('../middleware/cache');

const router = express.Router();

// Public route to get contact settings with caching
router.get('/', cacheMiddleware(CACHE_CONFIG.SETTINGS), contactSettingsController.getSettings);

// Admin-only route to update contact settings
router.put('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    await contactSettingsController.updateSettings(req, res);
    // Clear cache after successful update
    if (res.statusCode === 200) {
      clearCache('/api/contact-settings');
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;