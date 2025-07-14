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
  }, [category]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const url = category 
        ? `http://localhost:5000/api/images?category=${category}`
        : 'http://localhost:5000/api/images';
      
      const response = await fetch(url);
      
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
    return `http://localhost:5000/uploads/${filename}`;
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