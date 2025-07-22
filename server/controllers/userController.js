const database = require('../config/database');

const db = database.getDb();

class UserController {
  async getUserSubmissions(req, res) {
    try {
      const userId = req.user.id;
      console.log(`Fetching submissions for user ${userId}`);

      const submissions = await new Promise((resolve, reject) => {
        db.all(`SELECT 
          id, project, message, services, status, created_at
          FROM contact_submissions 
          WHERE user_id = ? 
          ORDER BY created_at DESC`, [userId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows.map(row => {
            let services = [];
            if (row.services) {
              try {
                const parsed = JSON.parse(row.services);
                services = Array.isArray(parsed) ? parsed : [];
              } catch (e) {
                console.error('Error parsing services JSON:', e);
              }
            }
            return {
              ...row,
              services
            };
          }));
        });
      });

      console.log(`Found ${submissions.length} submissions for user ${userId}`);
      res.json(submissions);
    } catch (error) {
      console.error('Get user submissions error:', error);
      res.status(500).json({ message: 'Failed to fetch submissions' });
    }
  }

  async getUserRatings(req, res) {
    try {
      const userId = req.user.id;
      console.log(`Fetching ratings for user ${userId}`);

      const ratings = await new Promise((resolve, reject) => {
        db.all("SELECT id, rating, comment, is_approved, created_at FROM ratings WHERE user_id = ? ORDER BY created_at DESC", 
          [userId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      console.log(`Found ${ratings.length} ratings for user ${userId}`);
      res.json(ratings);
    } catch (error) {
      console.error('Get user ratings error:', error);
      res.status(500).json({ message: 'Failed to fetch user ratings' });
    }
  }

  async getUserStats(req, res) {
    try {
      const userId = req.user.id;
      console.log(`Fetching stats for user ${userId}`);

      const stats = await new Promise((resolve, reject) => {
        db.get(`SELECT 
          (SELECT COUNT(*) FROM contact_submissions WHERE user_id = ?) as total_submissions,
          (SELECT COUNT(*) FROM ratings WHERE user_id = ?) as total_ratings,
          (SELECT COUNT(*) FROM contact_submissions WHERE user_id = ? AND status = 'done') as completed_submissions,
          (SELECT COUNT(*) FROM ratings WHERE user_id = ? AND is_approved = 1) as approved_ratings
          FROM users WHERE id = ?`, [userId, userId, userId, userId, userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      console.log(`Stats for user ${userId}:`, stats);
      res.json(stats);
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ message: 'Failed to fetch user stats' });
    }
  }
}

module.exports = new UserController();