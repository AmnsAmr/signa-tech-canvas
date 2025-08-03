const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { rateLimits, validationSchemas, handleValidationErrors } = require('../middleware/security');

const router = express.Router();

// Enhanced validation rules with security
const registerValidation = [
  ...validationSchemas.auth,
  body('company').optional().trim().isLength({ max: 200 }).withMessage('Company name too long'),
  body('phone').optional().trim().matches(/^[\+]?[0-9\s\-\(\)]{10,20}$/).withMessage('Invalid phone format')
];

const loginValidation = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required')
];

const verifyCodeValidation = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Code must be 6 digits')
];

const resetPasswordValidation = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Code must be 6 digits'),
  ...validationSchemas.auth.filter(rule => rule.builder.fields.includes('password'))
];

const verifyEmailValidation = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Code must be 6 digits'),
  body('userData').notEmpty().withMessage('User data is required')
];

// Routes with enhanced security validation
router.post('/register', registerValidation, handleValidationErrors, authController.register);
router.post('/login', loginValidation, handleValidationErrors, authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.post('/forgot-password', rateLimits.passwordReset, forgotPasswordValidation, handleValidationErrors, authController.forgotPassword);
router.post('/verify-reset-code', verifyCodeValidation, handleValidationErrors, authController.verifyResetCode);
router.post('/reset-password', rateLimits.passwordReset, resetPasswordValidation, handleValidationErrors, authController.resetPassword);
router.post('/verify-email', verifyEmailValidation, handleValidationErrors, authController.verifyEmail);
router.post('/resend-verification', rateLimits.passwordReset, body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'), handleValidationErrors, authController.resendVerificationCode);

// Google OAuth routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// Profile update
router.put('/profile', authenticateToken, authController.updateProfile);

// Account deletion
router.delete('/account', authenticateToken, authController.deleteAccount);

module.exports = router;