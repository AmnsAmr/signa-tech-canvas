require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { body, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Database setup
const db = new sqlite3.Database('signatech.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
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
  )`, (err) => {
    if (err) console.error('Error creating users table:', err);
    else console.log('Users table ready');
  });

  db.run(`CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`, (err) => {
    if (err) console.error('Error creating submissions table:', err);
    else console.log('Submissions table ready');
  });

  // Create admin user
  db.get("SELECT * FROM users WHERE email = 'admin@signatech.com'", (err, row) => {
    if (!row) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", 
        ['Admin', 'admin@signatech.com', hashedPassword, 'admin'], (err) => {
          if (err) console.error('Error creating admin user:', err);
          else console.log('Admin user created');
        });
    }
  });
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working', timestamp: new Date().toISOString() });
});

// Auth Routes
app.post('/api/auth/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  console.log('Register endpoint hit:', req.body);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { name, email, password, company, phone } = req.body;

  try {
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (row) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      db.run("INSERT INTO users (name, email, password, company, phone) VALUES (?, ?, ?, ?, ?)",
        [name, email, hashedPassword, company || null, phone || null], function(err) {
          if (err) {
            console.error('Insert error:', err);
            return res.status(500).json({ message: 'Registration failed' });
          }

          const token = jwt.sign(
            { id: this.lastID, email, role: 'client' },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

          res.json({
            token,
            user: { id: this.lastID, name, email, company, phone, role: 'client' }
          });
        });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  console.log('Login endpoint hit:', req.body.email);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  try {
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

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
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get("SELECT id, name, email, company, phone, role FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  });
});

// Contact submission endpoint
app.post('/api/contact/submit', authenticateToken, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const {
    name, company, email, phone, project, message,
    serviceType, material, size, quantity, thickness, colors,
    finishing, cuttingApplication
  } = req.body;

  try {
    db.run(`INSERT INTO contact_submissions (
      user_id, name, company, email, phone, project, message,
      service_type, material, size, quantity, thickness, colors,
      finishing, cutting_application
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, name, company, email, phone, project, message,
        serviceType, material, size, quantity, thickness, colors,
        finishing, cuttingApplication
      ], function(err) {
        if (err) {
          console.error('Submission error:', err);
          return res.status(500).json({ message: 'Failed to save submission' });
        }
        res.json({ message: 'Submission received successfully!' });
      });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes
app.get('/api/admin/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  db.all("SELECT id, name, email, company, phone, role, created_at FROM users ORDER BY created_at DESC", (err, users) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
    res.json(users);
  });
});

app.get('/api/admin/submissions', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  db.all(`
    SELECT cs.*, u.name as user_name, u.email as user_email 
    FROM contact_submissions cs 
    JOIN users u ON cs.user_id = u.id 
    ORDER BY cs.created_at DESC
  `, (err, submissions) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch submissions' });
    }
    res.json(submissions);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Routes registered:');
  console.log('- GET /test');
  console.log('- POST /api/auth/register');
  console.log('- POST /api/auth/login');
  console.log('- GET /api/auth/me');
  console.log('- POST /api/contact/submit');
  console.log('- GET /api/admin/users');
  console.log('- GET /api/admin/submissions');
});