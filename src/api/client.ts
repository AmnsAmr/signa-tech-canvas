import { apiCache } from './cache';
import { ApiResponse } from './types';
import { apiMonitor } from '@/utils/apiMonitor';
import { API_CONFIG } from './config';

class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;

  constructor(baseUrl: string, timeout = API_CONFIG.TIMEOUT, retryAttempts = API_CONFIG.RETRY_ATTEMPTS) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
    this.retryAttempts = retryAttempts;
  }

  public buildUrl(endpoint: string): string {
    // Handle absolute URLs (for external services)
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    
    // Handle relative endpoints
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  private async retryRequest<T>(
    url: string,
    options: RequestInit,
    attempt = 1
  ): Promise<Response> {
    try {
      return await this.fetchWithTimeout(url, options);
    } catch (error) {
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        console.warn(`Request failed, retrying (${attempt}/${this.retryAttempts}):`, error.message);
        await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        return this.retryRequest(url, options, attempt + 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      error.name === 'TypeError' || // Network error
      error.message.includes('timeout') ||
      (error.status >= 500 && error.status < 600)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheKey?: string,
    cacheTtl?: number
  ): Promise<ApiResponse<T>> {
    const endTimer = apiMonitor.startRequest(endpoint);
    const url = this.buildUrl(endpoint);
    
    try {
      // Check cache first for GET requests
      if (cacheKey && (!options.method || options.method === 'GET')) {
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

      // Set default headers
      const defaultHeaders: Record<string, string> = {};
      
      // Only set Content-Type for non-FormData requests
      if (!(options.body instanceof FormData)) {
        defaultHeaders['Content-Type'] = 'application/json';
      }

      // ALWAYS add Authorization header if token exists (for ALL requests)
      const token = localStorage.getItem('token');
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }

      const requestOptions: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        credentials: 'include', // Always include credentials
      };

      const response = await this.retryRequest(url, requestOptions);

      // Handle 304 Not Modified
      if (response.status === 304 && cacheKey) {
        const cached = apiCache.get<T>(cacheKey);
        if (cached) {
          return { data: cached, success: true };
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Use default error message if response is not JSON
        }
        
        throw new Error(errorMessage);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      let data: T;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }

      // Cache successful responses for GET requests
      if (cacheKey && response.ok && (!options.method || options.method === 'GET')) {
        const etag = response.headers.get('etag');
        apiCache.set(cacheKey, data, cacheTtl, etag || undefined);
      }

      return { data, success: true };
    } catch (error) {
      apiMonitor.recordError(endpoint);
      console.error(`API request failed [${options.method || 'GET'}] ${url}:`, error);
      
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
    
    // Handle absolute URLs
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    // Handle relative paths
    const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;
    return `${API_CONFIG.UPLOADS_URL}/${cleanFilename}`;
  }

  // Method to make requests to Python service
  async requestPythonService<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const pythonUrl = `${API_CONFIG.PYTHON_SERVICE_URL}${endpoint}`;
    return this.request<T>(pythonUrl, options);
  }

  // Method to check service health
  async healthCheck(): Promise<{ api: boolean; python: boolean }> {
    const results = await Promise.allSettled([
      this.get('/api/health').catch(() => ({ success: false })),
      this.requestPythonService('/health').catch(() => ({ success: false }))
    ]);
    
    return {
      api: results[0].status === 'fulfilled' && results[0].value.success,
      python: results[1].status === 'fulfilled' && results[1].value.success
    };
  }
}

// Create API client instances
export const apiClient = new ApiClient(API_CONFIG.BASE_URL);
export const pythonApiClient = new ApiClient(API_CONFIG.PYTHON_SERVICE_URL);