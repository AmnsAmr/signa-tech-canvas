require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Google OAuth setup
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  'http://localhost:5000/api/auth/google/callback'
);

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Database setup
const db = new sqlite3.Database('signatech.db', (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    role TEXT DEFAULT 'client',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    project TEXT,
    message TEXT NOT NULL,
    service_type TEXT,
    material TEXT,
    size TEXT,
    quantity TEXT,
    thickness TEXT,
    colors TEXT,
    finishing TEXT,
    cutting_application TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Create admin user
  db.get("SELECT * FROM users WHERE email = 'admin@signatech.com'", (err, row) => {
    if (!row) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", 
        ['Admin', 'admin@signatech.com', hashedPassword, 'admin']);
    }
  });
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { name, email, password, company, phone } = req.body;
  
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (row) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run("INSERT INTO users (name, email, password, company, phone) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, company || null, phone || null], function(err) {
        if (err) return res.status(500).json({ message: 'Registration failed' });

        const token = jwt.sign({ id: this.lastID, email, role: 'client' }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: this.lastID, name, email, company, phone, role: 'client' } });
      });
  });
});

app.post('/api/auth/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { email, password } = req.body;
  
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, company: user.company, phone: user.phone, role: user.role }
    });
  });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get("SELECT id, name, email, company, phone, role FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  });
});

// Google OAuth Routes
app.get('/api/auth/google', (req, res) => {
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email']
  });
  res.redirect(authUrl);
});

app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    
    // Check if user exists
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
      if (err) return res.redirect('http://localhost:8080/contact?error=database_error');
      
      if (user) {
        // User exists, login
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.redirect(`http://localhost:8080/contact?token=${token}`);
      } else {
        // Create new user
        db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          [name, email, 'google_oauth', 'client'], function(err) {
            if (err) return res.redirect('http://localhost:8080/contact?error=registration_failed');
            
            const token = jwt.sign({ id: this.lastID, email, role: 'client' }, JWT_SECRET, { expiresIn: '24h' });
            res.redirect(`http://localhost:8080/contact?token=${token}`);
          });
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect('http://localhost:8080/contact?error=oauth_failed');
  }
});

// Contact Routes
app.post('/api/contact/guest-submit', [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('message').notEmpty().withMessage('Message is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { name, company, email, phone, project, message, serviceType, material, size, quantity, thickness, colors, finishing, cuttingApplication } = req.body;

  db.run(`INSERT INTO contact_submissions (
    user_id, name, company, email, phone, project, message, service_type, material, size, quantity, thickness, colors, finishing, cutting_application
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [null, name, company, email, phone, project, message, serviceType, material, size, quantity, thickness, colors, finishing, cuttingApplication],
    function(err) {
      if (err) return res.status(500).json({ message: 'Failed to save submission' });
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'amraniaamine@gmail.com',
        subject: `Nouvelle demande de contact de ${name}`,
        html: `
          <h2>Nouvelle demande de contact (Invité)</h2>
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Entreprise:</strong> ${company || 'N/A'}</p>
          <p><strong>Email:</strong> ${email || 'N/A'}</p>
          <p><strong>Téléphone:</strong> ${phone}</p>
          <p><strong>Message:</strong> ${message}</p>
          ${serviceType ? `<h3>Spécifications:</h3><p><strong>Service:</strong> ${serviceType}</p>` : ''}
        `
      };

      transporter.sendMail(mailOptions, (emailErr) => {
        if (emailErr) return res.status(500).json({ message: 'Failed to send email' });
        res.json({ message: 'Votre demande a été envoyée avec succès!' });
      });
    });
});

app.post('/api/contact/submit', authenticateToken, [
  body('message').notEmpty().withMessage('Message is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { project, message, serviceType, material, size, quantity, thickness, colors, finishing, cuttingApplication } = req.body;

  db.get("SELECT * FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err || !user) return res.status(500).json({ message: 'User not found' });

    db.run(`INSERT INTO contact_submissions (
      user_id, name, company, email, phone, project, message, service_type, material, size, quantity, thickness, colors, finishing, cutting_application
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, user.name, user.company, user.email, user.phone, project, message, serviceType, material, size, quantity, thickness, colors, finishing, cuttingApplication],
      function(err) {
        if (err) return res.status(500).json({ message: 'Failed to save submission' });
        res.json({ message: 'Votre demande a été envoyée avec succès!' });
      });
  });
});

// Admin Routes
app.get('/api/admin/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  
  db.all("SELECT id, name, email, company, phone, role, created_at FROM users ORDER BY created_at DESC", (err, users) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch users' });
    res.json(users);
  });
});

app.get('/api/admin/submissions', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  
  db.all(`SELECT cs.*, 
    CASE WHEN cs.user_id IS NULL THEN 'Invité' ELSE u.name END as user_name,
    CASE WHEN cs.user_id IS NULL THEN 'Non inscrit' ELSE u.email END as user_email
    FROM contact_submissions cs LEFT JOIN users u ON cs.user_id = u.id 
    ORDER BY cs.created_at DESC`, (err, submissions) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch submissions' });
    res.json(submissions);
  });
});

app.patch('/api/admin/submissions/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['pending', 'done'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  
  db.run('UPDATE contact_submissions SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) return res.status(500).json({ message: 'Failed to update status' });
    if (this.changes === 0) return res.status(404).json({ message: 'Submission not found' });
    res.json({ message: 'Status updated successfully' });
  });
});

// Static files
app.use(express.static(path.join(__dirname, '../dist')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});