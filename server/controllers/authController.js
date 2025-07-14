const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const database = require('../config/database');
const { JWT_SECRET, RESET_CODE_EXPIRY } = require('../config/constants');
const { sendResetEmail } = require('../utils/emailService');

const db = database.getDb();

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { name, email, password, company, phone } = req.body;
      
      // Check if user exists
      const existingUser = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const userId = await new Promise((resolve, reject) => {
        db.run("INSERT INTO users (name, email, password, company, phone) VALUES (?, ?, ?, ?, ?)",
          [name, email, hashedPassword, company || null, phone || null], 
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
      });

      const token = jwt.sign({ id: userId, email, role: 'client' }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ 
        token, 
        user: { id: userId, name, email, company, phone, role: 'client' } 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, password } = req.body;
      
      const user = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      if (user.oauth_provider && !user.password) {
        return res.status(400).json({ message: 'Please use Google Sign-In for this account' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({
        token,
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          company: user.company, 
          phone: user.phone, 
          role: user.role 
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  }

  async getMe(req, res) {
    try {
      const user = await new Promise((resolve, reject) => {
        db.get("SELECT id, name, email, company, phone, role FROM users WHERE id = ?", [req.user.id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Database error' });
    }
  }

  async forgotPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email } = req.body;
      
      const user = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!user) {
        return res.status(400).json({ message: 'Email not found' });
      }
      
      if (user.oauth_provider) {
        return res.status(400).json({ message: 'Please use Google Sign-In for this account' });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + RESET_CODE_EXPIRY);

      await new Promise((resolve, reject) => {
        db.run("INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?)",
          [email, code, expiresAt.toISOString()], (err) => {
            if (err) reject(err);
            else resolve();
          });
      });

      await sendResetEmail(email, code);
      
      res.json({ message: 'Code de vérification envoyé à votre email' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Failed to send reset email' });
    }
  }

  async verifyResetCode(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, code } = req.body;
      
      const reset = await new Promise((resolve, reject) => {
        db.get(`SELECT * FROM password_resets WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1`,
          [email, code], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
      });

      if (!reset) {
        return res.status(400).json({ message: 'Code invalide ou expiré' });
      }
      
      res.json({ message: 'Code vérifié avec succès', valid: true });
    } catch (error) {
      console.error('Verify reset code error:', error);
      res.status(500).json({ message: 'Database error' });
    }
  }

  async resetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, code, password } = req.body;
      
      const reset = await new Promise((resolve, reject) => {
        db.get(`SELECT * FROM password_resets WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1`,
          [email, code], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
      });

      if (!reset) {
        return res.status(400).json({ message: 'Code invalide ou expiré' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await new Promise((resolve, reject) => {
        db.run("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      await new Promise((resolve, reject) => {
        db.run("UPDATE password_resets SET used = 1 WHERE id = ?", [reset.id], (err) => {
          if (err) console.error('Failed to mark reset code as used:', err);
          resolve();
        });
      });
      
      res.json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Failed to reset password' });
    }
  }
}

module.exports = new AuthController();