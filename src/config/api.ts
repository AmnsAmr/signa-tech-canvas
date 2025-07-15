// API Configuration - Dynamic base URL handling
const getApiBaseUrl = (): string => {
  // Check if we're in development
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }
  
  // In production, use relative URLs or environment variable
  return import.meta.env.VITE_API_URL || '';
};

const getUploadsBaseUrl = (): string => {
  // Check if we're in development
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5000/uploads';
  }
  
  // In production, use relative URLs or environment variable
  return import.meta.env.VITE_UPLOADS_URL || '/uploads';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  UPLOADS_URL: getUploadsBaseUrl(),
  ENDPOINTS: {
    AUTH: '/api/auth',
    ADMIN: '/api/admin',
    IMAGES: '/api/images',
    CONTACT: '/api/contact',
    RATINGS: '/api/ratings',
    USER: '/api/user'
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to build upload URLs
export const buildUploadUrl = (filename: string): string => {
  if (!filename) return '';
  
  // Add cache busting parameter
  const timestamp = Date.now();
  return `${API_CONFIG.UPLOADS_URL}/${filename}?t=${timestamp}`;
};

export default API_CONFIG;