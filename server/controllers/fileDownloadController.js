const database = require('../config/database');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const db = database.getDb();

class FileDownloadController {
  async downloadFile(req, res) {
    try {
      const { filename } = req.params;
      const tokenParam = req.query.token;
      
      console.log('Download request for file:', filename);
      
      // If token is provided in query param, use it for authentication
      if (tokenParam && !req.user) {
        try {
          const decoded = jwt.verify(tokenParam, process.env.JWT_SECRET);
          req.user = decoded;
        } catch (err) {
          console.error('Invalid token in query param:', err);
        }
      }
      
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Check if user is admin
      const isAdmin = req.user.role === 'admin';
      
      // Find the submission in the database
      const submission = await new Promise((resolve, reject) => {
        // Use a more flexible query to find the file
        db.get("SELECT * FROM contact_submissions WHERE file_path LIKE ? OR file_path LIKE ? OR file_path LIKE ?", 
          [`%${filename}`, `%${filename.replace(/\\\\/g, '/')}`, `%${filename.replace(/\\//g, '\\\\')}`], 
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
      });

      if (!submission) {
        console.error('File not found in database:', filename);
        return res.status(404).json({ message: 'File not found in database' });
      }
      
      // Check if user is authorized to access this file
      if (!isAdmin && submission.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. You can only download your own files.' });
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
}

module.exports = new FileDownloadController();