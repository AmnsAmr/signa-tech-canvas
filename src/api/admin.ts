import { apiClient } from './client';
import { ApiResponse } from './types';

interface User {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  role: string;
  created_at: string;
}

interface Admin {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface Submission {
  id: number;
  user_name: string;
  user_email: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  project?: string;
  message: string;
  services: any[];
  submission_group?: string;
  status: 'pending' | 'done';
  created_at: string;
  has_file?: boolean;
  file_name?: string;
  file_path?: string;
  file_size?: number;
  file_type?: string;
}

interface NotificationSettings {
  enabled: boolean;
}

interface FileInfo {
  name: string;
  size: number;
  path: string;
  created_at: string;
}

export class AdminService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return apiClient.request<T>(endpoint, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });
  }

  // User Management
  static async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>('/api/admin/users');
  }

  static async deleteUser(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/admin/users/${id}`, { method: 'DELETE' });
  }

  // Admin Management
  static async getAdmins(): Promise<ApiResponse<Admin[]>> {
    return this.request<Admin[]>('/api/admin/admins');
  }

  static async createAdmin(adminData: { name: string; email: string; password: string }): Promise<ApiResponse<Admin>> {
    return this.request<Admin>('/api/admin/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData),
    });
  }

  // Submission Management
  static async getSubmissions(): Promise<ApiResponse<Submission[]>> {
    return this.request<Submission[]>('/api/admin/submissions');
  }

  static async updateSubmissionStatus(id: number, status: 'pending' | 'done'): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/admin/submissions/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  }

  // Notification Management
  static async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    return this.request<NotificationSettings>('/api/admin/notifications/status');
  }

  static async updateNotificationSettings(enabled: boolean): Promise<ApiResponse<NotificationSettings>> {
    return this.request<NotificationSettings>('/api/admin/notifications/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
  }

  // File Management
  static async getFiles(): Promise<ApiResponse<FileInfo[]>> {
    return this.request<FileInfo[]>('/api/admin/files');
  }

  static async deleteFile(filename: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/admin/files/${encodeURIComponent(filename)}`, { method: 'DELETE' });
  }

  // Rating Management
  static async getRatings(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/admin/ratings');
  }

  static async updateRating(id: number, data: { is_approved?: boolean; is_featured?: boolean }): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/admin/ratings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  static async deleteRating(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/admin/ratings/${id}`, { method: 'DELETE' });
  }

  // Theme Management
  static async getTheme(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/theme');
  }

  static async updateTheme(themeData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/api/admin/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(themeData),
    });
  }
}