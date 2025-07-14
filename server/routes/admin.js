const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const imageController = require('../controllers/imageController');
const ratingController = require('../controllers/ratingController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/upload');

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Admin management routes
router.get('/admins', adminController.getAdmins);
router.post('/admins', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], adminController.createAdmin);

// User routes
router.get('/users', adminController.getUsers);
router.get('/submissions', adminController.getSubmissions);
router.patch('/submissions/:id/status', adminController.updateSubmissionStatus);

// Image management routes
router.get('/images', imageController.getImages);
router.post('/images/upload', uploadMiddleware.single('image'), imageController.uploadImage);
router.delete('/images/:id', imageController.deleteImage);
router.put('/images/:id/replace', uploadMiddleware.single('image'), imageController.replaceImage);
router.get('/images/categories', imageController.getCategories);

// Rating management routes
router.get('/ratings', ratingController.getAllRatings);
router.patch('/ratings/:id/status', ratingController.updateRatingStatus);
router.delete('/ratings/:id', ratingController.deleteRating);

module.exports = router;