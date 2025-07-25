# File-Based Theme System

## Overview
The theme system uses a `theme.json` file for persistent storage and provides global theme customization for all users.

## Features Implemented

### ✅ File-Based Storage
- Theme settings stored in `server/theme.json`
- Automatic fallback to default theme if file is missing/corrupted
- No database dependency

### ✅ Server Integration
- Theme file created on server startup if missing
- API endpoint `/api/theme` serves current theme
- Admin endpoint `/api/admin/theme` updates theme file
- Hot-reload without server restart

### ✅ Frontend Integration
- ThemeContext loads theme on app start
- CSS variables applied dynamically
- Live preview before saving
- Optimistic updates with error rollback

### ✅ Admin Interface
- Color picker with hex/HSL support
- 4 preset color schemes
- Live preview functionality
- Reset to default option

## File Structure
```
server/
├── theme.json              # Theme storage file
├── controllers/
│   └── themeController.js  # Theme API logic
├── routes/
│   └── theme.js           # Theme routes
└── utils/
    └── themeLoader.js     # Startup theme validation

src/
├── contexts/
│   └── ThemeContext.tsx   # Theme state management
└── components/Admin/
    └── SimpleThemeSettings.tsx  # Admin theme UI
```

## API Endpoints
- `GET /api/theme` - Get current theme (public)
- `POST /api/admin/theme` - Update theme (admin only)

## Theme Format
```json
{
  "primary": "270 85% 60%",
  "accent": "320 85% 65%",
  "background": "0 0% 99%",
  "foreground": "260 20% 15%",
  "card": "0 0% 100%",
  "border": "260 10% 90%"
}
```

## Usage
1. Admin navigates to Admin Panel → Theme tab
2. Selects colors using presets or custom pickers
3. Clicks "Preview" to see changes live
4. Clicks "Apply Theme" to save globally
5. Changes apply to all users immediately

## Performance
- Instant theme updates via CSS variables
- No page reloads required
- Minimal server load (file-based)
- Fallback handling for corrupted files