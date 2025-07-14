const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all user routes
router.use(authenticateToken);

// User dashboard routes
router.get('/submissions', userController.getUserSubmissions);
router.get('/ratings', userController.getUserRatings);
router.get('/stats', userController.getUserStats);

module.exports = router;