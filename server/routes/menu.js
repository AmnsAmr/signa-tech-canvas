const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public route - Get menu data
router.get('/', menuController.getMenu);

// Admin routes - Require authentication and admin role
router.get('/admin/categories', authenticateToken, requireAdmin, menuController.getAllCategories);
router.post('/admin/categories', authenticateToken, requireAdmin, menuController.getUploadMiddleware(), menuController.createCategory);
router.put('/admin/categories/:id', authenticateToken, requireAdmin, menuController.getUploadMiddleware(), menuController.updateCategory);
router.delete('/admin/categories/:id', authenticateToken, requireAdmin, menuController.deleteCategory);
router.post('/admin/categories/reorder', authenticateToken, requireAdmin, menuController.reorderCategories);

module.exports = router;