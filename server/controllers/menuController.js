const MenuCategory = require('../models/MenuCategory');
const { cacheManager } = require('../utils/cacheManager');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

class MenuController {
  // Get menu data with caching
  async getMenu(req, res) {
    try {
      const cacheKey = 'menu_data';
      let menuData = cacheManager.get(cacheKey);
      
      if (!menuData) {
        menuData = await this.buildMenuFromDatabase();
        cacheManager.set(cacheKey, menuData, 300); // Cache for 5 minutes
      }
      
      res.json(menuData);
    } catch (error) {
      console.error('Error fetching menu:', error);
      res.status(500).json({ error: 'Failed to fetch menu data' });
    }
  }

  // Build hierarchical menu structure from database
  async buildMenuFromDatabase() {
    try {
      const categories = await MenuCategory.find({ isActive: true })
        .sort({ displayOrder: 1 })
        .lean();
      
      // Build hierarchical structure
      const topLevel = categories.filter(cat => !cat.parentId);
      const menuData = topLevel.map(parent => ({
        id: parent._id,
        name: parent.name,
        imageUrl: parent.imageUrl,
        description: parent.description,
        customFields: parent.customFields,
        subcategories: categories
          .filter(cat => cat.parentId && cat.parentId.toString() === parent._id.toString())
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(sub => ({
            id: sub._id,
            name: sub.name,
            imageUrl: sub.imageUrl,
            description: sub.description,
            customFields: sub.customFields,
            type: sub.type
          }))
      }));
      
      return menuData;
    } catch (error) {
      throw error;
    }
  }

  // Admin: Get all categories
  async getAllCategories(req, res) {
    try {
      const categories = await MenuCategory.find()
        .populate('parentId', 'name')
        .sort({ parentId: 1, displayOrder: 1 })
        .lean();
      
      res.json(categories);
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin: Create category
  async createCategory(req, res) {
    try {
      console.log('CREATE - Body:', req.body);
      const { name, parentId, displayOrder, description, customFields, type, imageUrl } = req.body;
      
      if (!name || name.trim() === '') {
        console.log('CREATE - Missing name');
        return res.status(400).json({ error: 'Category name is required' });
      }
      
      const categoryData = {
        name: name.trim(),
        parentId: parentId && parentId !== '' ? parentId : null,
        displayOrder: displayOrder || 0,
        description: description || '',
        customFields: customFields || {},
        type: type || 'category',
        imageUrl: imageUrl || ''
      };
      
      console.log('CREATE - Data to save:', categoryData);
      const category = new MenuCategory(categoryData);
      const savedCategory = await category.save();
      console.log('CREATE - Saved successfully:', savedCategory._id);
      
      res.json(savedCategory.toObject());
    } catch (error) {
      console.error('Error in createCategory:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        return res.status(500).json({ error: 'Database error: ' + error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin: Update category
  async updateCategory(req, res) {
    try {
      console.log('UPDATE - ID:', req.params.id);
      console.log('UPDATE - Body:', req.body);
      console.log('UPDATE - Content-Type:', req.headers['content-type']);
      
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }
      
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Request body is empty' });
      }
      
      const { name, parentId, displayOrder, description, customFields, type, isActive, imageUrl } = req.body;
      
      if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'Category name is required' });
      }
      
      const updateData = {
        name: name.trim(),
        parentId: parentId && parentId !== '' ? parentId : null,
        displayOrder: displayOrder || 0,
        description: description || '',
        customFields: customFields || {},
        type: type || 'category',
        isActive: isActive !== undefined ? isActive : true
      };
      
      if (imageUrl !== undefined) {
        updateData.imageUrl = imageUrl;
      }
      
      console.log('Executing update with data:', updateData);
      const category = await MenuCategory.findByIdAndUpdate(id, updateData, { new: true });
      console.log('Update result:', category);
      
      if (!category) {
        console.log('Category not found for ID:', id);
        return res.status(404).json({ error: 'Category not found' });
      }
      
      console.log('Update successful, returning:', category.toObject());
      
      res.json(category.toObject());
    } catch (error) {
      console.error('Error in updateCategory:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin: Delete category
  async deleteCategory(req, res) {
    try {
      console.log('DELETE - ID:', req.params.id);
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('DELETE - Invalid ObjectId');
        return res.status(400).json({ error: 'Invalid category ID' });
      }
      
      // Delete all subcategories recursively
      console.log('DELETE - Deleting subcategories');
      await MenuController.deleteSubcategories(id);
      
      console.log('DELETE - Deleting main category');
      const category = await MenuCategory.findByIdAndDelete(id);
      
      if (!category) {
        console.log('DELETE - Category not found');
        return res.status(404).json({ error: 'Category not found' });
      }
      
      console.log('DELETE - Success');
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      if (error.name === 'MongoError' || error.name === 'MongoServerError') {
        return res.status(500).json({ error: 'Database error: ' + error.message });
      }
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // Admin: Reorder categories
  async reorderCategories(req, res) {
    try {
      const { categories } = req.body;
      
      if (!Array.isArray(categories)) {
        return res.status(400).json({ error: 'Categories array is required' });
      }
      
      // Update display order for each category
      const updatePromises = categories.map((cat, index) => 
        MenuCategory.findByIdAndUpdate(cat.id, { displayOrder: index })
      );
      
      await Promise.all(updatePromises);
      
      res.json({ message: 'Categories reordered successfully' });
    } catch (error) {
      console.error('Error in reorderCategories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get single category with products
  async getCategory(req, res) {
    try {
      const { categoryId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }
      
      const category = await MenuCategory.findById(categoryId).lean();
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      // Get all products in this category
      const products = await MenuCategory.find({ 
        parentId: categoryId, 
        type: 'product',
        isActive: true 
      }).sort({ displayOrder: 1 }).lean();
      
      const categoryData = {
        ...category,
        products: products.map(product => ({
          _id: product._id,
          name: product.name,
          imageUrl: product.imageUrl,
          description: product.description,
          customFields: product.customFields,
          type: product.type
        }))
      };
      
      res.json(categoryData);
    } catch (error) {
      console.error('Error in getCategory:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get single product
  async getProduct(req, res) {
    try {
      const { productId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
      }
      
      const product = await MenuCategory.findById(productId).lean();
      
      if (!product || product.type !== 'product') {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Error in getProduct:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Helper method to delete subcategories recursively
  static async deleteSubcategories(parentId) {
    const children = await MenuCategory.find({ parentId }).lean();
    for (const child of children) {
      await MenuController.deleteSubcategories(child._id);
      await MenuCategory.findByIdAndDelete(child._id);
    }
  }

  // Get upload middleware
  getUploadMiddleware() {
    return upload.single('image');
  }
}

module.exports = new MenuController();