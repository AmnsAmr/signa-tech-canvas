import { apiCache } from './cache';
import { ApiResponse } from './types';
import { apiMonitor } from '@/utils/apiMonitor';

const getApiBaseUrl = (): string => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }
  return import.meta.env.VITE_API_URL || '';
};

const getUploadsBaseUrl = (): string => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5000/uploads';
  }
  return import.meta.env.VITE_UPLOADS_URL || '/uploads';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  UPLOADS_URL: getUploadsBaseUrl(),
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTtl?: number
  ): Promise<ApiResponse<T>> {
    const endTimer = apiMonitor.startRequest(endpoint);
    
    try {
      // Check cache first
      if (cacheKey && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
        const cached = apiCache.getWithEtag<T>(cacheKey, cacheTtl);
        if (cached) {
          // Add If-None-Match header for conditional requests
          if (cached.etag) {
            options.headers = {
              ...options.headers,
              'If-None-Match': cached.etag
            };
          }
        }
      }

      const response = await fetch(this.buildUrl(endpoint), {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle 304 Not Modified
      if (response.status === 304 && cacheKey) {
        const cached = apiCache.get<T>(cacheKey);
        if (cached) {
          return { data: cached, success: true };
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Cache successful responses
      if (cacheKey && response.ok) {
        const etag = response.headers.get('etag');
        apiCache.set(cacheKey, data, cacheTtl, etag || undefined);
      }

      return { data, success: true };
    } catch (error) {
      apiMonitor.recordError(endpoint);
      console.error('API request failed:', error);
      return { 
        data: null as any, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      endTimer();
    }
  }

  async get<T>(endpoint: string, cacheKey?: string, cacheTtl?: number): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, cacheKey, cacheTtl);
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  buildUploadUrl(filename: string): string {
    if (!filename) return '';
    return `${API_CONFIG.UPLOADS_URL}/${filename}`;
  }
}

export const apiClient = new ApiClient(API_CONFIG.BASE_URL);