import { apiClient } from './client';
import { apiCache } from './cache';
import { SiteImage, ContactSettings, ApiResponse } from './types';
import { API_ENDPOINTS, buildEndpointWithParams } from '@/config/endpoints';

// Cache TTL constants (in milliseconds)
const CACHE_TTL = {
  STATIC: 30 * 60 * 1000,      // 30 minutes for static content
  DYNAMIC: 5 * 60 * 1000,      // 5 minutes for dynamic content
  IMAGES: 60 * 60 * 1000,      // 1 hour for images metadata
  SETTINGS: 15 * 60 * 1000,    // 15 minutes for settings
} as const;

export class ImagesApi {
  static async getAll(): Promise<ApiResponse<SiteImage[]>> {
    return apiClient.get<SiteImage[]>(API_ENDPOINTS.IMAGES.GET_ALL, 'images:all', CACHE_TTL.IMAGES);
  }

  static async getByCategory(category: string): Promise<ApiResponse<SiteImage[]>> {
    return apiClient.get<SiteImage[]>(
      API_ENDPOINTS.IMAGES.GET_BY_CATEGORY(category), 
      `images:category:${category}`, 
      CACHE_TTL.IMAGES
    );
  }

  // Admin methods
  static async adminGetAll(): Promise<ApiResponse<SiteImage[]>> {
    const token = localStorage.getItem('token');
    return apiClient.request<SiteImage[]>(API_ENDPOINTS.IMAGES.ADMIN.GET_ALL, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    }, 'admin:images:all', CACHE_TTL.IMAGES);
  }

  static async adminGetByCategory(category: string): Promise<ApiResponse<SiteImage[]>> {
    const token = localStorage.getItem('token');
    return apiClient.request<SiteImage[]>(
      API_ENDPOINTS.IMAGES.ADMIN.GET_BY_CATEGORY(category),
      {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      },
      `admin:images:category:${category}`,
      CACHE_TTL.IMAGES
    );
  }

  static async adminUpload(formData: FormData): Promise<ApiResponse<SiteImage>> {
    const token = localStorage.getItem('token');
    const response = await apiClient.request<SiteImage>(API_ENDPOINTS.IMAGES.ADMIN.UPLOAD, {
      method: 'POST',
      body: formData,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    
    if (response.success) {
      this.invalidateCache();
    }
    
    return response;
  }

  static async adminDelete(id: number): Promise<ApiResponse<void>> {
    const token = localStorage.getItem('token');
    const response = await apiClient.request<void>(API_ENDPOINTS.IMAGES.ADMIN.DELETE(id), {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    
    if (response.success) {
      this.invalidateCache();
    }
    
    return response;
  }

  static async adminReplace(id: number, formData: FormData): Promise<ApiResponse<SiteImage>> {
    const token = localStorage.getItem('token');
    const response = await apiClient.request<SiteImage>(API_ENDPOINTS.IMAGES.ADMIN.REPLACE(id), {
      method: 'PUT',
      body: formData,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
    
    if (response.success) {
      this.invalidateCache();
    }
    
    return response;
  }

  static async getCategories(): Promise<ApiResponse<string[]>> {
    const token = localStorage.getItem('token');
    return apiClient.request<string[]>(API_ENDPOINTS.IMAGES.ADMIN.CATEGORIES, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    }, 'images:categories', CACHE_TTL.SETTINGS);
  }

  static invalidateCache(): void {
    apiCache.invalidatePattern('^images:');
    apiCache.invalidatePattern('^admin:images:');
  }

  static getImageUrl(filename: string): string {
    return apiClient.buildUploadUrl(filename);
  }
}

export class ContactApi {
  static async getSettings(): Promise<ApiResponse<ContactSettings>> {
    return apiClient.get<ContactSettings>(API_ENDPOINTS.CONTACT.SETTINGS, 'contact:settings', CACHE_TTL.SETTINGS);
  }

  static async updateSettings(settings: Partial<ContactSettings>): Promise<ApiResponse<ContactSettings>> {
    const token = localStorage.getItem('token');
    if (!token) {
      return {
        data: null as any,
        success: false,
        error: 'Authentication required'
      };
    }
    
    const response = await apiClient.request<ContactSettings>(API_ENDPOINTS.CONTACT.SETTINGS, {
      method: 'PUT',
      body: JSON.stringify(settings),
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (response.success) {
      apiCache.delete('contact:settings');
      // Trigger settings update event
      window.dispatchEvent(new CustomEvent('contactSettingsUpdated'));
    }
    
    return response;
  }

  static async sendMessage(data: any): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.CONTACT.SEND_MESSAGE, data);
  }

  static async submitAuthenticated(formData: FormData): Promise<ApiResponse<any>> {
    const token = localStorage.getItem('token');
    return apiClient.request(API_ENDPOINTS.CONTACT.SUBMIT_AUTHENTICATED, {
      method: 'POST',
      body: formData,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }

  static async submitGuest(formData: FormData): Promise<ApiResponse<any>> {
    return apiClient.request(API_ENDPOINTS.CONTACT.SUBMIT_GUEST, {
      method: 'POST',
      body: formData,
    });
  }
}

export class AuthApi {
  static async login(credentials: { email: string; password: string }): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  }

  static async register(userData: any): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  }

  static async getMe(): Promise<ApiResponse<any>> {
    return apiClient.get(API_ENDPOINTS.AUTH.ME);
  }

  static async forgotPassword(email: string): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  }

  static async verifyResetCode(email: string, code: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/verify-reset-code', { email, code });
  }

  static async resetPassword(email: string, code: string, password: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/reset-password', { email, code, password });
  }

  static getGoogleAuthUrl(): string {
    return apiClient.buildUrl(API_ENDPOINTS.AUTH.GOOGLE);
  }
}

export class RatingsApi {
  static async getAll(featured?: boolean): Promise<ApiResponse<any[]>> {
    const endpoint = featured ? `${API_ENDPOINTS.RATINGS.GET_ALL}?featured=true` : API_ENDPOINTS.RATINGS.GET_ALL;
    const cacheKey = featured ? 'ratings:featured' : 'ratings:all';
    return apiClient.get<any[]>(endpoint, cacheKey, CACHE_TTL.DYNAMIC);
  }

  static async create(rating: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post(API_ENDPOINTS.RATINGS.CREATE, rating);
    if (response.success) {
      apiCache.invalidatePattern('^ratings:');
    }
    return response;
  }

  static async getStats(): Promise<ApiResponse<any>> {
    return apiClient.get<any>(API_ENDPOINTS.RATINGS.STATS, 'ratings:stats', CACHE_TTL.DYNAMIC);
  }
}

// Security API
export class SecurityApi {
  static async getCsrfToken(): Promise<ApiResponse<{ csrfToken: string }>> {
    return apiClient.get<{ csrfToken: string }>(API_ENDPOINTS.SECURITY.CSRF_TOKEN);
  }
}

// Python Vector Service API
export class VectorApi {
  static async analyzeFile(formData: FormData): Promise<ApiResponse<any>> {
    return apiClient.requestPythonService('/analyze', {
      method: 'POST',
      body: formData,
    });
  }

  static async healthCheck(): Promise<ApiResponse<any>> {
    return apiClient.requestPythonService('/health');
  }
}