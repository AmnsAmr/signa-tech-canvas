import { apiClient } from './client';
import { apiCache } from './cache';
import { SiteImage, ContactSettings, ApiResponse } from './types';
import { API_ENDPOINTS, API_CONFIG } from './config';
import { AdminService } from './admin';

const buildEndpointWithParams = (
  endpoint: string, 
  params?: Record<string, string | number | boolean>
): string => {
  if (!params || Object.keys(params).length === 0) return endpoint;
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return `${endpoint}${queryString ? '?' + queryString : ''}`;
};

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

  static async getRules(): Promise<ApiResponse<any[]>> {
    const token = localStorage.getItem('token');
    return apiClient.request<any[]>(API_ENDPOINTS.IMAGES.ADMIN.RULES, {
      method: 'GET',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    }, 'images:rules', CACHE_TTL.SETTINGS);
  }

  static invalidateCache(): void {
    if (API_CONFIG.CACHE_ENABLED) {
      apiCache.invalidatePattern('^images:');
      apiCache.invalidatePattern('^admin:images:');
    }
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
      if (API_CONFIG.CACHE_ENABLED) {
        apiCache.delete('contact:settings');
      }
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
    return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_RESET_CODE, { email, code });
  }

  static async resetPassword(email: string, code: string, password: string): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email, code, password });
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
    if (response.success && API_CONFIG.CACHE_ENABLED) {
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

// Legacy AdminApi - use AdminService instead
export class AdminApi {
  static async getUsers() {
    return AdminService.getUsers();
  }

  static async getAdmins() {
    return AdminService.getAdmins();
  }

  static async getSubmissions() {
    return AdminService.getSubmissions();
  }

  static async createAdmin(adminData: { name: string; email: string; password: string }) {
    return AdminService.createAdmin(adminData);
  }

  static async deleteUser(id: number) {
    return AdminService.deleteUser(id);
  }

  static async updateSubmissionStatus(id: number, status: string) {
    return AdminService.updateSubmissionStatus(id, status as 'pending' | 'done');
  }

  static async toggleNotifications(enabled: boolean) {
    return AdminService.updateNotificationSettings(enabled);
  }

  static async getNotificationStatus() {
    return AdminService.getNotificationSettings();
  }

  static async getFiles() {
    return AdminService.getFiles();
  }

  static async deleteFile(filename: string) {
    return AdminService.deleteFile(filename);
  }
}

// Projects API
export class ProjectsApi {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Public methods
  static async getSections(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(API_ENDPOINTS.PROJECTS.GET_SECTIONS, 'projects:sections', CACHE_TTL.DYNAMIC);
  }

  static async getSectionProjects(sectionId: number): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(
      API_ENDPOINTS.PROJECTS.GET_SECTION_PROJECTS(sectionId), 
      `projects:section:${sectionId}`, 
      CACHE_TTL.DYNAMIC
    );
  }

  // Admin methods
  static async adminGetSections(): Promise<ApiResponse<any[]>> {
    return apiClient.request<any[]>(API_ENDPOINTS.PROJECTS.ADMIN.SECTIONS, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  static async adminGetSectionProjects(sectionId: number): Promise<ApiResponse<any[]>> {
    return apiClient.request<any[]>(API_ENDPOINTS.PROJECTS.ADMIN.SECTION_PROJECTS(sectionId), {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
  }

  static async createSection(sectionData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.request(API_ENDPOINTS.PROJECTS.ADMIN.SECTIONS, {
      method: 'POST',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(sectionData),
    });
    
    if (response.success) {
      this.invalidateCache();
    }
    
    return response;
  }

  static async updateSection(id: number, sectionData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.request(`${API_ENDPOINTS.PROJECTS.ADMIN.SECTIONS}/${id}`, {
      method: 'PUT',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(sectionData),
    });
    
    if (response.success) {
      this.invalidateCache();
    }
    
    return response;
  }

  static async createProject(projectData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.request(API_ENDPOINTS.PROJECTS.ADMIN.PROJECTS, {
      method: 'POST',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });
    
    if (response.success) {
      this.invalidateCache();
    }
    
    return response;
  }

  static async updateProject(id: number, projectData: any): Promise<ApiResponse<any>> {
    const response = await apiClient.request(API_ENDPOINTS.PROJECTS.ADMIN.UPDATE_PROJECT(id), {
      method: 'PUT',
      headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });
    
    if (response.success) {
      this.invalidateCache();
    }
    
    return response;
  }

  static async updateProjectImage(id: number, formData: FormData): Promise<ApiResponse<any>> {
    const response = await apiClient.request(API_ENDPOINTS.PROJECTS.ADMIN.UPDATE_PROJECT_IMAGE(id), {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: formData,
    });
    
    if (response.success) {
      this.invalidateCache();
    }
    
    return response;
  }

  static async removeProjectImage(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.request<void>(API_ENDPOINTS.PROJECTS.ADMIN.REMOVE_PROJECT_IMAGE(id), {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    
    if (response.success) {
      this.invalidateCache();
    }
    
    return response;
  }

  static async deleteProject(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.request<void>(API_ENDPOINTS.PROJECTS.ADMIN.DELETE_PROJECT(id), {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    
    if (response.success) {
      this.invalidateCache();
    }
    
    return response;
  }

  static async deleteSection(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.request<void>(API_ENDPOINTS.PROJECTS.ADMIN.DELETE_SECTION(id), {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    
    if (response.success) {
      this.invalidateCache();
    }
    
    return response;
  }

  static invalidateCache(): void {
    if (API_CONFIG.CACHE_ENABLED) {
      apiCache.invalidatePattern('^projects:');
    }
    window.dispatchEvent(new CustomEvent('projectsUpdated'));
  }
}

// Python Vector Service API
export class VectorApi {
  static async analyzeFile(formData: FormData): Promise<ApiResponse<any>> {
    return apiClient.requestPythonService(API_ENDPOINTS.PYTHON_SERVICE.ANALYZE, {
      method: 'POST',
      body: formData,
    });
  }

  static async healthCheck(): Promise<ApiResponse<any>> {
    return apiClient.requestPythonService(API_ENDPOINTS.PYTHON_SERVICE.HEALTH);
  }
}

// Contact Download API
export class ContactDownloadApi {
  static async downloadFile(filename: string): Promise<Response> {
    const token = localStorage.getItem('token');
    return fetch(apiClient.buildUrl(API_ENDPOINTS.CONTACT_DOWNLOAD(filename)), {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    });
  }
}