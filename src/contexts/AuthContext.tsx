import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthApi, apiClient } from '@/api';
import { secureApiRequest, handleCSRFError } from '@/utils/csrf';

interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  role: 'client' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  company?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
    checkAuthStatus();
    handleGoogleCallback();
    } catch (error) {
      console.error('Auth initialization error:', error);
      setLoading(false);
    }
  }, []);

  const handleGoogleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      await checkAuthStatus();
    }
  };

  const checkAuthStatus = async () => {
    console.log('Checking auth status...');
    try {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Token found, verifying...');
        
        // Add Authorization header to the API client
        const response = await apiClient.request('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.success) {
          console.log('Auth successful, user data:', response.data);
          setUser(response.data);
        } else {
          console.log('Auth failed, removing token:', response.error);
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string } | string) => {
    let email: string, password: string;
    
    if (typeof credentials === 'string') {
      // Handle legacy string parameter (email)
      email = credentials;
      password = '';
    } else {
      email = credentials.email;
      password = credentials.password;
    }
    
    try {
      // Try with new API layer first
      const response = await AuthApi.login({ email, password });
      
      if (response.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        setUser(userData);
        return;
      }
      
      // Fallback to CSRF-protected request for compatibility
      const fallbackResponse = await secureApiRequest('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!fallbackResponse.ok) {
        const error = await fallbackResponse.json();
        if (handleCSRFError(error)) {
          // Retry once with new CSRF token
          const retryResponse = await secureApiRequest('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          
          if (!retryResponse.ok) {
            const retryError = await retryResponse.json();
            throw new Error(retryError.message || 'Login failed');
          }
          
          const { token, user: userData } = await retryResponse.json();
          localStorage.setItem('token', token);
          setUser(userData);
          return;
        }
        throw new Error(error.message || 'Login failed');
      }

      const { token, user: userData } = await fallbackResponse.json();
      localStorage.setItem('token', token);
      setUser(userData);
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      // Try with new API layer first
      const response = await AuthApi.register(userData);
      
      if (response.success) {
        const { token, user: newUser } = response.data;
        localStorage.setItem('token', token);
        setUser(newUser);
        return;
      }
      
      // Fallback to CSRF-protected request for compatibility
      const fallbackResponse = await secureApiRequest('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!fallbackResponse.ok) {
        const error = await fallbackResponse.json();
        if (handleCSRFError(error)) {
          // Retry once with new CSRF token
          const retryResponse = await secureApiRequest('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });
          
          if (!retryResponse.ok) {
            const retryError = await retryResponse.json();
            throw new Error(retryError.message || 'Registration failed');
          }
          
          const { token, user: newUser } = await retryResponse.json();
          localStorage.setItem('token', token);
          setUser(newUser);
          return;
        }
        throw new Error(error.message || 'Registration failed');
      }

      const { token, user: newUser } = await fallbackResponse.json();
      localStorage.setItem('token', token);
      setUser(newUser);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      refreshUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};