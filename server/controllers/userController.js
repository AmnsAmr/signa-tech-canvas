const database = require('../config/database');

const db = database.getDb();

class UserController {
  async getUserSubmissions(req, res) {
    try {
      const userId = req.user.id;

      const submissions = await new Promise((resolve, reject) => {
        db.all(`SELECT 
          id, project, message, services, status, created_at
          FROM contact_submissions 
          WHERE user_id = ? 
          ORDER BY created_at DESC`, [userId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => ({
            ...row,
            services: row.services ? JSON.parse(row.services) : []
          })));
        });
      });

      res.json(submissions);
    } catch (error) {
      console.error('Get user submissions error:', error);
      res.status(500).json({ message: 'Failed to fetch submissions' });
    }
  }

  async getUserRatings(req, res) {
    try {
      const userId = req.user.id;

      const ratings = await new Promise((resolve, reject) => {
        db.all("SELECT id, rating, comment, is_approved, created_at FROM ratings WHERE user_id = ? ORDER BY created_at DESC", 
          [userId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      res.json(ratings);
    } catch (error) {
      console.error('Get user ratings error:', error);
      res.status(500).json({ message: 'Failed to fetch user ratings' });
    }
  }

  async getUserStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await new Promise((resolve, reject) => {
        db.get(`SELECT 
          COUNT(DISTINCT cs.id) as total_submissions,
          COUNT(DISTINCT r.id) as total_ratings,
          COUNT(CASE WHEN cs.status = 'done' THEN 1 END) as completed_submissions,
          COUNT(CASE WHEN r.is_approved = 1 THEN 1 END) as approved_ratings
          FROM users u
          LEFT JOIN contact_submissions cs ON u.id = cs.user_id
          LEFT JOIN ratings r ON u.id = r.user_id
          WHERE u.id = ?`, [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      res.json(stats);
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ message: 'Failed to fetch user stats' });
    }
  }
}

module.exports = new UserController();