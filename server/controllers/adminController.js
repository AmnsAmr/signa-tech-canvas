const database = require('../config/database');

const db = database.getDb();

class AdminController {
  async getUsers(req, res) {
    try {
      const users = await new Promise((resolve, reject) => {
        db.all("SELECT id, name, email, company, phone, role, created_at FROM users ORDER BY created_at DESC", (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
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
      const submissions = await new Promise((resolve, reject) => {
        db.all(`SELECT cs.*, 
          CASE WHEN cs.user_id IS NULL THEN 'Invité' ELSE u.name END as user_name,
          CASE WHEN cs.user_id IS NULL THEN 'Non inscrit' ELSE u.email END as user_email
          FROM contact_submissions cs LEFT JOIN users u ON cs.user_id = u.id 
          ORDER BY cs.created_at DESC`, (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => ({
            ...row,
            services: row.services ? JSON.parse(row.services) : []
          })));
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
}

module.exports = new AdminController();