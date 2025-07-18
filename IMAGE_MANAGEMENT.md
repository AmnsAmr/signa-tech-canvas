# Image Management System - Signa Tech

## Overview
The admin panel now features an organized image management system that properly maps images to their actual usage throughout the website.

## Image Categories & Usage

### 🔴 Critical Priority (Immediate Display)

#### Logo du Site
- **Category**: `logo`
- **Usage**: Header navigation
- **Limit**: 1 image
- **Description**: Logo principal affiché dans l'en-tête du site

#### Page d'Accueil - Hero
- **Category**: `hero`
- **Usage**: Homepage hero section + portfolio preview cards
- **Limit**: 3 images
- **Description**: Images principales de la page d'accueil et aperçus portfolio
- **Order Mapping**:
  1. Image principale (hero background)
  2. Aperçu projet 1 (portfolio preview card)
  3. Aperçu projet 2 (portfolio preview card)

### 🟡 Important Priority (Main Pages)

#### Page À Propos
- **Category**: `about`
- **Usage**: About page story section
- **Limit**: 2 images
- **Description**: Images de l'équipe et de l'histoire de l'entreprise
- **Order Mapping**:
  1. Image équipe (team photo)
  2. Image histoire (company story)

#### Services & Projets
- **Category**: `services`
- **Usage**: Homepage portfolio preview section
- **Limit**: No limit
- **Description**: Images des services (façade, PLV, etc.) utilisées sur la page d'accueil
- **Order Mapping**:
  1. Projet façade (facade project)
  2. Projet PLV (PLV displays)
  3. Additional service images...

### 🟢 Standard Priority (Galleries)

#### Galerie Portfolio
- **Category**: `portfolio`
- **Usage**: Portfolio page main gallery
- **Limit**: No limit
- **Description**: Collection complète des projets pour la galerie portfolio

## Admin Interface Features

### Visual Organization
- **Color-coded priorities**: Red (Critical), Yellow (Important), Green (Standard)
- **Usage information**: Each section shows where images are used
- **Order indicators**: Images show their position and purpose
- **Limit warnings**: Alerts when maximum images are reached

### Image Management
- **Upload restrictions**: Prevents exceeding recommended limits
- **Replace functionality**: Easy image replacement without losing position
- **Delete confirmation**: Prevents accidental deletions
- **Order preservation**: Images maintain their intended sequence

## Best Practices

### Image Order Importance
1. **Hero section**: First image is the main hero background
2. **Services**: Order determines homepage display sequence
3. **Portfolio**: Order affects gallery navigation

### Recommended Image Specifications
- **Logo**: PNG with transparent background, 200x60px recommended
- **Hero**: High-resolution landscape images, 1920x1080px minimum
- **About**: Professional team photos, 800x600px minimum
- **Services**: Project showcase images, 800x600px minimum
- **Portfolio**: High-quality project images, 1200x800px minimum

### File Naming Conventions
- Use descriptive names: `logo-signatech.png`, `hero-main.jpg`
- Avoid special characters and spaces
- Include project type: `facade-project-1.jpg`, `plv-display-modern.jpg`

## Technical Implementation

### File Structure
```
src/
├── components/Admin/
│   └── OrganizedImageManager.tsx    # Main admin interface
├── utils/
│   └── imageOrganizer.ts           # Image organization utilities
└── hooks/
    └── useImageCache.ts            # Image caching for frontend
```

### API Integration
- Images are categorized on upload
- Frontend components use category-based image fetching
- Automatic cache invalidation on image updates

## Troubleshooting

### Common Issues
1. **Images not appearing**: Check category assignment in admin panel
2. **Wrong image order**: Use replace function to maintain position
3. **Upload failures**: Verify file size and format requirements
4. **Changes not visible on website**: Refresh the website page after making changes in admin

### Cache Management
- Server cache is automatically cleared when images are modified
- Frontend cache refreshes on page reload
- Admin shows success message when changes are saved

### Support
For technical issues with the image management system, check the browser console for error messages and verify admin permissions.