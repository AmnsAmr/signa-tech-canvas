// Legacy API Configuration - Use new API layer instead
// This file is kept for backward compatibility

import { apiClient, API_CONFIG as NEW_API_CONFIG } from '@/api';

// Re-export new API config for compatibility
export const API_CONFIG = NEW_API_CONFIG;

// Legacy helper functions - use new API layer instead
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const buildUploadUrl = (filename: string): string => {
  return apiClient.buildUploadUrl(filename);
};

export default API_CONFIG;