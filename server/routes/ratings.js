const express = require('express');
const { body } = require('express-validator');
const ratingController = require('../controllers/ratingController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const ratingValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').isLength({ min: 10, max: 500 }).withMessage('Comment must be between 10 and 500 characters')
];



// Public routes
router.get('/', ratingController.getPublicRatings);
router.get('/stats', ratingController.getRatingStats);

// Protected routes
router.get('/can-rate', authenticateToken, ratingController.canUserRate);
router.post('/submit', authenticateToken, ratingValidation, ratingController.submitRating);
router.delete('/my-rating', authenticateToken, ratingController.deleteUserRating);



module.exports = router;