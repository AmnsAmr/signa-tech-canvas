const fs = require('fs');
const path = require('path');
const database = require('../config/database');
const MigrationHelper = require('../utils/migrationHelper');

const db = database.getDb();

class ImageController {
  async getImages(req, res) {
    try {
      const { category } = req.query;
      let query = "SELECT * FROM site_images";
      let params = [];
      
      if (category) {
        query += " WHERE category = ?";
        params.push(category);
      }
      
      query += " ORDER BY category, created_at DESC";
      
      const images = await new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      res.json(images);
    } catch (error) {
      console.error('Get images error:', error);
      res.status(500).json({ message: 'Failed to fetch images' });
    }
  }

  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }
      
      const { category } = req.body;
      if (!category) {
        return res.status(400).json({ message: 'Category is required' });
      }
      
      const imagePath = `/uploads/${req.file.filename}`;
      
      const imageId = await new Promise((resolve, reject) => {
        db.run("INSERT INTO site_images (category, filename, original_name, path, size, mime_type) VALUES (?, ?, ?, ?, ?, ?)",
          [category, req.file.filename, req.file.originalname, imagePath, req.file.size, req.file.mimetype],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
      });
      
      res.json({
        id: imageId,
        category,
        filename: req.file.filename,
        original_name: req.file.originalname,
        path: imagePath,
        size: req.file.size,
        mime_type: req.file.mimetype
      });
    } catch (error) {
      console.error('Upload image error:', error);
      res.status(500).json({ message: 'Failed to save image info' });
    }
  }

  async deleteImage(req, res) {
    try {
      const { id } = req.params;
      
      const image = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM site_images WHERE id = ?", [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!image) {
        return res.status(404).json({ message: 'Image not found' });
      }
      
      // Delete file from filesystem
      const filePath = path.join(MigrationHelper.getUploadDir(), image.filename);
      fs.unlink(filePath, (fsErr) => {
        if (fsErr) console.error('Failed to delete file:', fsErr);
      });
      
      // Delete from database
      await new Promise((resolve, reject) => {
        db.run("DELETE FROM site_images WHERE id = ?", [id], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });

      res.json({ message: 'Image deleted successfully' });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({ message: 'Failed to delete image' });
    }
  }

  async replaceImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }
      
      const { id } = req.params;
      
      const oldImage = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM site_images WHERE id = ?", [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!oldImage) {
        return res.status(404).json({ message: 'Image not found' });
      }
      
      // Delete old file
      const oldFilePath = path.join(MigrationHelper.getUploadDir(), oldImage.filename);
      fs.unlink(oldFilePath, (fsErr) => {
        if (fsErr) console.error('Failed to delete old file:', fsErr);
      });
      
      // Update database with new image info
      const newImagePath = `/uploads/${req.file.filename}`;
      
      await new Promise((resolve, reject) => {
        db.run("UPDATE site_images SET filename = ?, original_name = ?, path = ?, size = ?, mime_type = ? WHERE id = ?",
          [req.file.filename, req.file.originalname, newImagePath, req.file.size, req.file.mimetype, id],
          function(err) {
            if (err) reject(err);
            else resolve();
          });
      });
      
      res.json({
        id: parseInt(id),
        category: oldImage.category,
        filename: req.file.filename,
        original_name: req.file.originalname,
        path: newImagePath,
        size: req.file.size,
        mime_type: req.file.mimetype
      });
    } catch (error) {
      console.error('Replace image error:', error);
      res.status(500).json({ message: 'Failed to update image' });
    }
  }

  async getCategories(req, res) {
    try {
      const categories = await new Promise((resolve, reject) => {
        db.all("SELECT DISTINCT category FROM site_images ORDER BY category", (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(c => c.category));
        });
      });

      res.json(categories);
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  }
}

module.exports = new ImageController();