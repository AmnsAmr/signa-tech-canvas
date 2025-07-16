import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse } from '@/api/types';

interface UseApiOptions<T> {
  initialData?: T;
  enabled?: boolean;
  fallback?: T;
  onError?: (error: string) => void;
  onSuccess?: (data: T) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

export function useApiWithFallback<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
) {
  const {
    initialData,
    enabled = true,
    fallback,
    onError,
    onSuccess,
    retryAttempts = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    if (!enabled || !mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      
      if (!mountedRef.current) return;

      if (response.success && response.data) {
        setData(response.data);
        setRetryCount(0);
        onSuccess?.(response.data);
      } else {
        throw new Error(response.error || 'API request failed');
      }
    } catch (err) {
      if (!mountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('API request failed:', errorMessage);
      
      if (retryCount < retryAttempts) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          if (mountedRef.current) {
            execute();
          }
        }, retryDelay);
      } else {
        setError(errorMessage);
        onError?.(errorMessage);
        
        // Use fallback data if available
        if (fallback && !data) {
          setData(fallback);
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiCall, enabled, retryCount, retryAttempts, retryDelay, onError, onSuccess, fallback, data]);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(() => {
    setRetryCount(0);
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    refetch,
    isRetrying: retryCount > 0,
  };
}