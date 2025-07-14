const express = require('express');
const imageController = require('../controllers/imageController');

const router = express.Router();

// Public route for frontend to get images
router.get('/', imageController.getImages);

module.exports = router;