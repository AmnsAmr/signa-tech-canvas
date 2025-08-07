/**
 * API Configuration
 * Centralized configuration for all API endpoints and URLs
 */

const getApiBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    console.warn('VITE_API_URL not configured, using default');
    return import.meta.env.DEV ? 'http://localhost:3001' : '';
  }
  return apiUrl;
};

const getUploadsBaseUrl = (): string => {
  // In development, always use the proxy path to avoid CORS issues
  if (import.meta.env.DEV) {
    return '/uploads';
  }
  
  const uploadsUrl = import.meta.env.VITE_UPLOADS_URL;
  if (!uploadsUrl) {
    const baseUrl = getApiBaseUrl();
    return baseUrl ? `${baseUrl}/uploads` : '/uploads';
  }
  return uploadsUrl;
};

const getPythonServiceUrl = (): string => {
  const pythonUrl = import.meta.env.VITE_PYTHON_SERVICE_URL;
  if (!pythonUrl) {
    console.warn('VITE_PYTHON_SERVICE_URL not configured, using default');
    return import.meta.env.DEV ? 'http://localhost:5001' : '';
  }
  return pythonUrl;
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  UPLOADS_URL: getUploadsBaseUrl(),
  PYTHON_SERVICE_URL: getPythonServiceUrl(),
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    VERIFY_RESET_CODE: '/api/auth/verify-reset-code',
    RESET_PASSWORD: '/api/auth/reset-password',
    GOOGLE: '/api/auth/google',
  },
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
      RULES: '/api/admin/images/rules',
    },
  },
  CONTACT: {
    SETTINGS: '/api/contact-settings',
    SEND_MESSAGE: '/api/contact',
    SUBMIT_AUTHENTICATED: '/api/contact/submit',
    SUBMIT_GUEST: '/api/contact/guest-submit',
  },
  RATINGS: {
    GET_ALL: '/api/ratings',
    CREATE: '/api/ratings',
    STATS: '/api/ratings/stats',
  },
  SECURITY: {
    CSRF_TOKEN: '/api/csrf-token',
  },
  ADMIN: {
    USERS: '/api/admin/users',
    ADMINS: '/api/admin/admins',
    SUBMISSIONS: '/api/admin/submissions',
    PROJECTS: '/api/admin/projects',
    THEME: '/api/admin/theme',
    FILES: '/api/admin/files',
    NOTIFICATIONS: {
      TOGGLE: '/api/admin/notifications/toggle',
      STATUS: '/api/admin/notifications/status',
    },
    DELETE_USER: (id: number) => `/api/admin/users/${id}`,
    UPDATE_SUBMISSION_STATUS: (id: number) => `/api/admin/submissions/${id}/status`,
    DELETE_FILE: (filename: string) => `/api/admin/files/${filename}`,
  },

  PROJECTS: {
    GET_SECTIONS: '/api/projects/sections',
    GET_SECTION_PROJECTS: (sectionId: number) => `/api/projects/sections/${sectionId}/projects`,
    ADMIN: {
      SECTIONS: '/api/projects/admin/sections',
      SECTION_PROJECTS: (sectionId: number) => `/api/projects/admin/sections/${sectionId}/projects`,
      PROJECTS: '/api/projects/admin/projects',
      UPDATE_PROJECT: (id: number) => `/api/projects/admin/projects/${id}`,
      UPDATE_PROJECT_IMAGE: (id: number) => `/api/projects/admin/projects/${id}/image`,
      REMOVE_PROJECT_IMAGE: (id: number) => `/api/projects/admin/projects/${id}/image`,
      DELETE_PROJECT: (id: number) => `/api/projects/admin/projects/${id}`,
      DELETE_SECTION: (id: number) => `/api/projects/admin/sections/${id}`,
    },
  },

  CONTACT_DOWNLOAD: (filename: string) => `/api/contact/download/${filename}`,
  PYTHON_SERVICE: {
    ANALYZE: '/analyze',
    HEALTH: '/health',
  },
} as const;

if (import.meta.env.DEV) {
  console.log('API Configuration:', API_CONFIG);
}