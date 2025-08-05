import { useEffect, useCallback } from 'react';
import { useImageCache } from './useImageCache';
import { apiClient } from '@/api';

export const useFavicon = () => {
  const { images: logoImages } = useImageCache('logo');
  const logoImage = logoImages[0];

  const updateFavicon = useCallback(() => {
    try {
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(link => link.remove());

      // Create new favicon link
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      
      if (logoImage?.filename) {
        const logoUrl = apiClient.buildUploadUrl(logoImage.filename);
        favicon.href = logoUrl;
        
        // Set appropriate type based on file extension
        const extension = logoImage.filename.toLowerCase().split('.').pop();
        switch (extension) {
          case 'png':
            favicon.type = 'image/png';
            break;
          case 'svg':
            favicon.type = 'image/svg+xml';
            break;
          case 'jpg':
          case 'jpeg':
            favicon.type = 'image/jpeg';
            break;
          default:
            favicon.type = 'image/x-icon';
        }
      } else {
        favicon.href = '/favicon.ico';
        favicon.type = 'image/x-icon';
      }
      
      document.head.appendChild(favicon);
    } catch (error) {
      console.error('Failed to update favicon:', error);
    }
  }, [logoImage]);

  useEffect(() => {
    try {
      updateFavicon();
    } catch (error) {
      console.error('Failed to initialize favicon:', error);
    }
  }, [updateFavicon]);

  useEffect(() => {
    try {
      // Listen for image updates
      const handleImageUpdate = () => {
        // Small delay to ensure cache is updated
        setTimeout(updateFavicon, 100);
      };
      
      window.addEventListener('imagesUpdated', handleImageUpdate);
      return () => window.removeEventListener('imagesUpdated', handleImageUpdate);
    } catch (error) {
      console.error('Failed to setup favicon event listener:', error);
    }
  }, []);

  return logoImage;
};
