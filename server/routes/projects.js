const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/upload');

// Public routes
router.get('/sections', projectController.getSections);
router.get('/sections/:sectionId/projects', projectController.getProjectsBySection);

// Admin routes - require admin privileges
router.get('/admin/sections', (req, res, next) => { console.log('GET /admin/sections'); next(); }, authenticateToken, requireAdmin, projectController.getAllSections);
router.post('/admin/sections', (req, res, next) => { console.log('POST /admin/sections'); next(); }, authenticateToken, requireAdmin, projectController.createSection);
router.put('/admin/sections/:id', (req, res, next) => { console.log('PUT /admin/sections/:id'); next(); }, authenticateToken, requireAdmin, projectController.updateSection);
router.delete('/admin/sections/:id', (req, res, next) => { console.log('DELETE /admin/sections/:id'); next(); }, authenticateToken, requireAdmin, projectController.deleteSection);

// Test endpoint
router.get('/admin/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Test successful' });
});

router.get('/admin/sections/:sectionId/projects', authenticateToken, requireAdmin, projectController.getProjectsBySection);
router.post('/admin/projects', authenticateToken, requireAdmin, projectController.createProject);
router.put('/admin/projects/:id', authenticateToken, requireAdmin, projectController.updateProject);
router.put('/admin/projects/:id/image', authenticateToken, requireAdmin, uploadMiddleware.single('image'), projectController.updateProjectImage);
router.delete('/admin/projects/:id/image', authenticateToken, requireAdmin, projectController.removeProjectImage);
router.delete('/admin/projects/:id', authenticateToken, requireAdmin, projectController.deleteProject);

module.exports = router;