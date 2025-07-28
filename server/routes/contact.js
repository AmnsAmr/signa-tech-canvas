const express = require('express');
const { body } = require('express-validator');
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/auth');
const { uploadContactFile } = require('../middleware/fileUpload');
const { validationSchemas, handleValidationErrors, validateFileUpload } = require('../middleware/security');

const router = express.Router();

// Enhanced validation rules with security
const guestContactValidation = [
  ...validationSchemas.contact
];

const userContactValidation = [
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
];

// File upload validation for vector files
const vectorFileValidation = validateFileUpload(
  ['svg', 'dxf', 'pdf', 'eps'], // Allowed file types
  10 * 1024 * 1024 // 10MB max size
);

// Routes with enhanced security validation
router.post('/guest-submit', 
  uploadContactFile, 
  vectorFileValidation,
  guestContactValidation, 
  handleValidationErrors,
  contactController.submitGuestContact
);

router.post('/submit', 
  authenticateToken, 
  uploadContactFile, 
  vectorFileValidation,
  userContactValidation, 
  handleValidationErrors,
  contactController.submitUserContact
);

// Route to download uploaded files (admin or file owner)
router.get('/download/:filename', 
  require('../middleware/optionalAuth'), 
  require('../controllers/fileDownloadController').downloadFile
);

// Route to analyze a vector file directly (admin only)
router.post('/analyze-vector', 
  authenticateToken, 
  uploadContactFile, 
  vectorFileValidation,
  contactController.analyzeVectorFile
);

// Route to get vector analysis for a specific file or submission (admin or file owner)
router.get('/analyze-file/:fileId', authenticateToken, require('../controllers/fileAnalysisController').getFileVectorAnalysis);

// Alias for backward compatibility - redirects to analyze-file endpoint
router.get('/vector-analysis/:submissionId', authenticateToken, (req, res) => {
  // Redirect to the correct endpoint
  const submissionId = req.params.submissionId;
  res.redirect(`/api/contact/analyze-file/${submissionId}`);
});

module.exports = router;