import { useState, useEffect, useCallback, useRef } from 'react';
import { ImagesApi } from '@/api/endpoints';
import { SiteImage } from '@/api/types';
import { useApiWithFallback } from './useApiWithFallback';

// Global cache to prevent duplicate requests
const imageCache = new Map<string, SiteImage[]>();
const loadingStates = new Map<string, boolean>();

export const useOptimizedImageLoader = (category?: string) => {
  const cacheKey = category || 'all';
  const [images, setImages] = useState<SiteImage[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const { data, loading, error, refetch } = useApiWithFallback(
    () => category ? ImagesApi.getByCategory(category) : ImagesApi.getAll(),
    {
      enabled: !imageCache.has(cacheKey) || imageCache.get(cacheKey)?.length === 0,
      fallback: [],
      onSuccess: (data) => {
        if (mountedRef.current) {
          imageCache.set(cacheKey, data);
          setImages(data);
        }
      },
      onError: (error) => {
        console.error('Failed to load images:', error);
        // Use cached data if available
        const cached = imageCache.get(cacheKey);
        if (cached && mountedRef.current) {
          setImages(cached);
        }
      }
    }
  );

  // Use cached data immediately if available
  useEffect(() => {
    const cached = imageCache.get(cacheKey);
    if (cached && cached.length > 0 && mountedRef.current) {
      setImages(cached);
    }
  }, [cacheKey]);

  // Update images when API data changes
  useEffect(() => {
    if (data && mountedRef.current) {
      setImages(data);
    }
  }, [data]);

  const getImageUrl = useCallback((filename: string) => {
    return ImagesApi.getImageUrl(filename);
  }, []);

  const getImageByCategory = useCallback((cat: string, index: number = 0) => {
    const categoryImages = images.filter(img => img.category === cat);
    return categoryImages[index] || null;
  }, [images]);

  const getImagesByCategory = useCallback((cat: string) => {
    return images.filter(img => img.category === cat);
  }, [images]);

  const invalidateCache = useCallback(() => {
    imageCache.delete(cacheKey);
    ImagesApi.invalidateCache();
    refetch();
  }, [cacheKey, refetch]);

  // Listen for global image updates
  useEffect(() => {
    const handleImageUpdate = () => {
      invalidateCache();
    };

    window.addEventListener('imagesUpdated', handleImageUpdate);
    return () => window.removeEventListener('imagesUpdated', handleImageUpdate);
  }, [invalidateCache]);

  return {
    images,
    loading,
    error,
    getImageUrl,
    getImageByCategory,
    getImagesByCategory,
    refetch,
    invalidateCache
  };
};

export default useOptimizedImageLoader;