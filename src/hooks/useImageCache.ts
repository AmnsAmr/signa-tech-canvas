import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/api/client';

interface SiteImage {
  id: number;
  category: string;
  filename: string;
  original_name: string;
  path: string;
  size: number;
  mime_type: string;
  created_at: string;
}

// Global cache to prevent duplicate requests
const imageCache = new Map<string, SiteImage[]>();
const loadingStates = new Map<string, boolean>();
const cacheEnabled = import.meta.env.VITE_ENABLE_CACHE !== 'false';

export const useImageCache = (category?: string) => {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Log cache status on first use
  useEffect(() => {
    console.log(`[useImageCache] Cache ${cacheEnabled ? 'enabled' : 'disabled'}`);
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const cacheKey = category || 'all';
    
    console.log(`[useImageCache] Effect triggered for category: ${category}`);
    console.log(`[useImageCache] Cache key: ${cacheKey}`);
    
    // Check cache first (only if caching is enabled)
    if (cacheEnabled && imageCache.has(cacheKey)) {
      console.log(`[useImageCache] Found cached data for ${cacheKey}`);
      setImages(imageCache.get(cacheKey) || []);
      setLoading(false);
      return;
    }

    // Check if already loading
    if (cacheEnabled && loadingStates.get(cacheKey)) {
      console.log(`[useImageCache] Already loading ${cacheKey}, waiting...`);
      const checkLoading = () => {
        if (!loadingStates.get(cacheKey) && imageCache.has(cacheKey)) {
          if (mountedRef.current) {
            setImages(imageCache.get(cacheKey) || []);
            setLoading(false);
          }
        } else {
          setTimeout(checkLoading, 100);
        }
      };
      checkLoading();
      return;
    }

    console.log(`[useImageCache] Starting fetch for ${cacheKey}`);
    fetchImages(cacheKey);

    // Listen for cache updates
    const handleImageUpdate = () => {
      console.log('Images updated event received, clearing cache and refetching');
      // Clear all image cache when images are updated
      imageCache.clear();
      loadingStates.clear();
      // Force immediate refetch
      setLoading(true);
      setTimeout(() => fetchImages(cacheKey), 100); // Small delay to ensure backend cache is cleared
    };
    
    window.addEventListener('imagesUpdated', handleImageUpdate);
    return () => window.removeEventListener('imagesUpdated', handleImageUpdate);
  }, [category]);

  const fetchImages = async (cacheKey: string) => {
    if (loadingStates.get(cacheKey)) return;
    
    try {
      loadingStates.set(cacheKey, true);
      setLoading(true);
      
      const endpoint = category 
        ? `/api/images?category=${category}`
        : '/api/images';
      
      console.log(`[useImageCache] Fetching images for category: ${category || 'all'}`);
      console.log(`[useImageCache] Endpoint: ${endpoint}`);
      console.log(`[useImageCache] Cache key: ${cacheKey}`);
      console.log(`[useImageCache] Full URL will be: ${apiClient.buildUrl(endpoint)}`);
      
      const response = await apiClient.get<SiteImage[]>(endpoint, cacheKey);
      console.log(`[useImageCache] API response:`, response);
      
      if (response.success && response.data) {
        console.log(`[useImageCache] Successfully fetched ${response.data.length} images:`, response.data);
        if (cacheEnabled) {
          imageCache.set(cacheKey, response.data);
        }
        
        if (mountedRef.current) {
          setImages(response.data);
          setError(null);
        }
      } else {
        console.error(`[useImageCache] API call failed:`, response.error);
        if (mountedRef.current) {
          setError(response.error || 'Failed to fetch images');
        }
      }
    } catch (err) {
      console.error(`[useImageCache] Exception caught:`, err);
      if (mountedRef.current) {
        setError('Network error');
      }
    } finally {
      loadingStates.set(cacheKey, false);
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  return { images, loading, error };
};

export default useImageCache;
