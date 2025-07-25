const express = require('express');
const themeController = require('../controllers/themeController');

const router = express.Router();

// Public route to get current theme
router.get('/', themeController.getTheme);

module.exports = router;