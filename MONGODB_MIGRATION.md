# MongoDB Migration Guide

This guide explains how to migrate from SQLite to MongoDB for the flexible mega menu system.

## Prerequisites

1. **MongoDB Installation**: Make sure MongoDB is installed and running on your system
   - Download from: https://www.mongodb.com/try/download/community
   - Default connection: `mongodb://localhost:27017`

2. **Environment Configuration**: Update your `.env` file in the server directory:
   ```env
   DB_TYPE=mongodb
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=signatech
   ```

## Migration Steps

### Option 1: Automatic Migration (Recommended)

1. **Run the migration script**:
   ```bash
   cd server
   node scripts/migrate-to-mongodb.js
   ```

2. **Start services with MongoDB**:
   ```bash
   # From project root
   start-with-mongodb.bat
   ```

### Option 2: Manual Setup

1. **Install MongoDB dependencies**:
   ```bash
   cd server
   npm install mongoose
   ```

2. **Update environment variables** in `server/.env`:
   ```env
   DB_TYPE=mongodb
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=signatech
   ```

3. **Start the application**:
   ```bash
   # Terminal 1 - Python Service
   cd python-vector-service
   python app.py

   # Terminal 2 - Node.js Server
   cd server
   npm start

   # Terminal 3 - Frontend
   npm run dev
   ```

## New Features

### Enhanced Menu System

The MongoDB-based mega menu system includes:

- **Flexible Schema**: Dynamic custom fields for categories and products
- **Rich Content**: Image support, descriptions, and custom attributes
- **Hierarchical Structure**: Unlimited nesting levels
- **Type System**: Distinguish between categories and products
- **Admin Interface**: Full CRUD operations with drag-and-drop reordering

### Database Schema

```javascript
{
  name: String,           // Category/Product name
  parentId: ObjectId,     // Parent category (null for top-level)
  displayOrder: Number,   // Sort order
  imageUrl: String,       // Image URL
  description: String,    // Description text
  customFields: Object,   // Dynamic fields
  type: String,          // 'category' or 'product'
  isActive: Boolean      // Visibility status
}
```

### API Endpoints

- `GET /api/menu` - Public menu data
- `GET /api/menu/admin/categories` - Admin: Get all categories
- `POST /api/menu/admin/categories` - Admin: Create category (with image upload)
- `PUT /api/menu/admin/categories/:id` - Admin: Update category
- `DELETE /api/menu/admin/categories/:id` - Admin: Delete category
- `POST /api/menu/admin/categories/reorder` - Admin: Reorder categories

### Admin Panel

Access the mega menu manager at: **Admin Panel > Menu Management**

Features:
- Create/Edit categories and products
- Upload images for visual appeal
- Add descriptions and custom fields
- Drag-and-drop reordering
- Hierarchical view with subcategories

### Frontend Integration

The MegaMenu component automatically displays:
- Category images and descriptions
- Product badges and custom fields
- Responsive design for desktop and mobile
- Rich hover effects and animations

## Troubleshooting

### MongoDB Connection Issues

1. **Check MongoDB Service**:
   ```bash
   # Windows
   net start MongoDB

   # Or check if running
   tasklist | findstr mongod
   ```

2. **Verify Connection String**:
   - Default: `mongodb://localhost:27017`
   - Check your MongoDB configuration

3. **Database Permissions**:
   - Ensure MongoDB has proper read/write permissions
   - Check firewall settings if using remote MongoDB

### Migration Issues

1. **SQLite Data Not Found**:
   - The script will create sample data if no SQLite categories exist
   - You can manually add categories through the admin panel

2. **Mongoose Connection Errors**:
   - Verify MongoDB is running
   - Check the MONGODB_URI in your .env file
   - Ensure the database name is correct

### Performance Optimization

1. **Indexes**: The system automatically creates indexes for:
   - `parentId` and `displayOrder`
   - `type` and `isActive`

2. **Caching**: Menu data is cached for 5 minutes to improve performance

3. **Image Optimization**: Images are automatically optimized and cached

## Rollback to SQLite

If you need to rollback to SQLite:

1. Change `DB_TYPE=sqlite` in your `.env` file
2. Restart the server
3. The system will automatically use the SQLite database

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Check the migration script output for any errors