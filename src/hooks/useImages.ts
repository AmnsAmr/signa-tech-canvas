import { useState, useEffect } from 'react';

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

export const useImages = (category?: string) => {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
    
    // Listen for image updates from admin panel
    const handleImageUpdate = () => {
      fetchImages();
    };
    
    window.addEventListener('imagesUpdated', handleImageUpdate);
    return () => window.removeEventListener('imagesUpdated', handleImageUpdate);
  }, [category]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const timestamp = Date.now();
      const url = category 
        ? `http://localhost:5000/api/images?category=${category}&t=${timestamp}`
        : `http://localhost:5000/api/images?t=${timestamp}`;
      
      const response = await fetch(url, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setImages(data);
        setError(null);
      } else {
        setError('Failed to fetch images');
      }
    } catch (err) {
      setError('Network error');
      console.error('Failed to fetch images:', err);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (filename: string) => {
    // Add cache busting parameter to force refresh
    const timestamp = Date.now();
    return `http://localhost:5000/uploads/${filename}?t=${timestamp}`;
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
    getImageByCategory,
    getImagesByCategory,
    refetch: fetchImages
  };
};

export default useImages;