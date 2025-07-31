// CSRF Token Management Utility

let cachedCsrfToken: string | null = null;
let tokenExpiry: number = 0;

// Error interface for CSRF errors
interface CSRFError {
  code?: string;
  message?: string;
}

export const getCsrfToken = async (): Promise<string> => {
  // Return cached token if still valid (cache for 30 minutes)
  if (cachedCsrfToken && Date.now() < tokenExpiry) {
    return cachedCsrfToken;
  }

  try {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get CSRF token: ${response.status}`);
    }
    
    const { csrfToken } = await response.json();
    
    // Cache the token for 30 minutes
    cachedCsrfToken = csrfToken;
    tokenExpiry = Date.now() + (30 * 60 * 1000);
    
    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
};

export const clearCsrfToken = (): void => {
  cachedCsrfToken = null;
  tokenExpiry = 0;
};

export const makeAuthenticatedRequest = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  // Get CSRF token for non-GET requests
  let headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase())) {
    const csrfToken = await getCsrfToken();
    headers['X-CSRF-Token'] = csrfToken;
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });
};

// Alias for compatibility with AuthContext
export const secureApiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Get CSRF token for non-GET requests
  let headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase())) {
    const csrfToken = await getCsrfToken();
    headers['X-CSRF-Token'] = csrfToken;
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });
};

// Handle CSRF errors
export const handleCSRFError = (error: any): boolean => {
  if (error?.code === 'CSRF_INVALID' || error?.message?.includes('CSRF')) {
    clearCsrfToken();
    return true;
  }
  return false;
};