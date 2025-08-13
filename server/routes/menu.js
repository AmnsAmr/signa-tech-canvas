const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/', menuController.getMenu);
router.get('/category/:categoryId', menuController.getCategory);
router.get('/product/:productId', menuController.getProduct);

// Admin routes - Require authentication and admin role
router.get('/admin/categories', authenticateToken, requireAdmin, menuController.getAllCategories);
router.post('/admin/categories', authenticateToken, requireAdmin, menuController.createCategory);
router.put('/admin/categories/:id', authenticateToken, requireAdmin, menuController.updateCategory);
router.delete('/admin/categories/:id', authenticateToken, requireAdmin, menuController.deleteCategory);
router.post('/admin/categories/reorder', authenticateToken, requireAdmin, menuController.reorderCategories);

// Image upload routes
router.post('/admin/upload-image', authenticateToken, requireAdmin, menuController.getUploadMiddleware(), menuController.uploadImage);
router.delete('/admin/remove-image/:categoryId', authenticateToken, requireAdmin, menuController.removeImage);

module.exports = router;