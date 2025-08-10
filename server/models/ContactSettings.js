const mongoose = require('mongoose');

const contactSettingsSchema = new mongoose.Schema({
  setting_key: {
    type: String,
    required: true,
    unique: true
  },
  setting_value: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ContactSettings', contactSettingsSchema);