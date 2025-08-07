import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/api';

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

export const useImageCache = (category?: string) => {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const cacheKey = category || 'all';
    
    // Check cache first
    if (imageCache.has(cacheKey)) {
      setImages(imageCache.get(cacheKey) || []);
      setLoading(false);
      return;
    }

    // Check if already loading
    if (loadingStates.get(cacheKey)) {
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
      
      const url = category 
        ? `/api/images?category=${category}`
        : '/api/images';
      
      console.log('Fetching images from:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched images data:', data);
        imageCache.set(cacheKey, data);
        
        if (mountedRef.current) {
          setImages(data);
          setError(null);
        }
      } else {
        if (mountedRef.current) {
          setError('Failed to fetch images');
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError('Network error');
      }
      console.error('Failed to fetch images:', err);
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
