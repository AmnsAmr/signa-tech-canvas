# Deployment Guide - Dynamic Image Management

## Overview
The admin profile picture update functionality has been refactored to be fully dynamic and production-ready. The system now automatically adapts to different environments without requiring developer intervention.

## Key Changes Made

### 1. Dynamic API Configuration
- Created `src/config/api.ts` for centralized API URL management
- Automatically detects development vs production environment
- Uses environment variables for configuration

### 2. Environment-Based Upload Directory
- Server now uses configurable upload directory via `UPLOAD_DIR` environment variable
- Default: `./uploads` (in server directory)
- Production: Can be set to any path (e.g., `/var/www/uploads`)

### 3. Automatic Migration
- Added migration helper to move existing images from `src/assets` to new upload directory
- Runs automatically on server startup
- Ensures backward compatibility

## Environment Configuration

### Frontend (.env)
```bash
# Development
VITE_API_URL=http://localhost:5000
VITE_UPLOADS_URL=http://localhost:5000/uploads

# Production
VITE_API_URL=https://your-domain.com
VITE_UPLOADS_URL=https://your-domain.com/uploads
```

### Backend (server/.env)
```bash
# Development
PORT=5000
NODE_ENV=development
UPLOAD_DIR=./uploads

# Production
PORT=3000
NODE_ENV=production
UPLOAD_DIR=/var/www/uploads
```

## Deployment Steps

### 1. Development Setup
```bash
# Frontend
cp .env.example .env
# Edit .env with your local settings

# Backend
cd server
cp .env.example .env
# Edit .env with your local settings
```

### 2. Production Deployment

#### Option A: Same Domain Deployment
```bash
# Frontend .env
VITE_API_URL=
VITE_UPLOADS_URL=/uploads

# Backend .env
PORT=3000
NODE_ENV=production
UPLOAD_DIR=/var/www/uploads
```

#### Option B: Separate Domain/Subdomain
```bash
# Frontend .env
VITE_API_URL=https://api.yourdomain.com
VITE_UPLOADS_URL=https://api.yourdomain.com/uploads

# Backend .env
PORT=3000
NODE_ENV=production
UPLOAD_DIR=/var/www/uploads
```

### 3. Server Configuration

#### Nginx Example
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Frontend
    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Uploads
    location /uploads/ {
        alias /var/www/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Admin Profile Picture Update Process

### How It Works Now:
1. **Dynamic URLs**: All API calls use environment-based URLs
2. **Flexible Upload**: Images stored in configurable directory
3. **Auto-Migration**: Existing images automatically moved to new location
4. **Cache Busting**: Automatic cache invalidation for updated images
5. **Production Ready**: Works seamlessly when hosted

### Admin Can Now:
1. Upload new profile pictures through the admin panel
2. Replace existing images without developer intervention
3. Delete unwanted images
4. Organize images by categories
5. All changes reflect immediately on the live site

## Troubleshooting

### Images Not Loading
1. Check environment variables are set correctly
2. Verify upload directory permissions
3. Ensure server can write to upload directory

### API Calls Failing
1. Verify VITE_API_URL is correct
2. Check CORS settings if using different domains
3. Ensure server is running and accessible

### Upload Failures
1. Check UPLOAD_DIR permissions
2. Verify disk space availability
3. Check file size limits in server configuration

## Benefits

1. **Zero Developer Intervention**: Admin can manage all images independently
2. **Environment Agnostic**: Works in development, staging, and production
3. **Scalable**: Easy to change upload directories or CDN integration
4. **Backward Compatible**: Existing images automatically migrated
5. **Performance Optimized**: Proper caching and cache busting implemented

The system is now fully dynamic and production-ready. Once deployed with proper environment variables, the admin can update their profile picture and all other site images without any developer assistance.