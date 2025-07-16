import { apiClient } from './client';
import { apiCache } from './cache';
import { SiteImage, ContactSettings, ApiResponse } from './types';

// Cache TTL constants (in milliseconds)
const CACHE_TTL = {
  STATIC: 30 * 60 * 1000,      // 30 minutes for static content
  DYNAMIC: 5 * 60 * 1000,      // 5 minutes for dynamic content
  IMAGES: 60 * 60 * 1000,      // 1 hour for images metadata
  SETTINGS: 15 * 60 * 1000,    // 15 minutes for settings
};

export class ImagesApi {
  static async getAll(): Promise<ApiResponse<SiteImage[]>> {
    return apiClient.get<SiteImage[]>('/api/images', 'images:all', CACHE_TTL.IMAGES);
  }

  static async getByCategory(category: string): Promise<ApiResponse<SiteImage[]>> {
    return apiClient.get<SiteImage[]>(
      `/api/images?category=${category}`, 
      `images:category:${category}`, 
      CACHE_TTL.IMAGES
    );
  }

  static invalidateCache(): void {
    apiCache.invalidatePattern('^images:');
  }

  static getImageUrl(filename: string): string {
    return apiClient.buildUploadUrl(filename);
  }
}

export class ContactApi {
  static async getSettings(): Promise<ApiResponse<ContactSettings>> {
    return apiClient.get<ContactSettings>('/api/contact-settings', 'contact:settings', CACHE_TTL.SETTINGS);
  }

  static async updateSettings(settings: Partial<ContactSettings>): Promise<ApiResponse<ContactSettings>> {
    const response = await apiClient.put<ContactSettings>('/api/contact-settings', settings);
    if (response.success) {
      apiCache.delete('contact:settings');
    }
    return response;
  }

  static async sendMessage(data: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/contact', data);
  }
}

export class AuthApi {
  static async login(credentials: { email: string; password: string }): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/login', credentials);
  }

  static async register(userData: any): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/register', userData);
  }

  static async forgotPassword(email: string): Promise<ApiResponse<any>> {
    return apiClient.post('/api/auth/forgot-password', { email });
  }
}

export class RatingsApi {
  static async getAll(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/api/ratings', 'ratings:all', CACHE_TTL.DYNAMIC);
  }

  static async create(rating: any): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/api/ratings', rating);
    if (response.success) {
      apiCache.invalidatePattern('^ratings:');
    }
    return response;
  }

  static async getStats(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/api/ratings/stats', 'ratings:stats', CACHE_TTL.DYNAMIC);
  }
}