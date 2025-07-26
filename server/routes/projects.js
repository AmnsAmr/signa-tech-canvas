const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/upload');

// Public routes
router.get('/sections', projectController.getSections);

// Admin routes
router.get('/admin/sections', authenticateToken, projectController.getAllSections);
router.post('/admin/sections', authenticateToken, projectController.createSection);
router.put('/admin/sections/:id', authenticateToken, projectController.updateSection);
router.delete('/admin/sections/:id', authenticateToken, projectController.deleteSection);

router.get('/admin/sections/:sectionId/projects', authenticateToken, projectController.getProjectsBySection);
router.post('/admin/projects', authenticateToken, projectController.createProject);
router.put('/admin/projects/:id', authenticateToken, projectController.updateProject);
router.put('/admin/projects/:id/image', authenticateToken, uploadMiddleware.single('image'), projectController.updateProjectImage);
router.delete('/admin/projects/:id', authenticateToken, projectController.deleteProject);

module.exports = router;