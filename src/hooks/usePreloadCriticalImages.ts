import { useEffect } from 'react';
import { buildUploadUrl } from '@/config/api';
import { preloadImage, addLinkPreload } from '@/utils/performance';

/**
 * Hook to preload critical images for better LCP performance
 * @param images Array of image filenames to preload
 * @param options Configuration options
 */
export const usePreloadCriticalImages = (
  images: string[], 
  options: { 
    addLinkTags?: boolean,
    fetchPriority?: 'high' | 'low' | 'auto'
  } = { addLinkTags: true, fetchPriority: 'high' }
) => {
  useEffect(() => {
    if (!images || images.length === 0) return;
    
    // Convert filenames to URLs
    const imageUrls = images
      .filter(Boolean)
      .map(filename => buildUploadUrl(filename));
    
    // Preload images using Image API
    imageUrls.forEach(url => {
      preloadImage(url, { fetchPriority: options.fetchPriority });
    });
    
    // Optionally add link preload tags to document head
    if (options.addLinkTags) {
      imageUrls.forEach(url => {
        addLinkPreload(url, 'image');
      });
    }
    
    return () => {
      // Clean up link preload tags if needed
      if (options.addLinkTags) {
        const linkTags = document.querySelectorAll(`link[rel="preload"][href^="${imageUrls[0].split('/')[0]}/"]`);
        linkTags.forEach(tag => tag.remove());
      }
    };
  }, [images, options.addLinkTags, options.fetchPriority]);
};

export default usePreloadCriticalImages;