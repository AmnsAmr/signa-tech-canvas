# Project Carousel System

## Overview

The project portfolio has been completely redesigned from a stacked card layout to a modern, professional sliding carousel system. This new system provides better organization, improved user experience, and enhanced admin management capabilities.

## Key Features

### 🎠 Modern Carousel Layout
- **Multiple Projects Display**: Shows multiple projects simultaneously in horizontally scrollable sliders
- **Smooth Transitions**: Fluid animations and responsive design for optimal UX
- **Touch/Swipe Support**: Native touch gestures on mobile devices
- **Keyboard Navigation**: Arrow key support for accessibility

### 📂 Dynamic Section Management
- **Customizable Sections**: Admin can create, edit, and organize project sections (e.g., "Web Projects", "Mobile Apps", "Visual Identity")
- **Flexible Organization**: Each section can contain multiple projects with custom ordering
- **Active/Inactive States**: Sections can be enabled/disabled without deletion

### 🛠 Admin Management
- **Project Manager**: Comprehensive admin interface for managing sections and projects
- **Image Integration**: Seamless integration with existing image management system
- **Drag & Drop Ordering**: Easy reordering of sections and projects
- **Bulk Operations**: Efficient management of multiple projects

## Technical Implementation

### Database Schema

#### Project Sections Table
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

#### Projects Table
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

### API Endpoints

#### Public Endpoints
- `GET /api/projects/sections` - Get all active sections with their projects

#### Admin Endpoints
- `GET /api/projects/admin/sections` - Get all sections (including inactive)
- `POST /api/projects/admin/sections` - Create new section
- `PUT /api/projects/admin/sections/:id` - Update section
- `DELETE /api/projects/admin/sections/:id` - Delete section
- `GET /api/projects/admin/sections/:sectionId/projects` - Get projects by section
- `POST /api/projects/admin/projects` - Create new project
- `PUT /api/projects/admin/projects/:id` - Update project
- `DELETE /api/projects/admin/projects/:id` - Delete project

### Components

#### ProjectCarousel.tsx
- Renders individual project carousels for each section
- Handles horizontal scrolling with navigation buttons
- Responsive design with touch support
- Smooth animations and hover effects

#### ProjectManager.tsx (Admin)
- Complete admin interface for managing projects
- Section creation, editing, and deletion
- Project management within sections
- Image selection from existing portfolio images
- Real-time updates and validation

## Migration from Old System

### What Was Removed
- ✅ Stacked card layout with random rotations
- ✅ Single image gallery approach
- ✅ Touch swipe navigation for single images
- ✅ Manual image index management
- ✅ Old portfolio image caching logic

### What Was Added
- ✅ Database-driven project organization
- ✅ Multi-section carousel system
- ✅ Admin project management interface
- ✅ Structured project data with titles and descriptions
- ✅ Flexible section management
- ✅ Enhanced responsive design

## Usage Instructions

### For Administrators

1. **Access Project Management**
   - Go to Admin Dashboard → Projects tab
   - View all sections and their project counts

2. **Create New Section**
   - Click "Nouvelle Section" button
   - Enter section name and display order
   - Save to create the section

3. **Add Projects to Section**
   - Click "Projet" button on any section
   - Fill in project title and description
   - Select an image from portfolio images
   - Set display order and save

4. **Manage Existing Content**
   - Edit sections by clicking the edit icon
   - Reorder sections using display_order field
   - Enable/disable sections without deletion
   - Delete projects or sections as needed

### For Users

1. **Browse Projects**
   - Visit the Portfolio page
   - Scroll through different project sections
   - Use navigation arrows to browse within each carousel
   - Click on project cards for detailed view

2. **Responsive Experience**
   - Desktop: Multiple projects visible with smooth scrolling
   - Tablet: Optimized layout with touch navigation
   - Mobile: Single project view with swipe gestures

## Performance Optimizations

- **Lazy Loading**: Images load as needed during scrolling
- **Smooth Scrolling**: CSS scroll-behavior and JavaScript optimization
- **Responsive Images**: Proper image sizing for different screen sizes
- **Minimal Re-renders**: Efficient React state management
- **Database Indexing**: Optimized queries with proper indexes

## Future Enhancements

- **Project Details Modal**: Expanded view with more project information
- **Category Filtering**: Filter projects by technology or type
- **Search Functionality**: Search within projects and descriptions
- **Project Analytics**: Track project views and engagement
- **Bulk Import**: Import multiple projects from external sources
- **Project Templates**: Predefined project structures for quick setup

## Maintenance

### Database Migrations
- Migration `003-add-project-sections.js` creates the new tables
- Sample data script `add-sample-projects.js` populates initial content
- Use `start-with-migrations.bat` to ensure migrations run on startup

### Backup Considerations
- Project data is stored in SQLite database
- Regular backups include both project metadata and associated images
- Image files remain in the uploads directory structure

## Troubleshooting

### Common Issues

1. **Projects Not Displaying**
   - Check if sections are marked as active (`is_active = 1`)
   - Verify projects exist and are active
   - Ensure API endpoints are accessible

2. **Images Not Loading**
   - Verify image files exist in uploads directory
   - Check image filename references in database
   - Ensure proper CORS configuration

3. **Admin Interface Issues**
   - Verify admin authentication and permissions
   - Check browser console for JavaScript errors
   - Ensure all required API endpoints are available

### Performance Issues

1. **Slow Carousel Scrolling**
   - Check for large image files that need optimization
   - Verify CSS transitions are not conflicting
   - Consider implementing virtual scrolling for large datasets

2. **Database Query Performance**
   - Monitor query execution times
   - Add indexes on frequently queried columns
   - Consider pagination for large project collections