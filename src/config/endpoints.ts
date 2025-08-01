// API Endpoints Configuration
// Centralized endpoint definitions for all API calls

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    GOOGLE: '/api/auth/google',
  },

  // Images endpoints
  IMAGES: {
    GET_ALL: '/api/images',
    GET_BY_CATEGORY: (category: string) => `/api/images?category=${category}`,
    ADMIN: {
      GET_ALL: '/api/admin/images',
      GET_BY_CATEGORY: (category: string) => `/api/admin/images?category=${category}`,
      UPLOAD: '/api/admin/images/upload',
      DELETE: (id: number) => `/api/admin/images/${id}`,
      REPLACE: (id: number) => `/api/admin/images/${id}/replace`,
      CATEGORIES: '/api/admin/images/categories',
    },
  },

  // Contact endpoints
  CONTACT: {
    SETTINGS: '/api/contact-settings',
    SEND_MESSAGE: '/api/contact',
    SUBMIT_AUTHENTICATED: '/api/contact/submit',
    SUBMIT_GUEST: '/api/contact/guest-submit',
  },

  // Ratings endpoints
  RATINGS: {
    GET_ALL: '/api/ratings',
    CREATE: '/api/ratings',
    STATS: '/api/ratings/stats',
  },

  // Security endpoints
  SECURITY: {
    CSRF_TOKEN: '/api/csrf-token',
  },

  // Admin endpoints
  ADMIN: {
    USERS: '/api/admin/users',
    PROJECTS: '/api/admin/projects',
    THEME: '/api/admin/theme',
  },
} as const;

// Helper function to build query parameters
export const buildQueryParams = (params: Record<string, string | number | boolean>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

// Helper function to build endpoint with query params
export const buildEndpointWithParams = (
  endpoint: string, 
  params?: Record<string, string | number | boolean>
): string => {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }
  const queryString = buildQueryParams(params);
  return `${endpoint}${queryString ? '?' + queryString : ''}`;
};