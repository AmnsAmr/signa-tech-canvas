const { validationResult } = require('express-validator');
const database = require('../config/database');

const db = database.getDb();

class RatingController {
  async submitRating(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { rating, comment } = req.body;
      const userId = req.user?.id || null;
      const name = req.user?.name || req.body.name;
      const email = req.user?.email || req.body.email;

      if (!name) {
        return res.status(400).json({ message: 'Name is required' });
      }

      const ratingId = await new Promise((resolve, reject) => {
        db.run("INSERT INTO ratings (user_id, name, email, rating, comment) VALUES (?, ?, ?, ?, ?)",
          [userId, name, email, rating, comment],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
      });

      res.json({ 
        message: 'Merci pour votre avis! Il sera publié après modération.',
        id: ratingId 
      });
    } catch (error) {
      console.error('Submit rating error:', error);
      res.status(500).json({ message: 'Failed to submit rating' });
    }
  }

  async getPublicRatings(req, res) {
    try {
      const { featured } = req.query;
      
      let query = "SELECT id, name, rating, comment, created_at FROM ratings WHERE is_approved = 1";
      let params = [];
      
      if (featured === 'true') {
        query += " AND is_featured = 1";
      }
      
      query += " ORDER BY created_at DESC";
      
      const ratings = await new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      res.json(ratings);
    } catch (error) {
      console.error('Get public ratings error:', error);
      res.status(500).json({ message: 'Failed to fetch ratings' });
    }
  }

  async getRatingStats(req, res) {
    try {
      const stats = await new Promise((resolve, reject) => {
        db.all(`
          SELECT 
            rating,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ratings WHERE is_approved = 1), 1) as percentage
          FROM ratings 
          WHERE is_approved = 1 
          GROUP BY rating 
          ORDER BY rating DESC
        `, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const totalRatings = await new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as total, AVG(rating) as average FROM ratings WHERE is_approved = 1", (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      // Ensure all star ratings are represented
      const fullStats = [5, 4, 3, 2, 1].map(star => {
        const found = stats.find(s => s.rating === star);
        return {
          rating: star,
          count: found ? found.count : 0,
          percentage: found ? found.percentage : 0
        };
      });

      res.json({
        stats: fullStats,
        total: totalRatings.total,
        average: Math.round(totalRatings.average * 10) / 10
      });
    } catch (error) {
      console.error('Get rating stats error:', error);
      res.status(500).json({ message: 'Failed to fetch rating stats' });
    }
  }

  // Admin methods
  async getAllRatings(req, res) {
    try {
      const ratings = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM ratings ORDER BY created_at DESC", (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      res.json(ratings);
    } catch (error) {
      console.error('Get all ratings error:', error);
      res.status(500).json({ message: 'Failed to fetch ratings' });
    }
  }

  async updateRatingStatus(req, res) {
    try {
      const { id } = req.params;
      const { is_approved, is_featured } = req.body;

      await new Promise((resolve, reject) => {
        db.run("UPDATE ratings SET is_approved = ?, is_featured = ? WHERE id = ?",
          [is_approved ? 1 : 0, is_featured ? 1 : 0, id],
          function(err) {
            if (err) reject(err);
            else resolve();
          });
      });

      res.json({ message: 'Rating status updated successfully' });
    } catch (error) {
      console.error('Update rating status error:', error);
      res.status(500).json({ message: 'Failed to update rating status' });
    }
  }

  async deleteRating(req, res) {
    try {
      const { id } = req.params;

      await new Promise((resolve, reject) => {
        db.run("DELETE FROM ratings WHERE id = ?", [id], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });

      res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
      console.error('Delete rating error:', error);
      res.status(500).json({ message: 'Failed to delete rating' });
    }
  }
}

module.exports = new RatingController();