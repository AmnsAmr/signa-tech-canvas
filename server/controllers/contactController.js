const { validationResult } = require('express-validator');
const database = require('../config/database');
const emailService = require('../utils/emailService');
const vectorService = require('../utils/vectorService');
const path = require('path');
const fs = require('fs');

const db = database.getDb();

class ContactController {
  async submitGuestContact(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { name, company, email, phone, project, message, services } = req.body;
      let servicesJson;
      try {
        // If services is already a string (JSON), parse it first then stringify it again
        if (typeof services === 'string') {
          const parsedServices = JSON.parse(services);
          servicesJson = JSON.stringify(parsedServices || []);
        } else {
          servicesJson = JSON.stringify(services || []);
        }
      } catch (e) {
        console.error('Error parsing services:', e);
        servicesJson = JSON.stringify([]);
      }
      const submissionGroup = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Handle uploaded file
      let filePath = null;
      let fileName = null;
      let fileSize = null;
      let fileType = null;

      if (req.file) {
        console.log('Guest contact - File uploaded:', req.file.originalname, req.file.mimetype);
        filePath = req.file.path;
        fileName = req.file.originalname;
        fileSize = req.file.size;
        fileType = req.file.mimetype;
      }

      const submissionId = await new Promise((resolve, reject) => {
        db.run(`INSERT INTO contact_submissions (
          user_id, name, company, email, phone, project, message, services, submission_group,
          file_path, file_name, file_size, file_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [null, name, company, email, phone, project, message, servicesJson, submissionGroup,
           filePath, fileName, fileSize, fileType],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
      });

      // Process vector file if present
      let vectorAnalysis = null;
      if (req.file) {
        try {
          // Check if it's a supported vector file
          const ext = path.extname(req.file.originalname).toLowerCase();
          const supportedExtensions = ['.svg', '.dxf', '.ai', '.pdf', '.eps', '.gcode', '.nc'];
          
          if (supportedExtensions.includes(ext)) {
            console.log('Processing vector file:', req.file.originalname);
            vectorAnalysis = await vectorService.processVectorFile(
              submissionId, 
              req.file.path, 
              req.file.originalname
            );
          }
        } catch (analysisError) {
          console.error('Vector analysis failed:', analysisError);
          // Continue without failing the request
        }
      }

      // Send notification email
      try {
        await emailService.sendContactNotification({
          name,
          company,
          email,
          phone,
          project,
          message,
          services,
          isGuest: true,
          hasFile: !!req.file,
          fileName: fileName,
          vectorAnalysis: vectorAnalysis
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue without failing the request
      }
      
      res.json({ 
        message: 'Votre demande a été envoyée avec succès!',
        vectorAnalysis: vectorAnalysis
      });
    } catch (error) {
      console.error('Guest contact submission error:', error);
      res.status(500).json({ message: 'Failed to save submission' });
    }
  }

  async submitUserContact(req, res) {
    try {
      // Log received data for debugging
      console.log('User contact submission received:');
      console.log('Body:', req.body);
      console.log('Message field:', req.body.message);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { project, message, services } = req.body;
      let servicesJson;
      try {
        // If services is already a string (JSON), parse it first then stringify it again
        if (typeof services === 'string') {
          const parsedServices = JSON.parse(services);
          servicesJson = JSON.stringify(parsedServices || []);
        } else {
          servicesJson = JSON.stringify(services || []);
        }
      } catch (e) {
        console.error('Error parsing services:', e);
        servicesJson = JSON.stringify([]);
      }
      const submissionGroup = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Handle uploaded file
      let filePath = null;
      let fileName = null;
      let fileSize = null;
      let fileType = null;

      if (req.file) {
        console.log('User contact - File uploaded:', req.file.originalname, req.file.mimetype);
        filePath = req.file.path;
        fileName = req.file.originalname;
        fileSize = req.file.size;
        fileType = req.file.mimetype;
      }

      const user = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE id = ?", [req.user.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!user) {
        return res.status(500).json({ message: 'User not found' });
      }

      const submissionId = await new Promise((resolve, reject) => {
        db.run(`INSERT INTO contact_submissions (
          user_id, name, company, email, phone, project, message, services, submission_group,
          file_path, file_name, file_size, file_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [req.user.id, user.name, user.company, user.email, user.phone, project, message, servicesJson, submissionGroup,
           filePath, fileName, fileSize, fileType],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
      });

      // Process vector file if present
      let vectorAnalysis = null;
      if (req.file) {
        try {
          // Check if it's a supported vector file
          const ext = path.extname(req.file.originalname).toLowerCase();
          const supportedExtensions = ['.svg', '.dxf', '.ai', '.pdf', '.eps', '.gcode', '.nc'];
          
          if (supportedExtensions.includes(ext)) {
            console.log('Processing vector file:', req.file.originalname);
            vectorAnalysis = await vectorService.processVectorFile(
              submissionId, 
              req.file.path, 
              req.file.originalname
            );
          }
        } catch (analysisError) {
          console.error('Vector analysis failed:', analysisError);
          // Continue without failing the request
        }
      }

      // Send notification email
      try {
        await emailService.sendContactNotification({
          name: user.name,
          company: user.company,
          email: user.email,
          phone: user.phone,
          project,
          message,
          services,
          isGuest: false,
          hasFile: !!req.file,
          fileName: fileName,
          vectorAnalysis: vectorAnalysis
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue without failing the request
      }
      
      res.json({ 
        message: 'Votre demande a été envoyée avec succès!',
        vectorAnalysis: vectorAnalysis
      });
    } catch (error) {
      console.error('User contact submission error:', error);
      res.status(500).json({ message: 'Failed to save submission' });
    }
  }

  async downloadFile(req, res) {
    try {
      const { filename } = req.params;
      
      console.log('Download request for file:', filename);
      
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }

      // Verify file exists in database and get submission info
      const submission = await new Promise((resolve, reject) => {
        // Use a more flexible query to find the file
        db.get("SELECT * FROM contact_submissions WHERE file_path LIKE ? OR file_path LIKE ? OR file_path LIKE ?", 
          [`%${filename}`, `%${filename.replace(/\\/g, '/')}`, `%${filename.replace(/\//g, '\\')}`], 
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
      });

      if (!submission) {
        console.error('File not found in database:', filename);
        return res.status(404).json({ message: 'File not found in database' });
      }

      console.log('Found file in database:', submission.file_path);
      const filePath = path.resolve(submission.file_path);
      
      // Check if file exists on filesystem
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found on server' });
      }

      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="${submission.file_name}"`);
      res.setHeader('Content-Type', submission.file_type || 'application/octet-stream');
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
    } catch (error) {
      console.error('File download error:', error);
      res.status(500).json({ message: 'Failed to download file' });
    }
  }

  async analyzeVectorFile(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Check if it's a supported vector file
      const ext = path.extname(req.file.originalname).toLowerCase();
      const supportedExtensions = ['.svg', '.dxf', '.ai', '.pdf', '.eps', '.gcode', '.nc'];
      
      if (!supportedExtensions.includes(ext)) {
        return res.status(400).json({ message: 'Not a supported vector file format' });
      }

      // Get units from request or default to mm
      const units = req.body.units || 'mm';

      try {
        console.log(`Direct analysis of ${req.file.originalname}`);
        
        // Use the vectorAnalyzer directly without storing in database
        const { analyzeVectorFile } = require('../utils/vectorAnalyzer');
        const vectorAnalysis = await analyzeVectorFile(req.file.path, units);
        
        return res.json({
          fileName: req.file.originalname,
          paperArea: vectorAnalysis.paperArea,
          letterArea: vectorAnalysis.letterArea,
          pathLength: vectorAnalysis.pathLength,
          shapes: vectorAnalysis.shapes,
          fileType: ext.substring(1).toUpperCase(),
          units: units
        });
      } catch (error) {
        console.error('Error analyzing vector file:', error);
        return res.status(500).json({ 
          message: 'Failed to analyze vector file',
          error: error.message 
        });
      }
    } catch (error) {
      console.error('Vector file analysis error:', error);
      res.status(500).json({ message: 'Failed to analyze vector file' });
    }
  }

  async getVectorAnalysis(req, res) {
    try {
      const { submissionId } = req.params;
      
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }

      // Get submission details
      const submission = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM contact_submissions WHERE id = ?", [submissionId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      // Get vector analysis results
      const analysisResults = await vectorService.getAnalysisResults(submissionId);
      
      if (!analysisResults) {
        // If no analysis exists but we have a file, try to analyze it now
        if (submission.file_path && fs.existsSync(submission.file_path)) {
          const ext = path.extname(submission.file_name).toLowerCase();
          const supportedExtensions = ['.svg', '.dxf', '.ai', '.pdf', '.eps', '.gcode', '.nc'];
          
          if (supportedExtensions.includes(ext)) {
            try {
              console.log(`On-demand analysis of ${submission.file_name} for submission ${submissionId}`);
              const vectorAnalysis = await vectorService.processVectorFile(
                submission.id,
                submission.file_path,
                submission.file_name
              );
              
              return res.json({
                fileName: submission.file_name,
                paperArea: vectorAnalysis.paperArea,
                letterArea: vectorAnalysis.letterArea,
                pathLength: vectorAnalysis.pathLength,
                shapes: vectorAnalysis.shapes,
                fileType: ext.substring(1).toUpperCase(),
                units: vectorAnalysis.paperArea && vectorAnalysis.paperArea.includes('mm') ? 'mm' : 'units'
              });
            } catch (error) {
              console.error('Error analyzing vector file:', error);
              return res.status(500).json({ 
                message: 'Failed to analyze vector file',
                error: error.message 
              });
            }
          } else {
            return res.status(400).json({ message: 'Not a supported vector file format' });
          }
        }
        
        return res.status(404).json({ message: 'No vector analysis available for this submission' });
      }
      
      // Return the analysis results
      res.json({
        fileName: analysisResults.file_name,
        paperArea: analysisResults.paper_area,
        letterArea: analysisResults.letter_area,
        pathLength: analysisResults.path_length,
        shapes: analysisResults.shapes_data,
        fileType: path.extname(analysisResults.file_name).substring(1).toUpperCase(),
        units: analysisResults.paper_area && analysisResults.paper_area.includes('mm') ? 'mm' : 'units'
      });
      
    } catch (error) {
      console.error('Vector analysis retrieval error:', error);
      res.status(500).json({ message: 'Failed to retrieve vector analysis' });
    }
  }
}

module.exports = new ContactController();