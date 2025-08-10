const Database = require('../config/database');
const { cacheManager } = require('../utils/cacheManager');

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
    const db = Database.getDb();
    
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC',
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          
          const categories = rows.map(row => ({
            id: row.id,
            name: row.name,
            parent_id: row.parent_id,
            display_order: row.display_order
          }));
          
          // Build hierarchical structure
          const topLevel = categories.filter(cat => cat.parent_id === null);
          const menuData = topLevel.map(parent => ({
            id: parent.id,
            name: parent.name,
            subcategories: categories
              .filter(cat => cat.parent_id === parent.id)
              .sort((a, b) => a.display_order - b.display_order)
              .map(sub => ({
                id: sub.id,
                name: sub.name
              }))
          }));
          
          resolve(menuData);
        }
      );
    });
  }

  // Admin: Get all categories
  async getAllCategories(req, res) {
    try {
      const db = Database.getDb();
      
      db.all(
        'SELECT * FROM categories ORDER BY parent_id ASC, display_order ASC',
        (err, rows) => {
          if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Failed to fetch categories' });
          }
          
          res.json(rows);
        }
      );
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin: Create category
  async createCategory(req, res) {
    try {
      const { name, parent_id, display_order } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      
      const db = Database.getDb();
      
      db.run(
        'INSERT INTO categories (name, parent_id, display_order) VALUES (?, ?, ?)',
        [name, parent_id || null, display_order || 0],
        function(err) {
          if (err) {
            console.error('Error creating category:', err);
            return res.status(500).json({ error: 'Failed to create category' });
          }
          
          // Clear menu cache
          cacheManager.delete('menu_data');
          
          res.json({ 
            id: this.lastID, 
            name, 
            parent_id: parent_id || null, 
            display_order: display_order || 0 
          });
        }
      );
    } catch (error) {
      console.error('Error in createCategory:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin: Update category
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, parent_id, display_order, is_active } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
      }
      
      const db = Database.getDb();
      
      db.run(
        'UPDATE categories SET name = ?, parent_id = ?, display_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, parent_id || null, display_order || 0, is_active !== undefined ? is_active : 1, id],
        function(err) {
          if (err) {
            console.error('Error updating category:', err);
            return res.status(500).json({ error: 'Failed to update category' });
          }
          
          if (this.changes === 0) {
            return res.status(404).json({ error: 'Category not found' });
          }
          
          // Clear menu cache
          cacheManager.delete('menu_data');
          
          res.json({ message: 'Category updated successfully' });
        }
      );
    } catch (error) {
      console.error('Error in updateCategory:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Admin: Delete category
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const db = Database.getDb();
      
      db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
        if (err) {
          console.error('Error deleting category:', err);
          return res.status(500).json({ error: 'Failed to delete category' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Category not found' });
        }
        
        // Clear menu cache
        cacheManager.delete('menu_data');
        
        res.json({ message: 'Category deleted successfully' });
      });
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new MenuController();