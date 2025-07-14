require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
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
console.log('Google OAuth Config:', {
  clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
  redirectUri: 'http://localhost:5000/api/auth/google/callback'
});

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
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
    password TEXT,
    company TEXT,
    phone TEXT,
    role TEXT DEFAULT 'client',
    oauth_provider TEXT,
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

  db.run(`CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS site_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    path TEXT NOT NULL,
    size INTEGER,
    mime_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add oauth_provider column if it doesn't exist (migration)
  db.run("ALTER TABLE users ADD COLUMN oauth_provider TEXT", (err) => {
    // Ignore error if column already exists
  });

  // Initialize default images
  db.get("SELECT COUNT(*) as count FROM site_images", (err, row) => {
    if (!err && row.count === 0) {
      const defaultImages = [
        { category: 'logo', filename: 'Logo.png', original_name: 'Logo.png', path: '/src/assets/Logo.png' },
        { category: 'hero', filename: 'main_pic.jpg', original_name: 'main_pic.jpg', path: '/src/assets/main_pic.jpg' },
        { category: 'about', filename: 'hero-workshop.jpg', original_name: 'hero-workshop.jpg', path: '/src/assets/hero-workshop.jpg' },
        { category: 'about', filename: 'team-work.jpg', original_name: 'team-work.jpg', path: '/src/assets/team-work.jpg' },
        { category: 'services', filename: 'facade-project.jpg', original_name: 'facade-project.jpg', path: '/src/assets/facade-project.jpg' },
        { category: 'services', filename: 'plv-displays.jpg', original_name: 'plv-displays.jpg', path: '/src/assets/plv-displays.jpg' }
      ];
      
      for (let i = 1; i <= 16; i++) {
        defaultImages.push({
          category: 'portfolio',
          filename: `${i}.jpg`,
          original_name: `${i}.jpg`,
          path: `/src/assets/${i}.jpg`
        });
      }
      
      defaultImages.forEach(img => {
        db.run("INSERT INTO site_images (category, filename, original_name, path) VALUES (?, ?, ?, ?)",
          [img.category, img.filename, img.original_name, img.path]);
      });
    }
  });
  
  // Create admin user
  db.get("SELECT * FROM users WHERE email = 'admin@signatech.com'", (err, row) => {
    if (!row) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", 
        ['Admin', 'admin@signatech.com', hashedPassword, 'admin']);
    }
  });
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../src/assets');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
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
    
    // Check if user is OAuth user
    if (user.oauth_provider && !user.password) {
      return res.status(400).json({ message: 'Please use Google Sign-In for this account' });
    }

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

// Forgot Password Routes
app.post('/api/auth/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { email } = req.body;
  
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!user) return res.status(400).json({ message: 'Email not found' });
    
    if (user.oauth_provider) {
      return res.status(400).json({ message: 'Please use Google Sign-In for this account' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    db.run("INSERT INTO password_resets (email, code, expires_at) VALUES (?, ?, ?)",
      [email, code, expiresAt.toISOString()], (err) => {
        if (err) return res.status(500).json({ message: 'Failed to create reset request' });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Code de réinitialisation de mot de passe - SignaTech',
          html: `
            <h2>Réinitialisation de mot de passe</h2>
            <p>Votre code de vérification est: <strong>${code}</strong></p>
            <p>Ce code expire dans 15 minutes.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          `
        };

        transporter.sendMail(mailOptions, (emailErr) => {
          if (emailErr) return res.status(500).json({ message: 'Failed to send email' });
          res.json({ message: 'Code de vérification envoyé à votre email' });
        });
      });
  });
});

app.post('/api/auth/verify-reset-code', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { email, code } = req.body;
  
  db.get(`SELECT * FROM password_resets WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1`,
    [email, code], (err, reset) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (!reset) return res.status(400).json({ message: 'Code invalide ou expiré' });
      
      res.json({ message: 'Code vérifié avec succès', valid: true });
    });
});

app.post('/api/auth/reset-password', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const { email, code, password } = req.body;
  
  db.get(`SELECT * FROM password_resets WHERE email = ? AND code = ? AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1`,
    [email, code], async (err, reset) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (!reset) return res.status(400).json({ message: 'Code invalide ou expiré' });
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      db.run("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email], (err) => {
        if (err) return res.status(500).json({ message: 'Failed to update password' });
        
        db.run("UPDATE password_resets SET used = 1 WHERE id = ?", [reset.id], (err) => {
          if (err) console.error('Failed to mark reset code as used:', err);
        });
        
        res.json({ message: 'Mot de passe réinitialisé avec succès' });
      });
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
        // Redirect with token and user info
        res.redirect(`http://localhost:8080/contact?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`);
      } else {
        // Create new user with Google info
        db.run(
          "INSERT INTO users (name, email, password, role, company, phone, oauth_provider) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [name, email, '', 'client', null, null, 'google'], // Changed 'null' to '' for password
          function (err) {
            if (err) {
              console.error('Database error:', err);
              return res.redirect('http://localhost:8080/contact?error=registration_failed');
            }

            const token = jwt.sign({ id: this.lastID, email, role: 'client' }, JWT_SECRET, { expiresIn: '24h' });
            res.redirect(`http://localhost:8080/contact?token=${token}`);
          }
        );
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

// Public Images Route (for frontend)
app.get('/api/images', (req, res) => {
  const { category } = req.query;
  let query = "SELECT * FROM site_images";
  let params = [];
  
  if (category) {
    query += " WHERE category = ?";
    params.push(category);
  }
  
  query += " ORDER BY category, created_at DESC";
  
  db.all(query, params, (err, images) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch images' });
    res.json(images);
  });
});

