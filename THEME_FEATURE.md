# Theme Management Feature

## Overview
The theme management feature allows administrators to customize the website's appearance including colors, dark/light mode, and provides real-time preview functionality.

## Features

### ✅ Admin Panel Integration
- New "Theme" tab in the admin panel
- Intuitive color picker interface
- Real-time preview functionality
- Color preset options

### ✅ Dynamic Theme System
- CSS variables for dynamic theming
- Optimized rendering without page reloads
- Persistent theme storage in database
- Site-wide theme application

### ✅ Color Customization
- Primary color customization
- Accent color customization
- Background color control
- Text color control
- Border color control

### ✅ Dark/Light Mode
- Toggle switch in admin panel
- Theme toggle button in header
- Automatic CSS class management
- Persistent mode preference

### ✅ Preview System
- Live preview before applying changes
- Color picker with hex/HSL support
- Preset color schemes
- Reset to default functionality

### ✅ Performance Optimized
- CSS variables for instant updates
- No page reloads required
- Optimistic UI updates
- Error handling with rollback

## Technical Implementation

### Frontend Components
- `ThemeContext.tsx` - React context for theme management
- `ThemeSettings.tsx` - Admin panel theme configuration
- `ThemeToggle.tsx` - Header dark/light mode toggle
- `ThemePreview.tsx` - Live preview component

### Backend Components
- `themeController.js` - API endpoints for theme management
- `theme.js` - Public and admin routes
- Database table: `theme_settings`

### Database Schema
```sql
CREATE TABLE theme_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  colors TEXT NOT NULL,
  dark_mode INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Public Endpoints
- `GET /api/theme` - Get current theme settings

### Admin Endpoints (Authentication Required)
- `POST /api/admin/theme` - Update theme settings

## Usage

### For Administrators
1. Navigate to Admin Panel → Theme tab
2. Use color pickers or presets to customize colors
3. Toggle dark/light mode as needed
4. Click "Preview" to see changes live
5. Click "Apply Theme" to save changes
6. Use "Reset" to restore default theme

### For Users
- Use the theme toggle button in the header to switch between light/dark modes
- Theme changes apply instantly across the entire site

## Color Format
Colors are stored in HSL format (e.g., "270 85% 60%") for better manipulation and consistency with CSS variables.

## Browser Support
- Modern browsers with CSS custom properties support
- Graceful fallback to default theme if JavaScript is disabled

## Performance Notes
- Theme changes are applied instantly using CSS variables
- No page reloads or full re-renders required
- Optimistic updates with error rollback
- Minimal impact on page load performance