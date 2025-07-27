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
              services: row.services ? JSON.parse(row.services) : [],
              submission_group: row.submission_group || `group_${row.id}`,
              has_file: !!row.file_path,
              file_info: row.file_path ? {
                name: row.file_name,
                size: row.file_size,
                type: row.file_type,
                path: row.file_path
              } : null
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

  async toggleNotifications(req, res) {
    try {
      const { enabled } = req.body;
      const adminId = req.user.id;
      
      console.log(`Toggling notifications for admin ${adminId} to ${enabled ? 'enabled' : 'disabled'}`);
      
      // Verify admin exists
      const admin = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE id = ? AND role = 'admin'", [adminId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (!admin) {
        console.error(`Admin with ID ${adminId} not found`);
        return res.status(404).json({ message: 'Admin not found' });
      }
      
      console.log('Admin found:', admin.name, admin.email);
      
      const emailService = require('../utils/emailService');
      const success = await emailService.toggleAdminNotifications(adminId, enabled);
      
      console.log('Toggle result:', success ? 'Success' : 'Failed');
      
      if (success) {
        res.json({ message: `Notifications ${enabled ? 'activées' : 'désactivées'} avec succès` });
      } else {
        res.status(404).json({ message: 'Admin not found' });
      }
    } catch (error) {
      console.error('Toggle notifications error:', error);
      res.status(500).json({ message: 'Failed to update notification settings' });
    }
  }

  async getNotificationStatus(req, res) {
    try {
      const adminId = req.user.id;
      console.log(`Getting notification status for admin ${adminId}`);
      
      // Verify admin exists
      const admin = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE id = ? AND role = 'admin'", [adminId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (!admin) {
        console.error(`Admin with ID ${adminId} not found`);
        return res.status(404).json({ message: 'Admin not found' });
      }
      
      console.log('Admin found:', admin.name, admin.email);
      
      const emailService = require('../utils/emailService');
      const enabled = await emailService.getAdminNotificationStatus(adminId);
      
      console.log('Current notification status:', enabled ? 'Enabled' : 'Disabled');
      
      res.json({ enabled });
    } catch (error) {
      console.error('Get notification status error:', error);
      res.status(500).json({ message: 'Failed to get notification status' });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      
      // Prevent admin from deleting themselves
      if (parseInt(id) === adminId) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }
      
      // Check if user exists
      const user = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Delete user and related data
      await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('DELETE FROM contact_submissions WHERE user_id = ?', [id]);
          db.run('DELETE FROM ratings WHERE user_id = ?', [id]);
          db.run('DELETE FROM password_resets WHERE email = ?', [user.email]);
          db.run('DELETE FROM email_verifications WHERE email = ?', [user.email]);
          db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
          });
        });
      });
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Failed to delete user' });
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