// Admin Image Management Routes
app.get('/api/admin/images', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  
  const { category } = req.query;
  let query = "SELECT * FROM site_images";
  let params = [];
  
  if (category) {
    query += " WHERE category = ?";
    params.push(category);
  }
  
  query += " ORDER BY category, created_at DESC";
  
  db.all(query, params, (err, images) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch images' });
    res.json(images);
  });
});

app.post('/api/admin/images/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  
  if (!req.file) return res.status(400).json({ message: 'No image file provided' });
  
  const { category } = req.body;
  if (!category) return res.status(400).json({ message: 'Category is required' });
  
  const imagePath = `/src/assets/${req.file.filename}`;
  
  db.run("INSERT INTO site_images (category, filename, original_name, path, size, mime_type) VALUES (?, ?, ?, ?, ?, ?)",
    [category, req.file.filename, req.file.originalname, imagePath, req.file.size, req.file.mimetype],
    function(err) {
      if (err) return res.status(500).json({ message: 'Failed to save image info' });
      
      res.json({
        id: this.lastID,
        category,
        filename: req.file.filename,
        original_name: req.file.originalname,
        path: imagePath,
        size: req.file.size,
        mime_type: req.file.mimetype
      });
    });
});

app.delete('/api/admin/images/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  
  const { id } = req.params;
  
  db.get("SELECT * FROM site_images WHERE id = ?", [id], (err, image) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!image) return res.status(404).json({ message: 'Image not found' });
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, '../src/assets', image.filename);
    fs.unlink(filePath, (fsErr) => {
      if (fsErr) console.error('Failed to delete file:', fsErr);
    });
    
    // Delete from database
    db.run("DELETE FROM site_images WHERE id = ?", [id], function(err) {
      if (err) return res.status(500).json({ message: 'Failed to delete image' });
      res.json({ message: 'Image deleted successfully' });
    });
  });
});

app.put('/api/admin/images/:id/replace', authenticateToken, upload.single('image'), (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  
  if (!req.file) return res.status(400).json({ message: 'No image file provided' });
  
  const { id } = req.params;
  
  db.get("SELECT * FROM site_images WHERE id = ?", [id], (err, oldImage) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (!oldImage) return res.status(404).json({ message: 'Image not found' });
    
    // Delete old file
    const oldFilePath = path.join(__dirname, '../src/assets', oldImage.filename);
    fs.unlink(oldFilePath, (fsErr) => {
      if (fsErr) console.error('Failed to delete old file:', fsErr);
    });
    
    // Update database with new image info
    const newImagePath = `/src/assets/${req.file.filename}`;
    
    db.run("UPDATE site_images SET filename = ?, original_name = ?, path = ?, size = ?, mime_type = ? WHERE id = ?",
      [req.file.filename, req.file.originalname, newImagePath, req.file.size, req.file.mimetype, id],
      function(err) {
        if (err) return res.status(500).json({ message: 'Failed to update image' });
        
        res.json({
          id: parseInt(id),
          category: oldImage.category,
          filename: req.file.filename,
          original_name: req.file.originalname,
          path: newImagePath,
          size: req.file.size,
          mime_type: req.file.mimetype
        });
      });
  });
});

app.get('/api/admin/images/categories', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  
  db.all("SELECT DISTINCT category FROM site_images ORDER BY category", (err, categories) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch categories' });
    res.json(categories.map(c => c.category));
  });
});

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../src/assets')));

// Static files - serve only for non-API routes
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api/') && !req.path.startsWith('/uploads/')) {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  } else if (req.path.startsWith('/api/')) {
    res.status(404).json({ message: 'API endpoint not found' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});