import { buildApiUrl } from '@/config/api';

class CSRFManager {
  private token: string | null = null;
  private tokenPromise: Promise<string> | null = null;

  async getToken(): Promise<string> {
    // If we already have a token, return it
    if (this.token) {
      return this.token;
    }

    // If we're already fetching a token, wait for that request
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    // Fetch a new token
    this.tokenPromise = this.fetchToken();
    
    try {
      this.token = await this.tokenPromise;
      return this.token;
    } finally {
      this.tokenPromise = null;
    }
  }

  private async fetchToken(): Promise<string> {
    try {
      const response = await fetch(buildApiUrl('/api/csrf-token'), {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();
      return data.csrfToken;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      throw error;
    }
  }

  clearToken(): void {
    this.token = null;
    this.tokenPromise = null;
  }

  async addCSRFHeader(headers: Record<string, string> = {}): Promise<Record<string, string>> {
    try {
      const token = await this.getToken();
      return {
        ...headers,
        'X-CSRF-Token': token
      };
    } catch (error) {
      console.warn('Failed to add CSRF token to headers:', error);
      return headers;
    }
  }
}

export const csrfManager = new CSRFManager();

// Utility function to make secure API requests
export async function secureApiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  const { headers = {}, ...otherOptions } = options;
  
  // Add CSRF token for non-GET requests
  const method = options.method?.toUpperCase() || 'GET';
  let finalHeaders = headers as Record<string, string>;
  
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    finalHeaders = await csrfManager.addCSRFHeader(finalHeaders);
  }

  return fetch(buildApiUrl(url), {
    ...otherOptions,
    headers: finalHeaders,
    credentials: 'include'
  });
}

// Handle CSRF token errors
export function handleCSRFError(error: any): boolean {
  if (error?.code === 'CSRF_INVALID' || error?.message?.includes('CSRF')) {
    csrfManager.clearToken();
    return true;
  }
  return false;
}