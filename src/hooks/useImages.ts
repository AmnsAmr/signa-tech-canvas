import { useState, useEffect } from 'react';
import { ImagesApi } from '@/api';
import type { SiteImage } from '@/api/types';

export const useImages = (category?: string) => {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (!hasLoaded) {
      fetchImages();
    }
    
    // Listen for image updates from admin panel
    const handleImageUpdate = () => {
      fetchImages();
    };
    
    window.addEventListener('imagesUpdated', handleImageUpdate);
    return () => window.removeEventListener('imagesUpdated', handleImageUpdate);
  }, [category, hasLoaded]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      
      const response = category 
        ? await ImagesApi.getByCategory(category)
        : await ImagesApi.getAll();
      
      if (response.success) {
        setImages(response.data);
        setError(null);
        setHasLoaded(true);
      } else {
        setError(response.error || 'Failed to fetch images');
      }
    } catch (err) {
      setError('Network error');
      console.error('Failed to fetch images:', err);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (filename: string) => {
    return ImagesApi.getImageUrl(filename);
  };
  
  const getImageUrlFromPath = (path: string) => {
    // Handle both old and new path formats
    const filename = path.includes('/uploads/') ? path.split('/uploads/')[1] : path.split('/').pop();
    return ImagesApi.getImageUrl(filename || '');
  };

  const getImageByCategory = (cat: string, index: number = 0) => {
    const categoryImages = images.filter(img => img.category === cat);
    return categoryImages[index] || null;
  };

  const getImagesByCategory = (cat: string) => {
    return images.filter(img => img.category === cat);
  };

  return {
    images,
    loading,
    error,
    getImageUrl,
    getImageUrlFromPath,
    getImageByCategory,
    getImagesByCategory,
    refetch: fetchImages
  };
};

export default useImages;