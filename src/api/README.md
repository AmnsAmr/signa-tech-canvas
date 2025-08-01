# API Integration Documentation

## Overview

This document describes the redesigned API integration system for the Signa Tech Canvas application. The new system provides a centralized, maintainable, and environment-aware approach to API communication.

## Architecture

### Core Components

1. **Environment Configuration** (`.env` files)
2. **Centralized Endpoints** (`src/config/endpoints.ts`)
3. **API Client** (`src/api/client.ts`)
4. **API Services** (`src/api/endpoints.ts`)
5. **Type Definitions** (`src/api/types.ts`)

## Environment Configuration

### Environment Files

- `.env` - Main environment file
- `.env.development` - Development-specific settings
- `.env.production` - Production-specific settings
- `.env.example` - Template with all available variables

### Environment Variables

```bash
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_UPLOADS_URL=http://localhost:5000/uploads
VITE_PYTHON_SERVICE_URL=http://localhost:5001

# Development Proxy (for vite.config.ts)
VITE_DEV_PROXY_TARGET=http://localhost:5000
```

## API Endpoints Mapping

### Authentication APIs
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/auth/google` - Google OAuth

### Images APIs
- `GET /api/images` - Get all images
- `GET /api/images?category={category}` - Get images by category
- `GET /api/admin/images` - Admin get images
- `POST /api/admin/images/upload` - Upload image
- `DELETE /api/admin/images/{id}` - Delete image
- `PUT /api/admin/images/{id}/replace` - Replace image
- `GET /api/admin/images/categories` - Get categories

### Contact APIs
- `GET /api/contact-settings` - Get contact settings
- `PUT /api/contact-settings` - Update contact settings
- `POST /api/contact` - Send contact message
- `POST /api/contact/submit` - Authenticated contact submit
- `POST /api/contact/guest-submit` - Guest contact submit

### Ratings APIs
- `GET /api/ratings` - Get all ratings
- `POST /api/ratings` - Create rating
- `GET /api/ratings/stats` - Get rating statistics

### Security APIs
- `GET /api/csrf-token` - Get CSRF token

## Usage Examples

### Basic API Calls

```typescript
import { ImagesApi, ContactApi, AuthApi } from '@/api';

// Get all images
const response = await ImagesApi.getAll();
if (response.success) {
  console.log(response.data);
}

// Login user
const loginResponse = await AuthApi.login({
  email: 'user@example.com',
  password: 'password'
});

// Get contact settings
const settings = await ContactApi.getSettings();
```

### File Upload

```typescript
import { ImagesApi, ContactApi } from '@/api';

// Upload image (admin)
const formData = new FormData();
formData.append('image', file);
formData.append('category', 'portfolio');

const uploadResponse = await ImagesApi.adminUpload(formData);

// Submit contact form with file
const contactFormData = new FormData();
contactFormData.append('name', 'John Doe');
contactFormData.append('vectorFile', file);

const contactResponse = await ContactApi.submitGuest(contactFormData);
```

### Error Handling

```typescript
import { ImagesApi } from '@/api';

const response = await ImagesApi.getAll();
if (!response.success) {
  console.error('API Error:', response.error);
  // Handle error appropriately
}
```

## Features

### Caching
- Automatic response caching with TTL
- ETag support for conditional requests
- Cache invalidation patterns

### Retry Logic
- Automatic retry on network failures
- Exponential backoff strategy
- Configurable retry attempts

### Timeout Handling
- Request timeout protection
- Configurable timeout duration
- Graceful timeout error handling

### Environment Switching
- Automatic environment detection
- Easy switching between dev/prod
- Proxy configuration for development

## Migration Guide

### From Old API Calls

**Before:**
```typescript
const response = await fetch('http://localhost:5000/api/images');
const data = await response.json();
```

**After:**
```typescript
const response = await ImagesApi.getAll();
if (response.success) {
  const data = response.data;
}
```

### From buildApiUrl Helper

**Before:**
```typescript
import { buildApiUrl } from '@/config/api';
const url = buildApiUrl('/api/images');
```

**After:**
```typescript
import { API_ENDPOINTS } from '@/config/endpoints';
// URL is handled internally by the API client
const response = await ImagesApi.getAll();
```

## Best Practices

1. **Always check response.success** before using data
2. **Use TypeScript interfaces** for type safety
3. **Handle errors gracefully** with user-friendly messages
4. **Use environment variables** for all URLs
5. **Leverage caching** for frequently accessed data
6. **Use appropriate API methods** (get, post, put, delete)

## Development vs Production

### Development
- Uses proxy configuration in vite.config.ts
- Detailed logging and error messages
- Hot reload support

### Production
- Direct API calls to production URLs
- Optimized error handling
- Compressed responses

## Health Checks

```typescript
import { apiClient } from '@/api';

// Check API health
const health = await apiClient.healthCheck();
console.log('API Health:', health.api);
console.log('Python Service Health:', health.python);
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check proxy configuration in vite.config.ts
2. **Environment Variables**: Ensure all VITE_ prefixed variables are set
3. **Network Timeouts**: Adjust timeout settings in API_CONFIG
4. **Cache Issues**: Use cache invalidation methods when needed

### Debug Mode

Enable detailed logging by setting:
```typescript
// In development
console.log('API Configuration:', API_CONFIG);
```