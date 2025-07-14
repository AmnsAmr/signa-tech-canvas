const database = require('../config/database');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const db = database.getDb();

class AdminController {
  async getUsers(req, res) {
    try {
      console.log('Fetching users...');
      const users = await new Promise((resolve, reject) => {
        db.all("SELECT id, name, email, company, phone, role, created_at FROM users ORDER BY created_at DESC", (err, rows) => {
          if (err) {
            console.error('Database error in getUsers:', err);
            reject(err);
          } else {
            console.log('Found users:', rows.length);
            resolve(rows);
          }
        });
      });

      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  }

  async getSubmissions(req, res) {
    try {
      console.log('Fetching submissions...');
      const submissions = await new Promise((resolve, reject) => {
        db.all(`SELECT cs.*, 
          CASE WHEN cs.user_id IS NULL THEN 'Invité' ELSE u.name END as user_name,
          CASE WHEN cs.user_id IS NULL THEN 'Non inscrit' ELSE u.email END as user_email
          FROM contact_submissions cs LEFT JOIN users u ON cs.user_id = u.id 
          ORDER BY cs.created_at DESC`, (err, rows) => {
          if (err) {
            console.error('Database error in getSubmissions:', err);
            reject(err);
          } else {
            console.log('Found submissions:', rows.length);
            resolve(rows.map(row => ({
              ...row,
              services: row.services ? JSON.parse(row.services) : []
            })));
          }
        });
      });

      res.json(submissions);
    } catch (error) {
      console.error('Get submissions error:', error);
      res.status(500).json({ message: 'Failed to fetch submissions' });
    }
  }

  async updateSubmissionStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['pending', 'done'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      const changes = await new Promise((resolve, reject) => {
        db.run('UPDATE contact_submissions SET status = ? WHERE id = ?', [status, id], function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });

      if (changes === 0) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      res.json({ message: 'Status updated successfully' });
    } catch (error) {
      console.error('Update submission status error:', error);
      res.status(500).json({ message: 'Failed to update status' });
    }
  }

  async createAdmin(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin user
      const adminId = await new Promise((resolve, reject) => {
        db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          [name, email, hashedPassword, 'admin'],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
      });

      res.json({ 
        message: 'Admin created successfully',
        admin: { id: adminId, name, email, role: 'admin' }
      });
    } catch (error) {
      console.error('Create admin error:', error);
      res.status(500).json({ message: 'Failed to create admin' });
    }
  }

  async getAdmins(req, res) {
    try {
      console.log('Fetching admins...');
      const admins = await new Promise((resolve, reject) => {
        db.all("SELECT id, name, email, created_at FROM users WHERE role = 'admin' ORDER BY created_at DESC", (err, rows) => {
          if (err) {
            console.error('Database error in getAdmins:', err);
            reject(err);
          } else {
            console.log('Found admins:', rows.length);
            resolve(rows);
          }
        });
      });

      res.json(admins);
    } catch (error) {
      console.error('Get admins error:', error);
      res.status(500).json({ message: 'Failed to fetch admins' });
    }
  }

  // Helper method to get all admin emails for notifications
  static async getAdminEmails() {
    return new Promise((resolve, reject) => {
      db.all("SELECT email FROM users WHERE role = 'admin'", (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => row.email));
      });
    });
  }
}

module.exports = new AdminController();