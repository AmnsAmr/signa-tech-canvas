const express = require('express');
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const guestContactValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('message').notEmpty().withMessage('Message is required')
];

const userContactValidation = [
  body('message').notEmpty().withMessage('Message is required')
];

// Routes
router.post('/guest-submit', guestContactValidation, contactController.submitGuestContact);
router.post('/submit', authenticateToken, userContactValidation, contactController.submitUserContact);

module.exports = router;