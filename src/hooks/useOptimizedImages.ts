import { useState, useEffect, useCallback } from 'react';
import { ImagesApi } from '@/api';
import { SiteImage } from '@/api/types';

export const useOptimizedImages = (category?: string) => {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = category 
        ? await ImagesApi.getByCategory(category)
        : await ImagesApi.getAll();
      
      if (response.success) {
        setImages(response.data);
      } else {
        setError(response.error || 'Failed to fetch images');
      }
    } catch (err) {
      setError('Network error');
      console.error('Failed to fetch images:', err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchImages();

    // Listen for image updates
    const handleImageUpdate = () => {
      ImagesApi.invalidateCache();
      fetchImages();
    };

    window.addEventListener('imagesUpdated', handleImageUpdate);
    return () => window.removeEventListener('imagesUpdated', handleImageUpdate);
  }, [fetchImages]);

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

  return {
    images,
    loading,
    error,
    getImageUrl,
    getImageByCategory,
    getImagesByCategory,
    refetch: fetchImages
  };
};