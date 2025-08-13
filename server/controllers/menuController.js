const MenuCategory = require('../models/MenuCategory');
const { cacheManager } = require('../utils/cacheManager');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// Configure multer for image uploads
const fs = require('fs');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const menuDir = path.join('uploads', 'Menu');
    if (!fs.existsSync(menuDir)) {
      fs.mkdirSync(menuDir, { recursive: true });
    }
    cb(null, menuDir);
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
  // Get menu data without caching for instant updates
  async getMenu(req, res) {
    try {
      console.log('getMenu called - bypassing cache for instant updates');
      const menuData = await MenuController.buildMenuFromDatabase();
      console.log('Sending fresh menu data:', menuData.length, 'top directories');
      
      // Set no-cache headers to prevent browser caching
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.json(menuData);
    } catch (error) {
      console.error('Error fetching menu:', error);
      res.status(500).json({ error: 'Failed to fetch menu data' });
    }
  }

  // Build hierarchical menu structure: Top Directory → Subdirectories → Products
  static async buildMenuFromDatabase() {
    try {
      const allItems = await MenuCategory.find({ isActive: true })
        .sort({ displayOrder: 1 })
        .lean();
      
      // Top directories (no parent, type = category)
      const topDirectories = allItems.filter(item => 
        item.parentId === null && item.type === 'category'
      );
      
      const menuData = topDirectories.map(topDir => {
        // Get subdirectories for this top directory
        const subdirectories = allItems
          .filter(item => 
            item.parentId && 
            item.parentId.toString() === topDir._id.toString() && 
            item.type === 'category'
          )
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(subDir => {
            // Get products for this subdirectory
            const products = allItems
              .filter(item => 
                item.parentId && 
                item.parentId.toString() === subDir._id.toString() && 
                item.type === 'product'
              )
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map(product => ({
                id: product._id.toString(),
                name: product.name,
                imageUrl: product.imageUrl,
                description: product.description,
                customFields: product.customFields,
                type: 'product'
              }));
            
            return {
              id: subDir._id.toString(),
              name: subDir.name,
              imageUrl: subDir.imageUrl,
              description: subDir.description,
              customFields: subDir.customFields,
              type: 'category',
              products
            };
          });
        
        return {
          id: topDir._id.toString(),
          name: topDir.name,
          imageUrl: topDir.imageUrl,
          description: topDir.description,
          customFields: topDir.customFields,
          type: 'category',
          subdirectories
        };
      });
      
      console.log('Menu structure built:', menuData.length, 'top directories');
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
      
      // Clear all menu-related caches
      cacheManager.del('menu_data');
      cacheManager.del('route:GET:/api/menu');
      
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
      
      // Clear all menu-related caches
      cacheManager.del('menu_data');
      cacheManager.del('route:GET:/api/menu');
      
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
      
      // Clear all menu-related caches after deletion
      cacheManager.del('menu_data');
      cacheManager.del('route:GET:/api/menu');
      
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

  // Get subdirectory with its products without caching for instant updates
  async getCategory(req, res) {
    try {
      const { categoryId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }
      
      const subdirectory = await MenuCategory.findById(categoryId).lean();
      
      if (!subdirectory || subdirectory.type !== 'category') {
        return res.status(404).json({ error: 'Subdirectory not found' });
      }
      
      // Get all products in this subdirectory
      const products = await MenuCategory.find({ 
        parentId: categoryId, 
        type: 'product',
        isActive: true 
      }).sort({ displayOrder: 1 }).lean();
      
      const categoryData = {
        ...subdirectory,
        products: products.map(product => ({
          _id: product._id,
          name: product.name,
          imageUrl: product.imageUrl,
          description: product.description,
          customFields: product.customFields,
          type: product.type
        }))
      };
      
      // Set no-cache headers to prevent browser caching
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.json(categoryData);
    } catch (error) {
      console.error('Error in getCategory:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get single product without caching for instant updates
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
      
      // Set no-cache headers to prevent browser caching
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
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

  // Upload image for product/category
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const { categoryId } = req.body;
      if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ error: 'Valid category ID is required' });
      }

      const imagePath = `Menu/${req.file.filename}`;
      
      // Update the category/product with the image path
      const category = await MenuCategory.findByIdAndUpdate(
        categoryId,
        { imageUrl: imagePath },
        { new: true }
      );

      if (!category) {
        return res.status(404).json({ error: 'Category/Product not found' });
      }

      // Clear menu cache
      cacheManager.del('menu_data');
      cacheManager.del('route:GET:/api/menu');

      res.json({ 
        message: 'Image uploaded successfully',
        imageUrl: imagePath,
        category: category.toObject()
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }

  // Remove image from product/category
  async removeImage(req, res) {
    try {
      const { categoryId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }

      const category = await MenuCategory.findById(categoryId);
      if (!category) {
        return res.status(404).json({ error: 'Category/Product not found' });
      }

      // Delete the image file if it exists
      if (category.imageUrl) {
        const imagePath = path.join('uploads', category.imageUrl);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Update the category to remove image URL
      category.imageUrl = '';
      await category.save();

      // Clear menu cache
      cacheManager.del('menu_data');
      cacheManager.del('route:GET:/api/menu');

      res.json({ 
        message: 'Image removed successfully',
        category: category.toObject()
      });
    } catch (error) {
      console.error('Error removing image:', error);
      res.status(500).json({ error: 'Failed to remove image' });
    }
  }

  // Get upload middleware
  getUploadMiddleware() {
    return upload.single('image');
  }
}

module.exports = new MenuController();