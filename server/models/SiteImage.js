const mongoose = require('mongoose');

const siteImageSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  original_name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number
  },
  mime_type: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SiteImage', siteImageSchema);