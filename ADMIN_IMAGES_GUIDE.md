# Enhanced Admin Images & Projects Management

## Overview

The admin panel now includes enhanced image and project management functionality with intelligent business rules and better user experience.

## Image Management Features

### Business Rules Implementation

1. **Logo Images** (`logo` category)
   - **Rule**: Maximum 1 image
   - **Behavior**: Uploading a new logo automatically replaces the existing one
   - **Usage**: Site header and favicon
   - **Restriction**: Cannot delete the only logo (must replace instead)

2. **Homepage Hero Images** (`hero` category)
   - **Rule**: Maximum 3 images
   - **Behavior**: Can add up to 3 images, prevents adding more
   - **Usage**: Homepage hero section and portfolio previews
   - **Order**: First image = main hero, 2nd & 3rd = project previews

3. **About Page Images** (`about` category)
   - **Rule**: Maximum 1 image
   - **Behavior**: Uploading replaces existing image
   - **Usage**: About page story section
   - **Restriction**: Cannot delete the only about image

4. **Portfolio Images** (`portfolio` category)
   - **Rule**: Unlimited images
   - **Behavior**: Can add/remove freely
   - **Usage**: Portfolio carousel and project assignments

### New API Endpoints

#### Image Rules
- `GET /api/admin/images/rules` - Get category rules with current counts

#### Enhanced Image Operations
- `POST /api/admin/images/upload` - Upload with automatic rule enforcement
- `DELETE /api/admin/images/:id` - Delete with business rule validation
- `PUT /api/admin/images/:id/replace` - Replace image

## Project Management Features

### Project Structure

1. **Project Sections**
   - Organize projects into categories (e.g., "Web Projects", "Mobile Apps")
   - Each section can contain multiple projects
   - Sections have display order and active/inactive status

2. **Projects**
   - Belong to a section
   - Have title, description, and optional image
   - Can be reordered within sections
   - Images are sourced from portfolio category

### New API Endpoints

#### Project Sections
- `GET /api/projects/admin/sections` - Get all sections
- `POST /api/projects/admin/sections` - Create section
- `PUT /api/projects/admin/sections/:id` - Update section
- `DELETE /api/projects/admin/sections/:id` - Delete section

#### Projects
- `GET /api/projects/admin/sections/:sectionId/projects` - Get section projects
- `POST /api/projects/admin/projects` - Create project
- `PUT /api/projects/admin/projects/:id` - Update project
- `PUT /api/projects/admin/projects/:id/image` - Update project image
- `DELETE /api/projects/admin/projects/:id/image` - Remove project image
- `DELETE /api/projects/admin/projects/:id` - Delete project

## Database Schema

### Enhanced site_images Table
```sql
CREATE TABLE site_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,           -- logo, hero, about, portfolio
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  path TEXT NOT NULL,
  size INTEGER,
  mime_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### New project_sections Table
```sql
CREATE TABLE project_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### New projects Table
```sql
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_filename TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_id) REFERENCES project_sections (id) ON DELETE CASCADE
);
```

## Setup Instructions

### 1. Ensure Database Tables Exist
```bash
cd server
node ensure-project-tables.js
```

### 2. Test Current Setup
```bash
node test-image-functionality.js
```

### 3. Start the Application
```bash
# Start all services
start-services-updated.bat

# Or manually:
# Terminal 1 - Python Service
cd python-vector-service
python app.py

# Terminal 2 - Node.js Server
cd server
npm start

# Terminal 3 - Frontend
npm run dev
```

## Usage Guide

### Image Management

1. **Access Admin Panel**
   - Navigate to `/admin`
   - Go to "Images" section

2. **Upload Images**
   - Select appropriate category
   - Choose image file
   - Click "Add" or "Replace" button
   - System enforces category rules automatically

3. **Manage Images**
   - View images organized by category
   - See current count vs. limits
   - Replace or delete images (where allowed)
   - Visual indicators show rule compliance

### Project Management

1. **Create Project Sections**
   - Go to "Projects" section in admin
   - Click "New Section"
   - Enter section name
   - Set display order

2. **Add Projects**
   - Click "Add Project" in desired section
   - Enter project details
   - Select existing portfolio image or upload new one
   - Set display order within section

3. **Manage Projects**
   - Edit project details
   - Update/remove project images
   - Reorder projects within sections
   - Delete projects or entire sections

## File Structure

### Backend Files
- `server/controllers/imageController.js` - Enhanced image management
- `server/controllers/projectController.js` - Project management
- `server/routes/admin.js` - Admin routes with new endpoints
- `server/routes/projects.js` - Project routes

### Frontend Files
- `src/components/Admin/EnhancedImageManager.tsx` - New image manager
- `src/components/Admin/EnhancedProjectManager.tsx` - New project manager
- `src/api/endpoints.ts` - Updated API endpoints
- `src/api/config.ts` - API configuration

### Utility Files
- `server/test-image-functionality.js` - Database testing
- `server/ensure-project-tables.js` - Table setup script

## Troubleshooting

### Common Issues

1. **Images not uploading**
   - Check uploads folder permissions
   - Verify file size limits
   - Check category rules compliance

2. **Projects not displaying**
   - Run `ensure-project-tables.js` to create tables
   - Check if sections exist and are active
   - Verify project images are in portfolio category

3. **Database errors**
   - Run test script to verify table structure
   - Check foreign key constraints
   - Ensure migrations have run

### Error Messages

- "Maximum X images allowed" - Category limit reached
- "Cannot delete the only logo image" - Business rule violation
- "Image not found" - File may have been deleted from filesystem
- "Project not found" - Project may have been deleted

## Best Practices

1. **Image Organization**
   - Use descriptive filenames
   - Optimize images before upload
   - Follow category guidelines

2. **Project Management**
   - Create logical section groupings
   - Use clear project titles
   - Add meaningful descriptions
   - Assign appropriate images

3. **Maintenance**
   - Regularly backup database
   - Clean up unused images
   - Monitor file storage usage
   - Test functionality after updates

## Future Enhancements

- Image compression and optimization
- Bulk image operations
- Advanced project filtering
- Image usage tracking
- Automated backups
- Performance monitoring