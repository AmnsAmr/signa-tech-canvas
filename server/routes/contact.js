const express = require('express');
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/auth');
const { uploadContactFile } = require('../middleware/fileUpload');

const router = express.Router();

// Validation rules
const guestContactValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('message').notEmpty().withMessage('Message is required')
];

const userContactValidation = [
  body('message').notEmpty().withMessage('Message is required').trim()
];

// Routes with file upload support
router.post('/guest-submit', uploadContactFile, guestContactValidation, contactController.submitGuestContact);
router.post('/submit', authenticateToken, uploadContactFile, userContactValidation, contactController.submitUserContact);

// Route to download uploaded files (admin only)
router.get('/download/:filename', authenticateToken, contactController.downloadFile);

// Route to get vector analysis for a submission (admin only)
router.get('/vector-analysis/:submissionId', authenticateToken, contactController.getVectorAnalysis);

// Route to analyze a vector file directly (admin only)
router.post('/analyze-vector', authenticateToken, uploadContactFile, contactController.analyzeVectorFile);

module.exports = router;