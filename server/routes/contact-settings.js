const express = require('express');
const contactSettingsController = require('../controllers/contactSettingsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public route to get contact settings
router.get('/', contactSettingsController.getSettings);

// Admin-only route to update contact settings
router.put('/', authenticateToken, requireAdmin, contactSettingsController.updateSettings);

module.exports = router;