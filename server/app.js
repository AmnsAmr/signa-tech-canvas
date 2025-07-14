require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT } = require('./config/constants');

// Import database to initialize
require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const imageRoutes = require('./routes/images');
const ratingRoutes = require('./routes/ratings');
const userRoutes = require('./routes/user');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/user', userRoutes);

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

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;