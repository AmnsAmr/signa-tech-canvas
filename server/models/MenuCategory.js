const mongoose = require('mongoose');

const menuCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuCategory',
    default: null
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  frameConfig: {
    width: { type: Number, default: 384 },
    height: { type: Number, default: 384 },
    objectFit: { type: String, enum: ['cover', 'contain', 'fill', 'scale-down', 'none'], default: 'cover' },
    borderRadius: { type: Number, default: 8 }
  },
  type: {
    type: String,
    enum: ['category', 'product'],
    default: 'category'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
menuCategorySchema.index({ parentId: 1, displayOrder: 1 });
menuCategorySchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('MenuCategory', menuCategorySchema);