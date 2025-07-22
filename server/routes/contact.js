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

// Route to download uploaded files (admin or file owner)
router.get('/download/:filename', require('../middleware/optionalAuth'), require('../controllers/fileDownloadController').downloadFile);

// Route to analyze a vector file directly (admin only)
router.post('/analyze-vector', authenticateToken, uploadContactFile, contactController.analyzeVectorFile);

// Route to get vector analysis for a specific file or submission (admin or file owner)
router.get('/analyze-file/:fileId', authenticateToken, require('../controllers/fileAnalysisController').getFileVectorAnalysis);

// Alias for backward compatibility - redirects to analyze-file endpoint
router.get('/vector-analysis/:submissionId', authenticateToken, (req, res) => {
  // Redirect to the correct endpoint
  const submissionId = req.params.submissionId;
  res.redirect(`/api/contact/analyze-file/${submissionId}`);
});

module.exports = router;