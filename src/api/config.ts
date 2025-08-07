/**
 * API Configuration
 * All URLs loaded from .env file only
 */

const getEnvVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key];
  if (!value && !fallback) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || fallback!;
};

export const API_CONFIG = {
  BASE_URL: getEnvVar('VITE_API_URL'),
  UPLOADS_URL: getEnvVar('VITE_UPLOADS_URL'),
  PYTHON_SERVICE_URL: getEnvVar('VITE_PYTHON_SERVICE_URL'),
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  CACHE_ENABLED: true, // Master cache switch
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
    THEME: '/api/admin/theme',
    FILES: '/api/admin/files',
    NOTIFICATIONS: '/api/admin/notifications',
    RATINGS: '/api/admin/ratings',
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

