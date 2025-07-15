const { validationResult } = require('express-validator');
const database = require('../config/database');
const emailService = require('../utils/emailService');

const db = database.getDb();

class ContactController {
  async submitGuestContact(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { name, company, email, phone, project, message, services } = req.body;
      const servicesJson = JSON.stringify(services || []);
      const submissionGroup = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const submissionId = await new Promise((resolve, reject) => {
        db.run(`INSERT INTO contact_submissions (
          user_id, name, company, email, phone, project, message, services, submission_group
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [null, name, company, email, phone, project, message, servicesJson, submissionGroup],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
      });

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
          isGuest: true
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue without failing the request
      }
      
      res.json({ message: 'Votre demande a été envoyée avec succès!' });
    } catch (error) {
      console.error('Guest contact submission error:', error);
      res.status(500).json({ message: 'Failed to save submission' });
    }
  }

  async submitUserContact(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { project, message, services } = req.body;
      const servicesJson = JSON.stringify(services || []);
      const submissionGroup = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
          user_id, name, company, email, phone, project, message, services, submission_group
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [req.user.id, user.name, user.company, user.email, user.phone, project, message, servicesJson, submissionGroup],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
      });

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
          isGuest: false
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue without failing the request
      }
      
      res.json({ message: 'Votre demande a été envoyée avec succès!' });
    } catch (error) {
      console.error('User contact submission error:', error);
      res.status(500).json({ message: 'Failed to save submission' });
    }
  }
}

module.exports = new ContactController();