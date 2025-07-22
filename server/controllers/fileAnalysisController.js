const fs = require('fs');
const path = require('path');
const database = require('../config/database');
const vectorService = require('../utils/vectorService');

const db = database.getDb();

class FileAnalysisController {
  async getFileVectorAnalysis(req, res) {
    console.log('getFileVectorAnalysis called with fileId:', req.params.fileId);
    try {
      const { fileId } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      // Get file details
      const file = await new Promise((resolve, reject) => {
        db.get(
          "SELECT cs.id, cs.file_path, cs.file_name, cs.user_id FROM contact_submissions cs WHERE cs.id = ?", 
          [fileId], 
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      // If no file found by ID, try to find by file path (for backward compatibility)
      if (!file) {
        console.log('File not found by ID, trying to find by path containing the ID');
        const fileByPath = await new Promise((resolve, reject) => {
          db.get(
            "SELECT cs.id, cs.file_path, cs.file_name, cs.user_id FROM contact_submissions cs WHERE cs.file_path LIKE ? OR cs.file_name LIKE ?",
            [`%${fileId}%`, `%${fileId}%`],
            (err, row) => {
              if (err) reject(err);
              else resolve(row);
            }
          );
        });
        
        if (fileByPath) {
          console.log('Found file by path:', fileByPath.file_name);
          return this.getFileVectorAnalysis({ ...req, params: { fileId: fileByPath.id } }, res);
        }
      }
      
      console.log('File details:', file);

      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Check if user is authorized to access this file
      if (!isAdmin && file.user_id !== userId) {
        return res.status(403).json({ message: 'Access denied. You can only view your own files.' });
      }

      // Check if file exists
      if (!file.file_path || !fs.existsSync(file.file_path)) {
        return res.status(404).json({ message: 'File not found on server' });
      }

      // Get vector analysis
      const ext = path.extname(file.file_name).toLowerCase();
      const supportedExtensions = ['.svg', '.dxf', '.ai', '.pdf', '.eps', '.gcode', '.nc'];
      
      if (!supportedExtensions.includes(ext)) {
        return res.status(400).json({ message: 'Not a supported vector file format' });
      }

      try {
        // First check if we already have analysis results
        let analysisResults = await vectorService.getAnalysisResults(fileId);
        
        // If not, process the file
        if (!analysisResults) {
          console.log('No existing analysis found. Processing vector file:', file.file_path);
          const vectorAnalysis = await vectorService.processVectorFile(
            fileId,
            file.file_path,
            file.file_name
          );
          
          // Format the results
          analysisResults = {
            fileName: file.file_name,
            paperArea: vectorAnalysis.paperArea,
            letterArea: vectorAnalysis.letterArea,
            pathLength: vectorAnalysis.pathLength,
            shapes: vectorAnalysis.shapes,
            fileType: ext.substring(1).toUpperCase(),
            units: vectorAnalysis.paperArea && vectorAnalysis.paperArea.includes('mm') ? 'mm' : 'units'
          };
        } else {
          console.log('Using existing analysis results for file:', file.file_name);
        }
        
        console.log('Vector analysis result:', analysisResults);
        return res.json(analysisResults);
      } catch (error) {
        console.error('Error analyzing vector file:', error);
        return res.status(500).json({ 
          message: 'Failed to analyze vector file',
          error: error.message 
        });
      }
    } catch (error) {
      console.error('File vector analysis error:', error);
      res.status(500).json({ message: 'Failed to retrieve vector analysis' });
    }
  }
}

module.exports = new FileAnalysisController();