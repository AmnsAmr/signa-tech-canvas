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

const guestRatingValidation = [
  ...ratingValidation,
  body('name').notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().withMessage('Valid email required')
];

// Public routes
router.get('/', ratingController.getPublicRatings);
router.get('/stats', ratingController.getRatingStats);

// Protected routes
router.post('/submit', authenticateToken, ratingValidation, ratingController.submitRating);

// Guest rating submission
router.post('/guest-submit', guestRatingValidation, (req, res) => {
  // Temporarily set req.user to null for guest submissions
  req.user = null;
  ratingController.submitRating(req, res);
});

module.exports = router;