const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const database = require('../config/database');
const { JWT_SECRET, RESET_CODE_EXPIRY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('../config/constants');
const emailService = require('../utils/emailService');
const { sanitizeForLog, generateSecureCode } = require('../middleware/security');

const googleClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  'http://localhost:5000/api/auth/google/callback'
);

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

      // Generate secure verification code
      const code = generateSecureCode(6);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store verification code
      await new Promise((resolve, reject) => {
        db.run("INSERT INTO email_verifications (email, code, expires_at) VALUES (?, ?, ?)",
          [email, code, expiresAt.toISOString()], (err) => {
            if (err) reject(err);
            else resolve();
          });
      });

      // Send verification email
      await emailService.sendVerificationEmail(email, code);
      
      // Store user data temporarily (without creating account yet)
      const hashedPassword = await bcrypt.hash(password, 10);
      
      res.json({ 
        message: 'Code de vérification envoyé à votre email',
        email,
        tempData: { name, email, hashedPassword, company, phone }
      });
    } catch (error) {
      console.error('Registration error:', {
        message: error.message,
        email: sanitizeForLog(email)
      });
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
      console.error('Login error:', {
        message: error.message,
        email: sanitizeForLog(email)
      });
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
      console.error('Get user error:', {
        message: error.message,
        userId: req.user?.id
      });
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

      const code = generateSecureCode(6);
      const expiresAt = new Date(Date.now() + RESET_CODE_EXPIRY);

      await new Promise((resolve, reject) => {
        db.run("INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?)",
          [email, code, expiresAt.toISOString()], (err) => {
            if (err) reject(err);
            else resolve();
          });
      });

      await emailService.sendResetEmail(email, code);
      
      res.json({ message: 'Code de vérification envoyé à votre email' });
    } catch (error) {
      console.error('Forgot password error:', {
        message: error.message,
        email: sanitizeForLog(email)
      });
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
      console.error('Verify reset code error:', {
        message: error.message,
        email: sanitizeForLog(email)
      });
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
      console.error('Reset password error:', {
        message: error.message,
        stack: error.stack,
        email: sanitizeForLog(email)
      });
      
      if (error.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ message: 'Invalid request data' });
      }
      
      res.status(500).json({ message: 'Password reset failed' });
    }
  }

  async verifyEmail(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, code, userData } = req.body;
      
      const verification = await new Promise((resolve, reject) => {
        db.get(`SELECT * FROM email_verifications WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1`,
          [email, code], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
      });

      if (!verification) {
        return res.status(400).json({ message: 'Code invalide ou expiré' });
      }
      
      // Create user account
      const { name, hashedPassword, company, phone } = userData;
      const userId = await new Promise((resolve, reject) => {
        db.run("INSERT INTO users (name, email, password, company, phone, email_verified) VALUES (?, ?, ?, ?, ?, 1)",
          [name, email, hashedPassword, company || null, phone || null], 
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
      });
      
      // Mark verification as used
      await new Promise((resolve, reject) => {
        db.run("UPDATE email_verifications SET used = 1 WHERE id = ?", [verification.id], (err) => {
          if (err) console.error('Failed to mark verification as used:', err);
          resolve();
        });
      });

      const token = jwt.sign({ id: userId, email, role: 'client' }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ 
        token, 
        user: { id: userId, name, email, company, phone, role: 'client', email_verified: true },
        message: 'Compte créé avec succès'
      });
    } catch (error) {
      console.error('Email verification error:', {
        message: error.message,
        email: sanitizeForLog(email)
      });
      res.status(500).json({ message: 'Verification failed' });
    }
  }

  async resendVerificationCode(req, res) {
    try {
      const { email } = req.body;
      
      // Generate new secure verification code
      const code = generateSecureCode(6);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Store new verification code
      await new Promise((resolve, reject) => {
        db.run("INSERT INTO email_verifications (email, code, expires_at) VALUES (?, ?, ?)",
          [email, code, expiresAt.toISOString()], (err) => {
            if (err) reject(err);
            else resolve();
          });
      });

      // Send verification email
      await emailService.sendVerificationEmail(email, code);
      
      res.json({ message: 'Nouveau code envoyé' });
    } catch (error) {
      console.error('Resend verification error:', {
        message: error.message,
        email: sanitizeForLog(email)
      });
      res.status(500).json({ message: 'Failed to resend code' });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      const user = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // If changing password, verify current password
      if (newPassword) {
        if (user.oauth_provider) {
          return res.status(400).json({ message: 'Cannot change password for OAuth accounts' });
        }
        
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password required' });
        }
        
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
      }
      
      // Update user data
      const updates = [];
      const values = [];
      
      if (name && name !== user.name) {
        updates.push('name = ?');
        values.push(name);
      }
      
      if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updates.push('password = ?');
        values.push(hashedPassword);
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ message: 'No changes to update' });
      }
      
      values.push(userId);
      
      await new Promise((resolve, reject) => {
        db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values, function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });
      
      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Update profile error:', {
        message: error.message,
        userId: sanitizeForLog(userId)
      });
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }

  async deleteAccount(req, res) {
    try {
      const { password } = req.body;
      const userId = req.user.id;
      
      // Get user data
      const user = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify password for non-OAuth users
      if (user.password && !user.oauth_provider) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid password' });
        }
      }
      
      // Delete user and related data with transaction
      await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');
          db.run('DELETE FROM contact_submissions WHERE user_id = ?', [userId]);
          db.run('DELETE FROM ratings WHERE user_id = ?', [userId]);
          db.run('DELETE FROM password_resets WHERE email = ?', [user.email]);
          db.run('DELETE FROM email_verifications WHERE email = ?', [user.email]);
          db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
            } else {
              db.run('COMMIT');
              resolve(this.changes);
            }
          });
        });
      });
      
      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Delete account error:', {
        message: error.message,
        userId: sanitizeForLog(userId)
      });
      res.status(500).json({ message: 'Failed to delete account' });
    }
  }

  async googleAuth(req, res) {
    try {
      const authUrl = googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email']
      });
      res.redirect(authUrl);
    } catch (error) {
      console.error('Google auth error:', error.message);
      res.status(500).json({ message: 'Google authentication failed' });
    }
  }

  async googleCallback(req, res) {
    try {
      const { code } = req.query;
      const { tokens } = await googleClient.getToken(code);
      googleClient.setCredentials(tokens);
      
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      const { email, name } = payload;
      
      // Check if user exists
      const existingUser = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      let user;
      if (existingUser) {
        user = existingUser;
      } else {
        // Create new user
        const userId = await new Promise((resolve, reject) => {
          db.run("INSERT INTO users (name, email, oauth_provider, role) VALUES (?, ?, 'google', 'client')",
            [name, email], function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            });
        });
        
        user = { id: userId, name, email, role: 'client', oauth_provider: 'google' };
      }
      
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      
      // Redirect to frontend with token
      res.redirect(`http://localhost:8080?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', {
        message: error.message,
        code: sanitizeForLog(req.query?.code)
      });
      res.redirect('http://localhost:8080?error=auth_failed');
    }
  }
}

module.exports = new AuthController();